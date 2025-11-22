from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from neo4j_client import get_driver

router = APIRouter(tags=["Accounts"])

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


# ----------------------------------------------------------------------
# TRANSACÕES DE UMA CONTA
# ----------------------------------------------------------------------

@router.get("/{id}/transactions")
def account_transactions(id: int):
    query = """
    MATCH (a:Account {id: $id})-[r:SENT]->(b)
    RETURN
        r.amount AS amount,
        r.ts AS ts,
        b.id AS dst
    ORDER BY r.ts DESC
    LIMIT 50
    """

    with get_driver().session() as session:
        result = session.run(query, id=id)
        return [record.data() for record in result]