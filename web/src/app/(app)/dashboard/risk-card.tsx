import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string; // ex: "+12%" ou "-4.5%"
  trendPositive?: boolean; // true = verde, false = vermelho
  icon?: React.ReactNode; // opcional
}

export function RiskMetricCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon,
}: RiskMetricCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {title}
        </CardDescription>

        <CardTitle className="text-2xl font-semibold tabular-nums @[350px]/card:text-3xl">
          {value}
        </CardTitle>

        {trend && (
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 px-2 py-1",
                trendPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trendPositive ? "▲" : "▼"} {trend}
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      {(subtitle || trend) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {subtitle && (
            <div className="text-muted-foreground leading-tight">{subtitle}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
