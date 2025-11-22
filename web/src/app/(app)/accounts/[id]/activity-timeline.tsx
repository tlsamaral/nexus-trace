"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function ActivityTimeline({
  data,
}: {
  data: { ts: string; type: "alert" | "info" | "tx"; text: string }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Linha do tempo</CardTitle>
        <CardDescription>Eventos recentes da conta</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="border-l pl-4 relative">
            <div
              className={`w-2 h-2 rounded-full absolute -left-[5px] top-1 ${
                item.type === "alert"
                  ? "bg-red-500"
                  : item.type === "tx"
                  ? "bg-blue-500"
                  : "bg-gray-400"
              }`}
            ></div>

            <p className="text-sm font-semibold">{item.ts}</p>
            <p className="text-muted-foreground text-sm">{item.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}