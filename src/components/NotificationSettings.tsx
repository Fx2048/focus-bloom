import { useLanguage } from '@/hooks/useLanguage';
import { Bell, BellOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface NotificationSettingsProps {
  enabled: boolean;
  permission: string;
  onToggle: () => void;
  onRequestPermission: () => void;
}

export function NotificationSettings({ enabled, permission, onToggle, onRequestPermission }: NotificationSettingsProps) {
  const { t } = useLanguage();

  return (
    <div className="card-calm p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">{t('notifications.title')}</p>
            <p className="text-xs text-muted-foreground">{t('notifications.description')}</p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={() => {
            if (permission === 'default') {
              onRequestPermission();
            } else {
              onToggle();
            }
          }}
        />
      </div>
      {enabled && (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground">✅ {t('notifications.taskReminder')}</p>
          <p className="text-xs text-muted-foreground">✅ {t('notifications.morningSummary')}</p>
          <p className="text-xs text-muted-foreground">✅ {t('notifications.breakReminder')}</p>
        </div>
      )}
    </div>
  );
}
