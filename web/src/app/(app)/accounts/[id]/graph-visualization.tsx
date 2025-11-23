"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { getAccountGraph } from "@/http/accounts/account-info"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

export function GraphVisualization({ accountId }: { accountId: string }) {
  const graphRef = useRef<any>(null)
  const [graph, setGraph] = useState<any>(null)

  // Load graph
  useEffect(() => {
    async function load() {
      const data = await getAccountGraph(accountId)
      setGraph(data)
    }
    load()
  }, [accountId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização do grafo</CardTitle>
        <CardDescription>Relações da conta dentro da rede antifraude</CardDescription>
      </CardHeader>

      <CardContent className="h-[500px] rounded-lg overflow-hidden p-2">

        {!graph && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Carregando grafo...
          </div>
        )}

        {graph && (
          <ForceGraph2D
            ref={graphRef}
            graphData={graph}
            nodeRelSize={6}
            warmupTicks={50}
            cooldownTicks={100}
            enableNodeDrag={false}
            autoPauseRedraw={true}
            
            // ⬇️ Ajuste mágico para não ficar amontoado no canto
            onEngineStop={() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(400, 60) // 400ms animation — padding 60px
              }
            }}

            nodeLabel={(node: any) =>
              `Conta: ${node.id}\nComunidade: ${node.community}\nRisco: ${node.risk}%`
            }

            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = `${node.id} (C${node.community} • ${node.risk}%)`

              const color =
                node.risk >= 70 ? "#ef4444" :
                node.risk >= 40 ? "#fbbf24" :
                "#16a34a"

              const radius =
                node.central ? 18 :
                node.risk >= 70 ? 16 :
                node.risk >= 40 ? 14 : 10

              ctx.shadowColor = color
              ctx.shadowBlur = 15

              ctx.beginPath()
              ctx.fillStyle = color
              ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI)
              ctx.fill()
              ctx.shadowBlur = 0

              const fontSize = 12 / globalScale
              ctx.font = `${fontSize}px Inter`
              ctx.textAlign = "center"
              ctx.textBaseline = "top"
              ctx.fillStyle = "#111"
              ctx.fillText(label, node.x!, node.y! + radius + 2)
            }}

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
        )}
      </CardContent>
    </Card>
  )
}