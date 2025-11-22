import { CommunitiesTable } from "./communities-table"

const mockCommunities = [
  {
    id: 12,
    size: 48,
    total_tx: 932,
    high_fanin_pct: 37,
    avg_risk: 61,
    status: "Suspeita",
  },
  {
    id: 5,
    size: 12,
    total_tx: 110,
    high_fanin_pct: 5,
    avg_risk: 12,
    status: "Normal",
  },
  {
    id: 7,
    size: 102,
    total_tx: 5200,
    high_fanin_pct: 64,
    avg_risk: 92,
    status: "Crítica",
  },
]

export default function CommunitiesPage() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-3xl font-bold">Comunidades</h1>
        <p className="text-muted-foreground">
          Agrupamentos detectados com algoritmos de grafos.
        </p>
      </div>

      <CommunitiesTable data={mockCommunities} />
    </div>
  )
}
