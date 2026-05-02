import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import LandingPage from "@/pages/LandingPage";
import SimulationPage from "@/pages/SimulationPage";
import ResultsPage from "@/pages/ResultsPage";
import ComparisonPage from "@/pages/ComparisonPage";
import HistoryPage from "@/pages/HistoryPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import DocsPage from "@/pages/DocsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<MainLayout />}>
        <Route path="simulate" element={<SimulationPage />} />
        <Route path="results/:id" element={<ResultsPage />} />
        <Route path="compare" element={<ComparisonPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="docs" element={<DocsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
