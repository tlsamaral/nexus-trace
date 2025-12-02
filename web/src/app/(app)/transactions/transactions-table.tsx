"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"

import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  IconArrowRight,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCircleCheck,
  IconUser,
  IconSend,
} from "@tabler/icons-react"
import { Transaction } from "@/http/transactions/get-transactions"
import dayjs from "dayjs"
import Link from "next/link"

function TransactionDetails({ tx }: { tx: Transaction }) {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Transação #{tx.id}</SheetTitle>
        <SheetDescription>
          Informações completas sobre risco, origem, destino e comportamento.
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4 text-sm p-4">

        <div className="flex justify-between">
          <span>Origem:</span>
          <span className="font-medium flex items-center gap-1">
            <IconUser size={16} /> {tx.src}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Destino:</span>
          <span className="font-medium flex items-center gap-1">
            <IconUser size={16} /> {tx.dst}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Valor:</span>
          <span className="font-medium">R$ {tx.amount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Data/Hora:</span>
          <span className="font-medium">{dayjs(tx.ts).format("DD/MM/YYYY HH:mm:ss")}</span>
        </div>

        <div className="flex justify-between">
          <span>Canal:</span>
          <Badge variant="outline">{tx.channel.toUpperCase()}</Badge>
        </div>

        <div className="flex justify-between">
          <span>Risco calculado:</span>
          <span className="font-medium">{tx.risk}</span>
        </div>

        <div className="flex justify-between">
          <span>Comunidade origem:</span>
          <span className="font-medium">{tx.community_src ?? "—"}</span>
        </div>

        <div className="flex justify-between">
          <span>Comunidade destino:</span>
          <span className="font-medium">{tx.community_dst ?? "—"}</span>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between">
            <span>Suspeita:</span>
            {tx.suspicious ? (
              <span className="text-red-500 font-medium flex items-center gap-1">
                <IconAlertTriangle size={16} /> Sim
              </span>
            ) : (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <IconCircleCheck size={16} /> Não
              </span>
            )}
          </div>
        </div>
        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-2">Análise de Fraude</h3>

          {tx.suspicious ? (
            <p className="text-red-500 text-sm">
              🚨 Esta transação foi marcada como suspeita pelo motor de comportamento.
              Isso pode ter ocorrido devido a:  
              • valor alto,  
              • fan-in elevado,  
              • risco da conta destino ≥ 85.
            </p>
          ) : (
            <p className="text-green-600 text-sm">
              ✔ Nenhum padrão de fraude detectado nesta transação.
            </p>
          )}
        </div>

        <Button className="w-full" asChild>
          <Link href={`/transactions/${tx.id}`}>Ver completo</Link>
        </Button>
      </div>
    </SheetContent>
  )
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
  },
  {
    accessorKey: "src",
    header: "Origem",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <IconUser size={16} />
        {row.original.src}
      </div>
    ),
  },
  {
    accessorKey: "dst",
    header: "Destino",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <IconSend size={16} />
        {row.original.dst}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => (
      <span>R$ {row.original.amount.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "channel",
    header: "Canal",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.channel.toUpperCase()}</Badge>
    )
  },
  {
  accessorKey: "suspicious",
  header: "Suspeita",
  cell: ({ row }) => {
    const s = row.original.suspicious

    return s ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <IconAlertTriangle size={14} />
        Sim
      </Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center gap-1">
          <IconCircleCheck size={14} />
          Não
        </Badge>
      )
    }
  },
  {
    accessorKey: "risk",
    header: "Risco",
    cell: ({ row }) => {
      const r = row.original.risk

      return (
        <Badge
          variant={
            r >= 80 ? "destructive" :
            r >= 50 ? "outline" : "secondary"
          }
        >
          {r >= 80 && <IconAlertTriangle size={14} className="mr-1" />}
          {r < 50 && <IconCircleCheck size={14} className="mr-1" />}
          {r}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="xs">
            Detalhes <IconArrowRight size={16} />
          </Button>
        </SheetTrigger>

        <TransactionDetails tx={row.original} />
      </Sheet>
    ),
  },
]

export function TransactionsTable({ data }: { data: Transaction[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}