import { useState } from 'react';
import type { UnlockedElement } from './useIslandProgression';

interface XpOrbProps {
  amount: number;
  onDone: () => void;
}

export function XpOrb({ amount, onDone }: XpOrbProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-bold text-white shadow-lg"
      style={{
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'float-up 2s ease-out forwards',
      }}
      onAnimationEnd={onDone}
    >
      <span>✨</span>
      <span>+{amount} XP</span>
    </div>
  );
}

export function useXpOrbs() {
  const [orbs, setOrbs] = useState<{ id: number; amount: number }[]>([]);
  let nextId = 0;

  const showOrb = (amount: number) => {
    const id = ++nextId;
    setOrbs((prev) => [...prev, { id, amount }]);
  };

  const removeOrb = (id: number) => {
    setOrbs((prev) => prev.filter((o) => o.id !== id));
  };

  return { orbs, showOrb, removeOrb };
}

