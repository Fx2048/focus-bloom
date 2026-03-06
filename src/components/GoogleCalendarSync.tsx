import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CalendarDays, Link2, Unlink, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const GOOGLE_CLIENT_ID = '537146158816-jllts7e83hr4u2etq4h9fknbbnsvbcbr.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = 'https://tizzaai.lovable.app/api/auth/google/callback';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export function GoogleCalendarSync() {
  const { user, session } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkConnection = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('google_calendar_tokens')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    setIsConnected(!!data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Listen for OAuth callback message from popup
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.data?.type === 'google-oauth-callback' && event.data?.code) {
        try {
          const { data, error } = await supabase.functions.invoke('google-calendar-callback', {
            body: { code: event.data.code },
          });
          if (error) throw error;
          toast.success('¡Google Calendar conectado!');
          setIsConnected(true);
        } catch (err: any) {
          toast.error('Error al conectar: ' + (err.message || 'Intenta de nuevo'));
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleConnect = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.open(url, 'google-oauth', 'width=500,height=600');
  };

  const handleDisconnect = async () => {
    if (!user) return;
    await supabase.from('google_calendar_tokens').delete().eq('user_id', user.id);
    setIsConnected(false);
    toast.success('Google Calendar desconectado');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync');
      if (error) throw error;
      if (data.code === 'NOT_CONNECTED' || data.code === 'TOKEN_EXPIRED') {
        setIsConnected(false);
        toast.error('Reconecta tu Google Calendar');
        return;
      }
      toast.success(`${data.created} tareas sincronizadas a Google Calendar`);
    } catch (err: any) {
      toast.error('Error al sincronizar: ' + (err.message || 'Intenta de nuevo'));
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user || isLoading) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Google Calendar</h3>
        <span className={cn(
          "ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
          isConnected 
            ? "bg-ff-balanced/20 text-ff-balanced" 
            : "bg-muted text-muted-foreground"
        )}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {isConnected ? (
        <div className="flex gap-2">
          <Button
            variant="calm"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sincronizar tareas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="gap-1 text-destructive hover:text-destructive"
          >
            <Unlink className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleConnect}
        >
          <Link2 className="w-4 h-4" />
          Conectar Google Calendar
        </Button>
      )}
    </div>
  );
}
