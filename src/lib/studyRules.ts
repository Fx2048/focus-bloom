export const FOCUS_SECONDS = 25 * 60;
export const BREAK_SECONDS = 5 * 60;
export type Priority = 'low' | 'medium' | 'high';
export function filterDeadlines<T extends { title: string; course: string; completed: boolean; priority: string; due_at: string }>(items: T[], search: string, filter: string) {
  const q = search.toLocaleLowerCase();
  return items.filter(d => `${d.title} ${d.course}`.toLocaleLowerCase().includes(q) && (filter === 'all' || (filter === 'done' ? d.completed : filter === 'pending' ? !d.completed : d.priority === filter && !d.completed)))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || Date.parse(a.due_at) - Date.parse(b.due_at));
}
export function gradeAnswers(questions: { answer: number }[], answers: number[]) {
  return questions.length ? Math.round(questions.filter((q, i) => q.answer === answers[i]).length / questions.length * 100) : 0;
}