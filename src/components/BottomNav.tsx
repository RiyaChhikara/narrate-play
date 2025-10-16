import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Settings } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/stories", icon: BookOpen, label: "Stories" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.1)] z-50 border-t border-border/50">
      <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all duration-300 ${
                active ? "bg-hero-orange/10 text-hero-orange" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className={`transition-all duration-300 ${active ? "w-6 h-6" : "w-5 h-5"}`} />
              <span className={`font-dm-sans text-xs transition-all duration-300 ${active ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
