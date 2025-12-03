from openai import OpenAI
from neo4j_client import get_driver
import os
import json

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ============================================================
# 1) FUNÇÕES DAS TOOLS
# ============================================================

def tool_get_account_summary(id: int):
    with get_driver().session() as session:
        rec = session.run("""
            MATCH (a:Account {id: $id})
            OPTIONAL MATCH (a)-[s:SENT]->()
            OPTIONAL MATCH ()-[r:SENT]->(a)
            RETURN
                a.id AS id,
                a.community AS community,
                a.risk_score AS risk,
                count(r) AS fanin,
                count(s) AS fanout,
                coalesce(sum(s.amount), 0) AS volume24h
        """, {"id": id}).single()

        return rec.data() if rec else {"error": "Conta não encontrada."}


def tool_get_account_anomalies(id: int):
    from routers.accounts import account_anomalies
    return account_anomalies(id)


def tool_get_account_prediction(id: int):
    from routers.accounts import account_prediction
    return account_prediction(id)


def tool_get_account_transactions(id: int):
    from routers.accounts import account_transactions
    return account_transactions(id)


def tool_get_transaction_details(tx_id: int):
    with get_driver().session() as session:
        rec = session.run("""
            MATCH (a)-[t:SENT]->(b)
            WHERE id(t) = $id
            RETURN
                id(t) AS id,
                a.id AS src,
                b.id AS dst,
                t.amount AS amount,
                t.ts AS ts,
                a.community AS community_src,
                b.community AS community_dst
        """, {"id": tx_id}).single()

        data = rec.data()

        if "ts" in data and hasattr(data["ts"], "iso_format"):
            data["ts"] = data["ts"].iso_format()

        return data

def tool_test_generate_data():
    from routers.tests import get_test_data
    return get_test_data()

def tool_test_transaction(origin_id: int, dest_id: int, amount: float, threshold: float):
    from routers.tests import test_transaction
    payload = {
        "origin_id": origin_id,
        "dest_id": dest_id,
        "amount": amount,
        "threshold": threshold
    }
    return test_transaction(payload)
# ============================================================
# 2) DEFINIÇÃO DAS TOOLS
# ============================================================

TOOLS = [
    {
        "type": "function",
        "name": "getAccountSummary",
        "description": "Resumo completo da conta antifraude.",
        "parameters": {
            "type": "object",
            "properties": {
                "id": { "type": "integer" }
            },
            "required": ["id"]
        }
    },
    {
        "type": "function",
        "name": "getAccountAnomalies",
        "description": "Anomalias detectadas na conta.",
        "parameters": {
            "type": "object",
            "properties": {
                "id": { "type": "integer" }
            },
            "required": ["id"]
        }
    },
    {
        "type": "function",
        "name": "getAccountPrediction",
        "description": "Predição de risco futuro da conta.",
        "parameters": {
            "type": "object",
            "properties": {
                "id": { "type": "integer" }
            },
            "required": ["id"]
        }
    },
    {
        "type": "function",
        "name": "getAccountTransactions",
        "description": "Lista transações enviadas pela conta.",
        "parameters": {
            "type": "object",
            "properties": {
                "id": { "type": "integer" }
            },
            "required": ["id"]
        }
    },
    {
        "type": "function",
        "name": "getTransactionDetails",
        "description": "Detalhes de uma transação específica.",
        "parameters": {
            "type": "object",
            "properties": {
                "tx_id": { "type": "integer" }
            },
            "required": ["tx_id"]
        }
    },
    {
        "type": "function",
        "name": "generateTestScenario",
        "description": "Gera duas contas aleatórias e um threshold para simulação de fraude.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "type": "function",
        "name": "simulateTransaction",
        "description": "Simula uma transação de teste e calcula risco.",
        "parameters": {
            "type": "object",
            "properties": {
                "origin_id": { "type": "integer" },
                "dest_id": { "type": "integer" },
                "amount": { "type": "number" },
                "threshold": { "type": "number" }
            },
            "required": ["origin_id", "dest_id", "amount", "threshold"]
        }
    }
]

# ============================================================
# 3) SYSTEM RULES (INTERPRETAÇÃO DO USUÁRIO)
# ============================================================

