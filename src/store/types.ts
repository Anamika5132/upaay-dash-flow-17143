export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "inprogress" | "done";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: number;
  details?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  subtasks: Subtask[];
  activityLog: ActivityLog[];
  customFields?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface TasksState {
  tasks: Task[];
  filter: {
    search: string;
    priority: TaskPriority | "all";
    status: TaskStatus | "all";
  };
}
