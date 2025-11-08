import { Task, TaskStatus } from "@/store/types";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusColors = {
  todo: "column-todo",
  inprogress: "column-inprogress",
  done: "column-done",
};

const underlineColors = {
  todo: "border-column-todo",
  inprogress: "border-column-inprogress",
  done: "border-column-done",
};

export const TaskColumn = ({ title, status, tasks, onAddTask, onEditTask, onDeleteTask }: TaskColumnProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Column Container with background and rounded borders */}
      <div 
        className="flex flex-col h-full rounded-2xl p-4"
        style={{ backgroundColor: '#F5F5F5' }}
      >
        {/* Column Header */}
        <div className={cn("mb-4 pb-2 border-b-4", underlineColors[status])}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg text-foreground">{title}</h2>
              <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-medium">
                {tasks.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddTask(status)}
              className="h-7 w-7 text-primary hover:bg-primary/10"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Droppable Area */}
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "flex-1 space-y-4 overflow-y-auto px-1 pb-4",
                snapshot.isDraggingOver && "bg-accent/10 rounded-lg"
              )}
            >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "transition-all",
                      snapshot.isDragging && "rotate-1 scale-105 opacity-90",
                      index === 1 && !snapshot.isDragging && "transform -rotate-1" // Slight tilt on second card
                    )}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg bg-muted/30">
                Drop tasks here
              </div>
            )}
          </div>
        )}
      </Droppable>
      </div>
    </div>
  );
};
