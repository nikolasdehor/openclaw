# Backend Dockerfile
FROM python:3.14-slim

WORKDIR /app

# Instala dependências sistêmicas
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código
COPY . .

# Expõe porta
EXPOSE 8000

# Comando
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
