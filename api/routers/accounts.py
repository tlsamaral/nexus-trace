from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from neo4j_client import get_driver
from datetime import datetime

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
  
@router.get("/{account_id}/anomalies")
def account_anomalies(account_id: int):
    with get_driver().session() as session:

        raw = session.run("""
            MATCH (a:Account {id: $id})

            OPTIONAL MATCH ()-[t1:SENT]->(a)
            WITH a, count(t1) AS fanin

            OPTIONAL MATCH (a)-[t2:SENT]->()
            WITH a, fanin, count(t2) AS fanout

            OPTIONAL MATCH (a)-[t3:SENT]->()
            WHERE t3.amount >= 5000
            WITH a, fanin, fanout, collect(t3.amount) AS high_values

            RETURN fanin, fanout, high_values, a.community AS community
        """, {"id": account_id}).single()

        fanin = raw["fanin"]
        fanout = raw["fanout"]
        large = raw["high_values"]
        community = raw["community"]

        anomalies = []

        # ---------------------------------------------
        # FAN-IN
        # ---------------------------------------------
        if fanin >= 40:
            anomalies.append({
                "title": "High Fan-In",
                "description": f"A conta recebeu {fanin} entradas recentes — padrão típico de conta mula.",
                "severity": "high"
            })
        elif fanin >= 20:
            anomalies.append({
                "title": "Fan-In Elevado",
                "description": f"A conta recebeu {fanin} entradas, acima do normal.",
                "severity": "medium"
            })
        elif fanin >= 10:
            anomalies.append({
                "title": "Fan-In Moderado",
                "description": f"A conta recebeu {fanin} entradas em pouco tempo.",
                "severity": "low"
            })

        # ---------------------------------------------
        # FAN-OUT
        # ---------------------------------------------
        if fanout >= 60:
            anomalies.append({
                "title": "High Fan-Out",
                "description": f"A conta enviou {fanout} transações — possível comportamento de roteamento ilícito.",
                "severity": "high"
            })
        elif fanout >= 40:
            anomalies.append({
                "title": "Fan-Out Elevado",
                "description": f"A conta enviou {fanout} transações — atividade incomum.",
                "severity": "medium"
            })

        # ---------------------------------------------
        # LARGE TRANSFERS
        # ---------------------------------------------
        if len(large) >= 5:
            anomalies.append({
                "title": "Transações de Alto Valor",
                "description": f"Foram detectadas {len(large)} transações acima de R$ 5.000.",
                "severity": "high"
            })
        elif len(large) >= 3:
            anomalies.append({
                "title": "Valores Elevados",
                "description": f"Foram detectadas {len(large)} transações de valor elevado.",
                "severity": "medium"
            })
        elif len(large) >= 1:
            anomalies.append({
                "title": "Transação de Alto Valor",
                "description": f"Houve {len(large)} operação acima de R$ 5.000.",
                "severity": "low"
            })

        # ---------------------------------------------
        # COMMUNITY RISK
        # ---------------------------------------------
        if community is not None and community >= 5:
            anomalies.append({
                "title": "High-Risk Community",
                "description": "A conta pertence a uma comunidade altamente conectada e marcada como suspeita.",
                "severity": "high"
            })

        return anomalies

        
@router.get("/{account_id}/explainability")
def explainability(account_id: int):
    with get_driver().session() as session:

        # ================================
        # 1) Fan-in e valor das transações
        # ================================
        result = session.run("""
            MATCH (a:Account {id: $id})

            OPTIONAL MATCH ()-[in:SENT]->(a)
            WITH a, count(in) AS fanin, avg(in.amount) AS avg_in_amount

            RETURN fanin, avg_in_amount
        """, {"id": account_id}).single()

        fanin = result["fanin"] or 0
        avg_amount = result["avg_in_amount"] or 0

        # ================================
        # 2) Risco da Comunidade
        # ================================
        community = session.run("""
            MATCH (a:Account {id: $id})
            RETURN a.community AS community
        """, {"id": account_id}).single()["community"]

        # comunidade pode não ter risco → normalizamos
        community_risk = (community % 100) / 10 if community else 0   # 0–10

        # ================================
        # 3) Cálculo dos componentes
        # ================================
        fanin_score = min(fanin * 0.5, 20)           # até 20 pts
        amount_score = min(avg_amount / 500, 20)      # valores altos puxam risco
        community_score = min(community_risk, 20)     # até 20 pts

        total_score = round(fanin_score + amount_score + community_score, 2)

        return {
            "total": total_score,
            "fanin": round(fanin_score, 2),
            "amount": round(amount_score, 2),
            "community": round(community_score, 2),
        }

