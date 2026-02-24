import { useState, useCallback, useRef, useEffect } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionType, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionType, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionType, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionType, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

interface VoiceRecognitionState {
  isListening: boolean;
  isWaitingForWakeWord: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

interface UseVoiceRecognitionOptions {
  wakeWord?: string;
  silenceTimeout?: number;
  maxDuration?: number;
  maxCharacters?: number;
  language?: string;
  onCommand?: (command: string) => void;
  onWakeWordDetected?: () => void;
}

function detectDuplicatePhrase(text: string, threshold = 3): boolean {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 6) return false;
  
  // Check for repeating 2-4 word phrases
  for (let phraseLen = 2; phraseLen <= 4; phraseLen++) {
    const phrases: Record<string, number> = {};
    for (let i = 0; i <= words.length - phraseLen; i++) {
      const phrase = words.slice(i, i + phraseLen).join(' ');
      phrases[phrase] = (phrases[phrase] || 0) + 1;
      if (phrases[phrase] >= threshold) return true;
    }
  }
  return false;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const {
    wakeWord = 'hola flofy',
    silenceTimeout = 2000,
    maxDuration = 30000,
    maxCharacters = 200,
    language = 'es-ES',
    onCommand,
    onWakeWordDetected,
  } = options;

  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isWaitingForWakeWord: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: typeof window !== 'undefined' && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  });

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const commandBufferRef = useRef<string>('');
  const isCapturingCommandRef = useRef<boolean>(false);
  const shouldRestartRef = useRef<boolean>(false);
  const onCommandRef = useRef(onCommand);
  const onWakeWordDetectedRef = useRef(onWakeWordDetected);

  useEffect(() => {
    onCommandRef.current = onCommand;
    onWakeWordDetectedRef.current = onWakeWordDetected;
  }, [onCommand, onWakeWordDetected]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearMaxDurationTimer = useCallback(() => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  const finishCommand = useCallback(() => {
    const command = commandBufferRef.current.trim();
    clearSilenceTimer();
    clearMaxDurationTimer();
    shouldRestartRef.current = false;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }
    
    commandBufferRef.current = '';
    isCapturingCommandRef.current = false;
    
    setState(prev => ({ 
      ...prev, 
      transcript: command,
      interimTranscript: '',
      isListening: false,
      isWaitingForWakeWord: false,
    }));
    
    if (command) {
      onCommandRef.current?.(command);
    }
  }, [clearSilenceTimer, clearMaxDurationTimer]);

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (isCapturingCommandRef.current && commandBufferRef.current.trim()) {
        finishCommand();
      }
    }, silenceTimeout);
  }, [clearSilenceTimer, silenceTimeout, finishCommand]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    clearMaxDurationTimer();
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }
    commandBufferRef.current = '';
    isCapturingCommandRef.current = false;
    setState(prev => ({ 
      ...prev, 
      isListening: false, 
      isWaitingForWakeWord: false,
      interimTranscript: '',
    }));
  }, [clearSilenceTimer, clearMaxDurationTimer]);

  const startListening = useCallback((waitForWakeWord = true) => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'El reconocimiento de voz no está soportado en este navegador' }));
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }

    shouldRestartRef.current = true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        isWaitingForWakeWord: waitForWakeWord,
        error: null,
        transcript: '',
        interimTranscript: '',
      }));
      
      // Start max duration timer
      clearMaxDurationTimer();
      maxDurationTimerRef.current = setTimeout(() => {
        if (isCapturingCommandRef.current && commandBufferRef.current.trim()) {
          finishCommand();
        } else {
          stopListening();
        }
      }, maxDuration);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentText = (finalTranscript + interimTranscript).toLowerCase().trim();

      // Duplicate phrase detection — stop if looping
      const fullBuffer = commandBufferRef.current + ' ' + currentText;
      if (fullBuffer.length > 50 && detectDuplicatePhrase(fullBuffer)) {
        // Take only the first non-repeated portion
        const cleanCommand = commandBufferRef.current.trim().split(/\s+/).slice(0, 15).join(' ');
        commandBufferRef.current = cleanCommand;
        finishCommand();
        return;
      }

      // Character limit check
      if (commandBufferRef.current.length > maxCharacters) {
        finishCommand();
        return;
      }

      if (!isCapturingCommandRef.current) {
        if (currentText.includes(wakeWord.toLowerCase())) {
          isCapturingCommandRef.current = true;
          onWakeWordDetectedRef.current?.();
          const afterWakeWord = currentText.split(wakeWord.toLowerCase()).pop()?.trim() || '';
          commandBufferRef.current = afterWakeWord;
          setState(prev => ({ 
            ...prev, 
            isWaitingForWakeWord: false,
            interimTranscript: afterWakeWord,
          }));
          startSilenceTimer();
        } else {
          setState(prev => ({ ...prev, interimTranscript: currentText }));
        }
      } else {
        if (finalTranscript) {
          commandBufferRef.current += ' ' + finalTranscript;
        }
        setState(prev => ({ 
          ...prev, 
          interimTranscript: commandBufferRef.current + ' ' + interimTranscript,
        }));
        startSilenceTimer();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('Speech recognition error:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
          shouldRestartRef.current = false;
          setState(prev => ({ ...prev, error: 'Permiso de micrófono denegado' }));
          break;
        case 'no-speech':
          return;
        case 'network':
          shouldRestartRef.current = false;
          clearMaxDurationTimer();
          setState(prev => ({ 
            ...prev, 
            error: 'Error de red. Verifica tu conexión a internet',
            isListening: false,
            isWaitingForWakeWord: false,
          }));
          break;
        case 'aborted':
          return;
        default:
          setState(prev => ({ ...prev, error: 'Error en el reconocimiento de voz' }));
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try {
          setTimeout(() => {
            if (shouldRestartRef.current && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (e) {
          console.log('Recognition restart failed:', e);
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          isListening: false,
          isWaitingForWakeWord: false,
        }));
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
      setState(prev => ({ ...prev, error: 'Error al iniciar el reconocimiento de voz' }));
    }
  }, [state.isSupported, language, wakeWord, startSilenceTimer, maxDuration, maxCharacters, finishCommand, stopListening, clearMaxDurationTimer]);

  const startDirectListening = useCallback(() => {
    startListening(false);
    isCapturingCommandRef.current = true;
  }, [startListening]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      clearMaxDurationTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [clearSilenceTimer, clearMaxDurationTimer]);

  return {
    ...state,
    startListening,
    startDirectListening,
    stopListening,
  };
}
