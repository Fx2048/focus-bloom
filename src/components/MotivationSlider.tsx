import { Slider } from '@/components/ui/slider';

const motivationEmojis = ['😴', '😔', '😐', '🙂', '😊', '😄', '🔥', '⚡', '🚀', '💫'];
const motivationLabels = [
  'Very low energy',
  'Feeling tired',
  'A bit sluggish',
  'Okay-ish',
  'Feeling alright',
  'Pretty good',
  'Motivated!',
  'Very energized',
  'Super focused!',
  'Unstoppable!'
];

interface MotivationSliderProps {
  motivationLevel: number;
  onMotivationChange: (level: number) => void;
}

export function MotivationSlider({ motivationLevel, onMotivationChange }: MotivationSliderProps) {
  return (
    <div className="card-calm p-5 animate-slide-up">
      <h3 className="font-bold text-foreground mb-4">How are you feeling today?</h3>
      
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
          {motivationLabels[motivationLevel - 1]}
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
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {motivationLevel <= 3 && (
        <div className="mt-4 p-3 rounded-xl bg-ff-lazy/10 border border-ff-lazy/20">
          <p className="text-sm text-ff-lazy">
            💙 It's okay to take it easy. We'll plan lighter tasks for you today.
          </p>
        </div>
      )}
    </div>
  );
}
