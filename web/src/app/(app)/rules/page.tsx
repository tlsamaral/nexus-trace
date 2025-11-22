import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

const modelConfig = {
  fanin: 50,
  amount: 30,
  community: 20,
  threshold: 80,
}

export default function RulesPage() {
  return (
    <div className="space-y-8 p-4">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold">Regras & Modelos</h1>
        <p className="text-muted-foreground">
          Pesos, thresholds e lógica de pontuação usados pelo motor antifraude.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Modelo</CardTitle>
          <CardDescription>
            Ajustes do modelo de risco (somente leitura — futuramente editável).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Peso Fan-In</label>
            <Slider value={[modelConfig.fanin]} max={100} step={1} disabled />
            <p className="text-sm text-muted-foreground">{modelConfig.fanin}%</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Peso do Valor</label>
            <Slider value={[modelConfig.amount]} max={100} step={1} disabled />
            <p className="text-sm text-muted-foreground">{modelConfig.amount}%</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Peso de Comunidade</label>
            <Slider value={[modelConfig.community]} max={100} step={1} disabled />
            <p className="text-sm text-muted-foreground">{modelConfig.community}%</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Threshold de Fraude</label>
            <Input
              type="number"
              value={modelConfig.threshold}
              disabled
            />
            <p className="text-sm text-muted-foreground">
              Transações com risco ≥ {modelConfig.threshold} são marcadas como fraude.
            </p>
          </div>

          <Separator />

          <div className="py-3 text-sm text-center text-muted-foreground">
            Em breve, esta página permitirá ajustar regras, testar impactos e versionar modelos.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}