import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  unit?: string;
  change?: number;
  sparklineData?: { name: string; value: number }[];
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "warning" | "success" | "danger";
}

export function SummaryCard({
  title,
  value,
  unit,
  change,
  sparklineData,
  icon,
  trend = "neutral",
  variant = "default"
}: SummaryCardProps) {
  const sparklinePoints = (() => {
    if (!sparklineData || sparklineData.length === 0) return "";

    const values = sparklineData.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return sparklineData
      .map((point, index) => {
        const x = sparklineData.length === 1 ? 40 : (index / (sparklineData.length - 1)) * 78 + 1;
        const y = 30 - ((point.value - min) / range) * 28;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  })();

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-risk" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-safe" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "border-warning/50 bg-warning/5";
      case "success":
        return "border-safe/50 bg-safe/5";
      case "danger":
        return "border-risk/50 bg-risk/5";
      default:
        return "";
    }
  };

  return (
    <Card className={`${getVariantStyles()} transition-all hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {value}
              {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
            </div>
            {change !== undefined && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {getTrendIcon()}
                <span className="ml-1">
                  {change > 0 ? "+" : ""}{change}% from last month
                </span>
              </div>
            )}
          </div>
          {sparklineData && (
            <div className="h-8 w-20 min-w-20" aria-hidden="true">
              <svg viewBox="0 0 80 32" className="h-full w-full overflow-visible">
                <polyline
                  points={sparklinePoints}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
