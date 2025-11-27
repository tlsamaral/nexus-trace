import { getAllTransactions } from "@/http/transactions/get-transactions"
import { TransactionsTable } from "./transactions-table"


export default async function TransactionsPage() {
  const transactions = await getAllTransactions()
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-3xl font-bold">Transações</h1>
        <p className="text-muted-foreground">
          Transações detectadas com algoritmos de grafos.
        </p>
      </div>

      <TransactionsTable data={transactions} />
    </div>
  )
}
