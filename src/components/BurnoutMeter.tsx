import { cn } from '@/lib/utils';
import { Flame, Leaf, Snowflake } from 'lucide-react';
import { BurnoutLevel } from '@/types/focusflow';

interface BurnoutMeterProps {
  burnoutLevel: BurnoutLevel;
  totalPomodoros: number;
  skippedBreaks: number;
}

export function BurnoutMeter({ burnoutLevel, totalPomodoros, skippedBreaks }: BurnoutMeterProps) {
  const getLevelInfo = () => {
    switch (burnoutLevel) {
      case 'lazy':
        return {
          label: 'Taking it Easy',
          icon: Snowflake,
          color: 'text-ff-lazy',
          bgColor: 'bg-ff-lazy/20',
          fillHeight: '25%',
          message: 'Ready to start focusing?',
        };
      case 'balanced':
        return {
          label: 'Perfectly Balanced',
          icon: Leaf,
          color: 'text-ff-balanced',
          bgColor: 'bg-ff-balanced/20',
          fillHeight: '50%',
          message: 'Great job maintaining balance!',
        };
      case 'burnout':
        return {
          label: 'Take a Break',
          icon: Flame,
          color: 'text-ff-burnout',
          bgColor: 'bg-ff-burnout/20',
          fillHeight: '85%',
          message: 'Consider resting soon',
        };
    }
  };

  const info = getLevelInfo();
  const Icon = info.icon;

  return (
    <div className="card-calm p-4 animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Thermometer */}
        <div className="relative w-8 h-32 bg-muted rounded-full overflow-hidden shadow-inner">
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700 ease-out",
              burnoutLevel === 'lazy' && 'bg-gradient-to-t from-ff-lazy to-ff-lazy/60',
              burnoutLevel === 'balanced' && 'bg-gradient-to-t from-ff-balanced to-ff-balanced/60',
              burnoutLevel === 'burnout' && 'bg-gradient-to-t from-ff-burnout to-ff-burnout/60'
            )}
            style={{ height: info.fillHeight }}
          />
          {/* Mercury bulb */}
          <div
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full shadow-lg",
              burnoutLevel === 'lazy' && 'bg-ff-lazy',
              burnoutLevel === 'balanced' && 'bg-ff-balanced',
              burnoutLevel === 'burnout' && 'bg-ff-burnout animate-pulse-soft'
            )}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className={cn("flex items-center gap-2 mb-1", info.color)}>
            <Icon className="w-5 h-5" />
            <span className="font-bold">{info.label}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{info.message}</p>
          
          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-secondary">
              🍅 {totalPomodoros} sessions
            </span>
            {skippedBreaks > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-ff-burnout/20 text-ff-burnout">
                ⚠️ {skippedBreaks} skipped breaks
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
