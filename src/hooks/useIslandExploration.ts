import { FormEvent, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ISLAND_ZONES, zoneForLevel } from '@/data/islandZones';
import type { AcademicMetrics, AcademicPlan, AcademicRecord } from '@/types/academic';
import type { IslandObject, IslandObjectType, IslandZone } from '@/types/island';

// La base de datos genera estos tipos vía Supabase. Regenéralos tras aplicar
// la migración correspondiente para poder quitar este cast.
const academicDb = supabase as any;

function computeMetrics(records: AcademicRecord[], totalCredits: number): AcademicMetrics {
  const approved = records.filter(
    (record) => record.status === 'approved' && record.grade !== null && record.academic_courses
  );

  const approvedCredits = approved.reduce(
    (sum, record) => sum + Number(record.academic_courses!.credits),
    0
  );

  const weightedGradeTotal = approved.reduce(
    (sum, record) => sum + Number(record.grade) * Number(record.academic_courses!.credits),
    0
  );

  const progress = totalCredits
    ? Math.min(100, Math.round((approvedCredits / totalCredits) * 100))
    : 0;

  const xp = approved.reduce(
    (sum, record) =>
      sum + Math.round(Number(record.academic_courses!.credits) * 100 * (Number(record.grade) / 20)),
    0
  );

  return {
    approvedCredits,
    progress,
    xp,
    weightedGrade: approvedCredits ? (weightedGradeTotal / approvedCredits).toFixed(2) : '—',
    level: Math.min(11, Math.floor(progress / 10) + 1),
  };
}

// Posición determinística (no aleatoria) a partir del id del registro, para
// que cada curso aprobado siempre "brote" en el mismo punto de la zona.
function seededPosition(seed: string): { x: number; y: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return {
    x: 12 + (hash % 76), // 12%-88%
    y: 20 + ((hash >> 8) % 60), // 20%-80%
  };
}

function deriveIslandObjects(approved: AcademicRecord[]): IslandObject[] {
  const objects: IslandObject[] = [];

  approved.forEach((record, index) => {
    // una flor por cada curso aprobado
    objects.push({
      id: `flower-${record.id}`,
      type: 'flower',
      ...seededPosition(record.id),
      label: record.academic_courses?.name,
    });

    // un árbol cada 5 cursos aprobados
    if ((index + 1) % 5 === 0) {
      objects.push({ id: `tree-${record.id}`, type: 'tree', ...seededPosition(`tree-${record.id}`) });
    }

    // una mariposa por cada nota sobresaliente (>=17)
    if (Number(record.grade) >= 17) {
      objects.push({
        id: `butterfly-${record.id}`,
        type: 'butterfly',
        ...seededPosition(`bf-${record.id}`),
      });
    }

    // una estatua por cada nota perfecta (20)
    if (Number(record.grade) === 20) {
      objects.push({
        id: `statue-${record.id}`,
        type: 'statue',
        ...seededPosition(`st-${record.id}`),
        label: `Nota perfecta · ${record.academic_courses?.name}`,
      });
    }
  });

  // una cabaña al llegar a 10 cursos aprobados
  if (approved.length >= 10) {
    objects.push({ id: 'cabin-10', type: 'cabin', x: 50, y: 50, label: '10 cursos aprobados' });
  }

  // un puente al completar el 100% de la malla
  return objects;
}

export interface DiscoveryBanner {
  zone: IslandZone;
  isNew: boolean;
}

