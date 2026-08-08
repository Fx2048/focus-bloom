import { FormEvent, useState } from 'react';
import { BookOpenCheck, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useIslandExploration } from '@/hooks/useIslandExploration';
import { IslandWorld } from '@/components/IslandWorld';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AcademicProgressPanel() {
  const {
    isLoading,
    plan,
    records,
    createPlan,
    addRecord,
    removeRecord,
  } = useIslandExploration();

  const [planName, setPlanName] = useState('');
  const [totalCredits, setTotalCredits] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCredits, setCourseCredits] = useState('');
  const [courseCycle, setCourseCycle] = useState('');
  const [grade, setGrade] = useState('');

  if (isLoading) {
    return <div className="card-calm p-5 text-sm text-muted-foreground">Cargando progreso académico...</div>;
  }

  if (!plan) {
    return (
      <section className="card-calm p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mapa de carrera
            </p>
            <h2 className="text-lg font-bold text-foreground">Crea tu meta personal</h2>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Tu isla se genera a partir de los créditos de tu propia malla: nada se ve hasta que existe.
        </p>

        <form
          className="space-y-3"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            createPlan.mutate({ name: planName, totalCredits: Number(totalCredits) });
          }}
        >
          <Input
            placeholder="Carrera, por ejemplo: Ingeniería Informática"
            value={planName}
            onChange={(event) => setPlanName(event.target.value)}
          />
          <Input
            type="number"
            min="1"
            step="0.5"
            placeholder="Total de créditos de tu malla"
            value={totalCredits}
            onChange={(event) => setTotalCredits(event.target.value)}
          />
          <Button className="w-full gap-2" disabled={createPlan.isPending}>
            <BookOpenCheck className="h-4 w-4" />
            Crear mi mapa de carrera
          </Button>
        </form>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <IslandWorld />

      <form
        className="card-calm space-y-2 p-3"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          addRecord.mutate(
            {
              name: courseName,
              code: courseCode,
              credits: Number(courseCredits),
              cycle: courseCycle,
              grade: Number(grade),
            },
            {
              onSuccess: () => {
                setCourseName('');
                setCourseCode('');
                setCourseCredits('');
                setCourseCycle('');
                setGrade('');
              },
            }
          );
        }}
      >
        <p className="text-sm font-semibold">Registrar curso en la ficha</p>
        <Input
          placeholder="Nombre del curso"
          value={courseName}
          onChange={(event) => setCourseName(event.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Código (opcional)"
            value={courseCode}
            onChange={(event) => setCourseCode(event.target.value)}
          />
          <Input
            type="number"
            min="1"
            placeholder="Ciclo"
            value={courseCycle}
            onChange={(event) => setCourseCycle(event.target.value)}
          />
          <Input
            type="number"
            min="0.5"
            step="0.5"
            placeholder="Créditos"
            value={courseCredits}
            onChange={(event) => setCourseCredits(event.target.value)}
          />
          <Input
            type="number"
            min="0"
            max="20"
            step="0.1"
            placeholder="Nota (0 a 20)"
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
          />
        </div>
        <Button type="submit" size="sm" className="w-full gap-2" disabled={addRecord.isPending}>
          <Plus className="h-4 w-4" />
          Guardar y recalcular la isla
        </Button>
      </form>

      <div className="card-calm space-y-2 p-3">
        <p className="text-sm font-semibold">Cursos registrados</p>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no registraste cursos. Puedes transcribirlos de tu ficha de notas.
          </p>
        ) : (
          records.map((record) => {
            const course = record.academic_courses;
            if (!course) return null;

            return (
              <div key={record.id} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{course.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.credits} créditos · {record.status === 'approved' ? 'Aprobado' : 'No aprobado'} · Nota{' '}
                    {record.grade ?? '—'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRecord.mutate(course.id)}
                  aria-label={'Eliminar ' + course.name}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
