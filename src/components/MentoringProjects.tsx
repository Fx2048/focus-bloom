import { useState } from 'react';
import { MentoringProject } from '@/hooks/useMentoring';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderKanban, ArrowRight } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'in-progress': { label: 'En progreso', color: 'bg-primary/10 text-primary' },
  'completed': { label: 'Completado', color: 'bg-ff-balanced/10 text-ff-balanced' },
  'paused': { label: 'Pausado', color: 'bg-muted text-muted-foreground' },
};

const STATUS_FLOW = ['in-progress', 'paused', 'completed'];

interface MentoringProjectsProps {
  projects: MentoringProject[];
  onCreate: (title: string, description: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export function MentoringProjects({ projects, onCreate, onUpdateStatus }: MentoringProjectsProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate(title.trim(), desc.trim());
    setTitle('');
    setDesc('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-primary" />
          Proyectos compartidos
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Nuevo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Nombre del proyecto" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Descripción (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!title.trim()}>Crear</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground text-sm py-6">
          No hay proyectos compartidos. ¡Crea uno! 📁
        </p>
      )}

      <div className="space-y-3">
        {projects.map((project) => {
          const config = STATUS_CONFIG[project.status] || STATUS_CONFIG['in-progress'];
          const nextStatus = STATUS_FLOW[(STATUS_FLOW.indexOf(project.status) + 1) % STATUS_FLOW.length];
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{project.title}</h4>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    )}
                  </div>
                  <Badge className={config.color} variant="secondary">{config.label}</Badge>
                </div>
                <div className="flex justify-end mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateStatus(project.id, nextStatus)}
                    className="text-xs"
                  >
                    Mover a {STATUS_CONFIG[nextStatus]?.label}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
