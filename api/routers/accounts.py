from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()

@router.get("/{id}")
def account_info(id: int):
    q = """
    MATCH (a:Account {id: $id})
    OPTIONAL MATCH (a)-[s:SENT]->()
    OPTIONAL MATCH ()-[r:SENT]->(a)
    RETURN 
        a.id AS id,
        sum(s.amount) AS total_sent,
        sum(r.amount) AS total_received,
        avg(s.amount) AS avg_amount,
        count(r) AS fanin_24h
    """
    with get_driver().session() as session:
        rec = session.run(q, id=id).single()
    return rec.data() if rec else {"error": "Account not found"}

@router.get("/{id}/transactions")
def account_transactions(id: int):
    q = """
    MATCH (a:Account {id: $id})-[r:SENT]->(b)
    RETURN r, b ORDER BY r.ts DESC LIMIT 50
    """
    with get_driver().session() as session:
        res = session.run(q, id=id)
    return [row.data() for row in res]