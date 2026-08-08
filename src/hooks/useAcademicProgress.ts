import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type AcademicPlan = {
  id: string;
  name: string;
  total_credits: number;
};

export type Course = {
  id: string;
  code: string | null;
  name: string;
  cycle: number | null;
  credits: number;
};

export type AcademicRecord = {
  id: string;
  grade: number | null;
  status: 'pending' | 'approved' | 'failed' | 'in_progress';
  academic_courses: Course | null;
};

export interface AcademicMetrics {
  approvedCredits: number;
  totalCredits: number;
  progress: number;

  xp: number;

  weightedGrade: string;

  level: number;

  currentCycle: number;
}

const academicDb = supabase as any;

export function useAcademicProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['academic-progress', user?.id],

    enabled: !!user,

    queryFn: async () => {
      if (!user) {
        throw new Error('Usuario no autenticado.');
      }

      const { data: plan, error: planError } = await academicDb
        .from('academic_plans')
        .select('id, name, total_credits')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) {
        throw planError;
      }

      if (!plan) {
        return {
          plan: null as AcademicPlan | null,
          records: [] as AcademicRecord[],
          metrics: null as AcademicMetrics | null,
        };
      }

      const { data: records, error: recordsError } =
        await academicDb
          .from('academic_records')
          .select(
            `
              id,
              grade,
              status,
              academic_courses(
                id,
                code,
                name,
                cycle,
                credits
              )
            `
          )
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

      if (recordsError) {
        throw recordsError;
      }

      const academicRecords =
        (records ?? []) as AcademicRecord[];

      const approved = academicRecords.filter(
        (record) =>
          record.status === 'approved' &&
          record.grade !== null &&
          record.academic_courses !== null
      );

      const approvedCredits = approved.reduce(
        (sum, record) =>
          sum +
          Number(record.academic_courses!.credits),
        0
      );

      const totalCredits =
        Number(plan.total_credits) || 0;

      const progress = totalCredits
        ? Math.min(
            100,
            Math.round(
              (approvedCredits / totalCredits) * 100
            )
          )
        : 0;

      const weightedGradeTotal = approved.reduce(
        (sum, record) =>
          sum +
          Number(record.grade) *
            Number(record.academic_courses!.credits),
        0
      );

      const weightedGrade = approvedCredits
        ? (
            weightedGradeTotal /
            approvedCredits
          ).toFixed(2)
        : '—';

      const xp = approved.reduce(
        (sum, record) =>
          sum +
          Math.round(
            Number(record.academic_courses!.credits) *
              100 *
              (Number(record.grade) / 20)
          ),
        0
      );

      /**
       * Obtenemos el ciclo académico más avanzado
       * que aparece en la ficha.
       */
      const cycles = academicRecords
        .map(
          (record) =>
            record.academic_courses?.cycle ?? 0
        )
        .filter((cycle) => cycle > 0);

      const currentCycle =
        cycles.length > 0
          ? Math.max(...cycles)
          : 1;

      /**
       * Nivel RPG.
       *
       * 0-9%   -> nivel 1
       * 10-19% -> nivel 2
       * ...
       */
      const level = Math.min(
        11,
        Math.floor(progress / 10) + 1
      );

      return {
        plan: plan as AcademicPlan,

        records: academicRecords,

        metrics: {
          approvedCredits,
          totalCredits,
          progress,
          xp,
          weightedGrade,
          level,
          currentCycle,
        } satisfies AcademicMetrics,
      };
    },
  });
}