export function useIslandExploration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['academic-progress', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: plan, error: planError } = await academicDb
        .from('academic_plans')
        .select('id, name, total_credits')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) throw planError;
      if (!plan) return { plan: null, records: [] as AcademicRecord[] };

      const { data: records, error: recordsError } = await academicDb
        .from('academic_records')
        .select('id, grade, status, academic_courses(id, code, name, cycle, credits)')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });

      if (recordsError) throw recordsError;

      return {
        plan: plan as AcademicPlan,
        records: (records ?? []) as AcademicRecord[],
      };
    },
  });

  const metrics = useMemo(
    () => computeMetrics(data?.records ?? [], Number(data?.plan?.total_credits ?? 0)),
    [data]
  );

  const activeZone = useMemo(() => zoneForLevel(metrics.level), [metrics.level]);

  const zoneStatuses = useMemo(() => {
    const map = new Map<string, 'locked' | 'active' | 'discovered'>();
    for (const zone of ISLAND_ZONES) {
      if (zone.unlockLevel > metrics.level) map.set(zone.id, 'locked');
      else if (zone.id === activeZone.id) map.set(zone.id, 'active');
      else map.set(zone.id, 'discovered');
    }
    return map;
  }, [metrics.level, activeZone]);

  const approvedRecords = useMemo(
    () => (data?.records ?? []).filter((r) => r.status === 'approved' && r.academic_courses),
    [data]
  );

  const islandObjects = useMemo(() => deriveIslandObjects(approvedRecords), [approvedRecords]);

  // Banner de "zona recién descubierta": se guarda en localStorage el nivel
  // más alto ya visto, así solo se anuncia una vez por dispositivo.
  const discovery: DiscoveryBanner | null = useMemo(() => {
    if (typeof window === 'undefined' || !data?.plan) return null;
    const storageKey = `island-highest-zone-seen:${data.plan.id}`;
    const lastSeen = Number(window.localStorage.getItem(storageKey) ?? '0');
    const isNew = activeZone.unlockLevel > lastSeen;
    if (isNew) window.localStorage.setItem(storageKey, String(activeZone.unlockLevel));
    return { zone: activeZone, isNew };
  }, [activeZone, data?.plan]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['academic-progress', user?.id] });

  const createPlan = useMutation({
    mutationFn: async ({ name, totalCredits }: { name: string; totalCredits: number }) => {
      if (!user || !name.trim() || !Number.isFinite(totalCredits) || totalCredits <= 0) {
        throw new Error('Escribe el nombre de tu carrera y sus créditos totales.');
      }

      const { error } = await academicDb.from('academic_plans').insert({
        user_id: user.id,
        name: name.trim(),
        total_credits: totalCredits,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tu malla personal fue creada.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addRecord = useMutation({
    mutationFn: async (input: {
      name: string;
      code: string;
      credits: number;
      cycle: string;
      grade: number;
    }) => {
      if (!user || !data?.plan) throw new Error('Primero crea tu malla.');
      if (
        !input.name.trim() ||
        !Number.isFinite(input.credits) ||
        input.credits <= 0 ||
        !Number.isFinite(input.grade) ||
        input.grade < 0 ||
        input.grade > 20
      ) {
        throw new Error('Completa nombre, créditos y una nota entre 0 y 20.');
      }

      const { data: course, error: courseError } = await academicDb
        .from('academic_courses')
        .insert({
          plan_id: data.plan.id,
          code: input.code.trim() || null,
          name: input.name.trim(),
          credits: input.credits,
          cycle: input.cycle ? Number(input.cycle) : null,
        })
        .select('id')
        .single();

      if (courseError) throw courseError;

      const { error: recordError } = await academicDb.from('academic_records').insert({
        user_id: user.id,
        course_id: course.id,
        grade: input.grade,
        status: input.grade >= 11 ? 'approved' : 'failed',
      });

      if (recordError) throw recordError;
    },
    onSuccess: () => {
      toast.success('Curso registrado. Tu isla fue recalculada.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeRecord = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await academicDb.from('academic_courses').delete().eq('id', courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Curso eliminado y la isla fue recalculada.');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    isLoading,
    plan: data?.plan ?? null,
    records: data?.records ?? [],
    metrics,
    zones: ISLAND_ZONES,
    zoneStatuses,
    activeZone,
    islandObjects,
    discovery,
    createPlan,
    addRecord,
    removeRecord,
  };
}
