import { useAuth } from '@/hooks/useAuth';
import Login from './Login';
import Dashboard from './Dashboard';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Check for guest mode
  const isGuest = localStorage.getItem('tizza-guest-mode') === 'true';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (user || isGuest) ? <Dashboard /> : <Login />;
};

export default Index;
