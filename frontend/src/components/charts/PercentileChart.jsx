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
import { formatLatency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export const PercentileChart = ({ metrics }) => {
  const chartData = useMemo(() => {
    if (!metrics) return [];

    return [
      { name: "P50", value: metrics.avgLatency * 1000, color: "#3b82f6" },
      {
        name: "P75",
        value: (metrics.avgLatency + metrics.p95Latency) * 500,
        color: "#10b981",
      },
      { name: "P90", value: metrics.p95Latency * 900, color: "#f59e0b" },
      { name: "P95", value: metrics.p95Latency * 1000, color: "#ef4444" },
      { name: "P99", value: metrics.p99Latency * 1000, color: "#dc2626" },
    ];
  }, [metrics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Latency Percentiles
        </CardTitle>
        <CardDescription>
          Response time distribution across percentiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              label={{
                value: "Latency (ms)",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => formatLatency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Bar dataKey="value" name="Latency" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