@router.get("/{account_id}/timeline")
def account_timeline(account_id: str):
    with get_driver().session() as session:

        query = """
        // Tornar o id disponível
        WITH toInteger($id) AS id

        // Subquery única que junta tudo via UNION ALL
        CALL {
            // ===========================
            // 1) ÚLTIMAS TRANSAÇÕES ENVIADAS
            // ===========================
            WITH id
            MATCH (src:Account {id: id})-[t:SENT]->(dst)
            RETURN 
                t.ts AS ts,
                'tx' AS type,
                'Enviou R$ ' + toString(t.amount) + ' para conta ' + toString(dst.id) AS text

            UNION ALL

            // ===========================
            // 2) ÚLTIMAS TRANSAÇÕES RECEBIDAS
            // ===========================
            WITH id
            MATCH (src)-[t:SENT]->(dst:Account {id: id})
            RETURN 
                t.ts AS ts,
                'tx' AS type,
                'Recebeu R$ ' + toString(t.amount) + ' de conta ' + toString(src.id) AS text

            UNION ALL

            // ===========================
            // 3) EVENTOS SUSPEITOS
            // ===========================
            WITH id
            MATCH (src)-[s:SENT]->(dst:Account {id: id})
            OPTIONAL MATCH ()-[fx:SENT]->(dst)
            WITH s, src, dst, count(fx) AS fanin
            WHERE s.amount >= 8000 OR fanin >= 20 OR dst.risk_score >= 85

            RETURN 
                s.ts AS ts,
                'alert' AS type,
                '⚠️ Evento suspeito: valor R$ ' + toString(s.amount)
                    + ' | fan-in=' + toString(fanin) AS text

            UNION ALL

            // ===========================
            // 4) INFO GERAL
            // ===========================
            WITH id
            MATCH (a:Account {id: id})
            RETURN 
                a.lastActivity AS ts,
                'info' AS type,
                'Última atividade registrada' AS text
        }

        RETURN ts, type, text
        ORDER BY ts DESC
        LIMIT 25
        """

        rows = session.run(query, {"id": account_id})

        return [
            {
                "ts": str(r["ts"]),
                "type": r["type"],
                "text": r["text"],
            }
            for r in rows
        ]


@router.get("/{account_id}/prediction")
def account_prediction(account_id: str):
    """
    Predição simples de risco futuro baseada em:
    - fan-in recentes
    - valores altos enviados/recebidos
    - comunidade (fraude em cluster tende a se espalhar)
    - score atual da conta
    """

    with get_driver().session() as session:

        query = """
        WITH toInteger($id) AS id

        // ============================
        // 1) INFO DA CONTA
        // ============================
        MATCH (a:Account {id: id})
        WITH a

        // ============================
        // 2) FAN-IN NAS ÚLTIMAS 24H
        // ============================
        OPTIONAL MATCH ()-[s:SENT]->(a)
        WHERE s.ts >= datetime() - duration('P1D')
        WITH a, count(s) AS fanin_24h

        // ============================
        // 3) TRANSFERÊNCIAS ALTAS 24H
        // ============================
        OPTIONAL MATCH (a)-[t:SENT]->()
        WHERE t.ts >= datetime() - duration('P1D') AND t.amount >= 3000
        WITH a, fanin_24h, count(t) AS high_value_24h

        // ============================
        // 4) RISCO DA COMUNIDADE
        // ============================
        OPTIONAL MATCH (o:Account)
        WHERE o.community = a.community
        WITH a, fanin_24h, high_value_24h, avg(o.risk_score) AS community_risk

        // ============================
        // 5) SCORE FINAL DE PREDIÇÃO
        // ============================
        WITH
            a,
            fanin_24h,
            high_value_24h,
            community_risk,
            // modelo heurístico simples (0–100)
            (fanin_24h * 1.5) +
            (high_value_24h * 4) +
            (community_risk * 0.4) +
            (a.risk_score * 0.8) AS predicted_risk

        RETURN
            predicted_risk,
            fanin_24h,
            high_value_24h,
            community_risk,
            a.risk_score AS current_risk
        """

        rec = session.run(query, {"id": account_id}).single()

        if not rec:
            return {
                "risk": 0,
                "horizon_hours": 12,
                "updated_at": datetime.now().isoformat()
            }

        # Normaliza risco (0–100)
        risk_value = float(rec["predicted_risk"])
        risk_value = max(0, min(100, risk_value))

        return {
            "risk": round(risk_value, 2),
            "horizon_hours": 12,  # fixo para agora
            "updated_at": datetime.now().isoformat()
        }