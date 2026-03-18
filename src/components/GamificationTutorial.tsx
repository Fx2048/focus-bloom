import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Swords, TrendingUp, Star, Medal, ChevronRight } from 'lucide-react';

const GAMIFICATION_TUTORIAL_KEY = 'tizza-gamification-tutorial-done';

export function useGamificationTutorial() {
  const done = localStorage.getItem(GAMIFICATION_TUTORIAL_KEY) === 'true';
  const markDone = () => localStorage.setItem(GAMIFICATION_TUTORIAL_KEY, 'true');
  return { showTutorial: !done, markTutorialDone: markDone };
}

interface GamificationTutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Trophy,
    title: 'Ranking Global',
    desc: 'Compite con otros estudiantes en el leaderboard. Cada sesión Pomodoro y tarea completada te sube de posición.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: TrendingUp,
    title: 'Sistema de Niveles',
    desc: 'Gana XP completando tareas, sesiones y retos. Sube de nivel desde Novato hasta Trascendente — 11 niveles en total.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Swords,
    title: 'Retos Semanales',
    desc: 'Únete a retos como "Maratonista Pomodoro" o "Madrugador". Cada reto completado te da XP extra y reconocimiento.',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  {
    icon: Medal,
    title: 'Badges y Logros',
    desc: 'Desbloquea badges únicos por hitos especiales: primer Pomodoro, día balanceado, racha imparable y más.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Star,
    title: '¡A jugar!',
    desc: 'Tu progreso se guarda automáticamente. Cada acción cuenta — completa tareas, mantén rachas y domina los retos.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export function GamificationTutorial({ onComplete }: GamificationTutorialProps) {
  const [step, setStep] = useState(0);

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
              className={`h-2.5 rounded-full transition-all ${
                i === step ? 'bg-primary w-8' : i < step ? 'bg-primary/40 w-2.5' : 'bg-muted w-2.5'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 rounded-3xl ${current.bg} flex items-center justify-center mx-auto mb-6 ${current.color} animate-scale-in`}>
          <Icon className="w-10 h-10" />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-foreground mb-3 animate-slide-up">{current.title}</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed animate-slide-up">{current.desc}</p>

        {/* Step counter */}
        <p className="text-xs text-muted-foreground mb-4">{step + 1} de {steps.length}</p>

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
            {isLast ? '🚀 ¡Empezar!' : 'Siguiente'}
            {!isLast && <ChevronRight className="w-5 h-5" />}
          </Button>

          <button
            onClick={onComplete}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Saltar tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
