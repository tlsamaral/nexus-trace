import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import {
  getCommunityDetails,
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
import { CommunityDetailsContainer } from "./community-details-container"

export default async function CommunityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const communityDetails = await getCommunityDetails(id)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <div>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Comunidade #{communityDetails.id}</h1>
          <p className="text-muted-foreground">
            Visualização avançada de comportamento, risco e estrutura.
          </p>
        </div>
      </div>

      <CommunityDetailsContainer communityDetails={communityDetails} />

    </div>
  )
}
