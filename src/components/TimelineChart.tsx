import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineData {
  year: string;
  emissions: number;
  floodRisk: number;
  displacement: number;
  foodInsecurity: number;
  projection?: boolean;
}

interface TimelineChartProps {
  data: TimelineData[];
  title?: string;
  type?: "line" | "area";
  showProjections?: boolean;
}

export function TimelineChart({ 
  data, 
  title = "Climate Impact Projections", 
  type = "line",
  showProjections = true 
}: TimelineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const ChartComponent = type === "area" ? AreaChart : LineChart;

  useEffect(() => {
    if (!chartRef.current) return;

    const updateSize = () => {
      const bounds = chartRef.current?.getBoundingClientRect();
      setChartSize({
        width: bounds && bounds.width > 0 ? Math.floor(bounds.width) : 0,
        height: bounds && bounds.height > 0 ? Math.floor(bounds.height) : 0
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(chartRef.current);

    return () => observer.disconnect();
  }, []);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isProjection = payload[0]?.payload?.projection;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Year: ${label}`}</p>
          {isProjection && (
            <p className="text-xs text-muted-foreground mb-1">(Projection)</p>
          )}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{title}</span>
          {showProjections && (
            <span className="text-xs bg-muted px-2 py-1 rounded">
              Includes Projections
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-80 min-w-0">
          {chartSize.width > 0 && chartSize.height > 0 && (
              <ChartComponent width={chartSize.width} height={chartSize.height} data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="year" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              
              {type === "area" ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="emissions"
                    stackId="1"
                    stroke="hsl(var(--earth-brown))"
                    fill="hsl(var(--earth-brown))"
                    fillOpacity={0.3}
                    name="CO2 Emissions (tons)"
                  />
                  <Area
                    type="monotone"
                    dataKey="floodRisk"
                    stackId="1"
                    stroke="hsl(var(--ocean-blue))"
                    fill="hsl(var(--ocean-blue))"
                    fillOpacity={0.3}
                    name="Flood Risk Score"
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="emissions"
                    stroke="hsl(var(--earth-brown))"
                    strokeWidth={2}
                    name="CO2 Emissions (tons)"
                  />
                  <Line
                    type="monotone"
                    dataKey="floodRisk"
                    stroke="hsl(var(--ocean-blue))"
                    strokeWidth={2}
                    name="Flood Risk Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="displacement"
                    stroke="hsl(var(--warning-orange))"
                    strokeWidth={2}
                    name="Displacement (thousands)"
                  />
                  <Line
                    type="monotone"
                    dataKey="foodInsecurity"
                    stroke="hsl(var(--risk-red))"
                    strokeWidth={2}
                    name="Food Insecurity (thousands)"
                  />
                </>
              )}
              </ChartComponent>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
