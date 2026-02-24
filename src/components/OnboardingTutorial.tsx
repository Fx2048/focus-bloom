import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Mic, Smile, Columns3, Award, ChevronRight } from 'lucide-react';

const ONBOARDING_KEY = 'tizza-onboarding-done';

export function useOnboarding() {
  const done = localStorage.getItem(ONBOARDING_KEY) === 'true';
  const markDone = () => localStorage.setItem(ONBOARDING_KEY, 'true');
  return { showOnboarding: !done, markOnboardingDone: markDone };
}

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const { t } = useLanguage();

  const steps = [
    { icon: Mic, title: t('onboarding.step1Title'), desc: t('onboarding.step1Desc'), color: 'text-primary' },
    { icon: Smile, title: t('onboarding.step2Title'), desc: t('onboarding.step2Desc'), color: 'text-accent' },
    { icon: Columns3, title: t('onboarding.step3Title'), desc: t('onboarding.step3Desc'), color: 'text-ff-balanced' },
    { icon: Award, title: t('onboarding.step4Title'), desc: t('onboarding.step4Desc'), color: 'text-ff-difficulty-medium' },
  ];

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm text-center">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step ? 'bg-primary w-8' : i < step ? 'bg-primary/40' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 ${current.color}`}>
          <Icon className="w-10 h-10" />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-foreground mb-3">{current.title}</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">{current.desc}</p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="calm"
            size="lg"
            className="w-full"
            onClick={() => {
              if (isLast) onComplete();
              else setStep(s => s + 1);
            }}
          >
            {isLast ? t('onboarding.start') : t('onboarding.next')}
            {!isLast && <ChevronRight className="w-5 h-5" />}
          </Button>
          
          <button
            onClick={onComplete}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('onboarding.skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
