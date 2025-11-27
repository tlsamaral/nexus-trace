import { getCommunities } from "@/http/communities/get-communities"
import { CommunitiesTable } from "./communities-table"

export default async function CommunitiesPage() {
  const communities = await getCommunities()
  
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-3xl font-bold">Comunidades</h1>
        <p className="text-muted-foreground">
          Agrupamentos detectados com algoritmos de grafos.
        </p>
      </div>

      <CommunitiesTable data={communities} />
    </div>
  )
}
