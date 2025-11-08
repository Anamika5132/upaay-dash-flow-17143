import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Warning } from "@mui/icons-material";
import { Task } from "@/store/types";
import { isBefore, isToday, format } from "date-fns";

interface DueDateBannerProps {
  tasks: Task[];
}

export const DueDateBanner = ({ tasks }: DueDateBannerProps) => {
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate))
  );

  const dueTodayTasks = tasks.filter(
    (task) => task.dueDate && isToday(new Date(task.dueDate))
  );

  if (overdueTasks.length === 0 && dueTodayTasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {overdueTasks.length > 0 && (
        <Alert className="bg-destructive/10 border-destructive/20">
          <Warning className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">
            {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-destructive/80">
            {overdueTasks.slice(0, 3).map((task, i) => (
              <div key={task.id}>
                • {task.title} (Due: {format(new Date(task.dueDate!), "MMM dd, yyyy")})
              </div>
            ))}
            {overdueTasks.length > 3 && (
              <div className="mt-1 text-sm">and {overdueTasks.length - 3} more...</div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {dueTodayTasks.length > 0 && (
        <Alert className="bg-warning/10 border-warning/20">
          <Warning className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning font-semibold">
            {dueTodayTasks.length} Task{dueTodayTasks.length > 1 ? 's' : ''} Due Today
          </AlertTitle>
          <AlertDescription className="text-warning/80">
            {dueTodayTasks.slice(0, 3).map((task, i) => (
              <div key={task.id}>
                • {task.title}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
