import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  timeoutId?: NodeJS.Timeout;
}

export function useNotifications() {
  const notificationsRef = useRef<Map<string, ScheduledNotification>>(new Map());
  const permissionRef = useRef<NotificationPermission>('default');

  // Check and request permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionRef.current = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission;
      return permission === 'granted';
    }

    return false;
  }, []);

  // Show notification immediately
  const showNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (permissionRef.current !== 'granted') {
      // Fallback to toast
      toast(title, { description: body });
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `focusflow-${Date.now()}`,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Also show as toast for in-app visibility
      toast(title, { description: body });
    } catch (e) {
      console.error('Failed to show notification:', e);
      toast(title, { description: body });
    }
  }, []);

  // Schedule notification for a specific time
  const scheduleNotification = useCallback((
    id: string,
    title: string,
    body: string,
    scheduledTime: Date,
    reminderMinutes: number = 10
  ) => {
    const now = new Date();
    const reminderTime = new Date(scheduledTime.getTime() - reminderMinutes * 60 * 1000);
    const delay = reminderTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Already past the reminder time
      return null;
    }

    // Clear any existing notification with this ID
    cancelNotification(id);

    const timeoutId = setTimeout(() => {
      showNotification(
        `⏰ ${title}`,
        `${body} - en ${reminderMinutes} minutos`
      );
      notificationsRef.current.delete(id);
    }, delay);

    const notification: ScheduledNotification = {
      id,
      title,
      body,
      scheduledTime,
      timeoutId,
    };

    notificationsRef.current.set(id, notification);
    return notification;
  }, [showNotification]);

  // Cancel a scheduled notification
  const cancelNotification = useCallback((id: string) => {
    const notification = notificationsRef.current.get(id);
    if (notification?.timeoutId) {
      clearTimeout(notification.timeoutId);
      notificationsRef.current.delete(id);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      notificationsRef.current.forEach((notification) => {
        if (notification.timeoutId) {
          clearTimeout(notification.timeoutId);
        }
      });
      notificationsRef.current.clear();
    };
  }, []);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    requestPermission,
    showNotification,
    scheduleNotification,
    cancelNotification,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
    permission: permissionRef.current,
  };
}
