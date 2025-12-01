from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter()

@router.get("/overview")
def metrics_overview():
    with get_driver().session() as session:

        query = """
        // =======================
        // 1. Transações HOJE
        // =======================
        MATCH (:Account)-[t:SENT]->()
        WHERE date(t.ts) = date()
        WITH 
            count(t) AS transacoes_hoje

        // =======================
        // 2. Transações suspeitas HOJE
        // =======================
        CALL {
            MATCH (src:Account)-[s:SENT]->(dst:Account)
            WHERE date(s.ts) = date()

            OPTIONAL MATCH ()-[r:SENT]->(dst)
            WITH s, dst, count(r) AS fanin

            WITH s,
                CASE 
                    WHEN s.amount >= 8000 AND fanin >= 20 THEN 1
                    WHEN s.amount >= 15000 AND fanin >= 10 THEN 1
                    WHEN dst.risk_score >= 85 THEN 1
                    ELSE 0
                END AS is_suspect

            RETURN sum(is_suspect) AS suspeitas_hoje
        }

        // =======================
        // 3. Fraudes confirmadas
        // =======================
        CALL {
            MATCH (a:Account)
            WHERE a.risk_score >= 95
            RETURN count(a) AS fraudes_confirmadas
        }

        // =======================
        // 4. Score médio últimas 24h
        // =======================
        CALL {
            MATCH (a:Account)-[s:SENT]->()
            WHERE s.ts >= datetime() - duration('P1D')
            RETURN avg(a.risk_score) AS avg_score_24h
        }

        // =======================
        // 5. Média e máximo do valor transacionado
        // =======================
        CALL {
            MATCH (:Account)-[t:SENT]->()
            RETURN avg(t.amount) AS avg_amount, max(t.amount) AS max_amount
        }

        RETURN
            transacoes_hoje,
            suspeitas_hoje,
            fraudes_confirmadas,
            avg_score_24h,
            avg_amount,
            max_amount
        """

        result = session.run(query).single()
        return result.data()
        
@router.get("/risk-transactions")
def get_risk_transactions():
    with get_driver().session() as session:

        # ================
        # 1) Baseline global
        # ================
        baseline_query = """
        MATCH (:Account)-[s:SENT]->()
        RETURN avg(s.amount) AS g_avg, stDev(s.amount) AS g_sd
        """

        baseline = session.run(baseline_query).single()
        g_avg = baseline["g_avg"] or 0
        g_sd = baseline["g_sd"] or 0.00001  # evita divisão por zero

        # ================
        # 2) Query principal
        # ================
        query = """
        MATCH (src:Account)-[s:SENT]->(dst:Account)
        WITH
            date(s.ts) AS day,
            s.amount AS amount,
            src, dst,
            $g_avg AS g_avg,
            $g_sd AS g_sd

        // fanin
        OPTIONAL MATCH ()-[fx:SENT]->(dst)
        WITH day, amount, src, dst, g_avg, g_sd, count(fx) AS fanin_dst

        // fanout
        OPTIONAL MATCH (src)-[fy:SENT]->()
        WITH day, amount, fanin_dst, g_avg, g_sd, count(fy) AS fanout_src

        // regras
        WITH
            day,
            CASE WHEN amount > g_avg + g_sd * 2 THEN 1 ELSE 0 END AS rule_high_value,
            CASE WHEN fanin_dst >= 10 THEN 1 ELSE 0 END AS rule_high_fanin,
            CASE WHEN fanin_dst >= 5 AND fanout_src <= 1 THEN 1 ELSE 0 END AS rule_mule

        // agregação
        WITH
            day,
            (rule_high_value + rule_high_fanin + rule_mule) AS score

        RETURN
            day,
            count(*) AS total_tx,
            sum(CASE WHEN score > 0 THEN 1 ELSE 0 END) AS suspicious_tx,
            avg(score) * 33 AS avg_risk
        ORDER BY day ASC
        LIMIT 30
        """

        result = [
            {
                "date": str(r["day"]),
                "transactions": r["total_tx"],
                "suspicious": r["suspicious_tx"],
                "avg_risk": r["avg_risk"],
            }
            for r in session.run(query, {"g_avg": g_avg, "g_sd": g_sd})
        ]

        return result


@router.get("/recent-suspicions")
def recent_suspicions():
    with get_driver().session() as session:

        query = """
        MATCH (src:Account)-[s:SENT]->(dst:Account)
        WHERE s.ts >= datetime() - duration('P1D')

        OPTIONAL MATCH ()-[r:SENT]->(dst)
        WITH src, dst, s, count(r) AS fanin

        WITH 
            src, dst, s, fanin,
            CASE
                WHEN s.amount >= 8000 AND fanin >= 20 THEN "High-value & High-FanIn"
                WHEN dst.risk_score >= 85 THEN "High Risk Score"
                WHEN fanin >= 30 THEN "FanIn Spike"
                ELSE null
            END AS reason

        WHERE reason IS NOT NULL

        RETURN
            dst.id AS account,
            dst.community AS community,
            fanin,
            s.amount AS amount,
            s.channel AS channel,
            dst.risk_score AS risk,
            reason,
            s.ts AS ts
        ORDER BY s.ts DESC
        LIMIT 50
        """

        return [
            {
                "account": r["account"],
                "community": r["community"],
                "fanin": r["fanin"],
                "amount": r["amount"],
                "channel": r["channel"],
                "risk": r["risk"],
                "reason": r["reason"],
                "ts": str(r["ts"]),
            }
            for r in session.run(query)
        ]