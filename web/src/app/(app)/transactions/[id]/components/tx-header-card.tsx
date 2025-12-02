import dayjs from "dayjs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  IconAlertTriangle,
  IconArrowRight,
  IconSend,
  IconUser,
} from "@tabler/icons-react"
import { TransactionDetails } from "@/http/transactions/get-transaction"

export function TransactionHeaderCard({ tx }: { tx: TransactionDetails }) {
  const formattedDate = tx.ts ? dayjs(tx.ts).format("DD/MM/YYYY HH:mm") : "—"

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">Transação #{tx.id}</h1>
          <p className="text-muted-foreground text-sm">
            {formattedDate} — Canal {tx.channel?.toUpperCase()}
          </p>

          <p className="text-4xl font-bold mt-4">
            R$ {tx.amount.toFixed(2)}
          </p>
        </div>

        {/* Badge de risco visual */}
        <Badge
          variant={tx.suspicious ? "destructive" : "secondary"}
          className="text-sm py-1 px-3"
        >
          {tx.suspicious ? (
            <span className="flex items-center gap-1">
              <IconAlertTriangle size={16} /> Suspeita
            </span>
          ) : (
            "Normal"
          )}
        </Badge>
      </div>
    </Card>
  )
}