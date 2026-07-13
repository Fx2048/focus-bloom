import { CheckCircle2, Clock3, Play, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type Mission = {
  id: string;
  title: string;
  course: string;
  description: string;
  xpReward: number;
  duration: number;
  tasks: { id: string; title: string; completed: boolean }[];
};

type Props = {
  mission: Mission | null;
  onClose: () => void;
  onStart: (mission: Mission) => void;
  onToggleTask: (missionId: string, taskId: string) => void;
};

export function MissionDetailModal({
  mission,
  onClose,
  onStart,
  onToggleTask,
}: Props) {
  if (!mission) return null;

  const completed = mission.tasks.filter((task) => task.completed).length;

  return (
    <Dialog open={Boolean(mission)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-sky-300 bg-slate-950 text-white">
        <DialogHeader>
          <p className="text-sm font-medium text-amber-300">{mission.course}</p>
          <DialogTitle className="text-2xl">{mission.title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-300">{mission.description}</p>

        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1 text-sky-300">
            <Clock3 size={16} /> {mission.duration} min
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <Sparkles size={16} /> +{mission.xpReward} XP
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">
            Objetivos ({completed}/{mission.tasks.length})
          </h3>

          {mission.tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onToggleTask(mission.id, task.id)}
              className="flex w-full items-center gap-3 rounded-lg bg-white/5 p-3 text-left hover:bg-white/10"
            >
              <CheckCircle2
                size={20}
                className={task.completed ? "text-emerald-400" : "text-slate-500"}
              />
              <span className={task.completed ? "text-slate-500 line-through" : ""}>
                {task.title}
              </span>
            </button>
          ))}
        </div>

        <Button
          className="bg-amber-400 text-slate-950 hover:bg-amber-300"
          onClick={() => onStart(mission)}
        >
          <Play size={16} className="mr-2" />
          Comenzar misión
        </Button>
      </DialogContent>
    </Dialog>
  );
}
