
import { RiskTransactionsGraph } from "@/components/risk-transactions-graph"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"


import data from "./data.json"
import { getRiskTransactions } from "@/http/metrics/get-risk-transactions"
import { SuspectEventsTable } from "./suspect-events-table"
import { getRecentSuspicions } from "@/http/metrics/get-recent-suspicions"

export default async function Page() {
  const riskTransactions = await getRiskTransactions()
  const data = await getRecentSuspicions()

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6 space-y-6">
        <RiskTransactionsGraph data={riskTransactions} />
        <SuspectEventsTable data={data} />
      </div>
    </div>
  )
}
