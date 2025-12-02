from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()


@router.get("/")
def get_analytics():
    with get_driver().session() as session:

        # -----------------------------------------------------
        # 1. Risco médio diário (últimos 7 dias)
        # -----------------------------------------------------
        query_risk_trend = """
          MATCH (a:Account)-[s:SENT]->()
          WITH date(s.ts) AS day, avg(a.risk_score) AS risk
          WITH day, risk
          ORDER BY day DESC
          LIMIT 7
          WITH day, risk
          ORDER BY day ASC
          RETURN day, risk
          """

        risk_trend = [
            {"day": str(r["day"]), "risk": r["risk"]}
            for r in session.run(query_risk_trend)
        ]

        # -----------------------------------------------------
        # 2. Distribuição de scores (contas agrupadas)
        # -----------------------------------------------------
        query_score_distribution = """
        MATCH (a:Account)
        RETURN
            sum(CASE WHEN a.risk_score <= 20 THEN 1 ELSE 0 END) AS r0_20,
            sum(CASE WHEN a.risk_score > 20 AND a.risk_score <= 40 THEN 1 ELSE 0 END) AS r21_40,
            sum(CASE WHEN a.risk_score > 40 AND a.risk_score <= 60 THEN 1 ELSE 0 END) AS r41_60,
            sum(CASE WHEN a.risk_score > 60 AND a.risk_score <= 80 THEN 1 ELSE 0 END) AS r61_80,
            sum(CASE WHEN a.risk_score > 80 THEN 1 ELSE 0 END) AS r81_100
        """

        distrib = session.run(query_score_distribution).single()

        score_distribution = [
            {"range": "0–20", "count": distrib["r0_20"]},
            {"range": "21–40", "count": distrib["r21_40"]},
            {"range": "41–60", "count": distrib["r41_60"]},
            {"range": "61–80", "count": distrib["r61_80"]},
            {"range": "81–100", "count": distrib["r81_100"]},
        ]

        # -----------------------------------------------------
        # 3. Uso de canais (PIX, TED, boleto...)
        # -----------------------------------------------------
        query_channels = """
        MATCH ()-[s:SENT]->()
        RETURN s.channel AS channel, count(s) AS total
        """

        channel_usage = [
            {"channel": r["channel"], "value": r["total"]}
            for r in session.run(query_channels)
        ]

        # -----------------------------------------------------
        # 4. Fan-in / Fan-out de contas mais ativas
        # -----------------------------------------------------
        query_fanin_out = """
        MATCH (a:Account)
        OPTIONAL MATCH ()-[r1:SENT]->(a)
        OPTIONAL MATCH (a)-[r2:SENT]->()
        RETURN a.id AS id, count(r1) AS fanin, count(r2) AS fanout
        ORDER BY fanin + fanout DESC
        LIMIT 10
        """

        fan_in_out = [
            {"account": rec["id"], "fanin": rec["fanin"], "fanout": rec["fanout"]}
            for rec in session.run(query_fanin_out)
        ]

        # -----------------------------------------------------
        # 5. Distribuição de comunidades (tamanho)
        # -----------------------------------------------------
        query_communities = """
        MATCH (a:Account)
        WHERE a.community IS NOT NULL
        RETURN a.community AS community, count(a) AS total
        ORDER BY total DESC
        LIMIT 5
        """

        top_communities = session.run(query_communities)

        community_distribution = [
            {"name": f"Comunidade {r['community']}", "value": r["total"]}
            for r in top_communities
        ]

        # -----------------------------------------------------
        # 6. Top contas suspeitas (maior risco)
        # -----------------------------------------------------
        query_suspicious = """
          MATCH (a:Account)
          WHERE a.risk_score IS NOT NULL

          WITH a,
              COUNT {
                  MATCH ()-[r:SENT]->(a)
              } AS fanin

          RETURN
              a.id AS id,
              a.risk_score AS risk,
              a.community AS community,
              fanin
          ORDER BY risk DESC
          LIMIT 10
          """

        top_suspicious = [
            {
                "id": rec["id"],
                "risk": rec["risk"],
                "fanin": rec["fanin"],
                "community": rec["community"],
            }
            for rec in session.run(query_suspicious)
        ]

        # -----------------------------------------------------
        # 7. Retorno final para a UI
        # -----------------------------------------------------
        return {
            "risk_trend": risk_trend,
            "score_distribution": score_distribution,
            "channel_usage": channel_usage,
            "fan_in_out": fan_in_out,
            "community_distribution": community_distribution,
            "top_suspicious": top_suspicious,
        }

@router.get("/overview")
def analytics_overview():
    with get_driver().session() as session:

        query = """
        // =======================
        // RISCO MÉDIO (HOJE)
        // =======================
        CALL {
            MATCH (a:Account)-[t:SENT]->()
            WHERE date(t.ts) = date()
            RETURN avg(a.risk_score) AS risco_medio_hoje
        }

        // =======================
        // TOTAL DE TRANSAÇÕES (HOJE)
        // =======================
        CALL {
            MATCH (:Account)-[t:SENT]->()
            WHERE date(t.ts) = date()
            RETURN count(t) AS total_transacoes_hoje
        }

        // =======================
        // SUSPEITAS (VALOR ≥ 8000, FANIN ALTO OU RISCO >= 85)
        // =======================
        CALL {
            MATCH (src)-[t:SENT]->(dst)
            WHERE date(t.ts) = date()
            
            OPTIONAL MATCH ()-[r:SENT]->(dst)
            WITH t, dst, count(r) AS fanin

            WITH t,
                CASE
                    WHEN t.amount >= 8000 OR fanin >= 20 OR dst.risk_score >= 85
                        THEN 1 ELSE 0
                END AS suspicious

            RETURN sum(suspicious) AS suspeitas_hoje
        }

        // =======================
        // TOTAL DE COMUNIDADES
        // =======================
        CALL {
            MATCH (a:Account)
            RETURN count(DISTINCT a.community) AS total_comunidades
        }

        RETURN
            risco_medio_hoje,
            total_transacoes_hoje,
            suspeitas_hoje,
            total_comunidades
        """

        row = session.run(query).single()

        return {
            "risk_today": row["risco_medio_hoje"] or 0,
            "transactions_today": row["total_transacoes_hoje"] or 0,
            "suspicions_today": row["suspeitas_hoje"] or 0,
            "communities": row["total_comunidades"] or 0,
        }