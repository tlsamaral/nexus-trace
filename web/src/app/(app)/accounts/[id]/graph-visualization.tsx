"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

// Import dinâmico (evita erro "window is not defined")
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

const mockGraph = {
  nodes: [
    { id: "101", community: 12, risk: 72, central: true },
    { id: "331", community: 12, risk: 23 },
    { id: "552", community: 8, risk: 84 },
    { id: "887", community: 3, risk: 12 },
    { id: "721", community: 12, risk: 55 },
  ],
  links: [
    { source: "331", target: "101", amount: 900, channel: "pix" },
    { source: "101", target: "552", amount: 3200, channel: "ted" },
    { source: "887", target: "101", amount: 1800, channel: "pix" },
    { source: "101", target: "721", amount: 400, channel: "interno" },
  ]
}

export function GraphVisualization() {
  const graphRef = useRef<any>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização do grafo</CardTitle>
        <CardDescription>
          Relações da conta dentro da rede antifraude
        </CardDescription>
      </CardHeader>

      <CardContent className="h-[500px] rounded-lg overflow-hidden p-2">

        <ForceGraph2D
          ref={graphRef}
          graphData={mockGraph}
          nodeRelSize={6}
          warmupTicks={40}
          cooldownTicks={80}
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={1}
          enableNodeDrag={false}
          nodeLabel={(node: any) =>
            `Conta: ${node.id}\nComunidade: ${node.community}\nRisco: ${node.risk}%`
          }
          
          // 🎨 Renderização personalizada
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = `${node.id} (C${node.community} • ${node.risk}%)`
            
            // Cores por risco
            const color =
              node.risk >= 70 ? "#ef4444" :
              node.risk >= 40 ? "#fbbf24" :
              "#16a34a"

            const radius =
              node.central ? 18 :
              node.risk >= 70 ? 16 :
              node.risk >= 40 ? 14 : 10

            // Glow
            ctx.shadowColor = color
            ctx.shadowBlur = 15

            // Node
            ctx.beginPath()
            ctx.fillStyle = color
            ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI)
            ctx.fill()
            ctx.shadowBlur = 0

            // Label
            const fontSize = 12 / globalScale
            ctx.font = `${fontSize}px Inter`
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillStyle = "#111"
            ctx.fillText(label, node.x!, node.y! + radius + 2)
          }}

          // 🎨 Links mais bonitos
          linkColor={(link: any) => {
            switch (link.channel) {
              case "pix": return "#3b82f6"
              case "ted": return "#8b5cf6"
              case "boleto": return "#ef4444"
              default: return "#6b7280"
            }
          }}

          linkWidth={(link: any) => Math.log(link.amount) * 0.8}
        />
      </CardContent>
    </Card>
  )
}