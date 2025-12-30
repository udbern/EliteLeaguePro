import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    if (theme === "dark") return <Moon className="h-4 w-4 sm:h-5 sm:w-5" />;
    if (theme === "light") return <Sun className="h-4 w-4 sm:h-5 sm:w-5" />;
    return <Laptop className="h-4 w-4 sm:h-5 sm:w-5" />;
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-md border-border/60 hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-40 rounded-lg border bg-popover p-1 shadow-md"
      >
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className={`flex items-center gap-3 cursor-pointer rounded-md px-3 py-2 transition-colors ${
            theme === "light" 
              ? "bg-primary/10 text-primary font-medium" 
              : "hover:bg-muted"
          }`}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={`flex items-center gap-3 cursor-pointer rounded-md px-3 py-2 transition-colors ${
            theme === "dark" 
              ? "bg-primary/10 text-primary font-medium" 
              : "hover:bg-muted"
          }`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={`flex items-center gap-3 cursor-pointer rounded-md px-3 py-2 transition-colors ${
            theme === "system" 
              ? "bg-primary/10 text-primary font-medium" 
              : "hover:bg-muted"
          }`}
        >
          <Laptop className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
