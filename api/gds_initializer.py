from neo4j_client import get_driver

def compute_graph_features():
    with get_driver().session() as session:

        print("🟡 Limpando grafo GDS (se existir)...")
        try:
            session.run("CALL gds.graph.drop('transacoes', false)")
        except:
            pass

        print("🟡 Projetando grafo para GDS...")
        session.run("""
            CALL gds.graph.project(
                'transacoes',
                'Account',
                {SENT: {type: 'SENT', orientation: 'NATURAL'}}
            )
        """)

        print("🟡 Calculando comunidades (Louvain)...")
        session.run("""
            CALL gds.louvain.write('transacoes', {
                writeProperty: 'community'
            })
        """)

        print("🟡 Calculando lastActivity por conta...")
        session.run("""
            MATCH (a:Account)
            OPTIONAL MATCH (a)-[s:SENT]->()
            WITH a, max(s.ts) AS lastTS
            SET a.lastActivity = lastTS
        """)

        print("🔵 Comunidades e lastActivity aplicados com sucesso!")