import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { Task } from '@/types/focusflow';

type NotifPermission = 'granted' | 'denied' | 'default';

export function useNotifications(tasks: Task[] = []) {
  const [permission, setPermission] = useState<NotifPermission>('default');
  const [enabled, setEnabled] = useState(() => localStorage.getItem('tizza-notifications') === 'true');
  const notifiedTasksRef = useRef<Set<string>>(new Set());
  const breakReminderRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const morningShownRef = useRef(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission as NotifPermission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones');
      return false;
    }
    const result = await Notification.requestPermission();
    setPermission(result as NotifPermission);
    if (result === 'granted') {
      setEnabled(true);
      localStorage.setItem('tizza-notifications', 'true');
      toast.success('¡Notificaciones activadas!');
      return true;
    }
    toast.error('Permiso de notificaciones denegado');
    return false;
  }, []);

  const toggleEnabled = useCallback(() => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem('tizza-notifications', String(newState));
    if (newState && permission !== 'granted') {
      requestPermission();
    }
  }, [enabled, permission, requestPermission]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (!enabled || permission !== 'granted') return;
    try {
      new Notification(title, { body, icon: '/favicon.ico', tag: `tizza-${Date.now()}` });
    } catch {
      toast(title, { description: body });
    }
  }, [enabled, permission]);

  // Task reminders (10 min before)
  useEffect(() => {
    if (!enabled || !tasks.length) return;
    const interval = setInterval(() => {
      const now = new Date();
      tasks.filter(t => t.status !== 'completed').forEach(task => {
        const scheduled = new Date(task.scheduledDay);
        scheduled.setHours(9, 0, 0, 0);
        const diffMin = (scheduled.getTime() - now.getTime()) / 60000;
        if (diffMin > 0 && diffMin <= 10 && !notifiedTasksRef.current.has(task.id)) {
          notifiedTasksRef.current.add(task.id);
          sendNotification('⏰ Tarea próxima', `"${task.name}" comienza en ${Math.round(diffMin)} min`);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [enabled, tasks, sendNotification]);

  // Morning summary
  useEffect(() => {
    if (!enabled || morningShownRef.current) return;
    const check = () => {
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() < 5 && !morningShownRef.current) {
        morningShownRef.current = true;
        const pending = tasks.filter(t => t.status !== 'completed').length;
        if (pending > 0) {
          sendNotification('🌅 Buenos días', `Tienes ${pending} tarea${pending > 1 ? 's' : ''} pendiente${pending > 1 ? 's' : ''} hoy.`);
        }
      }
    };
    const interval = setInterval(check, 60000);
    check();
    return () => clearInterval(interval);
  }, [enabled, tasks, sendNotification]);

  // Break reminder
  const startBreakReminder = useCallback((pomodoroCount: number) => {
    if (!enabled) return;
    if (breakReminderRef.current) clearTimeout(breakReminderRef.current);
    if (pomodoroCount >= 3) {
      breakReminderRef.current = setTimeout(() => {
        sendNotification('🧘 Momento de descanso', `Llevas ${pomodoroCount} sesiones seguidas. Tu bienestar importa.`);
      }, 5 * 60 * 1000);
    }
  }, [enabled, sendNotification]);

  // Legacy API compatibility
  const showNotification = sendNotification;
  const scheduleNotification = useCallback((_id: string, title: string, body: string) => {
    sendNotification(title, body);
    return null;
  }, [sendNotification]);
  const cancelNotification = useCallback((_id: string) => {}, []);

  return {
    permission,
    enabled,
    requestPermission,
    toggleEnabled,
    sendNotification,
    startBreakReminder,
    // Legacy API
    showNotification,
    scheduleNotification,
    cancelNotification,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
  };
}
