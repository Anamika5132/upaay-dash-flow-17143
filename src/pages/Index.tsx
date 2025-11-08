import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  syncTasksFromDB,
  addTaskToDB, 
  deleteTaskFromDB, 
  updateTaskInDB,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  setSearchFilter,
  setPriorityFilter,
  setStatusFilter,
  setCategoryFilter,
  setDueDateFilter
} from "@/store/tasksSlice";
import { Task, TaskStatus } from "@/store/types";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Board } from "@/components/Board";
import { ProjectHeader } from "@/components/ProjectHeader";
import { DueDateBanner } from "@/components/DueDateBanner";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useRealtimeTasks } from "@/hooks/useRealtimeTasks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const { tasks, filter, customFieldDefinitions } = useAppSelector((state) => state.tasks);
  
  // Sync tasks from database on mount
  useEffect(() => {
    if (user) {
      dispatch(syncTasksFromDB());
    }
  }, [user, dispatch]);

  // Enable real-time collaboration
  useRealtimeTasks(user?.id);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogStatus, setAddDialogStatus] = useState<TaskStatus>("todo");
  const [detailsDialogTask, setDetailsDialogTask] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    const matchesSearch =
      filter.search === "" ||
      task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      task.description.toLowerCase().includes(filter.search.toLowerCase());

    // Priority filter
    const matchesPriority = filter.priority === "all" || task.priority === filter.priority;

    // Status filter
    const matchesStatus = filter.status === "all" || task.status === filter.status;

    // Category filter (using customFields.category)
    const taskCategory = task.customFields?.category || "";
    const matchesCategory = filter.category === "" || taskCategory === filter.category;

    // Due date filter
    let matchesDueDate = true;
    if (filter.dueDate && task.dueDate) {
      const taskDueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(taskDueDate);
      taskDate.setHours(0, 0, 0, 0);
      
      switch (filter.dueDate) {
        case "overdue":
          matchesDueDate = taskDate < today;
          break;
        case "today":
          matchesDueDate = taskDate.getTime() === today.getTime();
          break;
        case "thisWeek": {
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + (7 - today.getDay()));
          matchesDueDate = taskDate >= today && taskDate <= weekEnd;
          break;
        }
        case "thisMonth": {
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          matchesDueDate = taskDate >= today && taskDate <= monthEnd;
          break;
        }
        default:
          matchesDueDate = true;
      }
    } else if (filter.dueDate && !task.dueDate) {
      // If filter is set but task has no due date, exclude it
      matchesDueDate = false;
    }

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesDueDate;
  });

  // Group tasks by status
  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "inprogress");
  const doneTasks = filteredTasks.filter((t) => t.status === "done");

  const handleOpenAddDialog = (status: TaskStatus) => {
    setAddDialogStatus(status);
    setAddDialogOpen(true);
  };

  const handleAddTask = (taskData: any) => {
    dispatch(addTaskToDB({
      ...taskData,
      subtasks: [],
      customFields: taskData.customFields || {},
    }))
      .unwrap()
      .then(() => {
        setAddDialogOpen(false);
        toast.success("Task added successfully");
      })
      .catch(() => {
        toast.error("Failed to add task");
      });
  };

  const handleDeleteTask = (taskId: string) => {
    dispatch(deleteTaskFromDB(taskId))
      .unwrap()
      .then(() => {
        toast.success("Task deleted successfully");
      })
      .catch(() => {
        toast.error("Failed to delete task");
      });
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    dispatch(updateTaskInDB({
      id: taskId,
      updates: { 
        status: newStatus,
        activityLog: [{
          id: `log-${Date.now()}`,
          action: 'moved',
          timestamp: Date.now(),
          details: `Moved from ${task.status} to ${newStatus}`,
        }, ...task.activityLog]
      }
    }))
      .unwrap()
      .then(() => {
        toast.success("Task moved successfully");
      })
      .catch(() => {
        toast.error("Failed to move task");
      });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    dispatch(updateTaskInDB({ id: taskId, updates }))
      .unwrap()
      .then(() => {
        toast.success("Task updated successfully");
      })
      .catch(() => {
        toast.error("Failed to update task");
      });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Navbar with Logout */}
        <div className="relative">
          <Navbar 
            searchValue={filter.search}
            onSearchChange={(search) => dispatch(setSearchFilter(search))}
          />
          <div className="absolute top-4 right-4">
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Due Date Reminder Banner */}
          <DueDateBanner tasks={tasks} />

          {/* Project Header */}
          <ProjectHeader
            tasks={tasks}
            filter={filter}
            onPriorityChange={(priority) => dispatch(setPriorityFilter(priority))}
            onStatusChange={(status) => dispatch(setStatusFilter(status))}
            onCategoryChange={(category) => dispatch(setCategoryFilter(category))}
            onDueDateChange={(dueDate) => dispatch(setDueDateFilter(dueDate))}
          />

          {/* Board */}
          <Board
            todoTasks={todoTasks}
            inProgressTasks={inProgressTasks}
            doneTasks={doneTasks}
            onAddTask={handleOpenAddDialog}
            onEditTask={setDetailsDialogTask}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
          />
        </div>
      </div>

      {/* Dialogs */}
      <AddTaskDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddTask}
        defaultStatus={addDialogStatus}
        customFieldDefinitions={customFieldDefinitions}
      />

      {detailsDialogTask && (
        <TaskDetailsDialog
          task={detailsDialogTask}
          open={!!detailsDialogTask}
          onClose={() => setDetailsDialogTask(null)}
          onUpdate={handleUpdateTask}
          customFieldDefinitions={customFieldDefinitions}
          onAddSubtask={(taskId, title) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              const newSubtasks = [...task.subtasks, {
                id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title,
                completed: false,
              }];
              dispatch(updateTaskInDB({
                id: taskId,
                updates: {
                  subtasks: newSubtasks,
                  activityLog: [{
                    id: `log-${Date.now()}`,
                    action: 'subtask_added',
                    timestamp: Date.now(),
                    details: `Added subtask: ${title}`,
                  }, ...task.activityLog]
                }
              }));
            }
          }}
          onToggleSubtask={(taskId, subtaskId) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              const newSubtasks = task.subtasks.map(s =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              );
              const subtask = task.subtasks.find(s => s.id === subtaskId);
              dispatch(updateTaskInDB({
                id: taskId,
                updates: {
                  subtasks: newSubtasks,
                  activityLog: [{
                    id: `log-${Date.now()}`,
                    action: subtask?.completed ? 'subtask_uncompleted' : 'subtask_completed',
                    timestamp: Date.now(),
                    details: `${subtask?.completed ? 'Uncompleted' : 'Completed'} subtask: ${subtask?.title}`,
                  }, ...task.activityLog]
                }
              }));
            }
          }}
          onDeleteSubtask={(taskId, subtaskId) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              const subtask = task.subtasks.find(s => s.id === subtaskId);
              const newSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
              dispatch(updateTaskInDB({
                id: taskId,
                updates: {
                  subtasks: newSubtasks,
                  activityLog: [{
                    id: `log-${Date.now()}`,
                    action: 'subtask_deleted',
                    timestamp: Date.now(),
                    details: `Deleted subtask: ${subtask?.title}`,
                  }, ...task.activityLog]
                }
              }));
            }
          }}
        />
      )}
    </div>
  );
};

export default Index;