SYSTEM_RULES = """
Você é um assistente antifraude. Interprete comandos como:

- "mostre a conta 12"
- "resumo da conta 30"
- "anomalias da conta 50"
- "transações da conta 8"
- "detalhes da transação 200"

Sempre que ler:
- "conta X" → getAccountSummary(id=X)
- "anomalias da conta X" → getAccountAnomalies(id=X)
- "predição da conta X" → getAccountPrediction(id=X)
- "transações da conta X" → getAccountTransactions(id=X)
- "transação X" → getTransactionDetails(tx_id=X)

Comandos de testes:
- "gerar cenário de teste"
- "simular transação"
- "criar cenário"
- "testar transação de 100 para contas x e y"
- "simular transferência de 5000 da conta 10 para a 300"

Mapeamentos:
- cenário de teste → generateTestScenario()
- simulação de transação → simulateTransaction()

Use regex para extrair números.
Quando não houver dados suficientes, peça os valores faltantes (origin_id, dest_id, amount) se o threshold não for fornecido no comando calcule com um aleatorio entre: 1000, 2000, 3000, 5000, 8000.

Extraia o número com regex.
Você precisa retornas no arguments os parametros da tool.
"""



# ============================================================
# 4) AGENTE PRINCIPAL
# ============================================================

def ask_ai(user_message: str):
    input_list = [
        {"role": "system", "content": SYSTEM_RULES},
        {"role": "user", "content": user_message}
    ]

    # 1) Modelo interpreta o pedido
    response = client.responses.create(
        model="gpt-4.1",
        input=input_list,
        tools=TOOLS,
        tool_choice="auto"
    )

    input_list += response.output

    out = response.output[0]
    print("🤖 RESPOSTA →", out)

    # ========================================================
    # 2) O modelo decidiu chamar uma tool
    # ========================================================
    if out.type == "function_call":
        name = out.name
        args = json.loads(out.arguments)
        tool_call_id = out.call_id  # <<< AQUI ESTÁ O ID CERTO

        print("🔧 TOOL CALL →", name, args)

        # Executa a tool
        fn = {
            "getAccountSummary": tool_get_account_summary,
            "getAccountAnomalies": tool_get_account_anomalies,
            "getAccountPrediction": tool_get_account_prediction,
            "getAccountTransactions": tool_get_account_transactions,
            "getTransactionDetails": tool_get_transaction_details,
            "generateTestScenario": tool_test_generate_data,
            "simulateTransaction": tool_test_transaction,
        }[name]

        result = fn(**args)

        # ========================================================
        # 3) SEGUNDA CHAMADA → devolvendo resultado da tool
        # ========================================================
        input_list.append({
                "type": "function_call_output",
                "call_id": tool_call_id,
                "output": json.dumps({
                  "result": result
                })
            })

        print(input_list)

        final = client.responses.create(
            model="gpt-4.1",
            input=input_list,
            tools=TOOLS,
            instructions="""
              Você agora deve gerar uma resposta final ao usuário baseada no resultado da ferramenta.
              Formate a resposta de forma clara, profissional e detalhada, como um analista antifraude sênior.

              Quando o resultado vier de:
              - getAccountSummary → gere um RELATÓRIO DA CONTA
              - getAccountAnomalies → gere uma ANÁLISE DE ANOMALIAS
              - getAccountPrediction → gere uma ANÁLISE DE RISCO FUTURO
              - getAccountTransactions → gere um RESUMO DE TRANSACOES
              - getTransactionDetails → gere um DETALHAMENTO DE TRANSACAO
              - generateTestScenario → explique o cenário gerado e o que cada dado significa.
              - simulateTransaction → gere uma análise de risco detalhada, explique o cálculo e mostre se seria fraude.

              Nunca responda apenas dados crus.
              Sempre gere uma explicação profissional, incluindo interpretações, implicações e possíveis alertas, porém não precisa parecer um robô falando, pode ser profissional mas com um tom mais descontraído.

              Quando o retorno for para Analise de risco simulada, remove informaçoes de threshold, não faça recomendações que vá além do contexto de teste.

              Sempre use markdown estilizado com espaámento de 2.
            """
        )

        return final.output_text

    # ========================================================
    # 4) Se não usou tool → mensagem normal
    # ========================================================
    if out.type == "message":
        return out.content[0].text
    print("🤖 ERRO →", out)
    return f"[ERRO] Tipo inesperado: {out.type}"