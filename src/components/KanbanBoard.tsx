import { Task, TaskStatus } from '@/types/focusflow';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';
import { ClipboardList, Timer, CheckCircle2 } from 'lucide-react';

const columns: { status: TaskStatus; title: string; icon: React.ElementType; color: string }[] = [
  { status: 'pending', title: 'To Do', icon: ClipboardList, color: 'text-muted-foreground' },
  { status: 'in-progress', title: 'In Progress', icon: Timer, color: 'text-ff-balanced' },
  { status: 'completed', title: 'Done', icon: CheckCircle2, color: 'text-primary' },
];

interface KanbanBoardProps {
  tasks: Task[];
  onStartPomodoro: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanBoard({ tasks, onStartPomodoro, onUpdateStatus, onDeleteTask }: KanbanBoardProps) {
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    
    // Don't allow moving completed tasks
    if (task && task.status !== 'completed') {
      onUpdateStatus(taskId, status);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Your Tasks</h2>
      
      {/* Mobile: Stacked columns */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter(t => t.status === column.status);
          const Icon = column.icon;

          return (
            <div
              key={column.status}
              className="flex-1 min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column header */}
              <div className={cn(
                "flex items-center gap-2 mb-3 pb-2 border-b-2",
                column.status === 'pending' && 'border-muted',
                column.status === 'in-progress' && 'border-ff-balanced',
                column.status === 'completed' && 'border-primary'
              )}>
                <Icon className={cn("w-5 h-5", column.color)} />
                <h3 className={cn("font-semibold", column.color)}>{column.title}</h3>
                <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      {column.status === 'pending' && 'Add tasks to get started'}
                      {column.status === 'in-progress' && 'Drag tasks here to start'}
                      {column.status === 'completed' && 'Complete tasks to see them here'}
                    </p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable={task.status !== 'completed'}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={cn(
                        task.status !== 'completed' && "cursor-grab active:cursor-grabbing"
                      )}
                    >
                      <TaskCard
                        task={task}
                        onStartPomodoro={() => onStartPomodoro(task.id)}
                        onUpdateStatus={(status) => onUpdateStatus(task.id, status)}
                        onDelete={() => onDeleteTask(task.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
