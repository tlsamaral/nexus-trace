from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()


@router.get("/")
def list_all_transactions(limit: int = 200):
    """
    Retorna transações do grafo no formato ideal para o frontend.
    """
    query = """
    MATCH (a:Account)-[r:SENT]->(b:Account)
    RETURN
        toString(id(r)) AS id,
        a.id AS src,
        b.id AS dst,
        r.amount AS amount,
        toString(r.ts) AS ts,
        coalesce(r.channel, "desconhecido") AS channel,
        CASE  
            WHEN r.amount >= 5000 THEN 90
            WHEN r.amount >= 2000 THEN 70
            WHEN r.amount >= 500 THEN 40
            ELSE 10
        END AS risk,
        a.community AS community_src,
        b.community AS community_dst
    ORDER BY r.ts DESC
    LIMIT $limit
    """

    with get_driver().session() as session:
        result = session.run(query, limit=limit)
        return [record.data() for record in result]