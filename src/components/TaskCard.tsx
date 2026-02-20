import { Task, Difficulty, TaskStatus } from '@/types/focusflow';
import { cn } from '@/lib/utils';
import { Clock, Zap, Play, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  onStartPomodoro?: () => void;
  onUpdateStatus?: (status: TaskStatus) => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

const difficultyConfig: Record<Difficulty, { label: string; className: string; icon: string }> = {
  low: { label: 'Easy', className: 'difficulty-low', icon: '🌱' },
  medium: { label: 'Medium', className: 'difficulty-medium', icon: '🌿' },
  high: { label: 'Hard', className: 'difficulty-high', icon: '🌳' },
};

export function TaskCard({ task, onStartPomodoro, onUpdateStatus, onDelete, isDragging }: TaskCardProps) {
  const difficulty = difficultyConfig[task.difficulty];
  const progress = task.pomodoroSessions > 0 
    ? (task.completedPomodoros / task.pomodoroSessions) * 100 
    : 0;

  return (
    <div
      className={cn(
        "card-calm p-4 transition-all duration-200",
        isDragging && "shadow-elevated rotate-2 scale-105",
        task.status === 'completed' && "opacity-75"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className={cn(
          "font-semibold text-foreground line-clamp-2",
          task.status === 'completed' && "line-through text-muted-foreground"
        )}>
          {task.name}
        </h4>
        <span className={cn(
          "shrink-0 text-xs px-2 py-1 rounded-full font-medium",
          difficulty.className
        )}>
          {difficulty.icon} {difficulty.label}
        </span>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{task.estimatedHours}h</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4" />
          <span>{task.completedPomodoros}/{task.pomodoroSessions} 🍅</span>
        </div>
      </div>

      {/* Progress bar */}
      {task.status !== 'pending' && (
        <div className="mb-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-ff-balanced rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {task.status === 'pending' && onUpdateStatus && (
          <Button
            size="sm"
            variant="soft"
            onClick={() => onUpdateStatus('in-progress')}
            className="flex-1"
          >
            Start Task
          </Button>
        )}
        
        {task.status === 'in-progress' && (
          <>
            <Button
              size="sm"
              variant="calm"
              onClick={onStartPomodoro}
              className="flex-1"
            >
              <Play className="w-4 h-4" />
              Focus
            </Button>
            {onUpdateStatus && (
              <Button
                size="sm"
                variant="success"
                onClick={() => onUpdateStatus('completed')}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
          </>
        )}

        {task.status === 'completed' && (
          <div className="flex items-center gap-2 text-ff-balanced">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Completed!</span>
          </div>
        )}

        {task.status !== 'completed' && onDelete && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
