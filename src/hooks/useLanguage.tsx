import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Header
  'app.name': { es: 'TIZZA', en: 'TIZZA' },
  'header.signOut': { es: 'Cerrar Sesión', en: 'Sign Out' },
  'header.profile': { es: 'Perfil', en: 'Profile' },
  'header.dailyHours': { es: 'Horas diarias', en: 'Daily hours' },
  'header.setDailyHours': { es: 'Configurar horas diarias', en: 'Set Daily Hours' },
  
  // Greeting
  'greeting.morning': { es: 'Buenos días', en: 'Good morning' },
  'greeting.afternoon': { es: 'Buenas tardes', en: 'Good afternoon' },
  'greeting.evening': { es: 'Buenas noches', en: 'Good evening' },
  'greeting.noTasks': { es: 'No hay tareas aún. ¡Agrega una para empezar!', en: 'No tasks yet. Add one to get started!' },
  'greeting.tasksCount': { es: 'tareas pendientes', en: 'tasks to focus on' },
  
  // Tabs
  'tab.summary': { es: 'Resumen', en: 'Summary' },
  'tab.tasks': { es: 'Tareas', en: 'Tasks' },
  
  // Motivation
  'mood.title': { es: '¿Cómo te sientes hoy?', en: 'How are you feeling today?' },
  'mood.low': { es: 'Bajo', en: 'Low' },
  'mood.high': { es: 'Alto', en: 'High' },
  'mood.suggestion': { es: 'Sugerencia IA', en: 'AI Suggestion' },
  'mood.1': { es: 'Muy baja energía', en: 'Very low energy' },
  'mood.2': { es: 'Cansado/a', en: 'Feeling tired' },
  'mood.3': { es: 'Un poco lento/a', en: 'A bit sluggish' },
  'mood.4': { es: 'Más o menos', en: 'Okay-ish' },
  'mood.5': { es: 'Bien', en: 'Feeling alright' },
  'mood.6': { es: 'Bastante bien', en: 'Pretty good' },
  'mood.7': { es: '¡Motivado/a!', en: 'Motivated!' },
  'mood.8': { es: 'Muy energizado/a', en: 'Very energized' },
  'mood.9': { es: '¡Súper enfocado/a!', en: 'Super focused!' },
  'mood.10': { es: '¡Imparable!', en: 'Unstoppable!' },
  'mood.lowTip': { es: '💙 Está bien tomarlo con calma. Planearemos tareas más ligeras.', en: '💙 It\'s okay to take it easy. We\'ll plan lighter tasks.' },
  
  // Burnout
  'burnout.lazy': { es: 'Tomándolo con calma', en: 'Taking it Easy' },
  'burnout.balanced': { es: 'Perfectamente equilibrado', en: 'Perfectly Balanced' },
  'burnout.burnout': { es: 'Toma un descanso', en: 'Take a Break' },
  'burnout.lazyMsg': { es: '¿Listo para enfocarte?', en: 'Ready to start focusing?' },
  'burnout.balancedMsg': { es: '¡Buen trabajo manteniendo el equilibrio!', en: 'Great job maintaining balance!' },
  'burnout.burnoutMsg': { es: 'Considera descansar pronto', en: 'Consider resting soon' },
  'burnout.sessions': { es: 'sesiones', en: 'sessions' },
  'burnout.skippedBreaks': { es: 'descansos saltados', en: 'skipped breaks' },
  
  // Kanban
  'kanban.title': { es: 'Tus Tareas', en: 'Your Tasks' },
  'kanban.todo': { es: 'Por Hacer', en: 'To Do' },
  'kanban.inProgress': { es: 'En Progreso', en: 'In Progress' },
  'kanban.done': { es: 'Completadas', en: 'Done' },
  'kanban.addTasks': { es: 'Agrega tareas para empezar', en: 'Add tasks to get started' },
  'kanban.dragHere': { es: 'Arrastra tareas aquí', en: 'Drag tasks here to start' },
  'kanban.completeToSee': { es: 'Completa tareas para verlas aquí', en: 'Complete tasks to see them here' },
  
  // Task Card
  'task.start': { es: 'Iniciar', en: 'Start Task' },
  'task.focus': { es: 'Enfocar', en: 'Focus' },
  'task.completed': { es: '¡Completada!', en: 'Completed!' },
  'task.undo': { es: 'Deshacer', en: 'Undo' },
  'task.easy': { es: 'Fácil', en: 'Easy' },
  'task.medium': { es: 'Media', en: 'Medium' },
  'task.hard': { es: 'Difícil', en: 'Hard' },
  
  // Add Task
  'addTask.title': { es: 'Agregar Nueva Tarea', en: 'Add New Task' },
  'addTask.what': { es: '¿Qué necesitas hacer?', en: 'What do you need to do?' },
  'addTask.placeholder': { es: 'Ej: Estudiar Capítulo 5...', en: 'e.g., Study Chapter 5...' },
  'addTask.difficulty': { es: '¿Qué tan difícil es?', en: 'How challenging is this?' },
  'addTask.time': { es: 'Tiempo estimado (horas)', en: 'Estimated time (hours)' },
  'addTask.date': { es: 'Programar para', en: 'Scheduled for' },
  'addTask.submit': { es: 'Agregar Tarea', en: 'Add Task' },
  'addTask.quickEasy': { es: 'Rápida y simple', en: 'Quick & simple' },
  'addTask.someFocus': { es: 'Requiere algo de enfoque', en: 'Some focus needed' },
  'addTask.deepWork': { es: 'Trabajo profundo requerido', en: 'Deep work required' },
  'addTask.hardTip': { es: '¡Las tareas difíciles se priorizarán primero cuando estés más fresco/a!', en: 'Hard tasks will be prioritized first when you\'re freshest!' },
  
  // AI Plan
  'aiPlan.title': { es: 'Planificador IA', en: 'AI Daily Planner' },
  'aiPlan.generate': { es: 'Generar Plan', en: 'Generate Plan' },
  'aiPlan.regenerate': { es: 'Regenerar', en: 'Regenerate' },
  'aiPlan.planning': { es: 'Planeando...', en: 'Planning...' },
  'aiPlan.description': { es: 'Deja que la IA cree un horario balanceado basado en tus tareas y energía.', en: 'Let AI create a balanced schedule based on your tasks and energy.' },
  'aiPlan.totalPlanned': { es: 'Total planeado', en: 'Total planned' },
  'aiPlan.scheduledTasks': { es: 'Tareas Programadas', en: 'Scheduled Tasks' },
  
  // Points
  'points.title': { es: 'Puntos Totales', en: 'Total Points' },
  'points.today': { es: 'Hoy', en: 'Today' },
  
  // Badges
  'badges.title': { es: 'Insignias', en: 'Badges' },
  'badges.empty': { es: '¡Completa tareas para ganar insignias!', en: 'Complete tasks to earn badges!' },
  
  // Profile
  'profile.title': { es: 'Perfil', en: 'Profile' },
  'profile.stats': { es: 'Estadísticas', en: 'Statistics' },
  'profile.maxHours': { es: 'Horas máximas diarias', en: 'Maximum daily hours' },
  'profile.feedback': { es: 'Danos tu opinión', en: 'Give us feedback' },
  
  // Login
  'login.title': { es: 'TIZZA', en: 'TIZZA' },
  'login.subtitle': { es: 'Productividad inteligente con bienestar emocional.', en: 'Smart productivity with emotional wellness.' },
  'login.signIn': { es: 'Iniciar Sesión', en: 'Sign In' },
  'login.signUp': { es: 'Crear Cuenta', en: 'Create Account' },
  'login.signingIn': { es: 'Iniciando sesión...', en: 'Signing in...' },
  'login.signingUp': { es: 'Creando cuenta...', en: 'Creating account...' },
  'login.hasAccount': { es: '¿Ya tienes cuenta? Inicia sesión', en: 'Already have an account? Sign in' },
  'login.noAccount': { es: '¿No tienes cuenta? Regístrate', en: "Don't have an account? Sign up" },
  'login.guest': { es: 'Probar sin cuenta', en: 'Try without account' },
  'login.guestDesc': { es: 'Explora TIZZA sin registro. Tus datos se guardarán localmente.', en: 'Explore TIZZA without signing up. Your data will be saved locally.' },
  'login.aiPlanning': { es: 'Planificación con IA', en: 'AI-powered planning' },
  'login.burnoutPrevention': { es: 'Prevención de burnout', en: 'Burnout prevention' },
  'login.mentalHealth': { es: 'Bienestar emocional', en: 'Mental health first' },
  'login.agreement': { es: 'Al continuar, aceptas enfocarte en tu bienestar 💚', en: 'By continuing, you agree to focus on your wellbeing 💚' },
  
  // Voice
  'voice.listening': { es: 'Escuchando...', en: 'Listening...' },
  'voice.processing': { es: 'Procesando...', en: 'Processing...' },
  'voice.confirm': { es: '¿Es correcto?', en: 'Is this correct?' },
  'voice.edit': { es: 'Editar tarea', en: 'Edit task' },
  'voice.command': { es: 'Comando de voz', en: 'Voice command' },
  'voice.speakNow': { es: 'Habla ahora...', en: 'Speak now...' },
  'voice.confirmOrEdit': { es: 'Confirma o edita la tarea', en: 'Confirm or edit the task' },
  'voice.waitingVoice': { es: '🎤 Esperando tu voz...', en: '🎤 Waiting for your voice...' },
  'voice.editBtn': { es: 'Editar', en: 'Edit' },
  'voice.confirmBtn': { es: 'Confirmar', en: 'Confirm' },
  'voice.saveBtn': { es: 'Guardar', en: 'Save' },
  'voice.cancelBtn': { es: 'Cancelar', en: 'Cancel' },
  'voice.taskTitle': { es: 'Título de la tarea', en: 'Task title' },
  'voice.examples': { es: 'Ejemplos de comandos:', en: 'Example commands:' },
  
  // Search
  'search.placeholder': { es: 'Buscar tareas...', en: 'Search tasks...' },
  
  // Onboarding
  'onboarding.welcome': { es: '¡Bienvenido/a a TIZZA!', en: 'Welcome to TIZZA!' },
  'onboarding.step1Title': { es: 'Crea tareas por voz', en: 'Create tasks by voice' },
  'onboarding.step1Desc': { es: 'Toca el micrófono y di algo como "Reunión a las 4pm el lunes"', en: 'Tap the microphone and say something like "Meeting at 4pm on Monday"' },
  'onboarding.step2Title': { es: 'Revisa tu estado de ánimo', en: 'Check your mood' },
  'onboarding.step2Desc': { es: 'El slider ajusta automáticamente tu plan según cómo te sientes', en: 'The slider auto-adjusts your plan based on how you feel' },
  'onboarding.step3Title': { es: 'Organiza con el Kanban', en: 'Organize with Kanban' },
  'onboarding.step3Desc': { es: 'Arrastra tareas entre columnas para cambiar su estado', en: 'Drag tasks between columns to change their status' },
  'onboarding.step4Title': { es: 'Gana insignias', en: 'Earn badges' },
  'onboarding.step4Desc': { es: 'Completa tareas y pomodoros para ganar puntos e insignias', en: 'Complete tasks and pomodoros to earn points and badges' },
  'onboarding.next': { es: 'Siguiente', en: 'Next' },
  'onboarding.start': { es: '¡Empezar!', en: 'Get Started!' },
  'onboarding.skip': { es: 'Saltar tutorial', en: 'Skip tutorial' },
  
  // Pomodoro
  'pomodoro.focusTime': { es: 'Tiempo de Enfoque', en: 'Focus Time' },
  'pomodoro.breakTime': { es: 'Tiempo de Descanso', en: 'Break Time' },
  'pomodoro.ready': { es: '¿Listo para enfocarte?', en: 'Ready to Focus?' },
  'pomodoro.startFocus': { es: 'Iniciar Enfoque', en: 'Start Focus' },
  'pomodoro.pause': { es: 'Pausa', en: 'Pause' },
  'pomodoro.resume': { es: 'Reanudar', en: 'Resume' },
  'pomodoro.skipBreak': { es: 'Saltar Descanso', en: 'Skip Break' },
  'pomodoro.burnoutWarning': { es: '⚠️ Has trabajado mucho. Toma este descanso para evitar burnout.', en: '⚠️ You\'ve been working hard! Please take this break.' },
  'pomodoro.skipWarning': { es: 'Saltar muchos descansos aumenta el riesgo de burnout', en: 'Skipping too many breaks increases burnout risk' },
  'pomodoro.completed': { es: 'completados', en: 'completed' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tizza-language');
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('tizza-language', language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
