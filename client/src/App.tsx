import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";

import Dashboard from "@/pages/Dashboard";
import Market from "@/pages/Market";
import TimeMachine from "@/pages/TimeMachine";
import Predictions from "@/pages/Predictions";
import Favorites from "@/pages/Favorites";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-300">
        <div className="flex-1 container mx-auto p-4 md:p-8 pt-20 lg:pt-8 max-w-7xl">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/market" component={Market} />
            <Route path="/timemachine" component={TimeMachine} />
            <Route path="/predictions" component={Predictions} />
            <Route path="/favorites" component={Favorites} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
