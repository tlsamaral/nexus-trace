"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function SuspectEventsTable({ data }: { data: any[] }) {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Community</TableHead>
              <TableHead>Fan-in (24h)</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">#{row.account}</TableCell>
                <TableCell>{row.community}</TableCell>
                <TableCell>{row.fanin}</TableCell>
                <TableCell>R$ {row.amount.toLocaleString()}</TableCell>
                <TableCell>{row.channel}</TableCell>

                <TableCell>
                  <Badge variant={row.risk >= 80 ? "destructive" : "secondary"}>
                    {row.risk}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{row.reason}</Badge>
                </TableCell>

                <TableCell>
                  {new Date(row.ts).toLocaleString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}