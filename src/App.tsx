import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import TopicSelection from "./pages/TopicSelection";
import Interview from "./pages/Interview";
import Results from "./pages/Results";
import AdminDashboard from "./pages/AdminDashboard";
<<<<<<< HEAD
import AdminLogin from "./pages/AdminLogin";
=======
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/topic-selection" element={<TopicSelection />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/results" element={<Results />} />
<<<<<<< HEAD
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
=======
          <Route path="/admin" element={<AdminDashboard />} />
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
