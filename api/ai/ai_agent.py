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

        return rec.data() if rec else {"error": "Transação não encontrada."}



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

              Nunca responda apenas dados crus.
              Sempre gere uma explicação profissional, incluindo interpretações, implicações e possíveis alertas.
            """
        )

        return final.output_text

    # ========================================================
    # 4) Se não usou tool → mensagem normal
    # ========================================================
    if out.type == "message":
        return out.content[0].text

    return f"[ERRO] Tipo inesperado: {out.type}"