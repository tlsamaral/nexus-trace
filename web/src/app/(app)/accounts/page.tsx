import { Account, AccountsTable } from "./accounts-table"

const mockAccounts: Account[] = Array.from({ length: 12 }).map((_, i) => ({
  id: 100 + i,
  risk_avg: Math.floor(Math.random() * 100),
  fanin: Math.floor(Math.random() * 200),
  fanout: Math.floor(Math.random() * 200),
  community: [3, 8, 12, 1][Math.floor(Math.random() * 4)],
  volume24h: Math.floor(Math.random() * 50000),
  lastActivity: `${Math.floor(Math.random() * 59)} min atrás`,
}))

export default function AccountsPage() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Contas</h1>
        <p className="text-muted-foreground">
          Lista completa de contas analisadas pelo motor antifraude.
        </p>
      </div>

      <AccountsTable data={mockAccounts} />
    </div>
  )
}