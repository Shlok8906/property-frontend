import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Profile = lazy(() => import("./pages/Profile"));
const MyEnquiries = lazy(() => import("./pages/MyEnquiries"));
const CityComingSoon = lazy(() => import("./pages/CityComingSoon"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const PropertyManagement = lazy(() => import("@/components/admin/PropertyManagement").then((module) => ({ default: module.PropertyManagement })));
const AdminAddProperty = lazy(() => import("@/pages/admin/AddProperty"));
const ImageManager = lazy(() => import("@/components/admin/ImageManager"));
const EnquiriesPage = lazy(() => import("@/components/admin/EnquiriesPage").then((module) => ({ default: module.EnquiriesPage })));
const LeadsPage = lazy(() => import("@/components/admin/LeadsPage").then((module) => ({ default: module.LeadsPage })));
const MessagesPage = lazy(() => import("@/components/admin/MessagesPage").then((module) => ({ default: module.MessagesPage })));
const CSVImportPage = lazy(() => import("@/components/admin/CSVImportPage.new").then((module) => ({ default: module.CSVImportPage })));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-background">
    <div className="container py-10 space-y-3">
      <div className="h-8 w-56 bg-muted rounded-xl animate-pulse" />
      <div className="h-5 w-80 bg-muted rounded-xl animate-pulse" />
      <div className="h-5 w-64 bg-muted rounded-xl animate-pulse" />
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/city/:city" element={<CityComingSoon />} />
                <Route path="/sell-rent" element={<Contact />} />

                {/* Protected User Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-enquiries"
                  element={
                    <ProtectedRoute>
                      <MyEnquiries />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/properties"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <PropertyManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/add-property"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminAddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/add-property/:id"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminAddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/csv-import"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CSVImportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/images"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ImageManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/enquiries"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <EnquiriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/leads"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <LeadsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/messages"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
