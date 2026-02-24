import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useBadges } from '@/hooks/useBadges';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Award, Sparkles, Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AVAILABLE_BADGES } from '@/types/focusflow';

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { badges } = useBadges();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [maxHours, setMaxHours] = useState(String(profile?.maxDailyHours ?? 6));

  const isGuest = !user;

  const handleSaveHours = () => {
    const num = Math.min(12, Math.max(1, parseInt(maxHours) || 6));
    setMaxHours(String(num));
    if (!isGuest) {
      updateProfile({ maxDailyHours: num });
    } else {
      localStorage.setItem('tizza-guest-max-hours', String(num));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center h-16 px-4 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold gradient-text-calm ml-2">{t('profile.title')}</h1>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* User info */}
        <div className="card-calm p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-primary">
              {isGuest ? '👤' : user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="font-semibold text-foreground">
            {isGuest ? 'Modo Invitado' : user?.email}
          </p>
          {isGuest && (
            <p className="text-sm text-muted-foreground mt-1">
              Crea una cuenta para sincronizar tus datos
            </p>
          )}
        </div>

        {/* Max daily hours */}
        <div className="card-calm p-5">
          <Label className="font-bold text-foreground mb-3 block">{t('profile.maxHours')}</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={12}
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              className="flex-1"
            />
            <Button variant="calm" onClick={handleSaveHours}>
              {t('voice.saveBtn')}
            </Button>
          </div>
        </div>

        {/* Points */}
        <div className="card-calm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-foreground">{t('points.title')}</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{profile?.totalPoints ?? 0}</p>
        </div>

        {/* Badges */}
        <div className="card-calm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">{t('badges.title')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_BADGES.map((badge) => {
              const earned = badges.find(b => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border transition-colors ${
                    earned
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-muted/30 opacity-50'
                  }`}
                >
                  <span className="text-2xl block mb-1">{badge.icon}</span>
                  <p className="font-semibold text-sm text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {earned && (
                    <p className="text-xs text-primary mt-1">
                      ✓ {t('task.completed')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open('https://forms.gle/your-feedback-form', '_blank')}
        >
          <MessageSquare className="w-4 h-4" />
          {t('profile.feedback')}
        </Button>
      </main>
    </div>
  );
}
