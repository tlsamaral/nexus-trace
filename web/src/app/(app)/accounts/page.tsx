import { getAccounts } from "@/http/accounts/get-accounts"
import { Account, AccountsTable } from "./accounts-table"

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Contas</h1>
        <p className="text-muted-foreground">
          Lista completa de contas analisadas pelo motor antifraude.
        </p>
      </div>

      <AccountsTable data={accounts} />
    </div>
  )
}