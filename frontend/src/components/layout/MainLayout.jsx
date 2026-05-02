import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useState, useEffect } from "react";
import { simulationService } from "@/services/simulationService";
import { useSimulationStore } from "@/store/simulationStore";

export const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { setAlgorithms, setHistory } = useSimulationStore();
  const { history } = useSimulationStore();

  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch algorithms
        const algoData = await simulationService.getAlgorithms();
        setAlgorithms(algoData.algorithms || []);

        // Fetch history for the sidebar badge
        const histData = await simulationService.listSimulations({
          limit: 100,
        });
        setHistory(histData.simulations || []);
      } catch (error) {
        console.error("Failed to initialize application data:", error);
      }
    };
    initData();
  }, [setAlgorithms, setHistory]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main
          style={{ marginLeft: sidebarCollapsed ? "60px" : "240px" }}
          className="flex-1 transition-[margin] duration-300 ease-in-out min-w-0 flex flex-col min-h-[calc(100vh-4rem)]"
        >
          <div className="flex-1 p-6">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
