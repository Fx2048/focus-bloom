import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

import {
  ISLAND_ZONES,
  zoneForLevel,
} from '@/data/islandZones';

import type {
  AcademicMetrics,
  AcademicPlan,
  AcademicRecord,
} from '@/types/academic';

import type {
  IslandObject,
  IslandObjectType,
  IslandZone,
} from '@/types/island';

const academicDb = supabase as any;


/* =========================================================
   MÉTRICAS ACADÉMICAS
========================================================= */

function computeMetrics(
  records: AcademicRecord[],
  totalCredits: number
): AcademicMetrics {
  const approved = records.filter(
    (record) =>
      record.status === 'approved' &&
      record.grade !== null &&
      record.academic_courses
  );

  const approvedCredits = approved.reduce(
    (sum, record) =>
      sum + Number(record.academic_courses!.credits),
    0
  );

  const weightedGradeTotal = approved.reduce(
    (sum, record) =>
      sum +
      Number(record.grade) *
        Number(record.academic_courses!.credits),
    0
  );

  const progress = totalCredits
    ? Math.min(
        100,
        Math.round(
          (approvedCredits / totalCredits) * 100
        )
      )
    : 0;

  /*
   * XP académico.
   *
   * 1 crédito con nota 20 = 100 XP.
   */
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

  return {
    approvedCredits,
    progress,
    xp,

    weightedGrade: approvedCredits
      ? (
          weightedGradeTotal /
          approvedCredits
        ).toFixed(2)
      : '—',

    /*
     * Nivel basado en porcentaje de carrera.
     *
     * 0-9%   → nivel 1
     * 10-19% → nivel 2
     * ...
     * 100%   → nivel 11
     */
    level: Math.min(
      11,
      Math.floor(progress / 10) + 1
    ),
  };
}


/* =========================================================
   POSICIONES DETERMINÍSTICAS
========================================================= */

function seededPosition(
  seed: string
): {
  x: number;
  y: number;
} {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash =
      (hash * 31 +
        seed.charCodeAt(i)) >>>
      0;
  }

  return {
    x: 12 + (hash % 76),
    y: 20 + ((hash >> 8) % 60),
  };
}


/* =========================================================
   OBJETOS GENERADOS POR PROGRESO ACADÉMICO
========================================================= */

function deriveIslandObjects(
  approved: AcademicRecord[],
  metrics: AcademicMetrics
): IslandObject[] {
  const objects: IslandObject[] = [];

  approved.forEach((record, index) => {
    const courseName =
      record.academic_courses?.name ??
      'Curso aprobado';

    /*
     * 🌸 FLOR
     *
     * Cada curso aprobado hace crecer una flor.
     */
    objects.push({
      id: `flower-${record.id}`,

      type: 'flower',

      zoneId: 'shore',

      ...seededPosition(
        `flower-${record.id}`
      ),

      label: courseName,

      animation: 'sway',

      unlocked: true,

      source: 'academic',

      sourceId: record.id,
    });


    /*
     * 🌳 ÁRBOL
     *
     * Cada 5 cursos aprobados.
     */
    if ((index + 1) % 5 === 0) {
      objects.push({
        id: `tree-${record.id}`,

        type: 'tree',

        zoneId: 'shore',

        ...seededPosition(
          `tree-${record.id}`
        ),

        label:
          `${index + 1} cursos aprobados`,

        animation: 'sway',

        unlocked: true,

        source: 'achievement',

        sourceId: record.id,
      });
    }


    /*
     * 🦋 MARIPOSA
     *
     * Nota >= 17.
     */
    if (Number(record.grade) >= 17) {
      objects.push({
        id: `butterfly-${record.id}`,

        type: 'butterfly',

        zoneId: 'shore',

        ...seededPosition(
          `butterfly-${record.id}`
        ),

        animation: 'fly',

        unlocked: true,

        source: 'academic',

        sourceId: record.id,
      });
    }


    /*
     * 🗿 ESTATUA
     *
     * Nota perfecta.
     */
    if (Number(record.grade) === 20) {
      objects.push({
        id: `statue-${record.id}`,

        type: 'statue',

        zoneId: 'shore',

        ...seededPosition(
          `statue-${record.id}`
        ),

        label:
          `Nota perfecta · ${courseName}`,

        animation: 'glow',

        unlocked: true,

        source: 'achievement',

        sourceId: record.id,
      });
    }
  });


  /*
   * 🏡 CABAÑA
   *
   * 10 cursos aprobados.
   */
  if (approved.length >= 10) {
    objects.push({
      id: 'cabin-10',

      type: 'cabin',

      zoneId: 'shore',

      x: 50,
      y: 50,

      label: '10 cursos aprobados',

      animation: 'smoke',

      unlocked: true,

      source: 'achievement',
    });
  }


  /*
   * 🌉 PUENTE
   *
   * 100% de la carrera.
   */
  if (metrics.progress >= 100) {
    objects.push({
      id: 'bridge-completion',

      type: 'bridge',

      zoneId: 'island-interior',

      x: 50,
      y: 65,

      label:
        'Has completado toda tu malla académica',

      animation: 'sparkle',

      unlocked: true,

      source: 'achievement',
    });
  }


  /*
   * 🔮 CRISTAL
   *
   * Nivel 6.
   */
  if (metrics.level >= 6) {
    objects.push({
      id: 'crystal-6',

      type: 'crystal',

      zoneId: 'mountains',

      x: 45,
      y: 40,

      label:
        'Un cristal apareció en las montañas',

      animation: 'glow',

      unlocked: true,

      source: 'discovery',
    });
  }


  /*
   * 🛖 PUEBLO
   *
   * Nivel 7.
   */
  if (metrics.level >= 7) {
    objects.push({
      id: 'hidden-village',

      type: 'village',

      zoneId: 'hidden-tribe',

      x: 50,
      y: 50,

      label:
        'Has descubierto el Pueblo Oculto',

      animation: 'smoke',

      unlocked: true,

      source: 'discovery',
    });
  }


  /*
   * 🏺 RUINAS
   *
   * Nivel 8.
   */
  if (metrics.level >= 8) {
    objects.push({
      id: 'ancient-ruins',

      type: 'ruins',

      zoneId: 'ancient-ruins',

      x: 50,
      y: 50,

      label:
        'Ruinas de una civilización desconocida',

      animation: 'mystery',

      unlocked: true,

      source: 'discovery',
    });
  }


  /*
   * 🌋 VOLCÁN
   *
   * Nivel 9.
   */
  if (metrics.level >= 9) {
    objects.push({
      id: 'volcano',

      type: 'cave',

      zoneId: 'volcano',

      x: 50,
      y: 50,

      label:
        'Entrada al volcán dormido',

      animation: 'smoke',

      unlocked: true,

      source: 'discovery',
    });
  }


  /*
   * ✨ SANTUARIO
   *
   * Nivel 10.
   */
  if (metrics.level >= 10) {
    objects.push({
      id: 'celestial-sanctuary',

      type: 'temple',

      zoneId: 'sanctuary',

      x: 50,
      y: 50,

      label:
        'El Santuario Celestial',

      animation: 'glow',

      unlocked: true,

      source: 'discovery',
    });
  }


  return objects;
}


