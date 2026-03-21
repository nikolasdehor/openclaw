#!/bin/bash
# Setup rápido do sistema - Life Gamification MVP
set -e

echo "🎮 Life Gamification Setup"
echo "=========================="

# 1. Verifica Python
echo "🔍 Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Instale Python 3.14+"
    exit 1
fi
echo "✅ Python $(python3 --version)"

# 2. Cria diretório de dados
mkdir -p data
echo "✅ Diretório data/ criado"

# 3. Copia .env se não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado (edite com sua OPENROUTER_API_KEY)"
else
    echo "⚠️  .env já existe"
fi

# 4. Instala dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
python3 -m venv .venv 2>/dev/null || true
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi
pip install -q -r requirements.txt
echo "✅ Dependências instaladas"

# 5. Inicializa banco
echo "🗄️  Inicializando banco de dados..."
python seed.py
echo "✅ Banco inicializado"

cd ..

# 6. Instruções finais
echo ""
echo "🎉 Setup completo!"
echo ""
echo "Próximos passos:"
echo "1. Edite .env e adicione sua OPENROUTER_API_KEY"
echo "2. Para rodar local:"
echo "   cd backend && uvicorn main:app --reload"
echo "3. Acesse: http://localhost:8000/docs (API Swagger)"
echo "4. Frontend: cd frontend && python -m http.server 3000"
echo ""
echo "Ou use Docker Compose:"
echo "   docker-compose up -d"
echo ""
echo "📚 Veja README.md para mais detalhes"
