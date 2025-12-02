import { getTransactionDetails } from "@/http/transactions/get-transaction"
import { TransactionHeaderCard } from "./components/tx-header-card"
import { TransactionRiskCard } from "./components/tx-risk-card"
import { TransactionParticipantsCard } from "./components/tx-participants-card"
import { TransactionExplainabilityCard } from "./components/tx-explainability-card"

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tx = await getTransactionDetails(id)

  return (
    <div className="space-y-6 p-4">
      <TransactionHeaderCard tx={tx} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TransactionRiskCard tx={tx} />
        <TransactionParticipantsCard tx={tx} />
      </div>

      <TransactionExplainabilityCard tx={tx} />
    </div>
  )
}