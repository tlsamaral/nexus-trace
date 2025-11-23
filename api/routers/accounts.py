from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from neo4j_client import get_driver

router = APIRouter(tags=["Accounts"])

# ------------------------------------------------------------
# MODELOS
# ------------------------------------------------------------

class AccountSummary(BaseModel):
    id: int
    community: int | None
    risk_avg: float
    fanin: int
    fanout: int
    volume24h: float
    lastActivity: str | None


class AccountDetail(BaseModel):
    id: int
    total_sent: float | None
    total_received: float | None
    avg_amount: float | None
    fanin_24h: int


class TransactionRecord(BaseModel):
    amount: float
    ts: str
    dst: int


# ------------------------------------------------------------
# LISTA DE CONTAS (NÃO MEXER)
# ------------------------------------------------------------
@router.get("/")
def list_accounts():
    q = """
    MATCH (a:Account)
    OPTIONAL MATCH (a)-[s:SENT]->()
    OPTIONAL MATCH ()-[r:SENT]->(a)
    RETURN
        a.id AS id,
        a.community AS community,
        coalesce(avg(s.amount), 0) AS risk_avg,
        count(r) AS fanin,
        count(s) AS fanout,
        coalesce(sum(s.amount), 0) AS volume24h,
        toString(a.lastActivity) AS lastActivity
    ORDER BY id ASC
    """
    with get_driver().session() as session:
        res = session.run(q)
        return [record.data() for record in res]


# ------------------------------------------------------------
# DETALHES (NÃO MEXER)
# ------------------------------------------------------------
@router.get("/{id}", response_model=AccountDetail)
def account_info(id: int):
    query = """
    MATCH (a:Account {id: $id})
    OPTIONAL MATCH (a)-[s:SENT]->()
    OPTIONAL MATCH ()-[r:SENT]->(a)
    RETURN
        a.id AS id,
        coalesce(sum(s.amount), 0) AS total_sent,
        coalesce(sum(r.amount), 0) AS total_received,
        coalesce(avg(s.amount), 0) AS avg_amount,
        count(r) AS fanin_24h
    """

    with get_driver().session() as session:
        rec = session.run(query, id=id).single()
        if not rec:
            raise HTTPException(status_code=404, detail="Account not found")
        return rec.data()


# ------------------------------------------------------------
# TRANSACOES (NÃO MEXER)
# ------------------------------------------------------------
@router.get("/{id}/transactions")
def account_transactions(id: int):
    query = """
    MATCH (a:Account {id: $id})-[r:SENT]->(b:Account)
    RETURN
        r.amount AS amount,
        toString(r.ts) AS ts,
        b.id AS dst,
        r.channel AS channel,
        CASE
            WHEN r.amount > 5000 THEN 95
            WHEN r.amount > 3000 THEN 75
            WHEN r.amount > 1500 THEN 55
            ELSE 20
        END AS risk
    ORDER BY r.ts DESC
    LIMIT 50
    """

    with get_driver().session() as session:
        return [record.data() for record in session.run(query, id=id)]


# ============================================================
# 🔵 ROTA NOVA 1: RESUMO PARA AccountSummaryCard
# ============================================================
@router.get("/{id}/summary", response_model=AccountSummary)
def account_summary(id: int):
    query = """
    MATCH (a:Account {id: $id})
    OPTIONAL MATCH (a)-[s:SENT]->()
    OPTIONAL MATCH ()-[r:SENT]->(a)
    RETURN
        a.id AS id,
        a.community AS community,
        coalesce(avg(s.amount), 0) AS risk_avg,
        count(r) AS fanin,
        count(s) AS fanout,
        coalesce(sum(s.amount), 0) AS volume24h,
        toString(a.lastActivity) AS lastActivity
    """

    with get_driver().session() as session:
        rec = session.run(query, id=id).single()
        if not rec:
            raise HTTPException(status_code=404, detail="Account not found")
        return rec.data()


# ============================================================
# 🔵 ROTA NOVA 2: HISTÓRICO DE RISCO (RiskHistoryChart)
# ============================================================
@router.get("/{id}/risk-history")
def risk_history(id: int):
    """
    Retorna os últimos 100 pontos de risco baseado no amount
    Pode ser melhorado depois
    """
    query = """
    MATCH (a:Account {id: $id})-[r:SENT]->()
    RETURN
        toString(r.ts) AS ts,
        coalesce(r.amount, 0) AS risk
    ORDER BY r.ts ASC
    LIMIT 100
    """

    with get_driver().session() as session:
        result = session.run(query, id=id)
        return [record.data() for record in result]


# ============================================================
# 🔵 ROTA NOVA 3: GRAFO LOCAL (GraphVisualization)
# ============================================================
@router.get("/{id}/graph")
def account_graph(id: int):
    """
    Retorna até 20 nós conectados à conta e suas transações.
    """
    query = """
    MATCH (a:Account {id: $id})
    OPTIONAL MATCH (a)-[s:SENT]->(b:Account)
    OPTIONAL MATCH (c:Account)-[r:SENT]->(a)

    RETURN
        collect(DISTINCT {
            id: a.id,
            community: a.community,
            risk: a.risk_score
        }) +
        collect(DISTINCT {
            id: b.id,
            community: b.community,
            risk: b.risk_score
        }) +
        collect(DISTINCT {
            id: c.id,
            community: c.community,
            risk: c.risk_score
        }) AS nodes,

        collect(DISTINCT {
            source: a.id,
            target: b.id,
            amount: s.amount,
            channel: s.channel
        }) +
        collect(DISTINCT {
            source: c.id,
            target: a.id,
            amount: r.amount,
            channel: r.channel
        }) AS links
    """

    with get_driver().session() as session:
        rec = session.run(query, id=id).single()
        data = rec.data()

        return {
            "nodes": data["nodes"],
            "links": data["links"]
        }