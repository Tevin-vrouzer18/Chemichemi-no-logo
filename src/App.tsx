import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

// Layout components
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

// Pages
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Customers from "./pages/Customers";
import Services from "./pages/Services";
import ServiceRecords from "./pages/ServiceRecords";
import Expenses from "./pages/Expenses";
import Inventory from "./pages/Inventory";
import Employees from "./pages/Employees";
import Growth from "./pages/Growth";
import Feedback from "./pages/Feedback";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Initialize PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth route */}
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
            
            {/* Landing page */}
            <Route path="/index" element={!user ? <Index /> : <Navigate to="/dashboard" replace />} />
            
            {/* Protected app routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full bg-background">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <AppHeader />
                      <main className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/appointments" element={<Appointments />} />
                          <Route path="/customers" element={<Customers />} />
                          <Route path="/services" element={<Services />} />
                          <Route path="/service-records" element={<ServiceRecords />} />
                          <Route path="/expenses" element={<Expenses />} />
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/employees" element={<Employees />} />
                          <Route path="/growth" element={<Growth />} />
                          <Route path="/feedback" element={<Feedback />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;