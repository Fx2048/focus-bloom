import { useState, useCallback, useEffect } from 'react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useNaturalLanguageParser, ParsedCommand } from '@/hooks/useNaturalLanguageParser';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Mic, MicOff, X, Check, Edit3, Calendar, Clock, AlertCircle, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VoiceCommandButtonProps {
  onTaskCreate: (taskData: {
    name: string;
    difficulty: 'low' | 'medium' | 'high';
    estimatedHours: number;
    scheduledDay: Date;
  }) => void;
}

type CommandState = 'idle' | 'listening' | 'processing' | 'confirming' | 'editing';

export function VoiceCommandButton({ onTaskCreate }: VoiceCommandButtonProps) {
  const [commandState, setCommandState] = useState<CommandState>('idle');
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [showPanel, setShowPanel] = useState(false);

  const { parseCommand } = useNaturalLanguageParser();
  const { scheduleNotification, requestPermission } = useNotifications();

  const handleCommand = useCallback((command: string) => {
    try {
      setCommandState('processing');
      
      const parsed = parseCommand(command);
      
      if (parsed) {
        // Validate the date before using it
        const isValidDate = parsed.date instanceof Date && !isNaN(parsed.date.getTime());
        
        if (!isValidDate) {
          console.warn('Invalid date in parsed command, using today as fallback');
          parsed.date = new Date();
          parsed.date.setHours(12, 0, 0, 0);
        }
        
        setParsedCommand(parsed);
        setEditedTitle(parsed.title);
        setCommandState('confirming');
        
        // Safe date formatting with error handling
        let formattedDate = 'hoy';
        try {
          formattedDate = format(parsed.date, "EEEE d 'de' MMMM", { locale: es });
        } catch (formatError) {
          console.warn('Error formatting date:', formatError);
          formattedDate = 'hoy';
        }
        
        // Audio feedback
        const utterance = new SpeechSynthesisUtterance(
          `Entendido: ${parsed.title} para el ${formattedDate}${parsed.time ? ` a las ${parsed.time}` : ''}`
        );
        utterance.lang = 'es-ES';
        utterance.rate = 1.1;
        speechSynthesis.speak(utterance);
      } else {
        toast.error('No pude entender el comando. Intenta de nuevo.');
        setCommandState('idle');
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast.error('Ocurrió un error al procesar el comando. Intenta de nuevo.');
      setCommandState('idle');
      setParsedCommand(null);
    }
  }, [parseCommand]);

  const handleWakeWordDetected = useCallback(() => {
    // Audio feedback
    const utterance = new SpeechSynthesisUtterance('Te escucho');
    utterance.lang = 'es-ES';
    utterance.rate = 1.2;
    speechSynthesis.speak(utterance);
    
    toast.info('🎤 Te escucho...', { duration: 2000 });
  }, []);

  const {
    isListening,
    isWaitingForWakeWord,
    interimTranscript,
    error,
    isSupported,
    startListening,
    startDirectListening,
    stopListening,
  } = useVoiceRecognition({
    wakeWord: 'hola flofy',
    silenceTimeout: 3000,
    onCommand: handleCommand,
    onWakeWordDetected: handleWakeWordDetected,
  });

  // Update command state based on listening state
  useEffect(() => {
    if (isListening) {
      setCommandState(isWaitingForWakeWord ? 'idle' : 'listening');
    } else if (commandState === 'listening' || commandState === 'processing') {
      // If we stopped listening unexpectedly (e.g. network error), reset state
      if (!parsedCommand) {
        setCommandState('idle');
      }
    }
  }, [isListening, isWaitingForWakeWord]);

  const handleStartListening = useCallback(async () => {
    await requestPermission();
    setShowPanel(true);
    startDirectListening();
    setCommandState('listening');
  }, [startDirectListening, requestPermission]);

  const handleStartWakeWordMode = useCallback(async () => {
    await requestPermission();
    setShowPanel(true);
    startListening(true);
    toast.info('Di "Hola Flofy" para activar', { duration: 3000 });
  }, [startListening, requestPermission]);

  const handleStop = useCallback(() => {
    stopListening();
    setCommandState('idle');
  }, [stopListening]);

  const handleConfirm = useCallback(() => {
    try {
      if (!parsedCommand) return;

      // Validate the date one more time before creating the task
      let taskDate = parsedCommand.date;
      if (!(taskDate instanceof Date) || isNaN(taskDate.getTime())) {
        console.warn('Invalid date detected in handleConfirm, using today');
        taskDate = new Date();
        taskDate.setHours(12, 0, 0, 0);
      }

      // Estimate difficulty based on title keywords
      let difficulty: 'low' | 'medium' | 'high' = 'medium';
      const lowerTitle = parsedCommand.title.toLowerCase();
      if (/examen|proyecto|presentación|reunión importante/i.test(lowerTitle)) {
        difficulty = 'high';
      } else if (/comprar|llamar|revisar|enviar/i.test(lowerTitle)) {
        difficulty = 'low';
      }

      // Estimate hours based on type
      let estimatedHours = 1;
      if (parsedCommand.type === 'event') {
        estimatedHours = 1;
      } else if (difficulty === 'high') {
        estimatedHours = 2;
      }

      // Create the task with validated date
      onTaskCreate({
        name: editedTitle || parsedCommand.title,
        difficulty,
        estimatedHours,
        scheduledDay: taskDate,
      });

      // Schedule notification if time is set
      if (parsedCommand.time && taskDate instanceof Date && !isNaN(taskDate.getTime())) {
        try {
          const notificationId = `task-${Date.now()}`;
          scheduleNotification(
            notificationId,
            `📅 ${editedTitle || parsedCommand.title}`,
            `Recordatorio: ${parsedCommand.description}`
          );
          toast.success('✅ Tarea creada con recordatorio');
        } catch (notifError) {
          console.warn('Error scheduling notification:', notifError);
          toast.success('✅ Tarea creada (sin recordatorio)');
        }
      } else {
        toast.success('✅ Tarea creada');
      }

      // Audio confirmation
      const utterance = new SpeechSynthesisUtterance('Listo, tarea creada');
      utterance.lang = 'es-ES';
      speechSynthesis.speak(utterance);

      // Reset state
      setParsedCommand(null);
      setEditedTitle('');
      setCommandState('idle');
      setShowPanel(false);
    } catch (error) {
      console.error('Error confirming task:', error);
      toast.error('Error al crear la tarea. Intenta de nuevo.');
      // Reset state on error to prevent stuck UI
      setParsedCommand(null);
      setEditedTitle('');
      setCommandState('idle');
    }
  }, [parsedCommand, editedTitle, onTaskCreate, scheduleNotification]);

  const handleCancel = useCallback(() => {
    stopListening();
    setParsedCommand(null);
    setEditedTitle('');
    setCommandState('idle');
    setShowPanel(false);
  }, [stopListening]);

  const handleEdit = useCallback(() => {
    setCommandState('editing');
  }, []);

  if (!isSupported) {
    return (
      <Button variant="soft" size="icon" disabled title="Reconocimiento de voz no soportado">
        <MicOff className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <>
      {/* Floating microphone button */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-2">
        {/* Wake word mode button */}
        <Button
          size="icon"
          variant={isWaitingForWakeWord ? "warning" : "soft"}
          onClick={isWaitingForWakeWord ? handleStop : handleStartWakeWordMode}
          className={cn(
            "rounded-full w-10 h-10 shadow-soft",
            isWaitingForWakeWord && "animate-pulse"
          )}
          title={isWaitingForWakeWord ? 'Escuchando "Hola Flofy"' : 'Activar modo de escucha'}
        >
          <Volume2 className="w-4 h-4" />
        </Button>

        {/* Direct recording button */}
        <Button
          size="icon"
          variant={isListening && !isWaitingForWakeWord ? "danger" : "calm"}
          onClick={isListening && !isWaitingForWakeWord ? handleStop : handleStartListening}
          className={cn(
            "rounded-full w-12 h-12 shadow-elevated",
            isListening && !isWaitingForWakeWord && "animate-pulse"
          )}
          title={isListening ? 'Detener grabación' : 'Grabar comando de voz'}
        >
          {isListening && !isWaitingForWakeWord ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Command panel */}
      {showPanel && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md card-elevated p-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  commandState === 'listening' && "bg-ff-burnout/20 animate-pulse",
                  commandState === 'processing' && "bg-primary/20",
                  commandState === 'confirming' && "bg-ff-balanced/20",
                  commandState === 'editing' && "bg-ff-difficulty-medium/20",
                  commandState === 'idle' && "bg-muted"
                )}>
                  <Mic className={cn(
                    "w-5 h-5",
                    commandState === 'listening' && "text-ff-burnout",
                    commandState === 'processing' && "text-primary",
                    commandState === 'confirming' && "text-ff-balanced",
                    commandState === 'editing' && "text-ff-difficulty-medium"
                  )} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {commandState === 'listening' && 'Escuchando...'}
                    {commandState === 'processing' && 'Procesando...'}
                    {commandState === 'confirming' && '¿Es correcto?'}
                    {commandState === 'editing' && 'Editar tarea'}
                    {commandState === 'idle' && 'Comando de voz'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {commandState === 'listening' && 'Habla ahora...'}
                    {commandState === 'confirming' && 'Confirma o edita la tarea'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Listening state - show interim transcript */}
            {(commandState === 'listening' || commandState === 'processing') && (
              <div className="mb-4">
                <div className="p-4 rounded-xl bg-muted min-h-[80px] flex items-center justify-center">
                  {interimTranscript ? (
                    <p className="text-foreground text-center">{interimTranscript}</p>
                  ) : (
                    <p className="text-muted-foreground text-center animate-pulse">
                      🎤 Esperando tu voz...
                    </p>
                  )}
                </div>
                
                {/* Audio visualizer */}
                <div className="flex items-center justify-center gap-1 mt-4 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 bg-primary rounded-full transition-all duration-150",
                        isListening ? "animate-pulse" : "h-1"
                      )}
                      style={{
                        height: isListening ? `${Math.random() * 24 + 8}px` : '4px',
                        animationDelay: `${i * 50}ms`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Confirming state - show parsed result */}
            {commandState === 'confirming' && parsedCommand && (
              <div className="mb-4 space-y-3">
                <div className="p-4 rounded-xl bg-ff-balanced/10 border border-ff-balanced/20">
                  <p className="font-semibold text-foreground mb-2">{parsedCommand.title}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary">
                      <Calendar className="w-3 h-3" />
                      {format(parsedCommand.date, "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                    {parsedCommand.time && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary">
                        <Clock className="w-3 h-3" />
                        {parsedCommand.time}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="soft" className="flex-1" onClick={handleEdit}>
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button variant="calm" className="flex-1" onClick={handleConfirm}>
                    <Check className="w-4 h-4" />
                    Confirmar
                  </Button>
                </div>
              </div>
            )}

            {/* Editing state */}
            {commandState === 'editing' && parsedCommand && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Título de la tarea
                  </label>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="h-12"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(parsedCommand.date, "d/MM/yyyy", { locale: es })}
                  </span>
                  {parsedCommand.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {parsedCommand.time}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="soft" className="flex-1" onClick={() => setCommandState('confirming')}>
                    Cancelar
                  </Button>
                  <Button variant="calm" className="flex-1" onClick={handleConfirm}>
                    <Check className="w-4 h-4" />
                    Guardar
                  </Button>
                </div>
              </div>
            )}

            {/* Tips */}
            {commandState === 'idle' && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Ejemplos de comandos:</p>
                <ul className="space-y-1 text-xs">
                  <li>• "Hola Flofy, apunta reunión con Jimena a las 4pm el domingo"</li>
                  <li>• "Recordarme comprar leche mañana a las 10am"</li>
                  <li>• "Cita médica el viernes 31 a las 2pm"</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
