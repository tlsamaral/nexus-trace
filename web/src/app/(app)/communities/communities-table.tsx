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

import { IconArrowRight, IconAlertTriangle, IconCircleCheck, IconUsers } from "@tabler/icons-react"


// ---------------------------------------
// Schema dos dados
// ---------------------------------------

export const communitySchema = z.object({
  id: z.number(),
  size: z.number(),
  total_tx: z.number(),
  high_fanin_pct: z.number(),
  avg_risk: z.number(),
  status: z.enum(["Normal", "Suspeita", "Crítica"]),
})

type Community = z.infer<typeof communitySchema>

// ---------------------------------------
// Sheet de Detalhes
// ---------------------------------------

function CommunityDetails({ community }: { community: Community }) {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Comunidade #{community.id}</SheetTitle>
        <SheetDescription>
          Detalhamento de risco, conexões e distribuição interna.
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4 text-sm p-4">
        <div className="flex justify-between">
          <span>Tamanho:</span>
          <span className="font-medium">{community.size} contas</span>
        </div>

        <div className="flex justify-between">
          <span>Transações totais:</span>
          <span className="font-medium">{community.total_tx}</span>
        </div>

        <div className="flex justify-between">
          <span>Fan-in alto (24h):</span>
          <span className="font-medium">
            {community.high_fanin_pct}%
          </span>
        </div>

        <div className="flex justify-between">
          <span>Risk médio:</span>
          <span className="font-medium">{community.avg_risk}</span>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold mb-2">Conclusão</h3>
          {community.status === "Crítica" && (
            <p className="text-red-500 text-sm">
              🚨 Comunidade com forte indicação de atividade coordenada.
              Recomenda-se análise imediata.
            </p>
          )}

          {community.status === "Suspeita" && (
            <p className="text-yellow-600 text-sm">
              ⚠️ Indicadores acima do normal, possível comportamento incomum.
            </p>
          )}

          {community.status === "Normal" && (
            <p className="text-green-600 text-sm">
              ✔ Nenhum comportamento fraudulento significativo detectado.
            </p>
          )}
        </div>
      </div>
    </SheetContent>
  )
}

export const columns: ColumnDef<Community>[] = [
  {
    accessorKey: "id",
    header: "Comunidade",
    cell: ({ row }) => (
      <div className="font-semibold">#{row.original.id}</div>
    ),
  },
  {
    accessorKey: "size",
    header: "Contas",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <IconUsers size={16} />
        {row.original.size}
      </div>
    ),
  },
  {
    accessorKey: "total_tx",
    header: "Transações",
    cell: ({ row }) => (
      <span>{row.original.total_tx}</span>
    ),
  },
  {
    accessorKey: "high_fanin_pct",
    header: "Fan-in Alto",
    cell: ({ row }) => (
      <span>{row.original.high_fanin_pct}%</span>
    ),
  },
  {
    accessorKey: "avg_risk",
    header: "Score Médio",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.avg_risk}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status

      return (
        <Badge
          variant={s === "Crítica" ? "destructive" :
                   s === "Suspeita" ? "outline" : "secondary"}
        >
          {s === "Crítica" && <IconAlertTriangle size={14} className="mr-1" />}
          {s === "Suspeita" && <IconAlertTriangle size={14} className="mr-1" />}
          {s === "Normal" && <IconCircleCheck size={14} className="mr-1" />}
          {s}
        </Badge>
      )
    },
  },
  {
    id: "details",
    header: "Ações",
    cell: ({ row }) => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="xs">
            Ver Detalhes <IconArrowRight size={16} />
          </Button>
        </SheetTrigger>

        <CommunityDetails community={row.original} />
      </Sheet>
    )
  }
]

export function CommunitiesTable({ data }: { data: Community[] }) {
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