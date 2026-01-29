import { Link, useLocation } from "wouter";
import { LayoutDashboard, TrendingUp, History, BrainCircuit, Star, LogOut, LogIn, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Market", icon: TrendingUp, href: "/market" },
  { label: "Time Machine", icon: History, href: "/timemachine" },
  { label: "AI Predictions", icon: BrainCircuit, href: "/predictions" },
  { label: "Favorites", icon: Star, href: "/favorites" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent animate-pulse" />
          <h1 className="text-xl font-bold font-display tracking-wider">
            CRYPTO<span className="text-primary">NITE</span>
          </h1>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,240,255,0.1)]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        {isAuthenticated ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-black flex items-center justify-center border border-white/10">
                <span className="text-lg font-bold text-primary font-display">
                  {user?.firstName?.[0] || user?.username?.[0] || "U"}
                </span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{user?.firstName || "User"}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.username || "Crypto Trader"}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <h4 className="text-sm font-semibold mb-2 text-primary">Unlock Full Access</h4>
            <p className="text-xs text-muted-foreground mb-4">Sign in to save favorites and use the Time Machine.</p>
            <a href="/api/login" className="block">
              <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <LogIn className="w-4 h-4" />
                Login via Replit
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button size="icon" variant="outline" className="glass-card" onClick={toggleMobile}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Drawer */}
      <div className={cn(
        "fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden transition-all duration-300 ease-in-out",
        mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 border-r border-white/5 bg-black/20 backdrop-blur-sm z-30">
        <NavContent />
      </aside>
    </>
  );
}
