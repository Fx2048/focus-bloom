import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CurriculumCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: string;
  prerequisites: string[];
  color: string;
  notes: string | null;
  position: number;
  status: 'planned' | 'in-progress' | 'completed' | 'failed';
}

export type CurriculumInput = Omit<CurriculumCourse, 'id'>;

export interface ParsedCourse {
  code: string;
  name: string;
  credits: number;
  cycle: number;
  prerequisites: string[];
}

function mapRow(r: any): CurriculumCourse {
  return {
    id: r.id,
    code: r.code ?? '',
    name: r.name,
    credits: Number(r.credits),
    semester: r.semester,
    prerequisites: r.prerequisites ?? [],
    color: r.color,
    notes: r.notes,
    position: r.position ?? 0,
    status: (r.status ?? 'planned') as CurriculumCourse['status'],
  };
}

export function useCurriculum() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['curriculum', user?.id],
    queryFn: async () => {
      if (!user) return [] as CurriculumCourse[];
      const { data, error } = await supabase
        .from('curriculum_courses' as any)
        .select('*')
        .order('semester')
        .order('position');
      if (error) throw error;
      return (data as any[]).map(mapRow);
    },
    enabled: !!user,
  });

  const addCourse = useMutation({
    mutationFn: async (c: Partial<CurriculumInput> & { semester: string; name: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('curriculum_courses' as any).insert({
        user_id: user.id,
        code: c.code ?? '',
        name: c.name,
        credits: c.credits ?? 3,
        semester: c.semester,
        prerequisites: c.prerequisites ?? [],
        color: c.color ?? '#c8f55a',
        notes: c.notes ?? null,
        position: c.position ?? 0,
        status: c.status ?? 'planned',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['curriculum'] });
      toast.success('Curso añadido');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CurriculumCourse> & { id: string }) => {
      const dbUpdates: Record<string, any> = {};
      if (updates.code !== undefined) dbUpdates.code = updates.code;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
      if (updates.semester !== undefined) dbUpdates.semester = updates.semester;
      if (updates.prerequisites !== undefined) dbUpdates.prerequisites = updates.prerequisites;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      const { error } = await supabase.from('curriculum_courses' as any).update(dbUpdates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['curriculum'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('curriculum_courses' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['curriculum'] });
      toast.success('Curso eliminado');
    },
  });

  const importCourses = useMutation({
    mutationFn: async ({
      parsed,
      semesters,
      replace,
    }: {
      parsed: ParsedCourse[];
      semesters: string[];
      replace: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      if (replace) {
        const { error } = await supabase
          .from('curriculum_courses' as any)
          .delete()
          .eq('user_id', user.id);
        if (error) throw error;
      }

      const palette = ['#c8f55a', '#8b5cf6', '#f59e0b', '#22d3ee', '#ec4899', '#10b981', '#ef4444', '#3b82f6'];

      const rows = parsed.map((c, i) => ({
        user_id: user.id,
        code: c.code ?? '',
        name: c.name,
        credits: c.credits ?? 3,
        semester: semesters[Math.min(Math.max(c.cycle, 1), semesters.length) - 1],
        prerequisites: [] as string[],
        color: palette[(Math.max(c.cycle, 1) - 1) % palette.length],
        notes: null,
        position: i,
        status: 'planned',
      }));
      const { data: inserted, error: insertError } = await supabase
        .from('curriculum_courses' as any)
        .insert(rows)
        .select('id, code, name');
      if (insertError) throw insertError;

      // Resolver prerrequisitos por código o nombre
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
      const byKey = new Map<string, string>();
      for (const row of (inserted as any[]) ?? []) {
        if (row.code) byKey.set(norm(row.code), row.id);
        byKey.set(norm(row.name), row.id);
      }

      for (let i = 0; i < parsed.length; i++) {
        const refs = parsed[i].prerequisites ?? [];
        if (!refs.length) continue;
        const ids = refs.map((r) => byKey.get(norm(r))).filter(Boolean) as string[];
        const self = (inserted as any[])?.[i];
        if (!ids.length || !self) continue;
        await supabase
          .from('curriculum_courses' as any)
          .update({ prerequisites: ids.filter((id) => id !== self.id) })
          .eq('id', self.id);
      }

      return rows.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['curriculum'] });
      toast.success(`${count} cursos importados desde tu malla`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    courses,
    isLoading,
    addCourse: addCourse.mutate,
    updateCourse: updateCourse.mutate,
    deleteCourse: deleteCourse.mutate,
    importCourses: importCourses.mutateAsync,
    isImporting: importCourses.isPending,
  };
}