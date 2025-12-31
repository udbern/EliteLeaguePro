import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trophy, Calendar, BarChart3, ChevronDown, Check } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./logo";
import NewWebsiteBanner from "./NewWebsiteBanner";
import { useSeason } from "@/hooks/contexts/SeasonContext";

const Header = () => {
  const location = useLocation();
  const { seasons, selectedSeason, setSelectedSeason } = useSeason();

  const isActive = (path: string) => location.pathname === path;

  const sortedSeasons = [...seasons].sort((a, b) => {
    const yearA = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
    const yearB = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
    return yearA - yearB;
  });

  const NavItems = ({ onItemClick = () => {} }) => (
    <>
      <Link to="/" onClick={onItemClick}>
        <Button
          variant={isActive("/") ? "default" : "ghost"}
          className={`justify-start text-xs sm:text-sm md:text-base ${
            isActive("/")
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <Trophy className="w-4 h-4" /> Overview
        </Button>
      </Link>
      <Link to="/standings" onClick={onItemClick}>
        <Button
          variant={isActive("/standings") ? "default" : "ghost"}
          className={`justify-start text-xs sm:text-sm md:text-base ${
            isActive("/standings")
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Standings
        </Button>
      </Link>
      <Link to="/fixtures" onClick={onItemClick}>
        <Button
          variant={isActive("/fixtures") ? "default" : "ghost"}
          className={`justify-start text-xs sm:text-sm md:text-base ${
            isActive("/fixtures")
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <Calendar className="w-4 h-4" /> Fixtures
        </Button>
      </Link>
    </>
  );

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 mb-10">
      <div className="container mx-auto px-2 py-1 sm:py-1 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center justify-between text-xs sm:text-sm min-w-[90px] sm:min-w-[120px] h-8 sm:h-9"
                disabled={sortedSeasons.length === 0}
              >
                <span>{selectedSeason?.name || "Select season"}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[140px] sm:w-auto">
              {sortedSeasons.map((season) => (
                <DropdownMenuItem
                  key={season._id}
                  onClick={() => {
                    console.log("🎯 SELECTING SEASON:", season);
                    setSelectedSeason(season);
                    // Reload the page to fetch fresh data for the new season
                    window.location.reload();
                  }}
                  className={
                    selectedSeason?._id === season._id
                      ? "font-medium text-primary"
                      : ""
                  }
                >
                  <span className="flex items-center gap-2">
                    {season.name}
                    {/* Blinking dot for active season */}
                    {season.isActive && (
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex container mb-2 mx-auto items-center sm:justify-start space-x-1 md:space-x-6 overflow-x-auto scrollbar-hide mt-2 sm:mt-2 p-2 md:pb-0">
        <NavItems />
      </nav>
      <NewWebsiteBanner />
    </header>
  );
};

export default Header;
