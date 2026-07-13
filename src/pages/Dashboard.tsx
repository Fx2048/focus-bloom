import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useGuestTasks } from '@/hooks/useGuestMode';
import { useProfile } from '@/hooks/useProfile';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useBadges } from '@/hooks/useBadges';
import { usePomodoroSessions } from '@/hooks/usePomodoroSessions';
import { useMoodCalculator } from '@/hooks/useMoodCalculator';
import { useLanguage } from '@/hooks/useLanguage';
import { useNotifications } from '@/hooks/useNotifications';
import { Header } from '@/components/Header';
import { BurnoutMeter } from '@/components/BurnoutMeter';
import { MotivationSlider } from '@/components/MotivationSlider';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AddTaskForm } from '@/components/AddTaskForm';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { AIDailyPlan } from '@/components/AIDailyPlan';
import { VoiceCommandButton } from '@/components/VoiceCommandButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CalendarPanel } from '@/components/CalendarPanel';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { MobileSearchBar } from '@/components/MobileSearchBar';
import { NotificationSettings } from '@/components/NotificationSettings';
import { GoogleCalendarSync } from '@/components/GoogleCalendarSync';
import { SpotifyPlayer } from '@/components/SpotifyPlayer';
import { OnboardingTutorial, useOnboarding } from '@/components/OnboardingTutorial';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  X,
  Loader2,
  LayoutDashboard,
  ListTodo,
  Search,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { BurnoutLevel, POINTS_PER_POMODORO, Task } from '@/types/focusflow';
import { LevelProgress } from '@/components/LevelProgress';
import { RpgHeroPanel } from '@/components/RpgHeroPanel';
import { AcademicProgressPanel } from '@/components/AcademicProgressPanel';
import { AcademicPdfUploader } from '@/components/AcademicPdfUploader';

