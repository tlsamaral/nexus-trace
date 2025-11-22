import { Transaction, TransactionsTable } from "./transactions-table"

export const mockTransactions = [
  {
    id: "1",
    src: 101,
    dst: 202,
    amount: 4500.55,
    ts: "2025-01-19T14:33:12Z",
    channel: "pix",
    risk: 87,
    community_src: 12,
    community_dst: 12
  },
  {
    id: "2",
    src: 304,
    dst: 115,
    amount: 230.9,
    ts: "2025-01-19T12:10:44Z",
    channel: "ted",
    risk: 32,
    community_src: 8,
    community_dst: 3
  },
  {
    id: "3",
    src: 501,
    dst: 887,
    amount: 999.99,
    ts: "2025-01-19T10:05:03Z",
    channel: "boleto",
    risk: 58,
    community_src: 5,
    community_dst: 9
  },
  {
    id: "4",
    src: 777,
    dst: 444,
    amount: 12000,
    ts: "2025-01-19T09:00:01Z",
    channel: "interno",
    risk: 92,
    community_src: 1,
    community_dst: 1
  }
]

export default function TransactionsPage() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-3xl font-bold">Transações</h1>
        <p className="text-muted-foreground">
          Transações detectadas com algoritmos de grafos.
        </p>
      </div>

      <TransactionsTable data={mockTransactions} />
    </div>
  )
}
