import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPercentage } from "@/lib/utils";
import { Server } from "lucide-react";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">Server {data.serverId}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Utilization:</span>
            <span className="font-mono font-medium">
              {formatPercentage(data.utilization)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Queue Length:</span>
            <span className="font-mono font-medium">{data.queueLength}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active Connections:</span>
            <span className="font-mono font-medium">
              {data.activeConnections}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Processed:</span>
            <span className="font-mono font-medium">{data.processed}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ServerLoadChart = ({ data, metrics }) => {
  const chartData = useMemo(() => {
    if (!metrics || !metrics.serverUtilization) return [];

    return metrics.serverUtilization.map((utilization, index) => ({
      serverId: index,
      utilization,
      queueLength: 0, // This would come from time series data
      activeConnections: 0,
      processed: 0,
    }));
  }, [metrics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Server Load Distribution
        </CardTitle>
        <CardDescription>
          Current utilization across all servers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="serverId"
              label={{
                value: "Server ID",
                position: "insideBottom",
                offset: -5,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{
                value: "Utilization (%)",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="utilization" name="Utilization" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.utilization > 80
                      ? "#ef4444"
                      : entry.utilization > 60
                        ? "#f59e0b"
                        : "#10b981"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Server Status Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((server) => (
            <div
              key={server.serverId}
              className="flex items-center justify-between rounded-md border p-2 text-sm"
            >
              <span className="font-medium">Server {server.serverId}</span>
              <span
                className={`font-mono ${
                  server.utilization > 80
                    ? "text-red-500"
                    : server.utilization > 60
                      ? "text-yellow-500"
                      : "text-green-500"
                }`}
              >
                {formatPercentage(server.utilization)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
