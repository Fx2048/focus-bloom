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
  language?: string;
  onCommand?: (command: string) => void;
  onWakeWordDetected?: () => void;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const {
    wakeWord = 'hola flofy',
    silenceTimeout = 3000,
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
  const commandBufferRef = useRef<string>('');
  const isCapturingCommandRef = useRef<boolean>(false);
  const shouldRestartRef = useRef<boolean>(false);
  const onCommandRef = useRef(onCommand);
  const onWakeWordDetectedRef = useRef(onWakeWordDetected);

  // Keep refs updated
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

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (isCapturingCommandRef.current && commandBufferRef.current.trim()) {
        // Silence detected, process the command
        const command = commandBufferRef.current.trim();
        
        // Stop listening first to prevent any further events
        shouldRestartRef.current = false;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            // Ignore
          }
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
        
        // Call onCommand after state is updated
        onCommandRef.current?.(command);
      }
    }, silenceTimeout);
  }, [clearSilenceTimer, silenceTimeout]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    commandBufferRef.current = '';
    isCapturingCommandRef.current = false;
    setState(prev => ({ 
      ...prev, 
      isListening: false, 
      isWaitingForWakeWord: false,
      interimTranscript: '',
    }));
  }, [clearSilenceTimer]);

  const startListening = useCallback((waitForWakeWord = true) => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'El reconocimiento de voz no está soportado en este navegador' }));
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
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

      // Check for wake word if waiting
      if (!isCapturingCommandRef.current) {
        if (currentText.includes(wakeWord.toLowerCase())) {
          isCapturingCommandRef.current = true;
          onWakeWordDetectedRef.current?.();
          // Remove wake word from command
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
        // Capturing command
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
          // This is normal, just restart if we should
          return;
        case 'network':
          // Stop restart loop on network errors
          shouldRestartRef.current = false;
          setState(prev => ({ 
            ...prev, 
            error: 'Error de red. Verifica tu conexión a internet',
            isListening: false,
            isWaitingForWakeWord: false,
          }));
          break;
        case 'aborted':
          // Normal when stopping, don't show error but stop restarting after multiple aborts
          return;
        default:
          setState(prev => ({ ...prev, error: 'Error en el reconocimiento de voz' }));
      }
    };

    recognition.onend = () => {
      // Only restart if we explicitly want to keep listening
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
  }, [state.isSupported, language, wakeWord, startSilenceTimer]);

  const startDirectListening = useCallback(() => {
    startListening(false);
    isCapturingCommandRef.current = true;
  }, [startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [clearSilenceTimer]);

  return {
    ...state,
    startListening,
    startDirectListening,
    stopListening,
  };
}
