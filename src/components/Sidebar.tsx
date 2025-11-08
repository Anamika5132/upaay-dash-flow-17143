import { Home, Message, Assignment, People, Settings, Lightbulb } from "@mui/icons-material";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { icon: Home, label: "Home", active: false },
  { icon: Message, label: "Messages", active: false },
  { icon: Assignment, label: "Tasks", active: true },
  { icon: People, label: "Members", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const projects = [
  { name: "Mobile App", color: "#8E59FF", active: true },
  { name: "Website Redesign", color: "#FF6B6B", active: false },
  { name: "Design System", color: "#4CAF50", active: false },
  { name: "Wireframes", color: "#FFA726", active: false },
];

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <aside className={cn("w-64 bg-sidebar-bg border-r border-border h-screen fixed left-0 top-0 flex flex-col", className)}>
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <span className="text-lg font-bold text-sidebar-text">Project M.</span>
      </div>

      {/* Menu Items */}
      <nav className="px-4 py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm",
                  item.active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-text/70 hover:bg-accent"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* My Projects Section */}
      <div className="px-4 py-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Projects</span>
          <button className="text-muted-foreground hover:text-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.33333V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li key={project.name}>
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm",
                  project.active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-text/70 hover:bg-accent"
                )}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="flex-1 text-left">{project.name}</span>
                {project.active && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 4V8L10.6667 9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Thoughts Time Section */}
      <div className="mt-auto px-4 pb-6">
        <div className="bg-yellow-50 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Lightbulb className="w-12 h-12 text-yellow-400/30" />
          </div>
          <h3 className="font-semibold text-sm text-gray-800 mb-2">Thoughts Time</h3>
          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            We don't have any notice for you, till then you can share your thoughts with your peers.
          </p>
          <input
            type="text"
            placeholder="Write a message..."
            className="w-full px-3 py-2 bg-white rounded-lg text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </aside>
  );
};
