import { Edit, Link as LinkIcon, Add, Share } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { TaskPriority, TaskStatus, Task, TasksState } from "@/store/types";
import { useMemo } from "react";

const mockAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop",
];

interface ProjectHeaderProps {
  tasks: Task[];
  filter: TasksState["filter"];
  onPriorityChange: (priority: TaskPriority | "all") => void;
  onStatusChange: (status: TaskStatus | "all") => void;
  onCategoryChange: (category: string) => void;
  onDueDateChange: (dueDate: string | null) => void;
}

export const ProjectHeader = ({ 
  tasks, 
  filter, 
  onPriorityChange, 
  onStatusChange,
  onCategoryChange,
  onDueDateChange
}: ProjectHeaderProps) => {
  // Get unique categories from tasks
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    tasks.forEach(task => {
      if (task.customFields?.category) {
        categorySet.add(task.customFields.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [tasks]);

  const hasActiveFilters = 
    filter.priority !== "all" || 
    filter.status !== "all" || 
    filter.category !== "" || 
    filter.dueDate !== null;

  const clearAllFilters = () => {
    onPriorityChange("all");
    onStatusChange("all");
    onCategoryChange("");
    onDueDateChange(null);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Project Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo - Using a simple SVG logo placeholder (Venn diagram style) */}
          <div className="w-10 h-10 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="12" r="8" fill="#3B82F6" opacity="0.8"/>
              <circle cx="12" cy="24" r="6" fill="#8B5CF6" opacity="0.7"/>
              <circle cx="28" cy="24" r="6" fill="#A78BFA" opacity="0.7"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Mobile App</h1>
          <button className="p-1.5 hover:bg-accent rounded transition-colors">
            <Edit className="w-5 h-5 text-primary" />
          </button>
          <button className="p-1.5 hover:bg-accent rounded transition-colors">
            <LinkIcon className="w-5 h-5 text-primary" />
          </button>
        </div>

        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 px-6">
          <Add className="w-5 h-5" />
          Invite
        </Button>
      </div>

      {/* Avatars Row */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {mockAvatars.map((avatar, i) => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-sm font-medium">
            +2
          </div>
        </div>
      </div>

      {/* Filter and Actions Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Filter (Priority) */}
          <Select value={filter.priority} onValueChange={(value) => onPriorityChange(value as TaskPriority | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filter.status} onValueChange={(value) => onStatusChange(value as TaskStatus | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <Select value={filter.category} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Due Date Filter */}
          <Select 
            value={filter.dueDate || "all"} 
            onValueChange={(value) => onDueDateChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Due Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>

        <Button variant="outline" className="gap-2 text-sm border-border">
          <Share className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  );
};
