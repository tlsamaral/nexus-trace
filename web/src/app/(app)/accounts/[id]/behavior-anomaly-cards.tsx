"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Props {
  data: {
    title: string
    description: string
    severity: "low" | "medium" | "high"
  }[]
}

export function BehaviorAnomalyCards({ data }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((a, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {a.title}
              <Badge
                variant={
                  a.severity === "high"
                    ? "destructive"
                    : a.severity === "medium"
                    ? "default"
                    : "outline"
                }
              >
                {a.severity.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>{a.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}