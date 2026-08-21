import { AcademicWorld } from '@/types/academicWorld';

const d = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
export const demoAcademicData: AcademicWorld = {
  mode: 'demo',
  profile: { university: 'Universidad Nacional Mayor de San Marcos', career: 'Ingeniería Informática', currentCycle: 5, targetCredits: 210, dailyGoalHours: 3, wellbeing: 72, level: 5, xp: 4250, bloomSeeds: 28, streak: 6 },
  courses: [
    { id:'mat1', code:'MAT101', name:'Matemática I', credits:5, cycle:1, grade:17, status:'approved', prerequisites:[], zone:'Costa del Génesis', monument:'library' },
    { id:'mat2', code:'MAT201', name:'Matemática II', credits:5, cycle:2, grade:16, status:'approved', prerequisites:['mat1'], zone:'Costa del Génesis', monument:'tower' },
    { id:'prog', code:'INF201', name:'Programación I', credits:4, cycle:2, grade:18, status:'approved', prerequisites:['mat1'], zone:'Arboleda Algorítmica', monument:'grove' },
    { id:'algo', code:'INF301', name:'Algoritmos y Estructuras', credits:5, cycle:3, grade:15, status:'approved', prerequisites:['prog','mat2'], zone:'Arboleda Algorítmica', monument:'tower' },
    { id:'db', code:'INF401', name:'Bases de Datos', credits:4, cycle:4, grade:16, status:'approved', prerequisites:['algo'], zone:'Ciudadela de Datos', monument:'observatory' },
    { id:'soft', code:'INF501', name:'Ingeniería de Software', credits:5, cycle:5, status:'in_progress', prerequisites:['algo'], zone:'Forja de Software', monument:'forge', nextMilestone:'Entrega de arquitectura · viernes' },
    { id:'net', code:'INF502', name:'Redes de Computadoras', credits:4, cycle:5, status:'in_progress', prerequisites:['prog'], zone:'Forja de Software', monument:'tower', nextMilestone:'Control de lectura · mañana' },
    { id:'ia', code:'INF601', name:'Inteligencia Artificial', credits:4, cycle:6, status:'pending', prerequisites:['algo'], zone:'Ciudadela de Datos', monument:'observatory' },
    { id:'dist', code:'INF701', name:'Sistemas Distribuidos', credits:4, cycle:7, status:'locked', prerequisites:['soft','net'], zone:'Ciudadela de Datos', monument:'tower' },
    { id:'thesis', code:'INF1001', name:'Proyecto de Grado', credits:8, cycle:10, status:'locked', prerequisites:['dist'], zone:'Observatorio de Grado', monument:'observatory' },
  ],
  tasks: [
    { id:'t1', courseId:'algo', title:'Preparar examen de Algoritmos', type:'exam', difficulty:3, estimatedMinutes:40, deadline:d(1), status:'pending', pomodoros:2, weight:35 },
    { id:'t2', courseId:'soft', title:'Diagrama de arquitectura Bloom', type:'project', difficulty:2, estimatedMinutes:25, deadline:d(3), status:'pending', pomodoros:1, weight:25 },
    { id:'t3', courseId:'net', title:'Lectura: capa de transporte', type:'reading', difficulty:1, estimatedMinutes:20, deadline:d(0), status:'pending', pomodoros:0, weight:10 },
  ], sessions: []
};
