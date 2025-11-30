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

export interface RiskTrendPoint {
  date: string
  transactions: number
  suspicious: number
  avg_risk: number
}

export interface RiskTransactionsGraphProps {
  data: RiskTrendPoint[]
}

const chartConfig = {
  transactions: {
    label: "Transactions",
    color: "var(--primary)",
  },
  suspicious: {
    label: "Suspicious",
    color: "var(--destructive)",
  },
  avg_risk: {
    label: "Avg Risk",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function RiskTransactionsGraph({ data }: RiskTransactionsGraphProps) {
  const isMobile = useIsMobile()
  const [range, setRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) setRange("7d")
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const ref = new Date()
    let days = range === "90d" ? 90 : range === "30d" ? 30 : 7

    const start = new Date(ref)
    start.setDate(start.getDate() - days)

    return data.filter((item) => new Date(item.date) >= start)
  }, [data, range])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>General Overview</CardTitle>
        <CardDescription>
          Monitoring of transactions, suspicious cases and average risk.
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={setRange}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-40 @[767px]/card:hidden">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTransactions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-transactions)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-transactions)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillSuspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-suspicious)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-suspicious)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-avg_risk)" stopOpacity={0.7} />
                <stop offset="95%" stopColor="var(--color-avg_risk)" stopOpacity={0.1} />
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
              dataKey="transactions"
              type="natural"
              fill="url(#fillTransactions)"
              stroke="var(--color-transactions)"
            />

            <Area
              dataKey="suspicious"
              type="natural"
              fill="url(#fillSuspicious)"
              stroke="var(--color-suspicious)"
            />

            <Area
              dataKey="avg_risk"
              type="natural"
              fill="url(#fillRisk)"
              stroke="var(--color-avg_risk)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}