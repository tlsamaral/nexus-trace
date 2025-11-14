# Projeto Fraude em Grafos - Arquivos Gerados
Arquivos neste diretório:

- docker-compose.yml: sobe Postgres e Neo4j (ports padrão). Usuário/senha em variáveis de ambiente.
- schema.sql: DDL para criar tabelas no Postgres.
- generate_data.py: gera CSVs em ./output_csv (requer pandas, faker, numpy).
- import_to_neo4j.cypher: comandos Cypher para importar CSVs para Neo4j.
- detection_queries.cypher: queries para detectar padrões de fraude.

## Como começar (local)
1. Instale Docker e suba os serviços:
   `docker compose up -d`
2. No Postgres: rode schema.sql para criar tabelas.
   Exemplo: `docker exec -i <pg_container> psql -U postgres -d frauddb < schema.sql`
3. Gere CSVs: `python3 generate_data.py` (cria folder output_csv)
4. Copie CSVs para a pasta import do Neo4j (ou use Neo4j Desktop import).
5. Abra Neo4j Browser (http://localhost:7474) e rode import_to_neo4j.cypher
6. Rode queries de detection em detection_queries.cypher
