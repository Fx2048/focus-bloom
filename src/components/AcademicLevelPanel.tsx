import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Pencil, Check, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const LEVEL_LABELS = [
  '', 'Semestre 1', 'Semestre 2', 'Semestre 3', 'Semestre 4', 'Semestre 5',
  'Semestre 6', 'Semestre 7', 'Semestre 8', 'Semestre 9', 'Semestre 10',
];

export function AcademicLevelPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [levelDraft, setLevelDraft] = useState(1);
  const [progressDraft, setProgressDraft] = useState(0);
  const [trackDraft, setTrackDraft] = useState('');

  const { data: academic } = useQuery({
    queryKey: ['academic', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('academic_level, academic_progress, academic_track')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return {
        level: (data as any).academic_level as number,
        progress: (data as any).academic_progress as number,
        track: (data as any).academic_track as string | null,
      };
    },
    enabled: !!user,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update({
          academic_level: Math.max(1, Math.min(10, levelDraft)),
          academic_progress: Math.max(0, Math.min(100, progressDraft)),
          academic_track: trackDraft || null,
        } as any)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academic'] });
      setEditing(false);
      toast.success('Nivel académico actualizado');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = () => {
    setLevelDraft(academic?.level ?? 1);
    setProgressDraft(academic?.progress ?? 0);
    setTrackDraft(academic?.track ?? '');
    setEditing(true);
  };

  const level = academic?.level ?? 1;
  const progress = academic?.progress ?? 0;
  const label = LEVEL_LABELS[level] ?? `Semestre ${level}`;
  const nextLabel = LEVEL_LABELS[level + 1] ?? 'Egresado';

  return (
    <div className="card-calm p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Nivel académico
            </p>
            <h3 className="text-lg font-bold text-foreground">{label}</h3>
            {academic?.track && (
              <p className="text-xs text-muted-foreground">{academic.track}</p>
            )}
          </div>
        </div>
        {!editing && (
          <Button variant="ghost" size="icon" onClick={startEdit} className="rounded-xl">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Semestre (1-10)</label>
              <Input
                type="number" min={1} max={10}
                value={levelDraft}
                onChange={(e) => setLevelDraft(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Progreso %</label>
              <Input
                type="number" min={0} max={100}
                value={progressDraft}
                onChange={(e) => setProgressDraft(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Carrera</label>
            <Input
              placeholder="Ing. de Sistemas, Derecho..."
              value={trackDraft}
              onChange={(e) => setTrackDraft(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="flex-1">
              Cancelar
            </Button>
            <Button size="sm" onClick={() => save.mutate()} className="flex-1 gap-1">
              <Check className="w-4 h-4" /> Guardar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Progreso a {nextLabel}</span>
              <span className="text-xs font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 rounded-full" />
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 rounded-xl"
            onClick={() => navigate('/schedule')}
          >
            <CalendarDays className="w-4 h-4" />
            Ver mi horario semanal
          </Button>
        </>
      )}
    </div>
  );
}