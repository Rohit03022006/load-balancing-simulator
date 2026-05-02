import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const StatisticsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  color = "default",
  className,
}) => {
  const colors = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
    info: "text-blue-600",
    purple: "text-purple-600",
  };

  const bgColors = {
    default: "bg-muted",
    primary: "bg-primary/10",
    success: "bg-green-100 dark:bg-green-950",
    warning: "bg-yellow-100 dark:bg-yellow-950",
    danger: "bg-red-100 dark:bg-red-950",
    info: "bg-blue-100 dark:bg-blue-950",
    purple: "bg-purple-100 dark:bg-purple-950",
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("rounded-lg p-2", bgColors[color])}>
            <Icon className={cn("h-4 w-4", colors[color])} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span
              className={trend === "up" ? "text-green-600" : "text-red-600"}
            >
              {trend === "up" ? "↑" : "↓"} {trendValue}
            </span>
            <span className="text-muted-foreground">vs previous</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
