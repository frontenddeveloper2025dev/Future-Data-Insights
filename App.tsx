import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import ForecastPage from "@/pages/ForecastPage";
import PerformancePage from "@/pages/PerformancePage";
import { AdvancedChartsPage } from "@/pages/AdvancedChartsPage";
import TemplatesPage from "@/pages/TemplatesPage";
import MonitoringPage from "@/pages/MonitoringPage";
import ExportPage from "@/pages/ExportPage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/forecast" element={
            <ProtectedRoute>
              <ForecastPage />
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <PerformancePage />
            </ProtectedRoute>
          } />
          <Route path="/charts" element={
            <ProtectedRoute>
              <AdvancedChartsPage />
            </ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>
          } />
          <Route path="/monitoring" element={
            <ProtectedRoute>
              <MonitoringPage />
            </ProtectedRoute>
          } />
          <Route path="/export" element={
            <ProtectedRoute>
              <ExportPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
