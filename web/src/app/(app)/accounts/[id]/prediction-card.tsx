"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts"
import { getAccountPrediction, type AccountPrediction } from "@/http/accounts/account-prediction"

export function PredictionCard({ accountId }: { accountId: string }) {
  const [prediction, setPrediction] = useState<AccountPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadPrediction() {
    try {
      setLoading(true)
      setError(null)

      const data = await getAccountPrediction(accountId)
      setPrediction(data)
    } catch (err) {
      console.error(err)
      setError("Não foi possível carregar a predição.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrediction()
  }, [accountId])

  const predictedRisk = prediction?.risk ?? 0

  const color =
    predictedRisk >= 70
      ? "hsl(0 84% 60%)" // vermelho
      : predictedRisk >= 40
      ? "hsl(45 93% 47%)" // amarelo
      : "hsl(142 76% 36%)" // verde

  const chartData = [
    {
      name: "Risco",
      value: predictedRisk,
      fill: color,
    },
  ]

  const isEmpty = !loading && !prediction && !error

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predição futura</CardTitle>
        <CardDescription>
          Estimativa de risco nas próximas {prediction?.horizon_hours ?? 12}h
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estado vazio */}
        {isEmpty && (
          <p className="text-sm text-muted-foreground text-center">
            Nenhum dado de predição disponível para esta conta.
          </p>
        )}

        {/* Gráfico + texto */}
        {!isEmpty && (
          <>
            <div className="w-full h-56 flex items-center justify-center">
              {loading ? (
                // Loading simples, mas elegante
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="w-20 h-20 rounded-full border-4 border-dashed animate-spin" />
                  <span className="text-xs">Calculando predição…</span>
                </div>
              ) : (
                <ResponsiveContainer width="60%" height="100%">
                  <RadialBarChart
                    data={chartData}
                    innerRadius="70%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={predictedRisk * 3.6 + 90} // 0–100 -> 0–360°
                  >
                    {/* Fundo (100%) */}
                    <RadialBar
                      dataKey="value"
                      cornerRadius={50}
                      fill="hsl(220 19% 85%)"
                      data={[{ value: 100 }]}
                    />

                    {/* Risco projetado */}
                    <RadialBar
                      dataKey="value"
                      cornerRadius={50}
                      fill={color}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
            </div>

            {!loading && (
              <div className="text-center space-y-1">
                <p className="text-4xl font-bold">
                  {predictedRisk.toFixed(0)}%
                </p>
                <p className="text-muted-foreground text-sm">
                  Risco projetado nas próximas {prediction?.horizon_hours ?? 12} horas
                </p>
                {prediction?.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    Atualizado em: {new Date(prediction.updated_at).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-center text-destructive">{error}</p>
            )}
          </>
        )}

        <Button
          className="w-full"
          variant="outline"
          onClick={loadPrediction}
          disabled={loading}
        >
          {loading ? "Reprocessando…" : "Reprocessar modelo para esta conta"}
        </Button>
      </CardContent>
    </Card>
  )
}