export default function Dashboard() {
  const { user } = useAuth();
  const isGuest = !user;

  const authTasks = useTasks();
  const guestTasks = useGuestTasks();
  const taskHooks = isGuest ? guestTasks : authTasks;

  const {
    tasks,
    isLoading: tasksLoading,
    updateTaskStatus,
    updateTaskPomodoros,
    addTask,
    updateTask,
    deleteTask,
  } = taskHooks;

  const { profile, addPoints } = useProfile();
  const {
    motivationLevel,
    skippedBreaks,
    setMotivationLevel,
    incrementSkippedBreaks,
  } = useDailyLog();

  const { earnBadge } = useBadges();
  const { completedWorkSessions } = usePomodoroSessions();
  const { suggestedMood } = useMoodCalculator({ tasks, completedWorkSessions });
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showOnboarding, markOnboardingDone } = useOnboarding();

  const {
    enabled: notifEnabled,
    permission: notifPermission,
    toggleEnabled: toggleNotif,
    requestPermission: requestNotifPermission,
  } = useNotifications(tasks);

  const [showAddTask, setShowAddTask] = useState(false);
  const [activePomodoro, setActivePomodoro] = useState<{
    taskId: string;
    taskName: string;
  } | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboardingModal, setShowOnboardingModal] = useState(showOnboarding);
  const [activeTab, setActiveTab] = useState('summary');
  const [moodInitialized, setMoodInitialized] = useState(false);

  useEffect(() => {
    if (!moodInitialized && tasks.length > 0) {
      setMoodInitialized(true);
    }
  }, [tasks, moodInitialized]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;

    const query = searchQuery.toLowerCase();

    return tasks.filter((task) =>
      task.name.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const burnoutLevel = useMemo((): BurnoutLevel => {
    const hour = new Date().getHours();
    const completedToday = tasks.filter(
      (task) => task.status === 'completed'
    ).length;

    if (completedWorkSessions < 2 && hour < 14 && motivationLevel < 4) {
      return 'lazy';
    }

    if (
      completedWorkSessions > 8 ||
      skippedBreaks > 2 ||
      (hour > 20 && completedWorkSessions > 5) ||
      (completedToday > 4 && skippedBreaks > 1)
    ) {
      return 'burnout';
    }

    return 'balanced';
  }, [completedWorkSessions, skippedBreaks, motivationLevel, tasks]);

  const handleStartPomodoro = useCallback(
    async (taskId: string) => {
      const task = tasks.find((currentTask) => currentTask.id === taskId);

      if (task) {
        setActivePomodoro({ taskId, taskName: task.name });
      }
    },
    [tasks]
  );

  const handlePomodoroComplete = useCallback(
    async (taskId: string) => {
      const task = tasks.find((currentTask) => currentTask.id === taskId);

      if (task) {
        updateTaskPomodoros(taskId, task.completedPomodoros + 1);
        addPoints(POINTS_PER_POMODORO);

        if (completedWorkSessions === 0) earnBadge('first-focus');
        if (completedWorkSessions >= 9) earnBadge('consistency');
        if (new Date().getHours() < 9) earnBadge('early-bird');
      }
    },
    [
      tasks,
      updateTaskPomodoros,
      addPoints,
      completedWorkSessions,
      earnBadge,
    ]
  );

  const handleSkipBreak = useCallback(() => {
    incrementSkippedBreaks();
  }, [incrementSkippedBreaks]);

  const handleTaskComplete = useCallback(
    (taskId: string) => {
      const completedToday =
        tasks.filter((task) => task.status === 'completed').length + 1;

      if (completedToday >= 5) earnBadge('task-master');
      if (completedToday >= 3 && skippedBreaks === 0) {
        earnBadge('balanced-day');
      }
    },
    [tasks, skippedBreaks, earnBadge]
    completeTaskAndExplore(taskId);   // ← Añade esta línea
    };
  );

  const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) return t('greeting.morning');
    if (hour < 17) return t('greeting.afternoon');

    return t('greeting.evening');
  };

  if (tasksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = tasks.filter((task) => task.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      {showOnboardingModal && (
        <OnboardingTutorial
          onComplete={() => {
            markOnboardingDone();
            setShowOnboardingModal(false);
          }}
        />
      )}

      <Header />

      <main className="container mx-auto max-w-3xl px-4 py-6 pb-28">
        <div className="mb-5 animate-fade-in">
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            {getGreeting()} 👋
          </h1>

          <p className="text-muted-foreground">
            {pendingCount === 0
              ? t('greeting.noTasks')
              : `${pendingCount} ${t('greeting.tasksCount')}`}
          </p>
        </div>

        <div className="mb-5 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('search.placeholder')}
              className="h-10 w-full rounded-xl border-0 bg-muted pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-5"
        >
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-muted">
            <TabsTrigger
              value="summary"
              className="gap-2 rounded-lg font-semibold data-[state=active]:shadow-soft"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('tab.summary')}
            </TabsTrigger>

            <TabsTrigger
              value="tasks"
              className="gap-2 rounded-lg font-semibold data-[state=active]:shadow-soft"
            >
              <ListTodo className="h-4 w-4" />
              {t('tab.tasks')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-0 space-y-5">
            {!isGuest && (
              <RpgHeroPanel
                tasks={filteredTasks}
                onTaskClick={(task) => setEditingTask(task)}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <MotivationSlider
                motivationLevel={motivationLevel}
                onMotivationChange={setMotivationLevel}
                suggestedMood={suggestedMood}
              />

              <BurnoutMeter
                burnoutLevel={burnoutLevel}
                totalPomodoros={completedWorkSessions}
                skippedBreaks={skippedBreaks}
              />
            </div>

            {!isGuest && tasks.length > 0 && (
              <AIDailyPlan
                tasks={tasks}
                motivationLevel={motivationLevel}
                maxDailyHours={profile?.maxDailyHours ?? 6}
                onStartTask={handleStartPomodoro}
              />
            )}

            {!isGuest && <GoogleCalendarSync />}

            {!isGuest && <SpotifyPlayer />}

            <NotificationSettings
              enabled={notifEnabled}
              permission={notifPermission}
              onToggle={toggleNotif}
              onRequestPermission={requestNotifPermission}
            />

            <CalendarPanel
              tasks={filteredTasks}
              onTaskClick={(task) => setEditingTask(task)}
            />

            {!isGuest && <LevelProgress />}

            {!isGuest && <AcademicProgressPanel />}

            {!isGuest && <AcademicPdfUploader />}

            {!isGuest && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 gap-2 rounded-xl"
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 className="h-4 w-4" />
                  {t('analytics.viewAll')}
                </Button>

                <Button
                  variant="outline"
                  className="h-12 gap-2 rounded-xl"
                  onClick={() => navigate('/gamification')}
                >
                  🏆 Gamificación
                </Button>

                <Button
                  variant="outline"
                  className="h-12 gap-2 rounded-xl"
                  onClick={() => navigate('/mentoring')}
                >
                  👥 Mentoring
                </Button>

                <Button
                  variant="outline"
                  className="h-12 gap-2 rounded-xl"
                  onClick={() => navigate('/schedule')}
                >
                  📚 Horario
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-0 space-y-5">
            <VoiceCommandButton onTaskCreate={addTask} />

            <KanbanBoard
              tasks={filteredTasks}
              onStartPomodoro={handleStartPomodoro}
              onUpdateStatus={(taskId, status) => {
                updateTaskStatus(taskId, status);

                if (status === 'completed') {
                  handleTaskComplete(taskId);
                }
              }}
              onDeleteTask={deleteTask}
            />
          </TabsContent>
        </Tabs>

        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-4 backdrop-blur-sm animate-fade-in sm:items-center">
            <div className="card-elevated w-full max-w-md animate-slide-up p-6">
              <AddTaskForm
                onClose={() => setShowAddTask(false)}
                onAddTask={(taskData) => {
                  addTask(taskData);
                  setShowAddTask(false);
                }}
              />
            </div>
          </div>
        )}

        <ThemeToggle />

        <TaskEditDialog
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(taskId, updates) => updateTask(taskId, updates)}
          onDelete={(taskId) => deleteTask(taskId)}
        />

        <div className="fixed bottom-16 left-1/2 z-40 -translate-x-1/2 sm:bottom-6">
          <Button
            size="xl"
            variant={showAddTask ? 'soft' : 'calm'}
            onClick={() => setShowAddTask(!showAddTask)}
            className={cn(
              'h-14 gap-2 rounded-full px-6 shadow-elevated',
              showAddTask && 'rotate-0'
            )}
          >
            {showAddTask ? (
              <>
                <X className="h-5 w-5" />
                {t('voice.cancelBtn')}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                {t('addTask.submit')}
              </>
            )}
          </Button>
        </div>

        <MobileSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {activePomodoro && (
          <PomodoroTimer
            taskId={activePomodoro.taskId}
            taskName={activePomodoro.taskName}
            burnoutLevel={burnoutLevel}
            onComplete={() => handlePomodoroComplete(activePomodoro.taskId)}
            onSkipBreak={handleSkipBreak}
            onClose={() => setActivePomodoro(null)}
          />
        )}
      </main>
    </div>
  );
}
