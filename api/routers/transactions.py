from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()


@router.get("/")
def list_all_transactions(limit: int = 200):
    """
    Retorna transações com risco e flag de suspeita,
    usando a mesma lógica do dashboard analytics.
    """
    query = """
    MATCH (a:Account)-[r:SENT]->(b:Account)

    // calcular fan-in do destino
    OPTIONAL MATCH ()-[fx:SENT]->(b)
    WITH a, b, r, count(fx) AS fanin

    RETURN
        toString(id(r)) AS id,
        a.id AS src,
        b.id AS dst,
        r.amount AS amount,
        toString(r.ts) AS ts,
        coalesce(r.channel, "desconhecido") AS channel,

        // risco baseado apenas no valor (como antes)
        CASE  
            WHEN r.amount >= 5000 THEN 90
            WHEN r.amount >= 2000 THEN 70
            WHEN r.amount >= 500 THEN 40
            ELSE 10
        END AS risk,

        // flag de suspeita (mesma lógica do overview)
        CASE
            WHEN r.amount >= 8000
              OR fanin >= 20
              OR b.risk_score >= 85
            THEN true
            ELSE false
        END AS suspicious,

        a.community AS community_src,
        b.community AS community_dst

    ORDER BY r.ts DESC
    LIMIT $limit
    """

    with get_driver().session() as session:
        result = session.run(query, limit=limit)
        return [record.data() for record in result]

@router.get("/{tx_id}")
def get_transaction_details(tx_id: str):
    with get_driver().session() as session:

        query = """
        MATCH (src:Account)-[t:SENT]->(dst:Account)
        WHERE id(t) = toInteger($id)

        OPTIONAL MATCH ()-[fx:SENT]->(dst)
        WITH src, dst, t, count(fx) AS fanin

        WITH src, dst, t, fanin,
            CASE
                WHEN t.amount >= 8000 OR fanin >= 20 OR dst.risk_score >= 85 THEN true
                ELSE false
            END AS suspicious,
            (
                (CASE WHEN t.amount >= 8000 THEN 30 ELSE 0 END) +
                (CASE WHEN fanin >= 20 THEN 40 ELSE 0 END) +
                (CASE WHEN dst.risk_score >= 85 THEN 30 ELSE 0 END)
            ) AS score

        RETURN {
            id: toString(id(t)),
            src: src.id,
            dst: dst.id,
            amount: t.amount,
            ts: toString(t.ts),
            channel: t.channel,
            community_src: src.community,
            community_dst: dst.community,
            suspicious: suspicious,
            risk_score: score,
            fanin: fanin,
            dst_risk: dst.risk_score
        } AS tx
        """

        row = session.run(query, {"id": tx_id}).single()

        if not row:
            return {"error": "Transaction not found"}

        return row["tx"]