// import_to_neo4j_v5.cypher (corrigido sem ';' dentro do CALL)
//
// Suba os CSVs para a pasta import do Neo4j (ex: /var/lib/neo4j/import ou import folder no Desktop)

// Importar customers
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///customer.csv' AS row
  MERGE (c:Customer {id: toInteger(row.id)})
  SET c.full_name = row.full_name,
      c.doc = row.doc,
      c.created_at = datetime(row.created_at)
} IN TRANSACTIONS OF 10000 ROWS;

// Importar accounts
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///account.csv' AS row
  MERGE (a:Account {id: toInteger(row.id)})
  SET a.customer_id = toInteger(row.customer_id),
      a.opened_at = datetime(row.opened_at),
      a.status = row.status,
      a.risk_score = toFloat(row.risk_score)
} IN TRANSACTIONS OF 10000 ROWS;

// Importar merchants
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///merchant.csv' AS row
  MERGE (m:Merchant {id: toInteger(row.id)})
  SET m.name = row.name,
      m.mcc = row.mcc,
      m.region = row.region
} IN TRANSACTIONS OF 10000 ROWS;

// Importar devices
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///device.csv' AS row
  MERGE (d:Device {id: toInteger(row.id)})
  SET d.fingerprint_hash = row.fingerprint_hash,
      d.first_seen_at = datetime(row.first_seen_at),
      d.risk_level = row.risk_level
} IN TRANSACTIONS OF 10000 ROWS;

// Importar transactions
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///transaction.csv' AS row
  MATCH (s:Account {id: toInteger(row.src_account_id)})
  MATCH (t:Account {id: toInteger(row.dst_account_id)})
  MERGE (s)-[r:SENT {id: toInteger(row.id)}]->(t)
  SET r.ts = datetime(row.ts),
      r.amount = toFloat(row.amount),
      r.channel = row.channel,
      r.device_id = toInteger(row.device_id),
      r.location = row.location,
      r.meta = row.meta
} IN TRANSACTIONS OF 10000 ROWS;

// Importar relationships
CALL {
  LOAD CSV WITH HEADERS FROM 'file:///relationship.csv' AS row
  MATCH (a:Account {id: toInteger(row.a_id)})
  MATCH (b:Account {id: toInteger(row.b_id)})
  MERGE (a)-[l:LINKED {type: row.type}]->(b)
  SET l.evidence = row.evidence,
      l.first_seen_at = datetime(row.first_seen_at)
} IN TRANSACTIONS OF 10000 ROWS;
