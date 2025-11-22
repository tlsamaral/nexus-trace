"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "Gráfico geral de riscos e transações"

// Dados adaptados para o contexto do NexosTrace
const chartData = [
  { date: "2024-06-01", transacoes: 120, suspeitas: 14, risco_medio: 42.5 },
  { date: "2024-06-02", transacoes: 98, suspeitas: 9, risco_medio: 37.1 },
  { date: "2024-06-03", transacoes: 150, suspeitas: 22, risco_medio: 55.3 },
  { date: "2024-06-04", transacoes: 180, suspeitas: 31, risco_medio: 61.0 },
  { date: "2024-06-05", transacoes: 90, suspeitas: 7, risco_medio: 29.4 },
]

const chartConfig = {
  transacoes: {
    label: "Transações",
    color: "var(--primary)",
  },
  suspeitas: {
    label: "Suspeitas",
    color: "var(--destructive)",
  },
  risco_medio: {
    label: "Risco Médio",
    color: "var(--chart-3)", // ajuste se quiser
  },
} satisfies ChartConfig

export function RiskTransactionsGraph() {
  const isMobile = useIsMobile()
  const [range, setRange] = React.useState("30d")

  // comportamento igual ao seu original
  React.useEffect(() => {
    if (isMobile) setRange("7d")
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let days = 90
    if (range === "30d") days = 30
    if (range === "7d") days = 7

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - days)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Panorama Geral</CardTitle>
        <CardDescription>
          Monitoramento de transações, suspeitas e risco médio.
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={setRange}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>

          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-40 @[767px]/card:hidden">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTransacoes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-transacoes)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-transacoes)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillSuspeitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-suspeitas)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-suspeitas)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillRisco" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-risco_medio)" stopOpacity={0.7} />
                <stop offset="95%" stopColor="var(--color-risco_medio)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "short",
                })
              }
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="transacoes"
              type="natural"
              fill="url(#fillTransacoes)"
              stroke="var(--color-transacoes)"
            />

            <Area
              dataKey="suspeitas"
              type="natural"
              fill="url(#fillSuspeitas)"
              stroke="var(--color-suspeitas)"
            />

            <Area
              dataKey="risco_medio"
              type="natural"
              fill="url(#fillRisco)"
              stroke="var(--color-risco_medio)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
