"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TransactionsTable({ data }: { data: any[] }) {
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
              <TableHead>ID</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Risco</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.dst}</TableCell>
                <TableCell>R$ {t.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">{t.channel}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{t.risk}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}