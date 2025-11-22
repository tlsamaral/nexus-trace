"use client";

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface AnalyticsMetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: string; 
  trendPositive?: boolean;
  icon: React.ReactNode;
  chartData?: { value: number }[]; 
}

export function AnalyticsMetricCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon,
  chartData = [],
}: AnalyticsMetricCardProps) {
  return (
    <Card className="p-4 @container/card">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <div>
          <CardDescription className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{icon}</span>
            {title}
          </CardDescription>

          <CardTitle className="text-2xl font-semibold mt-1 tabular-nums @[350px]/card:text-3xl">
            {value}
          </CardTitle>
        </div>

        <div className="h-[50px] w-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={trendPositive ? "#16a34a" : "#dc2626"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardHeader>

      <CardFooter className="flex items-center justify-between p-0 pt-4 text-sm">
        <div className="text-muted-foreground">{subtitle}</div>

        {trend && (
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-1",
              trendPositive ? "text-green-600" : "text-red-600"
            )}
          >
            <span
              className={cn(
                "inline-block w-2 h-2 rounded-full mr-1",
                trendPositive ? "bg-green-600" : "bg-red-600"
              )}
            />
            {trend}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}