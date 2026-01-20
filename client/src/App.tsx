import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Customers from "./pages/Customers";
import Personnel from "./pages/Personnel";
import Chat from "./pages/Chat";
import Maps from "./pages/Maps";
import ProductLookup from "./pages/ProductLookup";
import Settings from "./pages/Settings";

import SharedJob from "./pages/SharedJob";
import FlightBoard from "@/pages/FlightBoard";
import JobDetail from "@/pages/JobDetail";
import Calendar from "@/pages/Calendar";
import Equipment from "@/pages/Equipment";
import EquipmentDashboard from "@/pages/EquipmentDashboard";
import Sites from "./pages/Sites";
import Products from "./pages/Products";
import ServicePlans from "./pages/ServicePlans";
import EmailTest from "./pages/EmailTest";
import CustomerPortal from "./pages/CustomerPortal";
import UserManagement from "./pages/UserManagement";
import AuditLog from "./pages/AuditLog";
import BulkJobImport from "./pages/BulkJobImport";
import LandingPage from "./pages/LandingPage";
import OrganizationSetup from "./pages/OrganizationSetup";
import PlanSelection from "./pages/PlanSelection";
import TeamManagement from "./pages/TeamManagement";
import AcceptInvitation from "./pages/AcceptInvitation";
import Weather from "./pages/Weather";

import AISettings from "./pages/AISettings";
import DriftCalculator from "./pages/DriftCalculator";
import PreFlightChecklist from "./pages/PreFlightChecklist";

// Check if we're on the app subdomain
const isAppSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname.startsWith('app.') || hostname.includes('app-');
};

function Router() {
  // If on app subdomain and at root, redirect to dashboard
  const shouldRedirectToDashboard = isAppSubdomain() && window.location.pathname === '/';
  
  return (
    <Switch>
      {/* Redirect app subdomain root to dashboard */}
      {shouldRedirectToDashboard && <Redirect to="/dashboard" />}
      
      {/* Public marketing page - only on main domain */}
      <Route path="/">
        {() => isAppSubdomain() ? <Redirect to="/dashboard" /> : <LandingPage />}
      </Route>
      
      {/* Public shared job view - no auth required */}
      <Route path="/share/:token">
        {() => <SharedJob />}
      </Route>
      
      {/* Signup flow - protected routes */}
      <Route path="/signup/organization">
        {() => <OrganizationSetup />}
      </Route>
      
      <Route path="/signup/plans">
        {() => <PlanSelection />}
      </Route>
      
      {/* Team Invitation */}
      <Route path="/invite/:token">
        {() => <AcceptInvitation />}
      </Route>
      
      {/* Protected app routes - all wrapped in DashboardLayout */}
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/jobs/:id">
        {() => (
          <DashboardLayout>
            <JobDetail />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/weather">
        {() => (
          <DashboardLayout>
            <Weather />
          </DashboardLayout>
        )}
      </Route>

      <Route path="/tools/drift-calculator">
        {() => (
          <DashboardLayout>
            <DriftCalculator />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/flight-board">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="view_flight_board">
              <FlightBoard />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/calendar">
        {() => (
          <DashboardLayout>
            <Calendar />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/equipment">
        {() => (
          <DashboardLayout>
            <Equipment />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/equipment-dashboard">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="view_equipment_analytics">
              <EquipmentDashboard />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      
  
      <Route path="/products">
        {() => (
          <DashboardLayout>
            <Products />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/service-plans">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="view_service_plans">
              <ServicePlans />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/jobs">
        {() => (
          <DashboardLayout>
            <Jobs />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/customers">
        {() => (
          <DashboardLayout>
            <Customers />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/personnel">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="view_personnel">
              <Personnel />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/chat">
        {() => (
          <DashboardLayout>
            <Chat />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/maps">
        {() => (
          <DashboardLayout>
            <Maps />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/product-lookup">
        {() => (
          <DashboardLayout>
            <ProductLookup />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/settings">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="view_settings">
              <Settings />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>

      <Route path="/settings/ai">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="view_settings">
              <AISettings />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/team">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="manage_team">
              <TeamManagement />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      

      
      <Route path="/email-test">
        {() => (
          <DashboardLayout>
            <EmailTest />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/customer-portal">
        {() => (
          <DashboardLayout>
            <CustomerPortal />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/user-management">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="view_user_management">
              <UserManagement />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/audit-log">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="view_settings">
              <AuditLog />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/bulk-import">
        {() => (
          <DashboardLayout>
            <ProtectedRoute requiredPermission="create_jobs">
              <BulkJobImport />
            </ProtectedRoute>
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
