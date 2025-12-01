"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { IconAlertTriangle, IconMinus } from "@tabler/icons-react"

interface Tx {
  id: number | null
  dst: number
  amount: string
  channel?: string | null
  risk?: string | number
}

export function TransactionsTable({ data }: { data: Tx[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações</CardTitle>
        <CardDescription>Histórico recente da conta</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destino</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Risco</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-6"
                >
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}

            {data.map((t) => {
              return (
                <TableRow key={t.id ?? Math.random()}>
                  <TableCell className="font-medium">{t.dst}</TableCell>
                  <TableCell className="font-semibold">
                    {t.amount}
                  </TableCell>
                  <TableCell>
                    {t.channel ? (
                      <Badge variant="outline" className="uppercase">
                        {t.channel}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {typeof t.risk === "number" ? (
                      <Badge
                        variant={
                          t.risk >= 80
                            ? "destructive"
                            : t.risk >= 50
                            ? "secondary"
                            : "outline"
                        }
                        className="flex items-center gap-1"
                      >
                        {t.risk >= 80 && (
                          <IconAlertTriangle size={14} className="mr-1" />
                        )}
                        {t.risk}%
                      </Badge>
                    ) : (
                      <IconMinus size={16} className="text-muted-foreground" />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}