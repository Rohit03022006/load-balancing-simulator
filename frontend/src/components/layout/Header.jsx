import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  User,
  LogOut,
  Activity,
  History,
  Play,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";

// Persist theme across reloads
const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const PAGE_TITLES = {
  "/": "Home",
  "/simulate": "Simulation Studio",
  "/compare": "Algorithm Comparison",
  "/history": "Simulation History",
  "/analytics": "System Analytics",
};

export const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);
  const { currentSimulation } = useSimulationStore();

  // Apply theme on mount & change
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // Derive page title — handle dynamic routes like /results/:id
  const pageTitle = (() => {
    if (location.pathname.startsWith("/results")) return "Simulation Results";
    return PAGE_TITLES[location.pathname] ?? "Load Balancing Simulator";
  })();

  // Breadcrumb segments (skip empty and 'results/:id')
  const crumbs = location.pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1),
      path: `/${seg}`,
    }));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-3 px-4">
        {/* Sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:block font-bold tracking-tight leading-none">
            LB Simulator
          </span>
        </Link>

        {/* Divider + breadcrumb */}
        {crumbs.length > 0 && (
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <ChevronRight className="h-4 w-4 opacity-40" />
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Running simulation badge */}
        {currentSimulation && (
          <Badge
            variant="outline"
            className="gap-1 border-primary/40 text-primary hidden sm:flex"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Running
          </Badge>
        )}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
};
