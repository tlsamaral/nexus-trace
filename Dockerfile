FROM python:3.11-slim

WORKDIR /app

# Copia arquivos principais
COPY generate_data.py .
COPY schema.sql .
COPY import_to_neo4j.cypher .
COPY detection_queries.cypher .
COPY requirements.txt .
COPY ./api ./api

# Instala dependências
RUN pip install --no-cache-dir pandas faker numpy psycopg2-binary neo4j uvicorn fastapi && \
    pip install --no-cache-dir -r api/requirements.txt

# Expõe a porta da API
EXPOSE 8000

# Comando final
CMD ["/bin/bash", "-c", "\
  echo '⏳ Esperando Postgres e Neo4j subirem...' && \
  sleep 20 && \
  echo '🏗️ Gerando dados...' && \
  python generate_data.py && \
  echo '📦 Aplicando schema no Postgres...' && \
  PGPASSWORD=postgres psql -h postgres -U postgres -d frauddb -f schema.sql && \
  echo '🚀 Iniciando API de Detecção em Tempo Real...' && \
  uvicorn api.main:app --host 0.0.0.0 --port 8000 \
"]