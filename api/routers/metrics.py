from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()

@router.get("/overview")
def metrics_overview():
    q = """
    MATCH (:Account)-[r:SENT]->()
    RETURN 
        count(r) AS total_txs,
        avg(r.amount) AS avg_amount,
        max(r.amount) AS max_amount
    """
    with get_driver().session() as session:
        rec = session.run(q).single()
    return rec.data()