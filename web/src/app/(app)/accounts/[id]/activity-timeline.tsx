"use client"

import { useState } from "react"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

dayjs.locale("pt-br")

export function ActivityTimeline({
  data,
}: {
  data: { ts: string; type: "alert" | "info" | "tx"; text: string }[]
}) {
  const [expanded, setExpanded] = useState(false)

  // Mostrar apenas os 6 primeiros quando fechado
  const visibleData = expanded ? data : data.slice(0, 6)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linha do tempo</CardTitle>
        <CardDescription>Eventos recentes da conta</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {visibleData.map((item, i) => (
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

            <p className="text-sm font-semibold">
              {dayjs(item.ts).format("DD/MM/YYYY HH:mm")}
            </p>

            <p className="text-muted-foreground text-sm">{item.text}</p>
          </div>
        ))}

        {/* Botão ver mais / ver menos */}
        {data.length > 6 && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full"
            >
              {expanded ? "Ver menos" : "Ver mais"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}