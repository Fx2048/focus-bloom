import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurriculum, CurriculumCourse } from '@/hooks/useCurriculum';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, GraduationCap, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export const SEMESTERS = [
  '2026-1', '2026-2',
  '2027-0', '2027-1', '2027-2',
  '2028-0', '2028-1', '2028-2',
  '2029-0', '2029-1', '2029-2',
  '2030-0', '2030-1', '2030-2',
  '2031-0', '2031-1', '2031-2',
];

const COLORS = ['#c8f55a', '#8b5cf6', '#f59e0b', '#22d3ee', '#ec4899', '#10b981', '#ef4444', '#3b82f6'];
const STATUS_LABEL: Record<CurriculumCourse['status'], string> = {
  planned: 'Planeado',
  'in-progress': 'En curso',
  completed: 'Aprobado',
  failed: 'Desaprobado',
};

function isSummer(sem: string) {
  return sem.endsWith('-0');
}

type Draft = Partial<CurriculumCourse> & { id?: string; semester: string; name: string };

export default function Curriculum() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courses, isLoading, addCourse, updateCourse, deleteCourse } = useCurriculum();
  const [editing, setEditing] = useState<Draft | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const boardRef = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<{ id: string; d: string; color: string }[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);

  if (!user) { navigate('/'); return null; }

  const bySemester = useMemo(() => {
    const map = new Map<string, CurriculumCourse[]>();
    for (const s of SEMESTERS) map.set(s, []);
    for (const c of courses) {
      if (!map.has(c.semester)) map.set(c.semester, []);
      map.get(c.semester)!.push(c);
    }
    return map;
  }, [courses]);

  const totalCredits = useMemo(() => courses.reduce((a, c) => a + Number(c.credits || 0), 0), [courses]);
  const completedCredits = useMemo(
    () => courses.filter(c => c.status === 'completed').reduce((a, c) => a + Number(c.credits || 0), 0),
    [courses]
  );

  const recomputeArrows = () => {
    const board = boardRef.current;
    if (!board) return;
    const boardBox = board.getBoundingClientRect();
    const next: { id: string; d: string; color: string }[] = [];
    for (const c of courses) {
      for (const prereqId of c.prerequisites) {
        const from = cardRefs.current.get(prereqId);
        const to = cardRefs.current.get(c.id);
        if (!from || !to) continue;
        const a = from.getBoundingClientRect();
        const b = to.getBoundingClientRect();
        const x1 = a.right - boardBox.left + board.scrollLeft;
        const y1 = a.top + a.height / 2 - boardBox.top + board.scrollTop;
        const x2 = b.left - boardBox.left + board.scrollLeft;
        const y2 = b.top + b.height / 2 - boardBox.top + board.scrollTop;
        const mx = (x1 + x2) / 2;
        const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
        const isHi = hoverId === c.id || hoverId === prereqId;
        next.push({ id: `${prereqId}-${c.id}`, d, color: isHi ? '#c8f55a' : 'hsl(var(--muted-foreground))' });
      }
    }
    setArrows(next);
  };

  useLayoutEffect(() => {
    recomputeArrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, hoverId]);

  useEffect(() => {
    const onResize = () => recomputeArrows();
    window.addEventListener('resize', onResize);
    const board = boardRef.current;
    board?.addEventListener('scroll', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      board?.removeEventListener('scroll', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrop = (e: React.DragEvent, semester: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    const c = courses.find(x => x.id === id);
    if (!c || c.semester === semester) return;
    updateCourse({ id, semester });
  };

  const openNew = (semester: string) => setEditing({ semester, name: '', code: '', credits: 3, color: COLORS[0], prerequisites: [], status: 'planned', notes: '' });

  const saveDraft = () => {
    if (!editing) return;
    if (!editing.name?.trim()) { toast.error('El nombre es obligatorio'); return; }
    const payload = {
      code: editing.code ?? '',
      name: editing.name.trim(),
      credits: Number(editing.credits ?? 3),
      semester: editing.semester,
      prerequisites: editing.prerequisites ?? [],
      color: editing.color ?? COLORS[0],
      notes: editing.notes ?? '',
      status: (editing.status ?? 'planned') as CurriculumCourse['status'],
      position: editing.position ?? 0,
    };
    if (editing.id) updateCourse({ id: editing.id, ...payload });
    else addCourse(payload);
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 pb-20 max-w-[1400px] mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                Malla curricular
              </h1>
              <p className="text-xs text-muted-foreground">
                Arrastra cursos entre ciclos · Toca un curso para editarlo · Las líneas muestran prerrequisitos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-sm">Total: {totalCredits} créditos</Badge>
            <Badge className="text-sm bg-primary text-primary-foreground">Aprobados: {completedCredits}</Badge>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">Cargando malla...</p>
        ) : (
          <div
            ref={boardRef}
            className="relative overflow-x-auto overflow-y-visible rounded-2xl border bg-card/40 p-4"
          >
            {/* SVG arrows overlay */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%', minWidth: `${SEMESTERS.length * 240}px` }}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {arrows.map(a => (
                <path key={a.id} d={a.d} stroke={a.color} strokeWidth={2} fill="none" markerEnd="url(#arrow)" opacity={0.7} />
              ))}
            </svg>

            <div className="flex gap-3 min-w-max relative">
              {SEMESTERS.map(sem => {
                const list = bySemester.get(sem) ?? [];
                const credits = list.reduce((a, c) => a + Number(c.credits || 0), 0);
                const summer = isSummer(sem);
                return (
                  <div
                    key={sem}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, sem)}
                    className={`w-56 shrink-0 rounded-xl border p-2 flex flex-col gap-2 ${summer ? 'bg-orange-500/5 border-orange-500/30' : 'bg-background/40'}`}
                  >
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${summer ? 'text-orange-500' : 'text-foreground'}`}>
                          {sem}{summer && ' ☀️'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{credits} créd · {list.length} cursos</div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openNew(sem)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-2 min-h-[60px]">
                      {list.map(c => (
                        <button
                          key={c.id}
                          ref={(el) => {
                            if (el) cardRefs.current.set(c.id, el);
                            else cardRefs.current.delete(c.id);
                          }}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                          onMouseEnter={() => setHoverId(c.id)}
                          onMouseLeave={() => setHoverId(null)}
                          onClick={() => setEditing({ ...c })}
                          className="relative text-left rounded-lg p-2 border bg-card hover:shadow-elevated transition-all cursor-grab active:cursor-grabbing group"
                          style={{ borderLeft: `4px solid ${c.color}` }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              {c.code && <div className="text-[10px] font-mono text-muted-foreground truncate">{c.code}</div>}
                              <div className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{c.name}</div>
                            </div>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{c.credits}c</Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {c.status !== 'planned' && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                                c.status === 'completed' ? 'bg-primary/20 text-primary' :
                                c.status === 'in-progress' ? 'bg-blue-500/20 text-blue-500' :
                                'bg-destructive/20 text-destructive'
                              }`}>
                                {STATUS_LABEL[c.status]}
                              </span>
                            )}
                            {c.prerequisites.length > 0 && (
                              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <Link2 className="w-2.5 h-2.5" />{c.prerequisites.length}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                      {list.length === 0 && (
                        <div className="text-[10px] text-muted-foreground/60 text-center py-4 border border-dashed rounded-lg">
                          Arrastra o + para añadir
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar curso' : 'Nuevo curso'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-xs text-muted-foreground">Código</label>
                  <Input value={editing.code ?? ''} onChange={(e) => setEditing({ ...editing, code: e.target.value })} placeholder="CS101" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Nombre *</label>
                  <Input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Cálculo I" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Créditos</label>
                  <Input type="number" step="0.5" min="0" value={editing.credits ?? 3}
                    onChange={(e) => setEditing({ ...editing, credits: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Ciclo</label>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-2 text-sm"
                    value={editing.semester}
                    onChange={(e) => setEditing({ ...editing, semester: e.target.value })}
                  >
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}{isSummer(s) ? ' (verano)' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Estado</label>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-2 text-sm"
                    value={editing.status ?? 'planned'}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as CurriculumCourse['status'] })}
                  >
                    <option value="planned">Planeado</option>
                    <option value="in-progress">En curso</option>
                    <option value="completed">Aprobado</option>
                    <option value="failed">Desaprobado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button"
                      onClick={() => setEditing({ ...editing, color: c })}
                      className="w-7 h-7 rounded-full border-2"
                      style={{
                        backgroundColor: c,
                        borderColor: editing.color === c ? '#fff' : 'transparent',
                        transform: editing.color === c ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Prerrequisitos</label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                  {courses.filter(c => c.id !== editing.id).length === 0 && (
                    <p className="text-xs text-muted-foreground">Aún no hay otros cursos</p>
                  )}
                  {courses.filter(c => c.id !== editing.id).map(c => {
                    const checked = (editing.prerequisites ?? []).includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded">
                        <input type="checkbox" checked={checked}
                          onChange={() => {
                            const cur = editing.prerequisites ?? [];
                            setEditing({
                              ...editing,
                              prerequisites: checked ? cur.filter(x => x !== c.id) : [...cur, c.id],
                            });
                          }}
                        />
                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-mono text-[10px] text-muted-foreground">{c.semester}</span>
                        <span className="truncate">{c.code} {c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Notas</label>
                <Textarea rows={2} value={editing.notes ?? ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={saveDraft} className="flex-1">Guardar</Button>
                {editing.id && (
                  <Button variant="destructive" size="icon"
                    onClick={() => { if (confirm(`¿Eliminar "${editing.name}"?`)) { deleteCourse(editing.id!); setEditing(null); } }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}