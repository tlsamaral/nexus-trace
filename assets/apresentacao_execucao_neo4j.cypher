// APRESENTAÇÃO PRÁTICA – DETECÇÃO DE FRAUDES FINANCEIRAS COM GRAFOS

// ------------------------------------------------------------
// 1️⃣ Iniciar containers Docker
// ------------------------------------------------------------
docker compose up -d --build

// ------------------------------------------------------------
// 2️⃣ Verificar status dos serviços
// ------------------------------------------------------------
docker ps

// ------------------------------------------------------------
// 3️⃣ Acessar o Neo4j Browser em http://localhost:7474
// Login: neo4j / neo4jpassword
// ------------------------------------------------------------

// ------------------------------------------------------------
// 4️⃣ Confirmar instalação do plugin Graph Data Science (GDS)
CALL gds.version();

// ------------------------------------------------------------
// 5️⃣ Importar CSVs e montar o grafo (arquivo import_to_neo4j_v5_fixed.cypher)
// Executar bloco por bloco com :auto no início

:auto
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///customer.csv' AS row
  MERGE (c:Customer {id: toInteger(row.id)})
  SET c.full_name = row.full_name,
      c.doc = row.doc,
      c.created_at = datetime(row.created_at)
} IN TRANSACTIONS OF 10000 ROWS;

:auto
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///account.csv' AS row
  MERGE (a:Account {id: toInteger(row.id)})
  SET a.customer_id = toInteger(row.customer_id),
      a.opened_at = datetime(row.opened_at),
      a.status = row.status,
      a.risk_score = toFloat(row.risk_score)
} IN TRANSACTIONS OF 10000 ROWS;

:auto
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///transaction.csv' AS row
  MATCH (s:Account {id: toInteger(row.src_account_id)})
  MATCH (t:Account {id: toInteger(row.dst_account_id)})
  MERGE (s)-[r:SENT {id: toInteger(row.id)}]->(t)
  SET r.ts = datetime(row.ts),
      r.amount = toFloat(row.amount),
      r.channel = row.channel,
      r.device_id = toInteger(row.device_id),
      r.location = row.location
} IN TRANSACTIONS OF 10000 ROWS;

:auto
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///relationship.csv' AS row
  MATCH (a:Account {id: toInteger(row.a_id)})
  MATCH (b:Account {id: toInteger(row.b_id)})
  MERGE (a)-[l:LINKED {type: row.type}]->(b)
  SET l.evidence = row.evidence,
      l.first_seen_at = datetime(row.first_seen_at)
} IN TRANSACTIONS OF 10000 ROWS;

// ------------------------------------------------------------
// 6️⃣ Validação do grafo
CALL db.labels();
CALL db.relationshipTypes();
MATCH (n)-[r]->() RETURN n,r LIMIT 100;

// ------------------------------------------------------------
// 7️⃣ Execução das queries de detecção de fraudes
// ------------------------------------------------------------

// 7.1 Identificar ciclos suspeitos (lavagem de dinheiro)
MATCH (a:Account)-[r1:SENT]->(b:Account)-[r2:SENT]->(c:Account)-[r3:SENT]->(a)
WHERE duration.between(r1.ts, r3.ts).hours <= 48
RETURN a,b,c LIMIT 50;

// 7.2 Encontrar contas “mulas” (fan-in alto)
MATCH (dst:Account)<-[r:SENT]-()
WITH dst, count(DISTINCT r) AS total
WHERE total > 10
RETURN dst.id AS Conta, total AS TransacoesRecebidas
ORDER BY total DESC LIMIT 20;

// 7.3 Medir o risco médio das contas
MATCH (a:Account)
RETURN avg(a.risk_score) AS MediaRisco, max(a.risk_score) AS MaiorRisco;

// 7.4 Visualizar grupos suspeitos (transações altas)
MATCH (a:Account)-[r:SENT]->(b:Account)
WHERE r.amount > 3000
RETURN a,b,r LIMIT 100;

// ------------------------------------------------------------
// 8️⃣ Análise de comunidades (GDS - Louvain)
CALL gds.graph.drop('transacoes');
CALL gds.graph.project(
  'transacoes',
  'Account',
  {SENT: {type: 'SENT', orientation: 'NATURAL'}}
);
CALL gds.louvain.stream('transacoes')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).id AS Conta, communityId
ORDER BY communityId LIMIT 100;

// ------------------------------------------------------------
// 9️⃣ Limpar grafo da memória
CALL gds.graph.drop('transacoes');

// Bonus - Visualizar comunidades
CALL gds.louvain.stream('transacoes')
YIELD nodeId, communityId
WITH gds.util.asNode(nodeId) AS conta, communityId
SET conta.community = communityId
RETURN conta
LIMIT 200;