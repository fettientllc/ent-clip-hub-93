
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Submit from "./pages/Submit";
import UserInfo from "./pages/UserInfo";
import ThankYou from "./pages/ThankYou";
import ThankYouConfirmation from "./pages/ThankYouConfirmation";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/user-info" element={<UserInfo />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/thank-you-confirmation" element={<ThankYouConfirmation />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/submissions" element={<AdminSubmissions />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
