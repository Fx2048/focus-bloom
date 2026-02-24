import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { Flame, Leaf, Snowflake } from 'lucide-react';
import { BurnoutLevel } from '@/types/focusflow';

interface BurnoutMeterProps {
  burnoutLevel: BurnoutLevel;
  totalPomodoros: number;
  skippedBreaks: number;
}

export function BurnoutMeter({ burnoutLevel, totalPomodoros, skippedBreaks }: BurnoutMeterProps) {
  const { t } = useLanguage();

  const getLevelInfo = () => {
    switch (burnoutLevel) {
      case 'lazy':
        return {
          label: t('burnout.lazy'),
          icon: Snowflake,
          color: 'text-ff-lazy',
          bgColor: 'bg-ff-lazy/20',
          fillHeight: '25%',
          message: t('burnout.lazyMsg'),
        };
      case 'balanced':
        return {
          label: t('burnout.balanced'),
          icon: Leaf,
          color: 'text-ff-balanced',
          bgColor: 'bg-ff-balanced/20',
          fillHeight: '50%',
          message: t('burnout.balancedMsg'),
        };
      case 'burnout':
        return {
          label: t('burnout.burnout'),
          icon: Flame,
          color: 'text-ff-burnout',
          bgColor: 'bg-ff-burnout/20',
          fillHeight: '85%',
          message: t('burnout.burnoutMsg'),
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
          
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-secondary">
              🍅 {totalPomodoros} {t('burnout.sessions')}
            </span>
            {skippedBreaks > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-ff-burnout/20 text-ff-burnout">
                ⚠️ {skippedBreaks} {t('burnout.skippedBreaks')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
