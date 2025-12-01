import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# SUA API ORIGINAL
from models import Transaction
from fraud_detector import score_transaction
from websocket_manager import manager
from config import RISK_THRESHOLD

# NOVAS ROTAS
from routers.accounts import router as accounts_router
from routers.metrics import router as metrics_router
from routers.rules import router as rules_router
from routers.graph import router as graph_router
from routers.transactions import router as transactions_router
from routers.communities import router as communities_router
from routers.analytics import router as analytics_router


from gds_initializer import compute_graph_features
from utils.wait_for_neo4j import wait_for_neo4j

from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

app = FastAPI(title="Fraude API (Neo4j + FastAPI)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("⏳ Checando disponibilidade do Neo4j...")

    # Aguarda até Neo4j ficar disponível SEM derrubar o app
    waited = wait_for_neo4j(
        uri=NEO4J_URI,
        user=NEO4J_USER,
        password=NEO4J_PASSWORD,
        timeout=150
    )

    print("⚙️ Executando análise de comunidades (GDS)...")
    compute_graph_features()

# -----------------------------------------------------
# HEALTHCHECK
# -----------------------------------------------------
@app.get("/health")
def health():
    return {"ok": True}


@app.post("/transaction")
async def analyze_transaction(tx: Transaction):
    result = score_transaction(tx.src_account, tx.dst_account, tx.amount)
    risk = result["risk"]

    payload = {
        "type": "TRANSACTION",
        "src_account": tx.src_account,
        "dst_account": tx.dst_account,
        "amount": tx.amount,
        "risk": risk,
        "explanation": result["explanation"]
    }

    # enviar evento para o painel em tempo real
    await manager.broadcast(payload)

    # alertar fraude
    if risk >= RISK_THRESHOLD:
        await manager.broadcast({
            "type": "ALERT",
            "title": "🚨 Fraude detectada",
            "message": f"{tx.src_account} → {tx.dst_account} | R${tx.amount:.2f} | risco {risk}",
            "risk": risk,
            "tx": payload
        })

    return {
        "fraud": risk >= RISK_THRESHOLD,
        "risk": risk,
        "explanation": result["explanation"]
    }


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # apenas para manter conexão
    except WebSocketDisconnect:
        manager.disconnect(websocket)

app.include_router(accounts_router, prefix="/account", tags=["Accounts"])
app.include_router(metrics_router, prefix="/metrics", tags=["Metrics"])
app.include_router(rules_router,   prefix="/rules",   tags=["Rules"])
app.include_router(graph_router,   prefix="/graph",   tags=["Graph"])
app.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
app.include_router(communities_router, prefix="/communities", tags=["Communities"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)