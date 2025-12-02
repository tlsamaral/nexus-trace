"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TransactionDetails } from "@/http/transactions/get-transaction"
import { IconUser, IconSend } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

export function TransactionParticipantsCard({ tx }: { tx: TransactionDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Origem & Destino</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Origem */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <IconUser size={18} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Origem</span>
              <span className="font-semibold text-base">{tx.src}</span>
            </div>
          </div>

          <Badge variant="outline" className="text-xs px-2 py-0.5">
            C{tx.community_src}
          </Badge>
        </div>

        <hr />

        {/* Destino */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <IconSend size={18} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Destino</span>
              <span className="font-semibold text-base">{tx.dst}</span>
            </div>
          </div>

          <Badge variant="outline" className="text-xs px-2 py-0.5">
            C{tx.community_dst}
          </Badge>
        </div>

        <hr />

        {/* Fan-in */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-muted-foreground">Fan-In do destino</span>
          <span className="font-semibold">{tx.fanin}</span>
        </div>

      </CardContent>
    </Card>
  )
}