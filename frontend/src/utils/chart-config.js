import { CHART_COLORS } from "./constants";

export const chartConfig = {
  latency: {
    stroke: CHART_COLORS.primary,
    fill: CHART_COLORS.primary,
    fillOpacity: 0.1,
    yAxisLabel: "Latency (ms)",
    xAxisLabel: "Time (seconds)",
  },

  throughput: {
    stroke: CHART_COLORS.success,
    fill: CHART_COLORS.success,
    fillOpacity: 0.2,
    yAxisLabel: "Throughput (req/s)",
    xAxisLabel: "Time (seconds)",
  },

  queueLength: {
    stroke: CHART_COLORS.purple,
    fill: CHART_COLORS.purple,
    fillOpacity: 0.2,
    yAxisLabel: "Queue Length",
    xAxisLabel: "Time (seconds)",
  },

  utilization: {
    colors: [
      CHART_COLORS.primary,
      CHART_COLORS.success,
      CHART_COLORS.warning,
      CHART_COLORS.danger,
      CHART_COLORS.purple,
      CHART_COLORS.pink,
      CHART_COLORS.cyan,
      CHART_COLORS.orange,
    ],
    yAxisLabel: "Utilization (%)",
    xAxisLabel: "Server ID",
  },
};

export const getChartTheme = (theme = "light") => {
  const themes = {
    light: {
      backgroundColor: "#ffffff",
      textColor: "#1a1a1a",
      gridColor: "#e5e5e5",
      tooltipBackground: "#ffffff",
      tooltipBorder: "#e5e5e5",
    },
    dark: {
      backgroundColor: "#1a1a1a",
      textColor: "#ffffff",
      gridColor: "#333333",
      tooltipBackground: "#2a2a2a",
      tooltipBorder: "#404040",
    },
  };

  return themes[theme] || themes.light;
};

export const formatChartTick = (value, type) => {
  switch (type) {
    case "latency":
      return value >= 1000
        ? `${(value / 1000).toFixed(1)}s`
        : `${value.toFixed(0)}ms`;
    case "throughput":
      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0);
    case "percentage":
      return `${value.toFixed(0)}%`;
    default:
      return value.toString();
  }
};
