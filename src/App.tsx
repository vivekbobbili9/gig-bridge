import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Company from "./pages/Company.tsx";
import CompanyLogin from "./pages/CompanyLogin.tsx";
import CompanyFeedback from "./pages/CompanyFeedback.tsx";
import WorkerFlow from "./pages/WorkerFlow.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Worker Flow */}
          <Route path="/" element={<WorkerFlow />} />
          <Route path="/login/worker" element={<WorkerFlow />} />
          <Route path="/worker/*" element={<WorkerFlow />} />

          {/* Company Portal */}
          <Route path="/login/company" element={<CompanyLogin />} />
          <Route path="/company" element={<Company />} />
          <Route path="/company/feedback" element={<CompanyFeedback />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
