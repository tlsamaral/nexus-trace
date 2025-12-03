FROM python:3.11-slim

WORKDIR /app

# Copia o requirements da RAIZ
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

# Copia apenas a pasta API
COPY api/ /app/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]