/* =========================================================
   DISCOVERY
========================================================= */

export interface DiscoveryBanner {
  zone: IslandZone;
  isNew: boolean;
}


/* =========================================================
   HOOK PRINCIPAL
========================================================= */

export function useIslandExploration() {
  const { user } = useAuth();

  const queryClient =
    useQueryClient();


  /* =======================================================
     OBTENER DATOS ACADÉMICOS
  ======================================================= */

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: [
      'academic-progress',
      user?.id,
    ],

    enabled: !!user,

    queryFn: async () => {
      if (!user) {
        throw new Error(
          'Usuario no autenticado.'
        );
      }


      /*
       * Obtener malla académica.
       */
      const {
        data: plan,
        error: planError,
      } = await academicDb
        .from('academic_plans')
        .select(
          'id, name, total_credits'
        )
        .eq(
          'user_id',
          user.id
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();


      if (planError) {
        throw planError;
      }


      /*
       * Todavía no existe una malla.
       */
      if (!plan) {
        return {
          plan: null,
          records:
            [] as AcademicRecord[],
        };
      }


      /*
       * Obtener cursos.
       */
      const {
        data: records,
        error: recordsError,
      } = await academicDb
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
        .eq(
          'user_id',
          user.id
        )
        .order(
          'updated_at',
          {
            ascending: false,
          }
        );


      if (recordsError) {
        throw recordsError;
      }


      return {
        plan:
          plan as AcademicPlan,

        records:
          (records ?? []) as AcademicRecord[],
      };
    },
  });


  /* =======================================================
     MÉTRICAS
  ======================================================= */

  const metrics = useMemo(
    () =>
      computeMetrics(
        data?.records ?? [],
        Number(
          data?.plan?.total_credits ?? 0
        )
      ),

    [data]
  );


  /* =======================================================
     ZONA ACTUAL
  ======================================================= */

  const activeZone = useMemo(
    () =>
      zoneForLevel(
        metrics.level
      ),

    [metrics.level]
  );


  /* =======================================================
     ESTADO DE TODAS LAS ZONAS
  ======================================================= */

  const zoneStatuses =
    useMemo(() => {
      const map =
        new Map<
          string,
          'locked' |
          'active' |
          'discovered'
        >();


      for (
        const zone of ISLAND_ZONES
      ) {
        if (
          zone.unlockLevel >
          metrics.level
        ) {
          map.set(
            zone.id,
            'locked'
          );
        } else if (
          zone.id ===
          activeZone.id
        ) {
          map.set(
            zone.id,
            'active'
          );
        } else {
          map.set(
            zone.id,
            'discovered'
          );
        }
      }


      return map;
    }, [
      metrics.level,
      activeZone,
    ]);


  /* =======================================================
     CURSOS APROBADOS
  ======================================================= */

  const approvedRecords =
    useMemo(
      () =>
        (
          data?.records ?? []
        ).filter(
          (record) =>
            record.status ===
              'approved' &&
            !!record.academic_courses
        ),

      [data]
    );


  /* =======================================================
     OBJETOS DE LA ISLA
  ======================================================= */

  const islandObjects =
    useMemo(
      () =>
        deriveIslandObjects(
          approvedRecords,
          metrics
        ),

      [
        approvedRecords,
        metrics,
      ]
    );


  /* =======================================================
     DESCUBRIMIENTO DE ZONA
  ======================================================= */

  const discovery:
    DiscoveryBanner | null =
    useMemo(() => {
      if (
        typeof window ===
          'undefined' ||
        !data?.plan
      ) {
        return null;
      }


      const storageKey =
        `island-highest-zone-seen:${data.plan.id}`;


      const lastSeen =
        Number(
          window.localStorage.getItem(
            storageKey
          ) ?? '0'
        );


      const isNew =
        activeZone.unlockLevel >
        lastSeen;


      if (isNew) {
        window.localStorage.setItem(
          storageKey,
          String(
            activeZone.unlockLevel
          )
        );
      }


      return {
        zone: activeZone,
        isNew,
      };
    }, [
      activeZone,
      data?.plan,
    ]);


  /* =======================================================
     INVALIDAR CACHE
  ======================================================= */

  const invalidate =
    () =>
      queryClient.invalidateQueries({
        queryKey: [
          'academic-progress',
          user?.id,
        ],
      });


  /* =======================================================
     CREAR MALLA
  ======================================================= */

  const createPlan =
    useMutation({
      mutationFn:
        async ({
          name,
          totalCredits,
        }: {
          name: string;
          totalCredits: number;
        }) => {
          if (
            !user ||
            !name.trim() ||
            !Number.isFinite(
              totalCredits
            ) ||
            totalCredits <= 0
          ) {
            throw new Error(
              'Escribe el nombre de tu carrera y sus créditos totales.'
            );
          }


          const {
            error,
          } = await academicDb
            .from(
              'academic_plans'
            )
            .insert({
              user_id:
                user.id,

              name:
                name.trim(),

              total_credits:
                totalCredits,
            });


          if (error) {
            throw error;
          }
        },


      onSuccess: () => {
        toast.success(
          'Tu malla personal fue creada.'
        );

        invalidate();
      },


      onError: (
        error: Error
      ) =>
        toast.error(
          error.message
        ),
    });


  /* =======================================================
     AGREGAR CURSO
  ======================================================= */

  const addRecord =
    useMutation({
      mutationFn:
        async (input: {
          name: string;
          code: string;
          credits: number;
          cycle: string;
          grade: number;
        }) => {
          if (
            !user ||
            !data?.plan
          ) {
            throw new Error(
              'Primero crea tu malla.'
            );
          }


          if (
            !input.name.trim() ||
            !Number.isFinite(
              input.credits
            ) ||
            input.credits <= 0 ||
            !Number.isFinite(
              input.grade
            ) ||
            input.grade < 0 ||
            input.grade > 20
          ) {
            throw new Error(
              'Completa nombre, créditos y una nota entre 0 y 20.'
            );
          }


          /*
           * Crear curso.
           */
          const {
            data: course,
            error:
              courseError,
          } =
            await academicDb
              .from(
                'academic_courses'
              )
              .insert({
                plan_id:
                  data.plan.id,

                code:
                  input.code.trim() ||
                  null,

                name:
                  input.name.trim(),

                credits:
                  input.credits,

                cycle:
                  input.cycle
                    ? Number(
                        input.cycle
                      )
                    : null,
              })
              .select('id')
              .single();


          if (courseError) {
            throw courseError;
          }


          /*
           * Crear registro académico.
           */
          const {
            error:
              recordError,
          } =
            await academicDb
              .from(
                'academic_records'
              )
              .insert({
                user_id:
                  user.id,

                course_id:
                  course.id,

                grade:
                  input.grade,

                status:
                  input.grade >= 11
                    ? 'approved'
                    : 'failed',
              });


          if (recordError) {
            throw recordError;
          }
        },


      onSuccess: () => {
        toast.success(
          'Curso registrado. Tu isla fue recalculada.'
        );

        invalidate();
      },


      onError: (
        error: Error
      ) =>
        toast.error(
          error.message
        ),
    });


  /* =======================================================
     ELIMINAR CURSO
  ======================================================= */

  const removeRecord =
    useMutation({
      mutationFn:
        async (
          courseId: string
        ) => {
          const {
            error,
          } = await academicDb
            .from(
              'academic_courses'
            )
            .delete()
            .eq(
              'id',
              courseId
            );


          if (error) {
            throw error;
          }
        },


      onSuccess: () => {
        toast.success(
          'Curso eliminado y la isla fue recalculada.'
        );

        invalidate();
      },


      onError: (
        error: Error
      ) =>
        toast.error(
          error.message
        ),
    });


  /* =======================================================
     RETORNO
  ======================================================= */

  return {
    isLoading,

    plan:
      data?.plan ?? null,

    records:
      data?.records ?? [],

    metrics,

    zones:
      ISLAND_ZONES,

    zoneStatuses,

    activeZone,

    islandObjects,

    discovery,

    createPlan,

    addRecord,

    removeRecord,
  };
}
