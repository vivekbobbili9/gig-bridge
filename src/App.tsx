import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Company from "./pages/Company.tsx";
import Worker from "./pages/Worker.tsx";
import CompanyLogin from "./pages/CompanyLogin.tsx";
import WorkerLogin from "./pages/WorkerLogin.tsx";
import WorkerKyc from "./pages/WorkerKyc.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login/company" element={<CompanyLogin />} />
          <Route path="/login/worker" element={<WorkerLogin />} />
          <Route path="/company" element={<Company />} />
          <Route path="/worker" element={<Worker />} />
          <Route path="/worker/kyc" element={<WorkerKyc />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
