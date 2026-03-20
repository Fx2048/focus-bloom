import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function SpotifyOAuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && window.opener) {
      window.opener.postMessage({ type: 'spotify-oauth-callback', code }, '*');
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Conectando con Spotify...</p>
    </div>
  );
}
