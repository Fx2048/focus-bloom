import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { ChallengesList } from '@/components/ChallengesList';
import { Leaderboard } from '@/components/Leaderboard';
import { PointsBadges } from '@/components/PointsBadges';
import { useBadges } from '@/hooks/useBadges';
import { useProfile } from '@/hooks/useProfile';
import { usePomodoroSessions } from '@/hooks/usePomodoroSessions';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Star, Flame, Map, X, Sparkles, Lock } from 'lucide-react';

import { IslandCanvas } from '@/components/island/IslandCanvas';
import { IslandCollection } from '@/components/island/IslandCollection';
import { IslandThemeSelector } from '@/components/island/IslandThemeSelector';
import { XpOrb } from '@/components/island/XpOrb';
import { useIslandProgression } from '@/components/island/useIslandProgression';
import type { UnlockedElement, IslandTheme } from '@/components/island/useIslandProgression';

/* ------------------------------------------------------------------ */
/* Element info panel                                                   */
/* ------------------------------------------------------------------ */

const ELEMENT_EMOJIS: Record<string, string> = {
  sprout: '🌱', flower: '🌸', rock: '🪨', bush: '🌿', mushroom: '🍄',
  tree: '🌳', butterfly: '🦋', waterfall: '💧', cabin: '🏠',
  bridge: '🌉', crystal: '💎', statue: '🗿', arch: '⛩️', sanctuary: '🏛️',
};

