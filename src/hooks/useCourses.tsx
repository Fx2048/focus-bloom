import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Course {
  id: string;
  name: string;
  code: string | null;
  professor: string | null;
  room: string | null;
  color: string;
  dayOfWeek: number; // 0=Sun..6=Sat
  startTime: string; // "HH:MM:SS"
  endTime: string;
}

export type CourseInput = Omit<Course, 'id'>;

function mapRow(r: any): Course {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    professor: r.professor,
    room: r.room,
    color: r.color,
    dayOfWeek: r.day_of_week,
    startTime: r.start_time,
    endTime: r.end_time,
  };
}

export function useCourses() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('courses' as any)
        .select('*')
        .order('day_of_week')
        .order('start_time');
      if (error) throw error;
      return (data as any[]).map(mapRow);
    },
    enabled: !!user,
  });

  const addCourse = useMutation({
    mutationFn: async (c: CourseInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('courses' as any).insert({
        user_id: user.id,
        name: c.name,
        code: c.code,
        professor: c.professor,
        room: c.room,
        color: c.color,
        day_of_week: c.dayOfWeek,
        start_time: c.startTime,
        end_time: c.endTime,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Curso añadido');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });

  return { courses, isLoading, addCourse: addCourse.mutate, deleteCourse: deleteCourse.mutate };
}