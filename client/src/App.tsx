import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Customers from "./pages/Customers";
import Personnel from "./pages/Personnel";
import Chat from "./pages/Chat";
import Maps from "./pages/Maps";
import ProductLookup from "./pages/ProductLookup";
import Settings from "./pages/Settings";
import JobDetail from "@/pages/JobDetail";
import FlightBoard from "@/pages/FlightBoard";
import Calendar from "@/pages/Calendar";
import Sites from "./pages/Sites";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/flight-board" component={FlightBoard} />
      <Route path="/calendar" component={Calendar} />
        <Route path="/sites" component={Sites} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/customers" component={Customers} />
        <Route path="/personnel" component={Personnel} />
        <Route path="/chat" component={Chat} />
        <Route path="/maps" component={Maps} />
        <Route path="/product-lookup" component={ProductLookup} />
        <Route path="/settings" component={Settings} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
