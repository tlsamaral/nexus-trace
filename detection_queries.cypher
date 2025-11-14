// detection_queries.cypher

// 1) Ciclos de 3 contas em <= 48h com valores próximos
MATCH (a:Account)-[r1:SENT]->(b:Account)-[r2:SENT]->(c:Account)-[r3:SENT]->(a)
WHERE duration.between(r1.ts, r3.ts).hours <= 48
  AND abs(r1.amount - r2.amount) / r1.amount <= 0.15
  AND abs(r2.amount - r3.amount) / r2.amount <= 0.15
RETURN a.id AS a, b.id AS b, c.id AS c, r1.amount AS a1, r2.amount AS a2, r3.amount AS a3
LIMIT 100;

// 2) Fan-in alto: contas que receberam de muitos remetentes em 24h
MATCH (dst:Account)<-[s:SENT]-()
WITH dst, count(DISTINCT s) AS senders, collect(s) AS rels
MATCH (dst)<-[s2:SENT]-()
WHERE s2.ts >= datetime() - duration('P1D')  // últimas 24h
RETURN dst.id AS account, senders
ORDER BY senders DESC
LIMIT 50;

// 3) Contas a 1..3 saltos de uma conta marcada como fraud (assumindo property fraud=true)
MATCH (f:Account {fraud: true})<-[:SENT*1..3]-(a:Account)
RETURN DISTINCT a.id LIMIT 500;

// 4) Velocidade e valor (ex: >10 transações e >50k em 1h)
MATCH (a:Account)-[t:SENT]->()
WITH a, count(t) AS n_tx, sum(t.amount) AS total_amount, min(t.ts) AS tmin, max(t.ts) AS tmax
WHERE tmin >= datetime() - duration('PT1H')  // last 1 hour
  AND n_tx >= 10 AND total_amount >= 50000
RETURN a.id, n_tx, total_amount;
