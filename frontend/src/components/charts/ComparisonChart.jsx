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
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatLatency, formatThroughput } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export const ComparisonChart = ({ results, algorithms }) => {
  const latencyData = useMemo(() => {
    if (!Array.isArray(results) || !Array.isArray(algorithms)) return [];
    return results
      .filter((r) => r && !r.error)
      .map((result) => {
        const algo = algorithms.find((a) => a.id === result.algorithm);
        return {
          name: algo?.name || result.algorithm || "Unknown",
          avgLatency: (result.metrics?.avgLatency || 0) * 1000,
          p95Latency: (result.metrics?.p95Latency || 0) * 1000,
          p99Latency: (result.metrics?.p99Latency || 0) * 1000,
        };
      });
  }, [results, algorithms]);

  const throughputData = useMemo(() => {
    if (!Array.isArray(results) || !Array.isArray(algorithms)) return [];
    return results
      .filter((r) => r && !r.error)
      .map((result) => {
        const algo = algorithms.find((a) => a.id === result.algorithm);
        return {
          name: algo?.name || result.algorithm || "Unknown",
          avgThroughput: result.metrics?.avgThroughput || 0,
          peakThroughput: result.metrics?.peakThroughput || 0,
        };
      });
  }, [results, algorithms]);

  const utilizationData = useMemo(() => {
    if (!Array.isArray(results) || !Array.isArray(algorithms)) return [];
    return results
      .filter((r) => r && !r.error)
      .map((result) => {
        const algo = algorithms.find((a) => a.id === result.algorithm);
        const utilArray = result.metrics?.serverUtilization || [];
        const avgUtil =
          utilArray.length > 0
            ? utilArray.reduce((a, b) => a + b, 0) / utilArray.length
            : 0;
        return {
          name: algo?.name || result.algorithm || "Unknown",
          utilization: avgUtil,
          successRate: result.metrics?.successRate || 0,
        };
      });
  }, [results, algorithms]);

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader>
        <CardTitle>Algorithm Performance Comparison</CardTitle>
        <CardDescription>
          Side-by-side comparison of key metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="latency" className="space-y-4">
          <TabsList>
            <TabsTrigger value="latency">Latency</TabsTrigger>
            <TabsTrigger value="throughput">Throughput</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
          </TabsList>

          <TabsContent value="latency">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={latencyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                <Tooltip formatter={(value) => formatLatency(value)} />
                <Legend />
                <Bar
                  dataKey="avgLatency"
                  name="Average Latency"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="p95Latency"
                  name="P95 Latency"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="p99Latency"
                  name="P99 Latency"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="throughput">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={throughputData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  label={{
                    value: "Throughput (req/s)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => formatThroughput(value)} />
                <Legend />
                <Bar
                  dataKey="avgThroughput"
                  name="Average Throughput"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="peakThroughput"
                  name="Peak Throughput"
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="utilization">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={utilizationData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Utilization (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Success Rate (%)",
                    angle: 90,
                    position: "insideRight",
                  }}
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="utilization"
                  name="Avg Utilization"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="successRate"
                  name="Success Rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
