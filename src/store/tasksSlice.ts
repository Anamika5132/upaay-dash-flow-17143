import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Task, TasksState, TaskPriority, TaskStatus, Subtask, CustomFieldDefinition } from "./types";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "taskboard_state";

// Async thunks for database operations
export const syncTasksFromDB = createAsyncThunk(
  'tasks/syncFromDB',
  async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority as TaskPriority,
      status: task.status as TaskStatus,
      dueDate: task.due_date,
      subtasks: (task.subtasks as any) || [],
      activityLog: (task.activity_log as any) || [],
      customFields: (task.custom_fields as any) || {},
      createdAt: new Date(task.created_at).getTime(),
      updatedAt: new Date(task.updated_at).getTime(),
    }));
  }
);

export const addTaskToDB = createAsyncThunk(
  'tasks/addToDB',
  async (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "activityLog">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.dueDate,
        subtasks: task.subtasks as any,
        custom_fields: task.customFields || {} as any,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      dueDate: data.due_date,
      subtasks: (data.subtasks as any) || [],
      activityLog: [{
        id: `log-${Date.now()}`,
        action: 'created',
        timestamp: Date.now(),
        details: 'Task created',
      }],
      customFields: (data.custom_fields as any) || {},
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  }
);

export const updateTaskInDB = createAsyncThunk(
  'tasks/updateInDB',
  async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
    if (updates.activityLog !== undefined) dbUpdates.activity_log = updates.activityLog;
    if (updates.customFields !== undefined) dbUpdates.custom_fields = updates.customFields;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id);
    
    if (error) throw error;
    
    return { id, updates };
  }
);

export const deleteTaskFromDB = createAsyncThunk(
  'tasks/deleteFromDB',
  async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return id;
  }
);

const loadStateFromStorage = (): TasksState => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error("Error loading state from localStorage:", error);
  }
  return {
    tasks: [],
    filter: {
      search: "",
      priority: "all",
      status: "all",
      category: "",
      dueDate: null,
    },
    customFieldDefinitions: [
      // Default custom fields
      { id: "category", name: "Category", type: "tag", options: ["Frontend", "Backend", "Design", "Marketing", "Other"] },
      { id: "tags", name: "Tags", type: "tag", options: [] },
    ],
  };
};

const saveStateToStorage = (state: TasksState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving state to localStorage:", error);
  }
};

const initialState: TasksState = loadStateFromStorage();

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Omit<Task, "id" | "createdAt" | "updatedAt" | "activityLog">>) => {
      const newTask: Task = {
        ...action.payload,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        activityLog: [
          {
            id: `log-${Date.now()}`,
            action: "created",
            timestamp: Date.now(),
            details: "Task created",
          },
        ],
      };
      state.tasks.push(newTask);
      saveStateToStorage(state);
    },
    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) {
        const changes: string[] = [];
        Object.entries(action.payload.updates).forEach(([key, value]) => {
          if (key !== "activityLog" && key !== "updatedAt") {
            changes.push(`${key} updated`);
          }
          (task as any)[key] = value;
        });
        
        task.updatedAt = Date.now();
        task.activityLog.unshift({
          id: `log-${Date.now()}`,
          action: "updated",
          timestamp: Date.now(),
          details: changes.join(", "),
        });
        saveStateToStorage(state);
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      saveStateToStorage(state);
    },
    moveTask: (state, action: PayloadAction<{ taskId: string; newStatus: TaskStatus }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        const oldStatus = task.status;
        task.status = action.payload.newStatus;
        task.updatedAt = Date.now();
        task.activityLog.unshift({
          id: `log-${Date.now()}`,
          action: "moved",
          timestamp: Date.now(),
          details: `Moved from ${oldStatus} to ${action.payload.newStatus}`,
        });
        saveStateToStorage(state);
      }
    },
    addSubtask: (state, action: PayloadAction<{ taskId: string; title: string }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.subtasks.push({
          id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: action.payload.title,
          completed: false,
        });
        task.updatedAt = Date.now();
        task.activityLog.unshift({
          id: `log-${Date.now()}`,
          action: "subtask_added",
          timestamp: Date.now(),
          details: `Added subtask: ${action.payload.title}`,
        });
        saveStateToStorage(state);
      }
    },
    toggleSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        const subtask = task.subtasks.find((s) => s.id === action.payload.subtaskId);
        if (subtask) {
          subtask.completed = !subtask.completed;
          task.updatedAt = Date.now();
          task.activityLog.unshift({
            id: `log-${Date.now()}`,
            action: subtask.completed ? "subtask_completed" : "subtask_uncompleted",
            timestamp: Date.now(),
            details: `${subtask.completed ? "Completed" : "Uncompleted"} subtask: ${subtask.title}`,
          });
          saveStateToStorage(state);
        }
      }
    },
    deleteSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        const subtask = task.subtasks.find((s) => s.id === action.payload.subtaskId);
        if (subtask) {
          task.subtasks = task.subtasks.filter((s) => s.id !== action.payload.subtaskId);
          task.updatedAt = Date.now();
          task.activityLog.unshift({
            id: `log-${Date.now()}`,
            action: "subtask_deleted",
            timestamp: Date.now(),
            details: `Deleted subtask: ${subtask.title}`,
          });
          saveStateToStorage(state);
        }
      }
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filter.search = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<TaskPriority | "all">) => {
      state.filter.priority = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<TaskStatus | "all">) => {
      state.filter.status = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filter.category = action.payload;
    },
    setDueDateFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.dueDate = action.payload;
    },
    addCustomFieldDefinition: (state, action: PayloadAction<CustomFieldDefinition>) => {
      state.customFieldDefinitions.push(action.payload);
      saveStateToStorage(state);
    },
    updateCustomFieldDefinition: (state, action: PayloadAction<{ id: string; updates: Partial<CustomFieldDefinition> }>) => {
      const field = state.customFieldDefinitions.find(f => f.id === action.payload.id);
      if (field) {
        Object.assign(field, action.payload.updates);
        saveStateToStorage(state);
      }
    },
    deleteCustomFieldDefinition: (state, action: PayloadAction<string>) => {
      state.customFieldDefinitions = state.customFieldDefinitions.filter(f => f.id !== action.payload);
      saveStateToStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncTasksFromDB.fulfilled, (state, action) => {
        state.tasks = action.payload;
      })
      .addCase(addTaskToDB.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTaskInDB.fulfilled, (state, action) => {
        const task = state.tasks.find((t) => t.id === action.payload.id);
        if (task) {
          Object.assign(task, action.payload.updates);
        }
      })
      .addCase(deleteTaskFromDB.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      });
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  setSearchFilter,
  setPriorityFilter,
  setStatusFilter,
  setCategoryFilter,
  setDueDateFilter,
  addCustomFieldDefinition,
  updateCustomFieldDefinition,
  deleteCustomFieldDefinition,
} = tasksSlice.actions;

export default tasksSlice.reducer;
