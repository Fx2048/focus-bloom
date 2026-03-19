import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMentoring } from '@/hooks/useMentoring';
import { Header } from '@/components/Header';
import { MentoringChat } from '@/components/MentoringChat';
import { MentoringSessionsList } from '@/components/MentoringSessionsList';
import { MentoringProjects } from '@/components/MentoringProjects';
import { JitsiVideoCall } from '@/components/JitsiVideoCall';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Video, FolderKanban, UserPlus, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Login from './Login';

export default function Mentoring() {
  const { user } = useAuth();
  const mentoring = useMentoring();
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [connectId, setConnectId] = useState('');
  const [connectAsMentor, setConnectAsMentor] = useState(true);

  if (!user) return <Login />;

  const activeRel = mentoring.relationships.find(r => r.id === mentoring.activeRelationship);

  const handleConnect = () => {
    if (!connectId.trim()) return;
    mentoring.connectById(connectId.trim(), connectAsMentor);
    setConnectId('');
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    toast.success('ID copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mentoring</h1>
            <p className="text-muted-foreground text-sm">Sesiones de video, chat y proyectos compartidos</p>
          </div>
        </div>

        {/* Active video call */}
        {activeCall && (
          <div className="mb-6">
            <JitsiVideoCall
              roomName={activeCall}
              displayName={user.email?.split('@')[0] || 'Usuario'}
              onClose={() => setActiveCall(null)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Connections */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Tu ID</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <Button variant="outline" size="sm" className="w-full text-xs font-mono" onClick={copyUserId}>
                  <Copy className="w-3 h-3 mr-1" />
                  {user.id.slice(0, 12)}...
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Conectar
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 space-y-2">
                <Input
                  placeholder="ID del compañero"
                  value={connectId}
                  onChange={(e) => setConnectId(e.target.value)}
                  className="text-xs"
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={connectAsMentor ? 'default' : 'outline'}
                    className="flex-1 text-xs"
                    onClick={() => setConnectAsMentor(true)}
                  >
                    Soy mentor
                  </Button>
                  <Button
                    size="sm"
                    variant={!connectAsMentor ? 'default' : 'outline'}
                    className="flex-1 text-xs"
                    onClick={() => setConnectAsMentor(false)}
                  >
                    Soy estudiante
                  </Button>
                </div>
                <Button size="sm" className="w-full" onClick={handleConnect} disabled={!connectId.trim()}>
                  Conectar
                </Button>
              </CardContent>
            </Card>

            {/* Relationships list */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Conexiones</p>
              {mentoring.isLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!mentoring.isLoading && mentoring.relationships.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Sin conexiones aún
                </p>
              )}
              {mentoring.relationships.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => mentoring.setActiveRelationship(rel.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    mentoring.activeRelationship === rel.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{rel.partner_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{rel.partner_name}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {rel.is_mentor ? 'Estudiante' : 'Mentor'}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {!activeRel ? (
              <Card className="flex items-center justify-center h-[400px]">
                <CardContent className="text-center">
                  <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Conecta con alguien</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Comparte tu ID con un mentor o estudiante para empezar a colaborar con videollamadas, chat y proyectos compartidos.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="sessions" className="space-y-4">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="sessions" className="flex items-center gap-1">
                    <Video className="w-4 h-4" /> Sesiones
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" /> Chat
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="flex items-center gap-1">
                    <FolderKanban className="w-4 h-4" /> Proyectos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sessions">
                  <Card>
                    <CardContent className="p-4">
                      <MentoringSessionsList
                        sessions={mentoring.sessions}
                        onCreateSession={mentoring.createSession}
                        onJoinCall={(room) => setActiveCall(room)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="chat">
                  <Card>
                    <MentoringChat
                      messages={mentoring.messages}
                      onSend={mentoring.sendMessage}
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="projects">
                  <Card>
                    <CardContent className="p-4">
                      <MentoringProjects
                        projects={mentoring.projects}
                        onCreate={mentoring.createProject}
                        onUpdateStatus={mentoring.updateProjectStatus}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
