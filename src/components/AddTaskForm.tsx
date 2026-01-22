import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Difficulty } from '@/types/focusflow';
import { cn } from '@/lib/utils';
import { Plus, X, AlertTriangle } from 'lucide-react';

interface AddTaskFormProps {
  onClose?: () => void;
  onAddTask: (taskData: {
    name: string;
    difficulty: Difficulty;
    estimatedHours: number;
    scheduledDay: Date;
  }) => void;
}

export function AddTaskForm({ onClose, onAddTask }: AddTaskFormProps) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [scheduledDay, setScheduledDay] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddTask({
      name: name.trim(),
      difficulty,
      estimatedHours: parseFloat(estimatedHours) || 1,
      scheduledDay: new Date(scheduledDay),
    });

    setName('');
    setDifficulty('medium');
    setEstimatedHours('1');
  };

  const difficultyOptions: { value: Difficulty; label: string; icon: string; description: string }[] = [
    { value: 'low', label: 'Easy', icon: '🌱', description: 'Quick & simple' },
    { value: 'medium', label: 'Medium', icon: '🌿', description: 'Some focus needed' },
    { value: 'high', label: 'Hard', icon: '🌳', description: 'Deep work required' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Add New Task</h3>
        {onClose && (
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Task Name */}
      <div className="space-y-2">
        <Label htmlFor="name">What do you need to do?</Label>
        <Input
          id="name"
          placeholder="e.g., Study Chapter 5, Write essay..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12"
          autoFocus
        />
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <Label>How challenging is this?</Label>
        <div className="grid grid-cols-3 gap-2">
          {difficultyOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDifficulty(option.value)}
              className={cn(
                "p-3 rounded-xl border-2 transition-all text-center",
                difficulty === option.value
                  ? option.value === 'low'
                    ? 'border-ff-difficulty-low bg-ff-difficulty-low/10'
                    : option.value === 'medium'
                    ? 'border-ff-difficulty-medium bg-ff-difficulty-medium/10'
                    : 'border-ff-difficulty-high bg-ff-difficulty-high/10'
                  : 'border-border hover:border-primary/30'
              )}
            >
              <span className="text-2xl block mb-1">{option.icon}</span>
              <span className="font-semibold text-sm">{option.label}</span>
            </button>
          ))}
        </div>
        
        {difficulty === 'high' && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-ff-difficulty-high/10 border border-ff-difficulty-high/20">
            <AlertTriangle className="w-4 h-4 text-ff-difficulty-high shrink-0 mt-0.5" />
            <p className="text-sm text-ff-difficulty-high">
              Hard tasks will be prioritized first in your daily plan when you're freshest!
            </p>
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="hours">Estimated time (hours)</Label>
        <div className="flex gap-2">
          {['0.5', '1', '2', '3', '4'].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setEstimatedHours(h)}
              className={cn(
                "flex-1 py-2 rounded-lg border-2 transition-all font-medium",
                estimatedHours === h
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/30'
              )}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled Day */}
      <div className="space-y-2">
        <Label htmlFor="day">Scheduled for</Label>
        <Input
          id="day"
          type="date"
          value={scheduledDay}
          onChange={(e) => setScheduledDay(e.target.value)}
          className="h-12"
        />
      </div>

      {/* Submit */}
      <Button type="submit" variant="calm" size="lg" className="w-full">
        <Plus className="w-5 h-5" />
        Add Task
      </Button>
    </form>
  );
}
