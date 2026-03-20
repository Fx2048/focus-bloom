import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Music, Link2, Unlink, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader2, Library } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STUDY_PLAYLISTS = [
  { uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus', emoji: '🧠' },
  { uri: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn', name: 'Lo-Fi Beats', emoji: '🎧' },
  { uri: 'spotify:playlist:37i9dQZF1DWV0gynK7G6pD', name: 'Clásica', emoji: '🎻' },
  { uri: 'spotify:playlist:37i9dQZF1DX4PP3DA4J0N8', name: 'Naturaleza', emoji: '🌿' },
  { uri: 'spotify:playlist:37i9dQZF1DX8Uebhn9wzrS', name: 'Chill Study', emoji: '☕' },
];

const SPOTIFY_CLIENT_ID = '/* set at connect time */';
const REDIRECT_URI = 'https://tizzaai.lovable.app/api/auth/spotify/callback';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
].join(' ');

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

interface SpotifyTrack {
  name: string;
  artists: string;
  albumArt: string;
  duration: number;
  position: number;
}

export function SpotifyPlayer() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clientId, setClientId] = useState('');
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const playerRef = useRef<any>(null);

  // Check connection
  const checkConnection = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase
      .from('spotify_tokens' as any)
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle() as any);
    setIsConnected(!!data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (!isConnected) return;

    if (document.getElementById('spotify-sdk')) {
      if (window.Spotify) setSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'spotify-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => setSdkReady(true);
  }, [isConnected]);

  // Init player when SDK ready
  useEffect(() => {
    if (!sdkReady || !isConnected || playerRef.current) return;

    const initPlayer = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('spotify-refresh');
        if (error || !data?.access_token) {
          setIsConnected(false);
          return;
        }

        const spotifyPlayer = new window.Spotify.Player({
          name: 'TIZZA - Focus Music',
          getOAuthToken: async (cb: (t: string) => void) => {
            const { data } = await supabase.functions.invoke('spotify-refresh');
            cb(data?.access_token || '');
          },
          volume: volume / 100,
        });

        spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
          setDeviceId(device_id);
        });

        spotifyPlayer.addListener('player_state_changed', (state: any) => {
          if (!state) return;
          setIsPlaying(!state.paused);
          const track = state.track_window.current_track;
          if (track) {
            setCurrentTrack({
              name: track.name,
              artists: track.artists.map((a: any) => a.name).join(', '),
              albumArt: track.album.images[0]?.url || '',
              duration: track.duration_ms,
              position: state.position,
            });
          }
        });

        spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Spotify init error:', message);
        });

        spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Spotify auth error:', message);
          setIsConnected(false);
          toast.error('Sesión de Spotify expirada, reconecta');
        });

        await spotifyPlayer.connect();
        playerRef.current = spotifyPlayer;
        setPlayer(spotifyPlayer);
      } catch (err) {
        console.error('Failed to init Spotify player:', err);
      }
    };

    initPlayer();

    return () => {
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, [sdkReady, isConnected]);

  // Listen for OAuth popup callback
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.data?.type === 'spotify-oauth-callback' && event.data?.code) {
        try {
          const { data, error } = await supabase.functions.invoke('spotify-callback', {
            body: { code: event.data.code },
          });
          if (error) throw error;
          toast.success('¡Spotify conectado!');
          setIsConnected(true);
        } catch (err: any) {
          toast.error('Error al conectar Spotify: ' + (err.message || 'Intenta de nuevo'));
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleConnect = async () => {
    // Fetch client ID from edge function or use env
    const { data } = await supabase.functions.invoke('spotify-client-id');
    const cid = data?.client_id;
    if (!cid) {
      toast.error('Spotify no está configurado correctamente');
      return;
    }
    setClientId(cid);

    const params = new URLSearchParams({
      client_id: cid,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
    });
    window.open(`https://accounts.spotify.com/authorize?${params.toString()}`, 'spotify-oauth', 'width=500,height=700');
  };

  const handleDisconnect = async () => {
    if (!user) return;
    playerRef.current?.disconnect();
    playerRef.current = null;
    setPlayer(null);
    await (supabase.from('spotify_tokens' as any).delete().eq('user_id', user.id) as any);
    setIsConnected(false);
    setCurrentTrack(null);
    toast.success('Spotify desconectado');
  };

  const togglePlay = () => player?.togglePlay();
  const nextTrack = () => player?.nextTrack();
  const prevTrack = () => player?.previousTrack();

  const handleVolumeChange = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    setIsMuted(v === 0);
    player?.setVolume(v / 100);
  };

  const toggleMute = () => {
    if (isMuted) {
      player?.setVolume(volume / 100 || 0.5);
      setIsMuted(false);
      if (volume === 0) setVolume(50);
    } else {
      player?.setVolume(0);
      setIsMuted(true);
    }
  };

  const playPlaylist = async (contextUri: string) => {
    if (!deviceId) {
      toast.error('Reproductor no listo, espera un momento');
      return;
    }
    try {
      const { data } = await supabase.functions.invoke('spotify-refresh');
      if (!data?.access_token) return;

      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${data.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context_uri: contextUri }),
      });
    } catch (err) {
      console.error('Error playing playlist:', err);
    }
  };

  if (!user || isLoading) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-[#1DB954]" />
        <h3 className="font-semibold text-foreground text-sm">Spotify</h3>
        <span className={cn(
          "ml-auto text-xs px-2 py-0.5 rounded-full font-medium",
          isConnected
            ? "bg-[#1DB954]/20 text-[#1DB954]"
            : "bg-muted text-muted-foreground"
        )}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {isConnected ? (
        <div className="space-y-3">
          {/* Current Track */}
          {currentTrack ? (
            <div className="flex items-center gap-3">
              {currentTrack.albumArt && (
                <img
                  src={currentTrack.albumArt}
                  alt={currentTrack.name}
                  className="w-12 h-12 rounded-lg object-cover shadow-sm"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentTrack.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artists}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Library className="w-3 h-3" /> Playlists de estudio
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {STUDY_PLAYLISTS.map((pl) => (
                  <button
                    key={pl.uri}
                    onClick={() => playPlaylist(pl.uri)}
                    className="text-left text-xs p-2 rounded-lg border border-border hover:bg-muted/60 active:scale-[0.97] transition-all"
                  >
                    <span className="block text-sm leading-none mb-0.5">{pl.emoji}</span>
                    <span className="font-medium text-foreground truncate block">{pl.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-[#1DB954] text-white hover:bg-[#1DB954]/90"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextTrack}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>

          {/* Disconnect */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-destructive gap-1"
            onClick={handleDisconnect}
          >
            <Unlink className="w-3 h-3" />
            Desconectar Spotify
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
          Conectar Spotify
        </Button>
      )}
    </div>
  );
}
