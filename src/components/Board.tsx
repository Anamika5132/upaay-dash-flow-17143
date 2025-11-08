import { Task, TaskStatus } from "@/store/types";
import { TaskColumn } from "./TaskColumn";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

interface BoardProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export const Board = ({
  todoTasks,
  inProgressTasks,
  doneTasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}: BoardProps) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    
    if (!destination) return;
    
    const newStatus = destination.droppableId as TaskStatus;
    onMoveTask(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn
          title="To Do"
          status="todo"
          tasks={todoTasks}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
        <TaskColumn
          title="On Progress"
          status="inprogress"
          tasks={inProgressTasks}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
        <TaskColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </div>
    </DragDropContext>
  );
};
