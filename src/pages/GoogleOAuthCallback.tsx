import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && window.opener) {
      window.opener.postMessage({ type: 'google-oauth-callback', code }, '*');
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Conectando con Google Calendar...</p>
    </div>
  );
}
