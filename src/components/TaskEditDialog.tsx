import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Task, Difficulty } from "@/types/focusflow";

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Pick<Task, "name" | "difficulty" | "estimatedHours" | "scheduledDay">>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskEditDialog({ task, isOpen, onClose, onSave, onDelete }: TaskEditDialogProps) {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [estimatedHours, setEstimatedHours] = useState("1");
  const [scheduledDay, setScheduledDay] = useState<Date>(new Date());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDifficulty(task.difficulty);
      setEstimatedHours(String(task.estimatedHours));
      setScheduledDay(new Date(task.scheduledDay));
      setShowDeleteConfirm(false);
    }
  }, [task]);

  const handleSave = () => {
    if (!task || !name.trim()) return;
    
    onSave(task.id, {
      name: name.trim(),
      difficulty,
      estimatedHours: parseFloat(estimatedHours) || 1,
      scheduledDay,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    onDelete(task.id);
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Tarea</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modifica los detalles de tu tarea. Todos los cambios se aplicarán a esta ocurrencia.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Task Name */}
          <div className="grid gap-2">
            <Label htmlFor="task-name" className="text-foreground">
              Nombre de la tarea
            </Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Estudiar para examen"
              className="bg-background border-border focus:border-primary"
            />
          </div>

          {/* Difficulty */}
          <div className="grid gap-2">
            <Label htmlFor="difficulty" className="text-foreground">
              Dificultad
            </Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger id="difficulty" className="bg-background border-border">
                <SelectValue placeholder="Selecciona dificultad" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="low" className="text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-ff-difficulty-low" />
                    Fácil
                  </div>
                </SelectItem>
                <SelectItem value="medium" className="text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-ff-difficulty-medium" />
                    Media
                  </div>
                </SelectItem>
                <SelectItem value="high" className="text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-ff-difficulty-high" />
                    Difícil
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Hours */}
          <div className="grid gap-2">
            <Label htmlFor="hours" className="text-foreground">
              Horas estimadas
            </Label>
            <Select value={estimatedHours} onValueChange={setEstimatedHours}>
              <SelectTrigger id="hours" className="bg-background border-border">
                <SelectValue placeholder="Selecciona duración" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="0.5" className="text-foreground">30 minutos</SelectItem>
                <SelectItem value="1" className="text-foreground">1 hora</SelectItem>
                <SelectItem value="1.5" className="text-foreground">1.5 horas</SelectItem>
                <SelectItem value="2" className="text-foreground">2 horas</SelectItem>
                <SelectItem value="3" className="text-foreground">3 horas</SelectItem>
                <SelectItem value="4" className="text-foreground">4 horas</SelectItem>
                <SelectItem value="5" className="text-foreground">5 horas</SelectItem>
                <SelectItem value="6" className="text-foreground">6 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Day */}
          <div className="grid gap-2">
            <Label className="text-foreground">Fecha programada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-border",
                    !scheduledDay && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDay ? format(scheduledDay, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDay}
                  onSelect={(date) => date && setScheduledDay(date)}
                  initialFocus
                  className="pointer-events-auto"
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!showDeleteConfirm ? (
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="sm:mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={!name.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </>
          ) : (
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm text-destructive text-center">
                ¿Estás seguro de que quieres eliminar esta tarea?
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Confirmar Eliminación
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
