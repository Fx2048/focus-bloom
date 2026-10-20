import { describe, it, expect } from 'vitest';
import { filterDeadlines, gradeAnswers, FOCUS_SECONDS, BREAK_SECONDS } from './studyRules';
describe('Academic workspace rules', () => {
  it('keeps 25-minute focus sessions', () => expect(FOCUS_SECONDS).toBe(1500));
  it('keeps five-minute recovery breaks', () => expect(BREAK_SECONDS).toBe(300));
  it('filters pending work without completed activities', () => {
    const rows = [{title:'Álgebra', course:'Matemática', completed:false,priority:'high',due_at:'2026-10-21'}, {title:'Lectura',course:'Historia',completed:true,priority:'low',due_at:'2026-10-20'}];
    expect(filterDeadlines(rows, '', 'pending').map(x=>x.title)).toEqual(['Álgebra']);
  });
  it('checks submitted answers rather than granting completion credit', () => expect(gradeAnswers([{answer:1},{answer:2}], [1,0])).toBe(50));
});