export type CourseStatus = 'approved' | 'in_progress' | 'pending' | 'locked';
export type MonumentType = 'library' | 'tower' | 'forge' | 'grove' | 'observatory';
export type TaskType = 'exam' | 'project' | 'assignment' | 'reading';
export type MissionPriority = 'urgent' | 'growth' | 'recovery';

export interface AcademicProfile { university: string; career: string; currentCycle: number; targetCredits: number; dailyGoalHours: number; wellbeing: number; level: number; xp: number; bloomSeeds: number; streak: number; }
export interface Course { id: string; code: string; name: string; credits: number; cycle: number; grade?: number; status: CourseStatus; prerequisites: string[]; zone: string; monument: MonumentType; nextMilestone?: string; }
export interface AcademicTask { id: string; courseId: string; title: string; type: TaskType; difficulty: 1 | 2 | 3; estimatedMinutes: number; deadline?: string; status: 'pending' | 'done'; pomodoros: number; weight: number; }
export interface Mission { id: string; title: string; description: string; priority: MissionPriority; minutes: number; xp: number; taskId?: string; courseId?: string; }
export interface FocusSession { id: string; date: string; minutes: number; notes: string; focus: number; xp: number; }
export interface AcademicWorld { profile: AcademicProfile; courses: Course[]; tasks: AcademicTask[]; sessions: FocusSession[]; mode: 'demo' | 'personal'; }
