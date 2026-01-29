# APENAS PARA DESENVOLVIMENTO LOCAL COM DOCKER

FROM python:3.11-slim

WORKDIR /app

# Instala dependencias de sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia o requirements
COPY requirements.txt .

# Instala dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia a aplicacao
COPY . .

# Expoe a porta (variável de runtime)
ARG PORT=8000
EXPOSE ${PORT}

# Executa a aplicacao em modo production (usa variável de ambiente PORT quando disponível)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "${PORT}"]
