import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Pause, SkipForward, X, Coffee, Brain } from 'lucide-react';
import { POMODORO_WORK_MINUTES, POMODORO_BREAK_MINUTES, BurnoutLevel } from '@/types/focusflow';

interface PomodoroTimerProps {
  taskId: string;
  taskName: string;
  burnoutLevel: BurnoutLevel;
  onComplete: () => void;
  onSkipBreak: () => void;
  onClose: () => void;
}

type TimerPhase = 'work' | 'break' | 'idle';

export function PomodoroTimer({ taskId, taskName, burnoutLevel, onComplete, onSkipBreak, onClose }: PomodoroTimerProps) {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(POMODORO_WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const totalTime = phase === 'break' ? POMODORO_BREAK_MINUTES * 60 : POMODORO_WORK_MINUTES * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWork = useCallback(() => {
    setPhase('work');
    setTimeLeft(POMODORO_WORK_MINUTES * 60);
    setIsRunning(true);
  }, []);

  const startBreak = useCallback(() => {
    setPhase('break');
    setTimeLeft(POMODORO_BREAK_MINUTES * 60);
    setIsRunning(true);
  }, []);

  const handleSkipBreak = useCallback(() => {
    onSkipBreak();
    startWork();
  }, [onSkipBreak, startWork]);

  const handleComplete = useCallback(() => {
    if (phase === 'work') {
      onComplete();
      setSessionsCompleted(prev => prev + 1);
      setIsRunning(false);
      setPhase('break');
      // Auto-start break countdown
      setTimeout(() => {
        startBreak();
      }, 500);
    } else if (phase === 'break') {
      setPhase('idle');
      setTimeLeft(POMODORO_WORK_MINUTES * 60);
    }
  }, [phase, onComplete, startBreak]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleComplete]);

  const showBurnoutWarning = burnoutLevel === 'burnout' && phase === 'break';

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Phase indicator */}
        <div className={cn(
          "text-center mb-8 p-4 rounded-2xl transition-colors",
          phase === 'work' && "bg-ff-pomodoro-work/10",
          phase === 'break' && "bg-ff-pomodoro-break/10",
          phase === 'idle' && "bg-muted"
        )}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {phase === 'work' && <Brain className="w-6 h-6 text-ff-pomodoro-work" />}
            {phase === 'break' && <Coffee className="w-6 h-6 text-ff-pomodoro-break" />}
          </div>
          <h2 className={cn(
            "text-2xl font-bold",
            phase === 'work' && "text-ff-pomodoro-work",
            phase === 'break' && "text-ff-pomodoro-break",
            phase === 'idle' && "text-foreground"
          )}>
            {phase === 'work' && 'Focus Time'}
            {phase === 'break' && 'Break Time'}
            {phase === 'idle' && 'Ready to Focus?'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{taskName}</p>
        </div>

        {/* Timer circle */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              className={cn(
                "transition-all duration-1000",
                phase === 'work' && "text-ff-pomodoro-work",
                phase === 'break' && "text-ff-pomodoro-break",
                phase === 'idle' && "text-primary"
              )}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn(
              "text-5xl font-bold tabular-nums",
              isRunning && "animate-pulse-soft"
            )}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              {sessionsCompleted} 🍅 completed
            </span>
          </div>
        </div>

        {/* Burnout warning */}
        {showBurnoutWarning && (
          <div className="mb-6 p-4 rounded-xl bg-ff-burnout/10 border border-ff-burnout/20 animate-pulse-soft">
            <p className="text-sm text-ff-burnout text-center font-medium">
              ⚠️ You've been working hard! Please take this break to avoid burnout.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {phase === 'idle' && (
            <Button size="xl" variant="calm" onClick={startWork}>
              <Play className="w-6 h-6" />
              Start Focus
            </Button>
          )}

          {phase === 'work' && (
            <>
              <Button
                size="lg"
                variant={isRunning ? "soft" : "calm"}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isRunning ? 'Pause' : 'Resume'}
              </Button>
            </>
          )}

          {phase === 'break' && (
            <>
              <Button
                size="lg"
                variant={isRunning ? "soft" : "calm"}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                size="lg"
                variant="warning"
                onClick={handleSkipBreak}
                disabled={burnoutLevel === 'burnout'}
              >
                <SkipForward className="w-5 h-5" />
                Skip Break
              </Button>
            </>
          )}
        </div>

        {/* Skip warning */}
        {phase === 'break' && burnoutLevel !== 'burnout' && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Skipping too many breaks increases burnout risk
          </p>
        )}
      </div>
    </div>
  );
}
