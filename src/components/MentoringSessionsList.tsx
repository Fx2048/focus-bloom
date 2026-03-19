import { useState } from 'react';
import { MentoringSession } from '@/hooks/useMentoring';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Video } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';

interface MentoringSessionsListProps {
  sessions: MentoringSession[];
  onCreateSession: (title: string, scheduledAt: string, duration: number) => void;
  onJoinCall: (roomName: string) => void;
}

export function MentoringSessionsList({ sessions, onCreateSession, onJoinCall }: MentoringSessionsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');

  const handleCreate = () => {
    if (!title.trim() || !date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    onCreateSession(title.trim(), scheduledAt, parseInt(duration));
    setTitle(''); setDate(''); setTime(''); setDuration('30');
    setShowForm(false);
  };

  const upcoming = sessions.filter(s => isFuture(new Date(s.scheduled_at)));
  const past = sessions.filter(s => isPast(new Date(s.scheduled_at)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Sesiones de mentoring
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Programar
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Título de la sesión" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Min" min="15" max="120" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!title.trim() || !date || !time}>Programar</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground text-sm py-6">
          No hay sesiones programadas. ¡Agenda tu primera sesión! 📅
        </p>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Próximas</p>
          {upcoming.map((session) => (
            <Card key={session.id} className="border-primary/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{session.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(session.scheduled_at), "d MMM, HH:mm", { locale: es })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.duration_minutes} min
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="calm" onClick={() => onJoinCall(session.jitsi_room_name)}>
                  <Video className="w-4 h-4 mr-1" /> Unirse
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pasadas</p>
          {past.map((session) => (
            <Card key={session.id} className="opacity-60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{session.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.scheduled_at), "d MMM, HH:mm", { locale: es })}
                  </p>
                </div>
                <Badge variant="secondary">Finalizada</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
