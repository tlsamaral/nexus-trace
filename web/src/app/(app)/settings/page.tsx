import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Ajustes gerais do sistema, API, pesos e limites.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-10">
            Configurações serão exibidas aqui…
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
