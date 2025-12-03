from fastapi import APIRouter
from neo4j_client import get_driver

router = APIRouter(tags=["Fraud Test"])


# ============================================================
# 🔵 FUNÇÃO AUXILIAR — Calcula métricas reais entre duas contas
# ============================================================
def calculate_real_threshold(session, origin_id: int, dest_id: int):
    q = """
    MATCH (o:Account {id: $origin_id})-[t:SENT]->(d:Account {id: $dest_id})
    RETURN avg(t.amount) AS avg, stdev(t.amount) AS std, count(t) AS total
    """
    rec = session.run(q, {"origin_id": origin_id, "dest_id": dest_id}).single()

    if not rec or rec["total"] == 0:
        return {
            "avg": 0,
            "std": 0,
            "threshold": 0,
            "total": 0,
        }

    avg = rec["avg"] or 0
    std = rec["std"] or 0

    # threshold real com base na dispersão dos valores
    threshold = avg + (std * 2.5)

    return {
        "avg": avg,
        "std": std,
        "threshold": threshold,
        "total": rec["total"],
    }


# ============================================================
# 🔵 1) ROTA — Gera cenário REAL de teste
# ============================================================
from fastapi import APIRouter
from neo4j_client import get_driver
from neo4j.time import DateTime, Date, Time  # necessário para limpar objetos do Neo4j

router = APIRouter(tags=["Fraud Test"])


@router.get("/data")
def get_test_data():
    with get_driver().session() as session:

        # Seleciona o par de contas com mais transações entre si
        q = """
        MATCH (a:Account)-[t:SENT]->(b:Account)
        WITH a, b, count(t) AS freq
        WITH a, b, freq, rand() * freq AS score
        ORDER BY score DESC
        LIMIT 1
        RETURN a AS origin, b AS dest
        """
        rec = session.run(q).single()

        if not rec:
            return {"error": "Não há dados suficientes no grafo para gerar cenário de teste."}

        # =====================================================
        # 🔵 LIMPA propriedades Neo4j (DateTime, Date, Time etc)
        # =====================================================

        def clean(value):
            if isinstance(value, (DateTime, Date, Time)):
                return value.iso_format()
            if isinstance(value, dict):
                return {k: clean(v) for k, v in value.items()}
            if isinstance(value, list):
                return [clean(v) for v in value]
            return value

        origin = clean(rec["origin"]._properties)
        dest = clean(rec["dest"]._properties)

        # =====================================================
        # 🔵 CALCULA threshold REAL inline
        # =====================================================

        q2 = """
        MATCH (o:Account {id: $origin})-[t:SENT]->(d:Account {id: $dest})
        RETURN avg(t.amount) AS avg, stdev(t.amount) AS std, count(t) AS total
        """

        rec2 = session.run(q2, {
            "origin": origin["id"],
            "dest": dest["id"]
        }).single()

        avg = rec2["avg"] or 0
        std = rec2["std"] or 0
        total = rec2["total"] or 0

        threshold = avg + (std * 2.5) if total > 0 else 0

        # =====================================================
        # 🔵 MONTA explicação
        # =====================================================
        explain = (
            f"O threshold foi calculado com base nas transações reais entre as contas "
            f"{origin['id']} e {dest['id']}. "
            f"A média dos valores é R$ {avg:,.2f} e o desvio padrão é R$ {std:,.2f}. "
            f"Threshold = média + 2.5 × desvio padrão."
        )

        # =====================================================
        # 🔵 RETORNO FINAL
        # =====================================================
        return {
            "origin": origin,
            "dest": dest,
            "mean": avg,
            "std_dev": std,
            "threshold": threshold,
            "total_transactions_analyzed": total,
            "explain": explain,
        }

# ============================================================
# 🔵 2) ROTA — Testa transação REAL (sem enviar threshold)
# ============================================================
@router.post("/transaction")
def test_transaction(payload: dict):
    origin_id = payload["origin_id"]
    dest_id = payload["dest_id"]
    value = float(payload["amount"])

    with get_driver().session() as session:
        # Calcula threshold real novamente
        metrics = calculate_real_threshold(session, origin_id, dest_id)
        threshold = metrics["threshold"]

    risk = 0
    explain = []

    # Regras reais de fraude
    if threshold > 0 and value >= threshold:
        explain.append(
            f"Valor enviado (R$ {value:,.2f}) é maior que o threshold histórico (R$ {threshold:,.2f})."
        )
        risk += min(70 + ((value - threshold) / threshold) * 30, 100)
    else:
        explain.append(
            f"Valor enviado está dentro do comportamento histórico entre as contas "
            f"(média ~ R$ {metrics['avg']:,.2f})."
        )

    # Risco pela distância das comunidades
    if abs(origin_id - dest_id) > 200:
        risk += 10
        explain.append("Diferença entre contas sugere baixa afinidade transacional.")

    # Classificação final
    is_fraud = risk >= 70

    if is_fraud:
        explain.append("Score final ultrapassou 70%, sendo classificado como fraude.")
    else:
        explain.append("Score final ficou abaixo do limite de risco.")

    return {
        "origin_id": origin_id,
        "dest_id": dest_id,
        "amount": value,
        "risk": round(min(risk, 100), 2),
        "fraud": is_fraud,
        "threshold_used": threshold,
        "stats": {
            "mean": metrics["avg"],
            "std_dev": metrics["std"],
            "transactions_analyzed": metrics["total"],
        },
        "explain": explain,
    }