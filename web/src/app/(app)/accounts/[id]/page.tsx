import { AccountInner } from "./account-inner"


export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: accountId } = await params

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-3xl font-bold">Conta #{accountId}</h1>
        <p className="text-muted-foreground">
          Visualização completa da conta dentro do grafo antifraude.
        </p>
      </div>

     <AccountInner accountId={accountId} />
    </div>
  )
}