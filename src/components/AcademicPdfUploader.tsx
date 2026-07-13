import { useState } from 'react';
import { CheckCircle2, FileText, Loader2, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type DocumentType = 'curriculum' | 'notes';

const DOCUMENTS: Record<
  DocumentType,
  { title: string; description: string; filename: string }
> = {
  curriculum: {
    title: 'Malla curricular',
    description: 'Sube tu plan de estudios en PDF.',
    filename: 'curriculum.pdf',
  },
  notes: {
    title: 'Ficha de notas',
    description: 'Sube tu historial académico en PDF.',
    filename: 'notes.pdf',
  },
};

export function AcademicPdfUploader() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [uploaded, setUploaded] = useState<DocumentType[]>([]);

  async function uploadPdf(
    type: DocumentType,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      alert('Selecciona un archivo PDF.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El PDF no puede superar los 10 MB.');
      return;
    }

    setUploading(type);

    const path = `${user.id}/${DOCUMENTS[type].filename}`;

    const { error } = await supabase.storage
      .from('academic-documents')
      .upload(path, file, {
        upsert: true,
        contentType: 'application/pdf',
      });

    setUploading(null);

    if (error) {
      alert(`No se pudo subir el PDF: ${error.message}`);
      return;
    }

    setUploaded((current) =>
      current.includes(type) ? current : [...current, type]
    );

    alert(`${DOCUMENTS[type].title} subida correctamente.`);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-white shadow-elevated">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          Progreso académico
        </p>
        <h2 className="mt-1 text-2xl font-bold">Tu expediente de aventurero</h2>
        <p className="mt-1 text-sm text-slate-300">
          Sube tus PDFs para calcular créditos, nivel y experiencia.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(DOCUMENTS) as DocumentType[]).map((type) => {
          const document = DOCUMENTS[type];
          const isUploading = uploading === type;
          const isUploaded = uploaded.includes(type);

          return (
            <label
              key={type}
              className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={uploading !== null}
                onChange={(event) => uploadPdf(type, event)}
              />

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-400/15 p-2 text-sky-300">
                  <FileText size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{document.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {document.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                        <span>Subiendo...</span>
                      </>
                    ) : isUploaded ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-300">PDF guardado</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-amber-300" />
                        <span className="text-amber-200">Elegir PDF</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
