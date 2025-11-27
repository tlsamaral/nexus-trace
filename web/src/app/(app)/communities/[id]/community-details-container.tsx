'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CommunityDetails,
} from "@/http/communities/get-community-details"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { CommunitySummary } from "./community-summary"

export function CommunityDetailsContainer({ communityDetails }: { communityDetails: CommunityDetails }) {
  return (
    <div className="space-y-4">
      <CommunitySummary
        size={communityDetails.size}
        total_tx={communityDetails.total_tx}
        high_fanin_pct={communityDetails.high_fanin_pct}
        avg_risk={communityDetails.avg_risk}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Risco da Comunidade</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={communityDetails.risk_history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ts" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="risk" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Fan-in</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={communityDetails.fanin_distribution.labels.map((label, i) => ({
                  label,
                  value: communityDetails.fanin_distribution.values[i],
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Contas Suspeitas</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Conta</th>
                <th className="text-left">Fan-in</th>
                <th className="text-left">Fan-out</th>
                <th className="text-left">Risco</th>
              </tr>
            </thead>
            <tbody>
              {communityDetails.top_accounts.map((acc) => (
                <tr key={acc.id} className="border-b">
                  <td className="py-2 font-medium">#{acc.id}</td>
                  <td>{acc.fanin}</td>
                  <td>{acc.fanout}</td>
                  <td>{acc.risk_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo Total Entre Contas da Comunidade</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={communityDetails.flow_history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
