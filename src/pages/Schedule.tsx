import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCourses, Course } from '@/hooks/useCourses';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_INDEX = [1, 2, 3, 4, 5, 6, 0]; // display order → JS day
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7..21
const COLORS = ['#c8f55a', '#8b5cf6', '#f59e0b', '#22d3ee', '#ec4899', '#10b981', '#ef4444'];

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function Schedule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courses, isLoading, addCourse, deleteCourse } = useCourses();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', code: '', professor: '', room: '',
    dayOfWeek: 1, startTime: '08:00', endTime: '10:00', color: COLORS[0],
  });

  const byDay = useMemo(() => {
    const map = new Map<number, Course[]>();
    for (const c of courses) {
      if (!map.has(c.dayOfWeek)) map.set(c.dayOfWeek, []);
      map.get(c.dayOfWeek)!.push(c);
    }
    return map;
  }, [courses]);

  if (!user) { navigate('/'); return null; }

  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('Ponle un nombre al curso'); return; }
    if (toMin(form.endTime) <= toMin(form.startTime)) {
      toast.error('La hora de fin debe ser después de la de inicio');
      return;
    }
    addCourse({
      name: form.name.trim(),
      code: form.code.trim() || null,
      professor: form.professor.trim() || null,
      room: form.room.trim() || null,
      color: form.color,
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime + ':00',
      endTime: form.endTime + ':00',
    });
    setOpen(false);
    setForm({ ...form, name: '', code: '', professor: '', room: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 pb-20 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">📚 Horario semanal</h1>
              <p className="text-xs text-muted-foreground">Estilo pizarrón · toca un bloque para eliminarlo</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl"><Plus className="w-4 h-4" />Curso</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuevo curso</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nombre del curso" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Código (CS101)" value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })} />
                  <Input placeholder="Aula (B-204)" value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })} />
                </div>
                <Input placeholder="Profesor(a)" value={form.professor}
                  onChange={(e) => setForm({ ...form, professor: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Día</label>
                    <select
                      className="w-full h-10 rounded-md border bg-background px-2 text-sm"
                      value={form.dayOfWeek}
                      onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
                    >
                      {DAYS.map((d, i) => (
                        <option key={DAY_INDEX[i]} value={DAY_INDEX[i]}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Inicio</label>
                    <Input type="time" value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Fin</label>
                    <Input type="time" value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button key={c} type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        className="w-8 h-8 rounded-full border-2 transition-transform"
                        style={{
                          backgroundColor: c,
                          borderColor: form.color === c ? '#fff' : 'transparent',
                          transform: form.color === c ? 'scale(1.1)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full">Añadir al horario</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Blackboard */}
        <div
          className="rounded-3xl p-3 sm:p-5 shadow-elevated overflow-x-auto border-8"
          style={{
            background: 'radial-gradient(ellipse at center, #1f4a3d 0%, #0f2a22 100%)',
            borderColor: '#8b5a2b',
            borderImage: 'linear-gradient(135deg, #a97142, #5a3a1a) 1',
          }}
        >
          {isLoading ? (
            <p className="text-center text-white/70 py-10">Cargando horario...</p>
          ) : (
            <div className="min-w-[720px]">
              {/* Header row */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-1">
                <div />
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-white/90 font-bold uppercase tracking-widest text-xs sm:text-sm py-2 border-b border-white/20"
                    style={{ fontFamily: 'Caveat, "Comic Sans MS", cursive' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              <div className="relative grid grid-cols-[60px_repeat(7,1fr)] gap-1">
                {HOURS.map((h) => (
                  <div key={`row-${h}`} className="contents">
                    <div className="text-right pr-2 text-white/60 text-[11px] font-mono h-14 border-t border-white/10">
                      {String(h).padStart(2, '0')}:00
                    </div>
                    {DAY_INDEX.map((dayIdx) => (
                      <div key={`cell-${h}-${dayIdx}`}
                        className="h-14 border-t border-white/10 relative" />
                    ))}
                  </div>
                ))}

                {/* Course blocks absolutely positioned */}
                {DAY_INDEX.map((dayIdx, colIdx) => {
                  const dayCourses = byDay.get(dayIdx) ?? [];
                  return dayCourses.map((c) => {
                    const startMin = toMin(c.startTime);
                    const endMin = toMin(c.endTime);
                    const dayStart = HOURS[0] * 60;
                    const top = ((startMin - dayStart) / 60) * 56; // 56 = h-14
                    const height = ((endMin - startMin) / 60) * 56 - 4;
                    if (top < 0 || top > HOURS.length * 56) return null;
                    return (
                      <button key={c.id}
                        onClick={() => {
                          if (confirm(`¿Eliminar "${c.name}"?`)) deleteCourse(c.id);
                        }}
                        className="absolute rounded-lg p-2 text-left overflow-hidden shadow-lg hover:scale-[1.02] transition-transform text-stone-900"
                        style={{
                          top: `${top + 2}px`,
                          height: `${height}px`,
                          left: `calc(60px + ${colIdx} * ((100% - 60px) / 7) + 2px)`,
                          width: `calc((100% - 60px) / 7 - 4px)`,
                          backgroundColor: c.color,
                          boxShadow: `0 4px 12px ${c.color}55`,
                        }}
                      >
                        <div className="text-[11px] font-bold leading-tight truncate">{c.name}</div>
                        {c.code && <div className="text-[10px] opacity-80 truncate">{c.code}</div>}
                        {c.room && (
                          <div className="text-[10px] opacity-90 flex items-center gap-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5" />{c.room}
                          </div>
                        )}
                        {c.professor && height > 60 && (
                          <div className="text-[10px] opacity-80 flex items-center gap-0.5 truncate">
                            <User className="w-2.5 h-2.5" />{c.professor}
                          </div>
                        )}
                      </button>
                    );
                  });
                })}
              </div>
            </div>
          )}

          {courses.length === 0 && !isLoading && (
            <div className="text-center text-white/70 py-10">
              <p className="text-lg mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                Tu pizarrón está vacío
              </p>
              <p className="text-sm">Añade tu primer curso con el botón de arriba</p>
            </div>
          )}
        </div>

        {courses.length > 0 && (
          <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <Trash2 className="w-3 h-3" /> Toca un bloque para eliminarlo
          </div>
        )}
      </main>
    </div>
  );
}