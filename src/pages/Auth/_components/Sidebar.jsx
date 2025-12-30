import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Shield,
  Trophy,
  Play,
  Users,
  LogOut,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const AdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const { isMobile, setOpenMobile } = useSidebar();
  const menuItems = [
    { id: "analytics", label: "Analytics", icon: LayoutDashboard },
    { id: "teams", label: "Teams", icon: Shield },
    { id: "fixtures", label: "Fixtures", icon: Trophy },
    { id: "videos", label: "Videos", icon: Play },
    { id: "news", label: "News", icon: Newspaper },
  ];

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  return (
    <Sidebar className="border-r border-border/50 bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-xl shadow-xl">
      <SidebarContent className="flex flex-col justify-between h-full">
        {/* Top Section */}
        <div className="flex-1">
          <SidebarGroup>
            {/* Header/Logo */}
            <div className="px-6 py-6 border-b border-border/30">
              <SidebarGroupLabel className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                EliteLeague
              </SidebarGroupLabel>
              <p className="text-xs text-muted-foreground mt-1  px-2 font-medium">Admin Dashboard</p>
            </div>

            {/* Navigation Menu */}
            <SidebarGroupContent className="px-3 py-4 ">
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        setActiveTab(item.id);
                        if (isMobile) setOpenMobile(false);
                      }}
                      isActive={activeTab === item.id}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 group
                        ${
                          activeTab === item.id
                            ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary border-l-4 border-primary font-semibold shadow-sm"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border-l-4 border-transparent"
                        }`}
                    >
                      <item.icon
                        className={`h-5 w-5 transition-transform duration-300 ${
                          activeTab === item.id ? "text-primary scale-110" : "group-hover:scale-105"
                        }`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom Section: Theme & Logout */}
        <div className="border-t border-border/40 bg-gradient-to-b from-transparent to-muted/30 backdrop-blur-sm">
          {/* Theme Toggle Section */}
          <div className="px-4 py-4 border-b border-border/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Theme</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 font-semibold hover:scale-[1.02] transition-transform"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
