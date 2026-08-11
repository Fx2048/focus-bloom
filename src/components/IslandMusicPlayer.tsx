import { useEffect, useRef, useState } from 'react';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface IslandSound {
  id: string;
  zone: string;
  emoji: string;
  type: string;
  videoId?: string;
  playlistId?: string;
  description: string;
}

const ISLAND_SOUNDS: IslandSound[] = [
  {
    id: 'shore',
    zone: 'La Orilla',
    emoji: '🏖️',
    type: 'Ocean',
    videoId: 'hv-UYW--2pk',
    description: 'El sonido del océano acompaña tu aventura.',
  },
  {
    id: 'east-coast',
    zone: 'Costa Oriental',
    emoji: '🌴',
    type: 'Tropical chill',
    playlistId: 'PLb5eLlyJhRPeUTKeYymdHTX7wPoDW05Ni',
    description: 'Una brisa tropical recorre la costa.',
  },
  {
    id: 'western-forest',
    zone: 'Bosque Occidental',
    emoji: '🌲',
    type: 'Forest ambience',
    videoId: '4Y6n-1XQSfE',
    description: 'El bosque respira lentamente a tu alrededor.',
  },
  {
    id: 'western-village',
    zone: 'Aldea Occidental',
    emoji: '🏘️',
    type: 'Acoustic / cozy',
    videoId: 'vyg5jJrZ42s',
    description: 'Una pequeña aldea, cálida y tranquila.',
  },
  {
    id: 'island-interior',
    zone: 'Interior de la Isla',
    emoji: '🌳',
    type: 'Fantasy ambient',
    videoId: 'BkaWAU1z6EI',
    description: 'Algo mágico parece esconderse entre los árboles.',
  },
  {
    id: 'lost-mountains',
    zone: 'Montañas Perdidas',
    emoji: '🏔️',
    type: 'Cinematic',
    videoId: 'WKEr3clEqUE',
    description: 'El viento sopla entre las montañas.',
  },
  {
    id: 'hidden-village',
    zone: 'Pueblo Oculto',
    emoji: '🛖',
    type: 'Mystical ambient',
    videoId: 'lN3lIGw2aAM',
    description: 'Una comunidad escondida guarda sus propios secretos.',
  },
  {
    id: 'ancient-ruins',
    zone: 'Ruinas Antiguas',
    emoji: '🏛️',
    type: 'Ancient / atmospheric',
    playlistId: 'PLBaFTa_UFZw7bU7Dqt3H3H32r9J3jIMnF',
    description: 'Las ruinas parecen recordar algo que nadie más recuerda.',
  },
  {
    id: 'sleeping-volcano',
    zone: 'Volcán Dormido',
    emoji: '🌋',
    type: 'Dark ambient',
    videoId: 'DT-MqOAFDf4',
    description: 'Bajo la tierra todavía queda algo de fuego.',
  },
  {
    id: 'celestial-sanctuary',
    zone: 'Santuario Celestial',
    emoji: '☁️',
    type: 'Celestial / piano',
    videoId: '59XByaM4XUc',
    description: 'Un lugar suspendido entre las nubes.',
  },
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function IslandMusicPlayer() {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [apiReady, setApiReady] = useState(false);
  const [selectedSound, setSelectedSound] = useState(ISLAND_SOUNDS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // Cargar YouTube IFrame API
  useEffect(() => {
    if (window.YT?.Player) {
      setApiReady(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api');

    if (existingScript) {
      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
      return;
    }

    const script = document.createElement('script');

    script.id = 'youtube-iframe-api';
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);

  // Crear / cambiar reproductor
  useEffect(() => {
    if (!apiReady || !containerRef.current) return;

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const playerOptions: any = {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume);
        },
        onStateChange: (event: any) => {
          if (window.YT?.PlayerState) {
            setIsPlaying(
              event.data === window.YT.PlayerState.PLAYING
            );
          }
        },
      },
    };

    if (selectedSound.playlistId) {
      playerOptions.playerVars.listType = 'playlist';
      playerOptions.playerVars.list = selectedSound.playlistId;
    }

    playerRef.current = new window.YT.Player(
      containerRef.current,
      {
        ...playerOptions,
        videoId: selectedSound.videoId,
      }
    );

    setIsPlaying(false);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [apiReady, selectedSound]);

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];

    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    playerRef.current?.setVolume(newVolume);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      const restoredVolume = volume || 50;

      playerRef.current.setVolume(restoredVolume);
      setVolume(restoredVolume);
      setIsMuted(false);
    } else {
      playerRef.current.setVolume(0);
      setIsMuted(true);
    }
  };

  const selectSound = (sound: IslandSound) => {
    setSelectedSound(sound);
    setIsPlaying(false);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Reproductor invisible */}
      <div
        ref={containerRef}
        className="absolute h-px w-px overflow-hidden opacity-0 pointer-events-none"
      />

      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Music className="h-4 w-4 text-primary" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Sonidos de la isla
            </h3>

            <p className="text-xs text-muted-foreground">
              Elige cómo quieres vivir tu aventura.
            </p>
          </div>
        </div>

        {/* Zona actual */}
        <div className="mb-4 rounded-xl bg-muted/60 p-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {selectedSound.emoji}
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">
                {selectedSound.zone}
              </p>

              <p className="text-xs text-muted-foreground">
                {selectedSound.type}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {selectedSound.description}
              </p>
            </div>
          </div>
        </div>

        {/* Zonas */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {ISLAND_SOUNDS.map((sound) => (
            <button
              key={sound.id}
              type="button"
              onClick={() => selectSound(sound)}
              className={cn(
                'rounded-xl border p-2 text-left transition-all',
                'hover:bg-muted/70 active:scale-[0.98]',
                selectedSound.id === sound.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background'
              )}
            >
              <span className="block text-lg">
                {sound.emoji}
              </span>

              <span className="mt-1 block truncate text-xs font-medium text-foreground">
                {sound.zone}
              </span>
            </button>
          ))}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!apiReady}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>

        {!apiReady && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Cargando sonidos de la isla...
          </p>
        )}
      </div>
    </section>
  );
}
