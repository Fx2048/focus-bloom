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
import { OnboardingTutorial, useOnboarding } from '@/components/OnboardingTutorial';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Loader2, LayoutDashboard, ListTodo, Search, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { BurnoutLevel, POINTS_PER_POMODORO, Task } from '@/types/focusflow';

export default function Dashboard() {
  const { user } = useAuth();
  const isGuest = !user;
  
  // Use guest hooks for guest mode, real hooks for authenticated
  const authTasks = useTasks();
  const guestTasks = useGuestTasks();
  const taskHooks = isGuest ? guestTasks : authTasks;
  const { tasks, isLoading: tasksLoading, updateTaskStatus, updateTaskPomodoros, addTask, updateTask, deleteTask } = taskHooks;
  
  const { profile, addPoints } = useProfile();
  const { motivationLevel, skippedBreaks, setMotivationLevel, incrementSkippedBreaks } = useDailyLog();
  const { badges, earnBadge } = useBadges();
  const { completedWorkSessions, createSession, completeSession } = usePomodoroSessions();
  const { suggestedMood } = useMoodCalculator({ tasks, completedWorkSessions });
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showOnboarding, markOnboardingDone } = useOnboarding();
  const { enabled: notifEnabled, permission: notifPermission, toggleEnabled: toggleNotif, requestPermission: requestNotifPermission } = useNotifications(tasks);
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [activePomodoro, setActivePomodoro] = useState<{ taskId: string; taskName: string } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboardingModal, setShowOnboardingModal] = useState(showOnboarding);
  const [activeTab, setActiveTab] = useState('summary');
  const [moodInitialized, setMoodInitialized] = useState(false);

  // Suggest mood on first load
  useEffect(() => {
    if (!moodInitialized && tasks.length > 0) {
      setMoodInitialized(true);
      // Don't override if user already set it today
    }
  }, [tasks, moodInitialized]);

  // Filter tasks by search
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t => t.name.toLowerCase().includes(q));
  }, [tasks, searchQuery]);

  // Calculate burnout level
  const burnoutLevel = useMemo((): BurnoutLevel => {
    const hour = new Date().getHours();
    const completedToday = tasks.filter(t => t.status === 'completed').length;

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

  const handleStartPomodoro = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActivePomodoro({ taskId, taskName: task.name });
    }
  }, [tasks]);

  const handlePomodoroComplete = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTaskPomodoros(taskId, task.completedPomodoros + 1);
      addPoints(POINTS_PER_POMODORO);
      if (completedWorkSessions === 0) earnBadge('first-focus');
      if (completedWorkSessions >= 9) earnBadge('consistency');
      if (new Date().getHours() < 9) earnBadge('early-bird');
    }
  }, [tasks, updateTaskPomodoros, addPoints, completedWorkSessions, earnBadge]);

  const handleSkipBreak = useCallback(() => {
    incrementSkippedBreaks();
  }, [incrementSkippedBreaks]);

  const handleTaskComplete = useCallback((taskId: string) => {
    const completedToday = tasks.filter(t => t.status === 'completed').length + 1;
    if (completedToday >= 5) earnBadge('task-master');
    if (completedToday >= 3 && skippedBreaks === 0) earnBadge('balanced-day');
  }, [tasks, skippedBreaks, earnBadge]);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 17) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding */}
      {showOnboardingModal && (
        <OnboardingTutorial onComplete={() => {
          markOnboardingDone();
          setShowOnboardingModal(false);
        }} />
      )}

      <Header />

      <main className="container px-4 py-6 pb-28 max-w-3xl mx-auto">
        {/* Greeting */}
        <div className="mb-5 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {getGreeting()} 👋
          </h1>
          <p className="text-muted-foreground">
            {pendingCount === 0
              ? t('greeting.noTasks')
              : `${pendingCount} ${t('greeting.tasksCount')}`}
          </p>
        </div>

        {/* Desktop search bar */}
        <div className="hidden sm:block mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full pl-9 h-10 bg-muted border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="w-full grid grid-cols-2 h-12 rounded-xl bg-muted">
            <TabsTrigger value="summary" className="rounded-lg gap-2 font-semibold data-[state=active]:shadow-soft">
              <LayoutDashboard className="w-4 h-4" />
              {t('tab.summary')}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-lg gap-2 font-semibold data-[state=active]:shadow-soft">
              <ListTodo className="w-4 h-4" />
              {t('tab.tasks')}
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB: SUMMARY ===== */}
          <TabsContent value="summary" className="space-y-5 mt-0">
            {/* Mood + Burnout grid */}
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

            {/* AI Daily Plan */}
            {!isGuest && tasks.length > 0 && (
              <AIDailyPlan 
                tasks={tasks}
                motivationLevel={motivationLevel}
                maxDailyHours={profile?.maxDailyHours ?? 6}
                onStartTask={handleStartPomodoro}
              />
            )}

            {/* Google Calendar Sync */}
            {!isGuest && <GoogleCalendarSync />}

            {/* Notifications */}
            <NotificationSettings
              enabled={notifEnabled}
              permission={notifPermission}
              onToggle={toggleNotif}
              onRequestPermission={requestNotifPermission}
            />

            {/* Calendar Panel */}
            <CalendarPanel 
              tasks={filteredTasks} 
              onTaskClick={(task) => setEditingTask(task)} 
            />

            {/* Analytics Link */}
            {!isGuest && (
              <Button
                variant="outline"
                className="w-full gap-2 rounded-xl h-12"
                onClick={() => navigate('/analytics')}
              >
                <BarChart3 className="w-4 h-4" />
                {t('analytics.viewAll')}
              </Button>
            )}
          </TabsContent>

          {/* ===== TAB: TASKS ===== */}
          <TabsContent value="tasks" className="space-y-5 mt-0">
            {/* Voice Command Button */}
            <VoiceCommandButton onTaskCreate={addTask} />

            {/* Kanban Board */}
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

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md card-elevated p-6 animate-slide-up">
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

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Task Edit Dialog */}
        <TaskEditDialog
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(taskId, updates) => updateTask(taskId, updates)}
          onDelete={(taskId) => deleteTask(taskId)}
        />

        {/* Floating Add Button — centered bottom */}
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Button
            size="xl"
            variant={showAddTask ? "soft" : "calm"}
            onClick={() => setShowAddTask(!showAddTask)}
            className={cn(
              "rounded-full h-14 px-6 shadow-elevated gap-2",
              showAddTask && "rotate-0"
            )}
          >
            {showAddTask ? (
              <>
                <X className="w-5 h-5" />
                {t('voice.cancelBtn')}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                {t('addTask.submit')}
              </>
            )}
          </Button>
        </div>

        {/* Mobile Search Bar */}
        <MobileSearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Pomodoro Timer Modal */}
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
