import { Edit, Link as LinkIcon, Add, FilterList, Today, Share } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { TaskPriority } from "@/store/types";

const mockAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop",
];

interface ProjectHeaderProps {
  onFilterChange: (search: string) => void;
  onPriorityChange: (priority: TaskPriority | "all") => void;
}

export const ProjectHeader = ({ onFilterChange, onPriorityChange }: ProjectHeaderProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Project Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-sm border-border">
            <FilterList className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2 text-sm border-border">
            <Today className="w-4 h-4" />
            Today
          </Button>
        </div>

        <Button variant="outline" className="gap-2 text-sm border-border">
          <Share className="w-4 h-4" />
          Share
        </Button>
      </div>
    </div>
  );
};
