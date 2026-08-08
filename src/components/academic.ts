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

export type AcademicMetrics = {
  approvedCredits: number;
  progress: number; // 0-100, contra el total de créditos de la malla
  xp: number;
  weightedGrade: string;
  level: number; // 1-11, derivado de progress
};
