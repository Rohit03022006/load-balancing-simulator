import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatThroughput } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

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
              {formatThroughput(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ThroughputChart = ({ data, metrics }) => {
  const chartData = useMemo(() => {
    if (!data || !data.timeSeriesData || !data.timeSeriesData.throughput) {
      return [];
    }

    return data.timeSeriesData.throughput.map((item) => ({
      time: item.timestamp.toFixed(1),
      throughput: item.value,
      avgThroughput: metrics?.avgThroughput,
    }));
  }, [data, metrics]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Throughput Over Time
            </CardTitle>
            <CardDescription>
              Request processing rate during simulation
            </CardDescription>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Average: </span>
            <span className="font-mono font-medium">
              {formatThroughput(metrics?.avgThroughput || 0)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
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
                value: "Throughput (req/s)",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="throughput"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={2}
              name="Throughput"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
