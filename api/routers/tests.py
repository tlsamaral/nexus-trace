from fastapi import APIRouter
from neo4j_client import get_driver
import random

router = APIRouter(tags=["Fraud Test"])


# ---------------------------------------------------
# 🔵 1) ROTA — Gera cenário de teste
# ---------------------------------------------------
@router.get("/data")
def get_test_data():
    with get_driver().session() as session:

        # escolhe 2 contas aleatórias
        q = """
        MATCH (a:Account)
        RETURN a.id AS id, a.community AS community, a.risk_score AS risk
        ORDER BY rand()
        LIMIT 2
        """
        accounts = [r.data() for r in session.run(q)]

        origin = accounts[0]
        dest = accounts[1]

        # threshold aleatório para simulação
        threshold = random.choice([1000, 2000, 3000, 5000, 8000])

        explain = (
            "Este valor foi gerado como limite artificial para simulação de fraude. "
            "Transações iguais ou superiores ao threshold são marcadas como suspeitas "
            "porque valores altos geralmente indicam comportamento atípico."
        )

        return {
            "origin": origin,
            "dest": dest,
            "threshold": threshold,
            "explain": explain
        }


# ---------------------------------------------------
# 🔵 2) ROTA — Testa transação simulada
# ---------------------------------------------------
@router.post("/transaction")
def test_transaction(payload: dict):
    origin_id = payload["origin_id"]
    dest_id = payload["dest_id"]
    value = float(payload["amount"])
    threshold = float(payload["threshold"])

    # regra simples de risco
    risk = 0

    # quanto maior o valor acima do limite → mais risco
    if value >= threshold:
        risk += min(70 + ((value - threshold) / threshold) * 30, 100)

    # risco adicional baseado na distância de comunidades
    if abs(origin_id - dest_id) > 200:
        risk += 10

    is_fraud = risk >= 70

    explain = []

    if value >= threshold:
        explain.append(f"Valor enviado (R$ {value:,.2f}) é maior que o threshold definido (R$ {threshold:,.2f}).")

    if abs(origin_id - dest_id) > 200:
        explain.append("Diferença entre contas sugere baixa afinidade transacional.")

    if is_fraud:
        explain.append("Score final ultrapassou 70%, sendo classificado como fraude.")
    else:
        explain.append("Score final ficou abaixo do limite de risco.")

    return {
        "risk": round(min(risk, 100), 2),
        "fraud": is_fraud,
        "explain": explain
    }