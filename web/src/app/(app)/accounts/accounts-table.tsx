"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { z } from "zod"

export const accountSchema = z.object({
  id: z.number(),
  community: z.number(),
  risk_avg: z.number(),
  fanin: z.number(),
  fanout: z.number(),
  volume24h: z.number(),
  lastActivity: z.string(),
})

export type Account = z.infer<typeof accountSchema>

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"

import {
  IconUser,
  IconArrowRight,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconChecks,
} from "@tabler/icons-react"

function AccountDetails({ acc }: { acc: Account }) {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Conta #{acc.id}</SheetTitle>
        <SheetDescription>Análise detalhada da conta</SheetDescription>
      </SheetHeader>

      <div className="space-y-4 text-sm p-4">

        <div className="flex justify-between">
          <span>Comunidade:</span>
          <Badge>{acc.community}</Badge>
        </div>

        <div className="flex justify-between">
          <span>Risco médio (24h):</span>
          <span className="font-medium">{acc.risk_avg}</span>
        </div>

        <div className="flex justify-between">
          <span>Fan-in:</span>
          <span className="font-medium">{acc.fanin}</span>
        </div>

        <div className="flex justify-between">
          <span>Fan-out:</span>
          <span className="font-medium">{acc.fanout}</span>
        </div>

        <div className="flex justify-between">
          <span>Volume (24h):</span>
          <span className="font-medium">R$ {acc.volume24h.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Última atividade:</span>
          <span className="font-medium">{acc.lastActivity}</span>
        </div>

        <Button
          className="w-full mt-4"
          onClick={() => (window.location.href = `/accounts/${acc.id}`)}
        >
          Abrir página da conta
        </Button>
      </div>
    </SheetContent>
  )
}

export const accountColumns: ColumnDef<Account>[] = [
  {
    accessorKey: "id",
    header: "Conta",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 font-medium">
        <IconUser size={16} />
        {row.original.id}
      </div>
    ),
  },
  {
    accessorKey: "community",
    header: "Comunidade",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.community}</Badge>
    ),
  },
  {
    accessorKey: "risk_avg",
    header: "Risco 24h",
    cell: ({ row }) => {
      const r = row.original.risk_avg
      return (
        <Badge
          variant={
            r >= 80 ? "destructive" :
            r >= 50 ? "outline" : "secondary"
          }
        >
          {r >= 80 && <IconAlertTriangle size={14} className="mr-1" />}
          {r < 50 && <IconChecks size={14} className="mr-1" />}
          {r}
        </Badge>
      )
    },
  },
  {
    accessorKey: "fanin",
    header: "Entradas",
    cell: ({ row }) => (
      <span className="flex items-center gap-1">
        <IconTrendingUp className="text-green-600" size={16} />
        {row.original.fanin}
      </span>
    ),
  },
  {
    accessorKey: "fanout",
    header: "Saídas",
    cell: ({ row }) => (
      <span className="flex items-center gap-1">
        <IconTrendingDown className="text-red-600" size={16} />
        {row.original.fanout}
      </span>
    ),
  },
  {
    accessorKey: "volume24h",
    header: "Volume 24h",
    cell: ({ row }) => (
      <span>R$ {row.original.volume24h.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "lastActivity",
    header: "Última atividade",
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

        <AccountDetails acc={row.original} />
      </Sheet>
    ),
  },
]

export function AccountsTable({ data }: { data: Account[] }) {
  const table = useReactTable({
    data,
    columns: accountColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader className="bg-muted/40">
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
            <TableRow key={row.original.id}>
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