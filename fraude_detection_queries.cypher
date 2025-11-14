// fraude_detection_queries.cypher
// Consultas avançadas para detecção e análise de fraudes financeiras em grafos Neo4j.
// Desenvolvido para o projeto de Detecção de Fraudes com Grafos e Cypher (Tallés Amaral).
// Cada seção inclui uma query explicativa e pode ser executada individualmente no Neo4j Browser.
// ------------------------------------------------------------

// 1️⃣ Visualizar transações (grafo geral)
MATCH (a:Account)-[r:SENT]->(b:Account)
RETURN a,b,r
LIMIT 100;

// ------------------------------------------------------------
// 2️⃣ Detectar ciclos curtos entre contas (lavagem de dinheiro)
MATCH (a:Account)-[r1:SENT]->(b:Account)-[r2:SENT]->(c:Account)-[r3:SENT]->(a)
WHERE duration.between(r1.ts, r3.ts).hours <= 48
  AND abs(r1.amount - r2.amount) / r1.amount <= 0.15
  AND abs(r2.amount - r3.amount) / r2.amount <= 0.15
RETURN a,b,c
LIMIT 50;

// ------------------------------------------------------------
// 3️⃣ Listar contas envolvidas nesses ciclos
MATCH (a:Account)-[r1:SENT]->(b:Account)-[r2:SENT]->(c:Account)-[r3:SENT]->(a)
WHERE duration.between(r1.ts, r3.ts).hours <= 48
RETURN DISTINCT a.id AS Conta_A, b.id AS Conta_B, c.id AS Conta_C
LIMIT 50;

// ------------------------------------------------------------
// 4️⃣ Contas com FAN-IN alto (muitas entradas)
MATCH (dst:Account)<-[r:SENT]-()
WITH dst, count(DISTINCT r) AS total
WHERE total > 10
RETURN dst.id AS Conta, total AS TransacoesRecebidas
ORDER BY total DESC
LIMIT 20;

// ------------------------------------------------------------
// 5️⃣ Contas com FAN-OUT alto (muitos envios)
MATCH (src:Account)-[r:SENT]->()
WITH src, count(DISTINCT r) AS total
WHERE total > 10
RETURN src.id AS Conta, total AS TransacoesEnviadas
ORDER BY total DESC
LIMIT 20;

// ------------------------------------------------------------
// 6️⃣ Contas próximas de fraudes conhecidas (propagação de risco)
MATCH (f:Account {fraud: true})<-[:SENT*1..3]-(a:Account)
RETURN DISTINCT a.id AS ContaSuspeita, count(*) AS NivelDeConexao
ORDER BY NivelDeConexao DESC
LIMIT 50;

// ------------------------------------------------------------
// 7️⃣ Contas com transações acima de um valor limite (ex: R$3000)
MATCH (a:Account)-[r:SENT]->(b:Account)
WHERE r.amount > 3000
RETURN a,b,r
LIMIT 100;

// ------------------------------------------------------------
// 8️⃣ Risco médio e máximo das contas
MATCH (a:Account)
RETURN avg(a.risk_score) AS MediaRisco, max(a.risk_score) AS MaiorRisco;

// ------------------------------------------------------------
// 9️⃣ Conexões indiretas por IP, dispositivo, ou endereço
MATCH (a:Account)-[r:LINKED]->(b:Account)
RETURN a,b,r
LIMIT 50;

// ------------------------------------------------------------
// 🔟 Exibir rede completa de contas suspeitas (lavagem + fan-in)
MATCH (a:Account)-[r:SENT]->(b:Account)
WHERE r.amount > 3000 OR a.risk_score > 0.8
RETURN a,b,r
LIMIT 200;

// ------------------------------------------------------------
// 11️⃣ Estatísticas gerais
MATCH (a:Account)-[r:SENT]->(b:Account)
RETURN count(DISTINCT a) AS ContasOrigem,
       count(DISTINCT b) AS ContasDestino,
       avg(r.amount) AS ValorMedio,
       max(r.amount) AS MaiorValor;

// ------------------------------------------------------------
// 12️⃣ Identificar clusters de transações densas
CALL gds.graph.project(
  'transacoes',
  'Account',
  {
    SENT: {
      type: 'SENT',
      orientation: 'NATURAL'
    }
  }
);
CALL gds.louvain.stream('transacoes')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).id AS Conta, communityId
ORDER BY communityId
LIMIT 100;
