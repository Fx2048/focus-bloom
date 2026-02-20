import { useState } from 'react';
import { Task } from '@/types/focusflow';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Sparkles, Loader2, Clock, Play, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface PlannedTask {
  taskId: string;
  taskName: string;
  suggestedTime: string;
  duration: number;
  pomodorosToComplete: number;
  reason: string;
}

interface DailyPlanResponse {
  plan: PlannedTask[];
  totalHours: number;
  message: string;
  wellnessReminder: string;
  error?: string;
}

interface AIDailyPlanProps {
  tasks: Task[];
  motivationLevel: number;
  maxDailyHours: number;
  onStartTask: (taskId: string) => void;
}

export function AIDailyPlan({ tasks, motivationLevel, maxDailyHours, onStartTask }: AIDailyPlanProps) {
  const [plan, setPlan] = useState<DailyPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const generatePlan = async () => {
    setIsLoading(true);
    try {
      const activeTasks = tasks.filter(t => t.status !== 'completed');
      
      const { data, error } = await supabase.functions.invoke('generate-plan', {
        body: {
          tasks: activeTasks.map(t => ({
            id: t.id,
            name: t.name,
            difficulty: t.difficulty,
            estimatedHours: t.estimatedHours,
            pomodoroSessions: t.pomodoroSessions,
            completedPomodoros: t.completedPomodoros,
          })),
          motivationLevel,
          maxDailyHours,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setPlan(data);
      toast.success('Daily plan generated! ✨');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast.error('Failed to generate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'completed');

  if (activeTasks.length === 0) {
    return null;
  }

  return (
    <div className="card-calm p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">AI Daily Planner</h3>
        </div>
        
        <Button
          size="sm"
          variant={plan ? "soft" : "calm"}
          onClick={generatePlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Planning...
            </>
          ) : plan ? (
            'Regenerate'
          ) : (
            'Generate Plan'
          )}
        </Button>
      </div>

      {!plan && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Let AI create a balanced study schedule based on your tasks, energy levels, and available time.
        </p>
      )}

      {plan && (
        <div className="space-y-4">
          {/* Message */}
          <p className="text-sm text-foreground">{plan.message}</p>
          
          {/* Wellness reminder */}
          {plan.wellnessReminder && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Heart className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-primary">{plan.wellnessReminder}</p>
            </div>
          )}

          {/* Total hours */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Total planned: {plan.totalHours}h</span>
          </div>

          {/* Toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between"
          >
            <span>Scheduled Tasks ({plan.plan.length})</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {/* Plan items */}
          {isExpanded && (
            <div className="space-y-3">
              {plan.plan.map((item, index) => (
                <div
                  key={item.taskId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{item.suggestedTime}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.taskName}</p>
                    <p className="text-xs text-foreground/70">
                      {item.duration}h • {item.pomodorosToComplete} 🍅 • {item.reason}
                    </p>
                  </div>

                  <Button
                    size="icon"
                    variant="calm"
                    onClick={() => onStartTask(item.taskId)}
                    className="shrink-0"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
