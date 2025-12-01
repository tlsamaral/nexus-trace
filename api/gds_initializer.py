from neo4j_client import get_driver

def compute_graph_features():
    with get_driver().session() as session:

        print("📥 Importando dados CSV para Neo4j...")

        # ---------------------------------------------------------
        # 1) Carregar Customer
        # ---------------------------------------------------------
        session.run("""
        CALL {
          LOAD CSV WITH HEADERS FROM 'file:///customer.csv' AS row
          MERGE (c:Customer {id: toInteger(row.id)})
          SET c.full_name = row.full_name,
              c.doc = row.doc,
              c.created_at = datetime(row.created_at)
        } IN TRANSACTIONS OF 10000 ROWS;
        """)
        print("✔ Customer carregado")

        # ---------------------------------------------------------
        # 2) Carregar Account
        # ---------------------------------------------------------
        session.run("""
        CALL {
          LOAD CSV WITH HEADERS FROM 'file:///account.csv' AS row
          MERGE (a:Account {id: toInteger(row.id)})
          SET a.customer_id = toInteger(row.customer_id),
              a.opened_at = datetime(row.opened_at),
              a.status = row.status,
              a.risk_score = toFloat(row.risk_score)
        } IN TRANSACTIONS OF 10000 ROWS;
        """)
        print("✔ Account carregado")

        # ---------------------------------------------------------
        # 3) Carregar Transactions
        # ---------------------------------------------------------
        session.run("""
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
        """)
        print("✔ Transações carregadas")

        # ---------------------------------------------------------
        # 4) Carregar relacionamentos (shared device/ip)
        # ---------------------------------------------------------
        session.run("""
        CALL {
          LOAD CSV WITH HEADERS FROM 'file:///relationship.csv' AS row
          MATCH (a:Account {id: toInteger(row.a_id)})
          MATCH (b:Account {id: toInteger(row.b_id)})
          MERGE (a)-[l:LINKED {type: row.type}]->(b)
          SET l.evidence = row.evidence,
              l.first_seen_at = datetime(row.first_seen_at)
        } IN TRANSACTIONS OF 10000 ROWS;
        """)
        print("✔ Relationships carregados")

        # ---------------------------------------------------------
        # 5) LIMPAR GRAFO GDS
        # ---------------------------------------------------------
        print("🟡 Limpando grafo GDS (se existir)...")
        try:
            session.run("CALL gds.graph.drop('transacoes', false)")
        except:
            pass

        # ---------------------------------------------------------
        # 6) Projetar grafo
        # ---------------------------------------------------------
        print("🟡 Projetando grafo para GDS...")
        session.run("""
            CALL gds.graph.project(
                'transacoes',
                'Account',
                {SENT: {type: 'SENT', orientation: 'NATURAL'}}
            )
        """)

        # ---------------------------------------------------------
        # 7) Calcular comunidades
        # ---------------------------------------------------------
        print("🟡 Calculando comunidades (Louvain)...")
        session.run("""
            CALL gds.louvain.write('transacoes', {
                writeProperty: 'community'
            })
        """)

        # ---------------------------------------------------------
        # 8) Atualizar lastActivity
        # ---------------------------------------------------------
        print("🟡 Calculando lastActivity por conta...")
        session.run("""
            MATCH (a:Account)
            OPTIONAL MATCH (a)-[s:SENT]->()
            WITH a, max(s.ts) AS lastTS
            SET a.lastActivity = lastTS
        """)

        print("🔵 Comunidades, relações e lastActivity aplicados com sucesso!")