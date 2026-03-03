import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

function StatCard({ label, value, prev, unit = '' }: { label: string; value: number; prev: number; unit?: string }) {
  const diff = prev > 0 ? ((value - prev) / prev) * 100 : 0;
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor = diff > 0 ? 'text-ff-balanced' : diff < 0 ? 'text-ff-burnout' : 'text-muted-foreground';

  return (
    <div className="card-calm p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}{unit}
        </span>
        {prev > 0 && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(Math.round(diff))}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const { data, isLoading } = useAnalytics(range);
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chartData = data?.current || [];
  const totals = data?.totals;

  const chartColors = {
    pomodoro: 'hsl(150, 50%, 50%)',
    tasks: 'hsl(15, 75%, 55%)',
    mood: 'hsl(210, 60%, 60%)',
    breaks: 'hsl(0, 65%, 55%)',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 pb-28 max-w-3xl mx-auto">
        {/* Back button + Title */}
        <div className="flex items-center gap-3 mb-5">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{t('analytics.title')}</h1>
        </div>

        {/* Range Tabs */}
        <Tabs value={range} onValueChange={(v) => setRange(v as 'week' | 'month')} className="space-y-5">
          <TabsList className="w-full grid grid-cols-2 h-10 rounded-xl bg-muted">
            <TabsTrigger value="week" className="rounded-lg font-semibold data-[state=active]:shadow-soft">
              {t('analytics.weekly')}
            </TabsTrigger>
            <TabsTrigger value="month" className="rounded-lg font-semibold data-[state=active]:shadow-soft">
              {t('analytics.monthly')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={range} className="space-y-5 mt-0">
            {/* Summary Cards */}
            {totals && (
              <div className="grid grid-cols-2 gap-3">
                <StatCard label={t('analytics.pomodoros')} value={totals.pomodoros} prev={totals.prevPomodoros} />
                <StatCard label={t('analytics.tasksCompleted')} value={totals.tasks} prev={totals.prevTasks} />
                <StatCard label={t('analytics.avgMood')} value={totals.avgMood} prev={totals.prevAvgMood} unit="/10" />
                <StatCard label={t('analytics.skippedBreaks')} value={totals.skippedBreaks} prev={0} />
              </div>
            )}

            {/* Pomodoros Chart */}
            <div className="card-calm p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">🍅 {t('analytics.pomodoroTrend')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="pomodoros" fill={chartColors.pomodoro} radius={[6, 6, 0, 0]} name="Pomodoros" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tasks Completed Chart */}
            <div className="card-calm p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">✅ {t('analytics.tasksTrend')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="tasksCompleted" fill={chartColors.tasks} radius={[6, 6, 0, 0]} name={t('analytics.tasksCompleted')} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Trend */}
            <div className="card-calm p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">😊 {t('analytics.moodTrend')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: 12,
                    }}
                  />
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.mood} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.mood} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="motivationLevel"
                    stroke={chartColors.mood}
                    fill="url(#moodGradient)"
                    strokeWidth={2}
                    name={t('analytics.avgMood')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Burnout Indicator - Skipped Breaks */}
            <div className="card-calm p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">⚠️ {t('analytics.burnoutTrend')}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="skippedBreaks"
                    stroke={chartColors.breaks}
                    strokeWidth={2}
                    dot={{ r: 4, fill: chartColors.breaks }}
                    name={t('analytics.skippedBreaks')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