function ElementInfoPanel({
  element,
  accent,
  onClose,
}: {
  element: UnlockedElement;
  accent: string;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute bottom-4 left-1/2 z-30 w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-white/30 bg-black/60 p-4 text-white shadow-2xl backdrop-blur-md"
      style={{ animation: 'xp-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full p-1 text-white/60 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{ELEMENT_EMOJIS[element.type] ?? '✨'}</span>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
            Elemento desbloqueado
          </p>
          <h3 className="text-base font-bold">{element.label}</h3>
          <p className="mt-0.5 text-xs text-white/70">{element.unlockedBy}</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-300">
            <Star className="h-3 w-3" />
            {element.xpRequired} XP requeridos
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Next-unlock hint                                                     */
/* ------------------------------------------------------------------ */

function NextUnlockHint({
  nextUnlock,
  xpToGo,
  totalXp,
}: {
  nextUnlock: UnlockedElement | null;
  xpToGo: number;
  totalXp: number;
}) {
  if (!nextUnlock) return null;
  const progressPct = Math.max(0, Math.min(100, ((totalXp - (nextUnlock.xpRequired - xpToGo)) / (nextUnlock.xpRequired - (nextUnlock.xpRequired - xpToGo))) * 100));

  return (
    <div className="rounded-2xl border border-amber-200/60 bg-amber-50/80 p-3 dark:border-amber-800/40 dark:bg-amber-950/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            Próximo: {nextUnlock.label}
          </span>
        </div>
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
          {xpToGo} XP
        </span>
      </div>
      <Progress
        value={Math.max(5, 100 - (xpToGo / nextUnlock.xpRequired) * 100)}
        className="mt-2 h-1.5 rounded-full"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */

export default function Gamification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { badges } = useBadges();
  const { profile } = useProfile();
  const { completedWorkSessions } = usePomodoroSessions();
  const { tasks } = useTasks();

  const {
    xp,
    level,
    levelProgress,
    currentXp,
    nextLevelXp,
    stage,
    stageName,
    stageEmoji,
    unlockedElements,
    newlyUnlockedIds,
    nextUnlock,
    selectedTheme,
    unlockedThemes,
    setTheme,
  } = useIslandProgression();

  const [selectedElement, setSelectedElement] = useState<UnlockedElement | null>(null);
  const [orbList, setOrbList] = useState<{ id: number; amount: number }[]>([]);
  const orbIdRef = useRef(0);
  const prevXpRef = useRef(xp);

  // Show XP orb when XP increases
  useEffect(() => {
    if (xp > prevXpRef.current && prevXpRef.current > 0) {
      const gained = xp - prevXpRef.current;
      const id = ++orbIdRef.current;
      setOrbList((prev) => [...prev, { id, amount: gained }]);
    }
    prevXpRef.current = xp;
  }, [xp]);

  const removeOrb = (id: number) => {
    setOrbList((prev) => prev.filter((o) => o.id !== id));
  };

  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const xpToNextUnlock = nextUnlock ? nextUnlock.xpRequired - xp : 0;

  const themeConfig = selectedTheme;

  if (!user) {
    navigate('/');
    return null;
  }

  const LEVEL_TITLES = [
    'Novato', 'Aprendiz', 'Estudiante', 'Enfocado', 'Dedicado',
    'Experto', 'Maestro', 'Leyenda', 'Titán', 'Inmortal', 'Trascendente',
  ];
  const levelTitle = LEVEL_TITLES[level - 1] ?? 'Trascendente';

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(160deg, ${themeConfig.sky[0]}55 0%, ${themeConfig.sky[1]}33 50%, transparent 100%)`,
        backgroundColor: 'hsl(var(--background))',
      }}
    >
      {/* XP Orbs */}
      {orbList.map((orb) => (
        <XpOrb key={orb.id} amount={orb.amount} onDone={() => removeOrb(orb.id)} />
      ))}

      <Header />

      <main className="container max-w-2xl space-y-4 px-4 pb-24 pt-4">
        {/* Title row */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">🏝️ Mi Isla</h1>
            <p className="text-xs text-muted-foreground">
              {stageEmoji} {stageName} · Nivel {level} {levelTitle}
            </p>
          </div>
          {/* XP pill */}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.sky[1]})` }}
          >
            <Star className="h-3.5 w-3.5" />
            {xp.toLocaleString()} XP
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="island">
          <TabsList className="grid w-full grid-cols-5 rounded-2xl">
            <TabsTrigger value="island" className="rounded-xl text-xs">🏝️ Isla</TabsTrigger>
            <TabsTrigger value="collection" className="rounded-xl text-xs">🎒 Colec.</TabsTrigger>
            <TabsTrigger value="challenges" className="rounded-xl text-xs">⚔️ Retos</TabsTrigger>
            <TabsTrigger value="ranking" className="rounded-xl text-xs">🏆 Ranking</TabsTrigger>
            <TabsTrigger value="themes" className="rounded-xl text-xs">🎨 Temas</TabsTrigger>
          </TabsList>

          {/* ── ISLAND TAB ── */}
          <TabsContent value="island" className="mt-4 space-y-4">
            {/* Island canvas */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <IslandCanvas
                stage={stage}
                unlockedElements={unlockedElements}
                newlyUnlockedIds={newlyUnlockedIds}
                theme={selectedTheme.id as IslandTheme}
                onElementClick={(el) => setSelectedElement(el)}
              />

              {/* Element info overlay */}
              {selectedElement && (
                <ElementInfoPanel
                  element={selectedElement}
                  accent={themeConfig.accent}
                  onClose={() => setSelectedElement(null)}
                />
              )}

              {/* Newly unlocked badge */}
              {newlyUnlockedIds.length > 0 && (
                <div
                  className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-white shadow-lg"
                  style={{ animation: 'xp-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
                >
                  ✨ {newlyUnlockedIds.length} nuevo{newlyUnlockedIds.length > 1 ? 's' : ''} elemento{newlyUnlockedIds.length > 1 ? 's' : ''} desbloqueado{newlyUnlockedIds.length > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* XP progress bar */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-white shadow"
                    style={{ background: `linear-gradient(135deg, ${themeConfig.grass[0]}, ${themeConfig.grass[1]})` }}
                  >
                    {level}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nivel
                    </p>
                    <p className="text-base font-bold text-foreground">{levelTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Próximo nivel</p>
                  <p className="text-sm font-bold text-foreground">
                    {currentXp}/{nextLevelXp} XP
                  </p>
                </div>
              </div>
              <Progress value={levelProgress} className="h-3 rounded-full" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '⭐', label: 'XP Total', value: xp.toLocaleString() },
                { icon: '🎖️', label: 'Nivel', value: level },
                { icon: '📚', label: 'Hoy', value: completedToday },
                { icon: '🍅', label: 'Pomodoros', value: completedWorkSessions },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border/40 bg-card p-3 text-center shadow-sm"
                >
                  <span className="text-xl">{icon}</span>
                  <p className="text-base font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Next unlock hint */}
            <NextUnlockHint
              nextUnlock={nextUnlock}
              xpToGo={xpToNextUnlock}
              totalXp={xp}
            />

            {/* Explore instruction */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                <Map className="mb-0.5 mr-1 inline h-3 w-3" />
                Toca cualquier elemento para descubrir cómo lo desbloqueaste. Arrastra los animalitos para moverlos; también pasean solos por la isla
              </p>
            </div>

            {/* Badges */}
            <PointsBadges
              totalPoints={profile?.totalPoints ?? 0}
              badges={badges}
              completedTasksToday={completedToday}
              totalPomodorosToday={completedWorkSessions}
            />
          </TabsContent>

          {/* ── COLLECTION TAB ── */}
          <TabsContent value="collection" className="mt-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Colección de la Isla</h3>
              </div>
              <IslandCollection xp={xp} unlockedElements={unlockedElements} />
            </div>
          </TabsContent>

          {/* ── CHALLENGES TAB ── */}
          <TabsContent value="challenges" className="mt-4">
            <ChallengesList />
          </TabsContent>

          {/* ── RANKING TAB ── */}
          <TabsContent value="ranking" className="mt-4">
            <Leaderboard />
          </TabsContent>

          {/* ── THEMES TAB ── */}
          <TabsContent value="themes" className="mt-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <h3 className="text-lg font-bold text-foreground">Temas Visuales</h3>
              </div>
              <IslandThemeSelector
                level={level}
                selectedTheme={selectedTheme.id}
                onSelect={(t) => setTheme(t)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
