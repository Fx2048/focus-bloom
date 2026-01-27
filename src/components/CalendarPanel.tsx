import { useState, useMemo } from "react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/focusflow";

interface CalendarPanelProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function CalendarPanel({ tasks, onTaskClick }: CalendarPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const tasksForDate = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter(task => isSameDay(new Date(task.scheduledDay), selectedDate));
  }, [selectedDate, tasks]);

  const getTaskCountForDay = (day: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.scheduledDay), day)).length;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low": return "bg-ff-difficulty-low text-white";
      case "medium": return "bg-ff-difficulty-medium text-foreground";
      case "high": return "bg-ff-difficulty-high text-white";
      default: return "bg-muted text-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "in-progress": return "En Progreso";
      case "completed": return "Completada";
      default: return status;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "fixed bottom-20 left-6 z-40 rounded-full w-12 h-12 shadow-elevated",
            "bg-card border-border hover:bg-accent hover:border-primary/30",
            "transition-all duration-300 ease-out",
            "hover:scale-105 active:scale-95"
          )}
          aria-label="Abrir calendario"
        >
          <CalendarDays className="h-5 w-5 text-primary" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-full sm:w-[420px] p-0 bg-background border-r border-border"
      >
        <SheetHeader className="p-4 border-b border-border bg-card/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Calendario
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-base font-semibold text-foreground capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-xl border border-border bg-card/30 p-3">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const taskCount = getTaskCountForDay(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm",
                      "transition-all duration-200 hover:bg-accent/50",
                      !isCurrentMonth && "text-muted-foreground/40",
                      isCurrentMonth && "text-foreground",
                      isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <span className="font-medium">{format(day, "d")}</span>
                    {taskCount > 0 && (
                      <div className={cn(
                        "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-primary"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Tasks */}
          {selectedDate && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                  className="h-7 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[280px]">
                {tasksForDate.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay tareas para este día</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-2">
                    {tasksForDate.map(task => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border border-border",
                          "bg-card hover:bg-accent/30 transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-primary/30"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className={cn(
                            "font-medium text-sm",
                            task.status === "completed" && "line-through text-muted-foreground"
                          )}>
                            {task.name}
                          </h5>
                          <Badge className={cn("text-xs shrink-0", getDifficultyColor(task.difficulty))}>
                            {task.difficulty === "low" ? "Fácil" : task.difficulty === "medium" ? "Media" : "Difícil"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{task.estimatedHours}h estimadas</span>
                          <span className={cn(
                            task.status === "completed" && "text-ff-balanced",
                            task.status === "in-progress" && "text-primary"
                          )}>
                            {getStatusText(task.status)}
                          </span>
                        </div>
                        {task.pomodoroSessions > 0 && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="flex gap-0.5">
                              {Array.from({ length: task.pomodoroSessions }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    i < task.completedPomodoros
                                      ? "bg-ff-balanced"
                                      : "bg-muted"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground ml-1">
                              {task.completedPomodoros}/{task.pomodoroSessions}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
