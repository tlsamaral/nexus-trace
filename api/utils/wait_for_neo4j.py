import time
from neo4j import GraphDatabase

def wait_for_neo4j(uri, user, password, timeout=60):
    start = time.time()
    while True:
        try:
            driver = GraphDatabase.driver(uri, auth=(user, password))
            with driver.session() as s:
                s.run("RETURN 1")
            print("✅ Neo4j está pronto!")
            return True
        except Exception as e:
            print("⏳ Aguardando Neo4j ficar online...")
            time.sleep(2)

        if time.time() - start > timeout:
            print("❌ Timeout esperando o Neo4j")
            return False