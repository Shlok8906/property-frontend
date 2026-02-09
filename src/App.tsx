import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import MyEnquiries from "./pages/MyEnquiries";
import CityComingSoon from "./pages/CityComingSoon";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PropertyManagement } from "@/components/admin/PropertyManagement";
import ImageManager from "@/components/admin/ImageManager";
import { EnquiriesPage } from "@/components/admin/EnquiriesPage";
import { LeadsPage } from "@/components/admin/LeadsPage";
import { MessagesPage } from "@/components/admin/MessagesPage";
import { CSVImportPage } from "@/components/admin/CSVImportPage.new";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
export default function App() {
  return (
    <div style={{
      background: 'red',
      color: 'white',
      fontSize: '32px',
      padding: '30px',
      textAlign: 'center'
    }}>
      🚨 DEPLOY TEST — {new Date().toISOString()}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Public Routes - Accessible to all */}
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/city/:city" element={<CityComingSoon />} />

            {/* Protected Routes - Requires authentication */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-enquiries" element={<ProtectedRoute><MyEnquiries /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/properties" element={<ProtectedRoute requiredRole="admin"><PropertyManagement /></ProtectedRoute>} />
            <Route path="/admin/csv-import" element={<ProtectedRoute requiredRole="admin"><CSVImportPage /></ProtectedRoute>} />
            <Route path="/admin/images" element={<ProtectedRoute requiredRole="admin"><ImageManager /></ProtectedRoute>} />
            <Route path="/admin/enquiries" element={<ProtectedRoute requiredRole="admin"><EnquiriesPage /></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute requiredRole="admin"><LeadsPage /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute requiredRole="admin"><MessagesPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
