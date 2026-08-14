import { useRef, useState } from 'react';
import { Loader2, ScanText, Upload, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { ParsedCourse } from '@/hooks/useCurriculum';
import { toast } from 'sonner';

interface Props {
  semesters: string[];
  onImport: (args: { parsed: ParsedCourse[]; semesters: string[]; replace: boolean }) => Promise<unknown>;
  isImporting: boolean;
}

export function CurriculumImporter({ semesters, onImport, isImporting }: Props) {
  const [open, setOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedCourse[] | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [replace, setReplace] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async (payload: { imageBase64?: string; text?: string }) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-curriculum', { body: payload });
      if (error) throw error;
      const courses: ParsedCourse[] = data?.courses ?? [];
      if (!courses.length) {
        toast.error('No se detectaron cursos en la malla');
        return;
      }
      setParsed(courses);
      toast.success(`${courses.length} cursos detectados`);
    } catch (e) {
      toast.error((e as Error).message || 'No se pudo leer la malla');
    } finally {
      setAnalyzing(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Sube una imagen o captura de tu malla (PNG/JPG)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('La imagen no puede superar 8 MB');
      return;
    }
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    analyze({ imageBase64: base64 });
  };

  const confirm = async () => {
    if (!parsed) return;
    await onImport({ parsed, semesters: semesters.slice(startIndex), replace });
    setParsed(null);
    setText('');
    setOpen(false);
  };

  const cycles = parsed ? Array.from(new Set(parsed.map(c => c.cycle))).sort((a, b) => a - b) : [];

  return (
    <>
      <Button variant="secondary" className="rounded-xl gap-2" onClick={() => setOpen(true)}>
        <ScanText className="w-4 h-4" />
        Leer malla
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setParsed(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leer malla curricular</DialogTitle>
          </DialogHeader>

          {!parsed ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sube una imagen de tu malla o pega su texto. La IA detecta cursos, créditos, ciclos y prerrequisitos.
              </p>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              <Button
                variant="outline"
                className="w-full h-24 rounded-xl border-dashed gap-2"
                disabled={analyzing}
                onClick={() => fileRef.current?.click()}
              >
                {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {analyzing ? 'Analizando malla...' : 'Subir imagen de la malla'}
              </Button>

              <div className="space-y-2">
                <Textarea
                  rows={6}
                  placeholder={'O pega aquí el texto de tu malla:\nCiclo 1 - MAT101 Cálculo I - 4 créditos\n...'}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <Button
                  className="w-full rounded-xl gap-2"
                  disabled={analyzing || !text.trim()}
                  onClick={() => analyze({ text })}
                >
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Analizar texto
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm space-y-1">
                  <span className="text-muted-foreground">Ciclo 1 empieza en</span>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={startIndex}
                    onChange={(e) => setStartIndex(Number(e.target.value))}
                  >
                    {semesters.map((s, i) => (
                      <option key={s} value={i}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-end gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={replace}
                    onChange={(e) => setReplace(e.target.checked)}
                    className="mb-3 h-4 w-4"
                  />
                  <span className="mb-2.5">Reemplazar la malla actual</span>
                </label>
              </div>

              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {cycles.map((cycle) => (
                  <div key={cycle} className="rounded-xl border p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                      Ciclo {cycle} → {semesters.slice(startIndex)[cycle - 1] ?? '—'}
                    </p>
                    <ul className="space-y-1">
                      {parsed.filter(c => c.cycle === cycle).map((c, i) => (
                        <li key={`${c.name}-${i}`} className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate">
                            {c.code ? <span className="text-muted-foreground mr-1">{c.code}</span> : null}
                            {c.name}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">{c.credits} cr.</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setParsed(null)}>
                  Volver
                </Button>
                <Button className="flex-1 rounded-xl gap-2" onClick={confirm} disabled={isImporting}>
                  {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear ciclos y cursos
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
