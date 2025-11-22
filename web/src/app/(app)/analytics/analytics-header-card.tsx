import { AnalyticsMetricCard } from "./analytics-metric-card";
import {
  IconActivity,
  IconGauge,
  IconAlertTriangle,
  IconTopologyStar3,
} from "@tabler/icons-react";

export function AnalyticsHeaderCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AnalyticsMetricCard
        title="Risco médio (hoje)"
        value="56.4"
        subtitle="Média ponderada das transações do dia"
        trend="+4.2%"
        trendPositive={true}
        icon={<IconGauge size={18} />}
        chartData={[
          { value: 40 },
          { value: 45 },
          { value: 50 },
          { value: 47 },
          { value: 56 },
        ]}
      />

      <AnalyticsMetricCard
        title="Total de transações"
        value="1.240"
        subtitle="Volume total processado hoje"
        trend="+12%"
        trendPositive={true}
        icon={<IconActivity size={18} />}
        chartData={[
          { value: 800 },
          { value: 900 },
          { value: 1200 },
          { value: 1100 },
          { value: 1240 },
        ]}
      />

      <AnalyticsMetricCard
        title="Suspeitas"
        value="32"
        subtitle="Transações com risco ≥ 80"
        trend="+3%"
        trendPositive={false}
        icon={<IconAlertTriangle size={18} />}
        chartData={[
          { value: 20 },
          { value: 22 },
          { value: 25 },
          { value: 30 },
          { value: 32 },
        ]}
      />

      <AnalyticsMetricCard
        title="Comunidades"
        value="14"
        subtitle="Agrupamentos detectados via GDS"
        trend="+1"
        trendPositive={true}
        icon={<IconTopologyStar3 size={18} />}
        chartData={[
          { value: 8 },
          { value: 10 },
          { value: 12 },
          { value: 13 },
          { value: 14 },
        ]}
      />

    </div>
  );
}