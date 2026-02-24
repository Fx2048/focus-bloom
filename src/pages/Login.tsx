import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Mail, Sparkles, Shield, Heart, Lock, UserPlus, LogIn, Globe, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setIsLoading(true);
    
    if (isSignUp) {
      await signUp(email.trim(), password);
    } else {
      await signIn(email.trim(), password);
    }
    
    setIsLoading(false);
  };

  const handleGuestMode = () => {
    localStorage.setItem('tizza-guest-mode', 'true');
    navigate('/dashboard');
  };

  const features = [
    { icon: Sparkles, text: t('login.aiPlanning') },
    { icon: Shield, text: t('login.burnoutPrevention') },
    { icon: Heart, text: t('login.mentalHealth') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="gap-1"
        >
          <Globe className="w-4 h-4" />
          {language === 'es' ? 'EN' : 'ES'}
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-8 animate-float">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-ff-balanced flex items-center justify-center shadow-glow">
            <Leaf className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-3">
          <span className="gradient-text-calm">{t('login.title')}</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8 max-w-sm text-balance">
          {t('login.subtitle')}
        </p>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <feature.icon className="w-4 h-4 text-primary" />
              {feature.text}
            </div>
          ))}
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 h-12"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="calm"
            size="lg"
            className="w-full"
            disabled={isLoading || !email.trim() || !password.trim()}
          >
            {isLoading ? (
              <span className="animate-pulse">{isSignUp ? t('login.signingUp') : t('login.signingIn')}</span>
            ) : (
              <>
                {isSignUp ? (
                  <>
                    <UserPlus className="w-5 h-5" />
                    {t('login.signUp')}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t('login.signIn')}
                  </>
                )}
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp ? t('login.hasAccount') : t('login.noAccount')}
          </button>
        </form>

        {/* Guest mode */}
        <div className="mt-6 w-full max-w-sm">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full mt-4 gap-2"
            onClick={handleGuestMode}
          >
            <UserX className="w-5 h-5" />
            {t('login.guest')}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t('login.guestDesc')}
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6 max-w-xs">
          {t('login.agreement')}
        </p>
      </div>

      <div className="h-20 bg-gradient-to-t from-secondary/50 to-transparent" />
    </div>
  );
}
