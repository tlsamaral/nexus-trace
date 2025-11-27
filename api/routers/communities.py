from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()

@router.get("/")
def list_communities():
    query = """
    MATCH (a:Account)
    WHERE a.community IS NOT NULL
    WITH a.community AS id, collect(a) AS accounts
    WITH id, accounts, size(accounts) AS size

    MATCH (acc)-[s:SENT]->()
    WHERE acc IN accounts
    WITH id, accounts, size, count(s) AS total_tx

    MATCH ()-[r:SENT]->(acc2)
    WHERE acc2 IN accounts
    WITH id, size, total_tx, acc2, count(r) AS fanin_per_account
    WITH id, size, total_tx, collect(fanin_per_account) AS fanin_list

    WITH
      id,
      size,
      total_tx,
      fanin_list,
      (100.0 * size([f IN fanin_list WHERE f > 10])) / size AS high_fanin_pct

    MATCH (acc3:Account)
    WHERE acc3.community = id
    WITH
      id,
      size,
      total_tx,
      high_fanin_pct,
      avg(acc3.risk_score) AS avg_risk

    WITH
      id,
      size,
      total_tx,
      high_fanin_pct,
      avg_risk,
      CASE
        WHEN avg_risk >= 80 THEN 'Crítica'
        WHEN avg_risk >= 40 THEN 'Suspeita'
        ELSE 'Normal'
      END AS status

    RETURN
      id,
      size,
      total_tx,
      high_fanin_pct,
      avg_risk,
      status
    ORDER BY id ASC
    """

    with get_driver().session() as session:
        res = session.run(query)
        return [record.data() for record in res]

@router.get("/{community_id}/details")
def get_community_details(community_id: int):
    with get_driver().session() as session:

        # -----------------------------------------------------
        # 1. Dados gerais da comunidade
        # -----------------------------------------------------
        query_summary = """
        MATCH (a:Account)
        WHERE a.community = $cid
        WITH collect(a) AS accounts

        WITH accounts,
             size(accounts) AS size

        // total de transações geradas pela comunidade
        MATCH (acc)-[s:SENT]->()
        WHERE acc IN accounts
        WITH accounts, size, count(s) AS total_tx

        // fanin por conta
        MATCH ()-[r:SENT]->(acc2)
        WHERE acc2 IN accounts
        WITH accounts, size, total_tx, acc2, count(r) AS fanin_per_account
        WITH accounts, size, total_tx, collect(fanin_per_account) AS fanin_list

        WITH
            size,
            total_tx,
            fanin_list,
            (100.0 * size([f IN fanin_list WHERE f > 10]) / size) AS high_fanin_pct

        RETURN
            size,
            total_tx,
            high_fanin_pct
        """

        summary = session.run(
            query_summary, {"cid": community_id}
        ).single()

        if not summary:
            return {"error": "Community not found"}

        size = summary["size"]
        total_tx = summary["total_tx"]
        high_fanin_pct = summary["high_fanin_pct"]

        # -----------------------------------------------------
        # 2. Score médio (risk_score)
        # -----------------------------------------------------
        query_avg_risk = """
        MATCH (a:Account)
        WHERE a.community = $cid
        RETURN avg(a.risk_score) AS avg_risk
        """

        avg_risk = session.run(
            query_avg_risk, {"cid": community_id}
        ).single()["avg_risk"] or 0.0

        # 3. Histórico de risco da comunidade (média por dia)
        query_risk_history = """
        MATCH (a:Account {community: $cid})-[s:SENT]->()
        WITH date(s.ts) AS day, collect(a.risk_score) AS scores
        WITH day,
            reduce(total = 0.0, x IN scores | total + x) AS sumRisk,
            size(scores) AS countRisk
        RETURN
            day,
            CASE
                WHEN countRisk = 0 THEN 0.0
                ELSE sumRisk / countRisk
            END AS risk
        ORDER BY day ASC
        LIMIT 30
        """     

        risk_history = [
            {"ts": str(r["day"]), "risk": r["risk"]}
            for r in session.run(query_risk_history, {"cid": community_id})
        ]

        # -----------------------------------------------------
        # 4. Distribuição de fan-in
        # -----------------------------------------------------
        query_fanin_dist = """
        MATCH ()-[r:SENT]->(a:Account)
        WHERE a.community = $cid
        WITH a.id AS acc, count(r) AS fanin
        RETURN fanin
        """

        fanins = [record["fanin"] for record in session.run(query_fanin_dist, {"cid": community_id})]

        # cria buckets simples
        bucket_labels = ["0-5", "6-10", "11-20", "21-50", "50+"]
        bucket_values = [0, 0, 0, 0, 0]

        for f in fanins:
            if f <= 5:
                bucket_values[0] += 1
            elif f <= 10:
                bucket_values[1] += 1
            elif f <= 20:
                bucket_values[2] += 1
            elif f <= 50:
                bucket_values[3] += 1
            else:
                bucket_values[4] += 1

        fanin_distribution = {
            "labels": bucket_labels,
            "values": bucket_values,
        }

        # -----------------------------------------------------
        # 5. Top contas mais relevantes da comunidade
        # -----------------------------------------------------
        query_top_accounts = """
        MATCH (a:Account)
        WHERE a.community = $cid

        OPTIONAL MATCH ()-[r1:SENT]->(a)
        OPTIONAL MATCH (a)-[r2:SENT]->()

        RETURN
            a.id AS id,
            count(r1) AS fanin,
            count(r2) AS fanout,
            a.risk_score AS risk_score
        ORDER BY fanin DESC
        LIMIT 10
        """

        top_accounts = [
            {
                "id": rec["id"],
                "fanin": rec["fanin"],
                "fanout": rec["fanout"],
                "risk_score": rec["risk_score"],
            }
            for rec in session.run(query_top_accounts, {"cid": community_id})
        ]

        # -----------------------------------------------------
        # 6. Volume transacionado por dia
        # -----------------------------------------------------
        query_flow_history = """
        MATCH (a:Account {community: $cid})-[s:SENT]->()
        WITH date(s.ts) AS day, sum(s.amount) AS volume
        RETURN day, volume
        ORDER BY day ASC
        LIMIT 30
        """

        flow_history = [
            {"ts": str(r["day"]), "volume": r["volume"]}
            for r in session.run(query_flow_history, {"cid": community_id})
        ]

        # -----------------------------------------------------
        # 7. Retorno final
        # -----------------------------------------------------
        return {
            "id": community_id,
            "size": size,
            "total_tx": total_tx,
            "high_fanin_pct": high_fanin_pct,
            "avg_risk": avg_risk,
            "risk_history": risk_history,
            "fanin_distribution": fanin_distribution,
            "top_accounts": top_accounts,
            "flow_history": flow_history,
        }