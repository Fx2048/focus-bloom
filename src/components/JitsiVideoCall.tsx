import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, X } from 'lucide-react';

interface JitsiVideoCallProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
}

export function JitsiVideoCall({ roomName, displayName, onClose }: JitsiVideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Jitsi Meet external API
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && (window as any).JitsiMeetExternalAPI) {
        const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: 500,
          userInfo: { displayName },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#1a1a2e',
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'desktop', 'chat',
              'raisehand', 'tileview', 'hangup',
            ],
          },
        });

        api.addEventListener('readyToClose', onClose);
        return () => api.dispose();
      }
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [roomName, displayName, onClose]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Videollamada en curso
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={containerRef} className="rounded-b-lg overflow-hidden" />
      </CardContent>
    </Card>
  );
}
