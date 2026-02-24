import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Sparkles } from 'lucide-react';

const motivationEmojis = ['😴', '😔', '😐', '🙂', '😊', '😄', '🔥', '⚡', '🚀', '💫'];

interface MotivationSliderProps {
  motivationLevel: number;
  onMotivationChange: (level: number) => void;
  suggestedMood?: number;
}

export function MotivationSlider({ motivationLevel, onMotivationChange, suggestedMood }: MotivationSliderProps) {
  const { t } = useLanguage();

  return (
    <div className="card-calm p-5 animate-slide-up">
      <h3 className="font-bold text-foreground mb-4">{t('mood.title')}</h3>
      
      <div className="flex items-center justify-center mb-4">
        <span className="text-5xl animate-float" key={motivationLevel}>
          {motivationEmojis[motivationLevel - 1]}
        </span>
      </div>
      
      <div className="text-center mb-4">
        <span className="text-lg font-semibold text-foreground">
          {motivationLevel}/10
        </span>
        <p className="text-sm text-muted-foreground mt-1">
          {t(`mood.${motivationLevel}`)}
        </p>
      </div>

      <div className="relative px-2">
        <Slider
          value={[motivationLevel]}
          onValueChange={(value) => onMotivationChange(value[0])}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{t('mood.low')}</span>
          <span>{t('mood.high')}</span>
        </div>
      </div>

      {/* AI Suggestion */}
      {suggestedMood && suggestedMood !== motivationLevel && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs gap-1 text-primary"
            onClick={() => onMotivationChange(suggestedMood)}
          >
            <Sparkles className="w-3 h-3" />
            {t('mood.suggestion')}: {motivationEmojis[suggestedMood - 1]} {suggestedMood}/10
          </Button>
        </div>
      )}

      {motivationLevel <= 3 && (
        <div className="mt-4 p-3 rounded-xl bg-ff-lazy/10 border border-ff-lazy/20">
          <p className="text-sm text-ff-lazy">
            {t('mood.lowTip')}
          </p>
        </div>
      )}
    </div>
  );
}
