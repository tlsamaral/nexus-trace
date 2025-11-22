"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"

export function TopSuspiciousTable({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top contas suspeitas</CardTitle>
        <CardDescription>Baseado em risco + fan-in</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conta</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Fan-In 24h</TableHead>
              <TableHead>Comunidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.risk}</TableCell>
                <TableCell>{c.fanin}</TableCell>
                <TableCell>{c.community}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}