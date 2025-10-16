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
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-border">
      <div className="flex items-center justify-around py-4 px-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                active ? "text-hero-orange" : "text-muted-foreground"
              }`}
            >
              <div className={`relative ${active ? "border-t-4 border-hero-orange pt-1" : ""}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-dm-sans text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
