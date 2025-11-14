# Realtime Fraud API (FastAPI + Neo4j)

## Instalação
```bash
cd realtime_api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=neo4jpassword
uvicorn main:app --reload --port 8000
```

## Teste rápido
```bash
curl -X POST http://localhost:8000/transaction \  -H "Content-Type: application/json" \  -d '{ "src_account": 1, "dst_account": 2, "amount": 3800, "channel": "pix" }'
```

## WebSocket (alertas em tempo real)
Abra no browser/console:
```js
const ws = new WebSocket("ws://localhost:8000/ws");
ws.onmessage = (e) => console.log("WS:", e.data);
```

## Notas
- Score combina fan-in 24h (0-50), valor vs média 7d (0-30) e community flag (0-20).
- Configure o limite via env: `RISK_THRESHOLD` (default 80).
