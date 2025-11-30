
import { RiskTransactionsGraph } from "@/components/risk-transactions-graph"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"


import data from "./data.json"
import { getRiskTransactions } from "@/http/metrics/get-risk-transactions"

export default async function Page() {
  const riskTransactions = await getRiskTransactions()
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <RiskTransactionsGraph data={riskTransactions} />
      </div>
      
      <DataTable data={data} />
    </div>
  )
}
