import { Search, CalendarToday, Message, Notifications } from "@mui/icons-material";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  className?: string;
}

export const Navbar = ({ className }: NavbarProps) => {
  const { user } = useAuth();
  
  return (
    <nav className={`bg-card border-b border-border px-6 py-3 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for anything..."
            className="pl-10 bg-background border-border"
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 mr-20">
          {/* Calendar Icon */}
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <CalendarToday className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Messages Icon */}
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Message className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Notifications Icon */}
          <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
            <Notifications className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
          </button>

          {/* Profile Section */}
          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border">
            <div>
              <p className="text-sm font-medium text-foreground text-right">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground text-right">
                {user?.email || ''}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center text-white font-semibold">
              {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
