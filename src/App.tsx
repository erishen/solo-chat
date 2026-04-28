import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

const Chat = lazy(() => import("@/pages/Chat"));
const Settings = lazy(() => import("@/pages/Settings"));
const Invest = lazy(() => import("@/pages/Invest"));
const InvestChat = lazy(() => import("@/pages/InvestChat"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="text-zinc-400">Loading...</div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/chat" element={<InvestChat />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}
