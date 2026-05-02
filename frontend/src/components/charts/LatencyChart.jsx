import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatLatency } from "@/lib/utils";
import { TrendingDown } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">Time: {label}s</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-medium">
              {formatLatency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const LatencyChart = ({ data, metrics }) => {
  const chartData = useMemo(() => {
    if (!data || !data.timeSeriesData) return [];

    // Process time series data for latency visualization
    const latencyData = [];
    const serverStates = data.timeSeriesData.serverStates || [];

    serverStates.forEach((state) => {
      const avgLatency =
        state.servers.reduce((sum, s) => {
          // Calculate average latency from server metrics
          return sum + (s.avgResponseTime || 0);
        }, 0) / state.servers.length;

      latencyData.push({
        time: state.timestamp.toFixed(1),
        avgLatency: avgLatency * 1000, // Convert to ms
        p95Latency: metrics?.p95Latency * 1000,
        p99Latency: metrics?.p99Latency * 1000,
      });
    });

    return latencyData;
  }, [data, metrics]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Latency Over Time
            </CardTitle>
            <CardDescription>
              Response time distribution during simulation
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">P95: </span>
              <span className="font-mono font-medium">
                {formatLatency((metrics?.p95Latency || 0) * 1000)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">P99: </span>
              <span className="font-mono font-medium">
                {formatLatency((metrics?.p99Latency || 0) * 1000)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              label={{
                value: "Time (seconds)",
                position: "insideBottom",
                offset: -5,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{
                value: "Latency (ms)",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgLatency"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Average Latency"
            />
            <ReferenceLine
              y={metrics?.p95Latency * 1000}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: "P95",
                position: "right",
                fill: "#f59e0b",
                fontSize: 12,
              }}
            />
            <ReferenceLine
              y={metrics?.p99Latency * 1000}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: "P99",
                position: "right",
                fill: "#ef4444",
                fontSize: 12,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
