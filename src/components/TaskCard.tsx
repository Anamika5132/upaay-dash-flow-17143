import { Task } from "@/store/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MoreVert, ChatBubbleOutline, AttachFile } from "@mui/icons-material";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

// Mock avatars for now
const mockAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
];

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  
  const isDueSoon = task.dueDate && isAfter(new Date(task.dueDate), new Date()) && isBefore(new Date(task.dueDate), addDays(new Date(), 3));
  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date());

  // Random comment and file counts for visual purposes
  const commentCount = Math.floor(Math.random() * 15) + 1;
  const fileCount = Math.floor(Math.random() * 3);

  return (
    <Card 
      className="group cursor-pointer transition-all hover:shadow-lg border-border bg-card"
      onClick={() => onEdit(task)}
    >
      <div className="p-4 space-y-3">
        {/* Priority Badge and Menu */}
        <div className="flex items-start justify-between gap-2">
          <Badge 
            variant="outline"
            className={cn(
              "text-xs font-medium px-2 py-0.5",
              task.priority === "high" && "bg-red-50 text-red-600 border-red-200",
              task.priority === "medium" && "bg-yellow-50 text-yellow-700 border-yellow-200",
              task.priority === "low" && "bg-orange-50 text-orange-600 border-orange-200"
            )}
          >
            {task.priority}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 -mt-1 text-muted-foreground hover:text-foreground"
              >
                <MoreVert className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}>
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="text-destructive"
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-foreground line-clamp-1">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Bottom Section: Avatars, Comments, Files */}
        <div className="flex items-center justify-between pt-2">
          {/* Avatars */}
          <div className="flex -space-x-2">
            {mockAvatars.map((avatar, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Comments and Files */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ChatBubbleOutline className="w-3.5 h-3.5" />
              <span>{commentCount} comments</span>
            </div>
            <div className="flex items-center gap-1">
              <AttachFile className="w-3.5 h-3.5" />
              <span>{fileCount} files</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
