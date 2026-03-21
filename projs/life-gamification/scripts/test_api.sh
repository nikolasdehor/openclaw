#!/bin/bash
# Testes da API - Life Gamification MVP
set -e

BASE="http://localhost:8000"
USER="+556286077431"

echo "🧪 Testando API Life Gamification"
echo "=================================="
echo ""

# 1. Health check
echo "1️⃣  Health check..."
curl -s "$BASE/health" | jq . || echo "❌ Health falhou"
echo ""

# 2. Dashboard vazio (cria usuário automaticamente)
echo "2️⃣  Dashboard (usuário automático)..."
curl -s "$BASE/dashboard?user_phone=$USER" | jq '.user.level, .user.total_points' || echo "❌ Dashboard falhou"
echo ""

# 3. IA recomenda missões
echo "3️⃣  IA recomenda missões..."
curl -s -X POST "$BASE/ai/recommend" \
  -H "Content-Type: application/json" \
  -d "{\"user_phone\":\"$USER\",\"limit\":2}" | jq '.reasoning, .recommendations[].title' || echo "⚠️  IA fallback (sem API key)"
echo ""

# 4. Completar missão IA (quick-complete)
echo "4️⃣  Completar missão (quick)..."
curl -s -X POST "$BASE/mission/quick-complete" \
  -H "Content-Type: application/json" \
  -d "{\"user_phone\":\"$USER\",\"title\":\"Teste Manual\",\"description\":\"Missão de teste\",\"area_name\":\"foco\",\"difficulty\":\"easy\"}" | jq '.success, .points_earned, .current_streak' || echo "❌ Quick complete falhou"
echo ""

# 5. Dashboard após missão
echo "5️⃣  Dashboard atualizado..."
curl -s "$BASE/dashboard?user_phone=$USER" | jq '.user.total_points, .user.level, .user.area_scores' || echo "❌ Dashboard pós-missão falhou"
echo ""

# 6. Listar achievements
echo "6️⃣  Achievements..."
curl -s "$BASE/api/achievements?user_phone=$USER" | jq '.total_unlocked, .total_pending' || echo "❌ Achievements falhou"
echo ""

# 7. Listar missões disponíveis
echo "7️⃣  Missões disponíveis..."
curl -s "$BASE/api/missions" | jq '.[-1].title' || echo "❌ Lista missões falhou"
echo ""

echo "✅ Testes concluídos!"
echo ""
echo "📊 Próximos passos:"
echo "- Acesse o frontend: http://localhost:3000"
echo "- API Docs: http://localhost:8000/docs"
echo "- Teste manual: gere recomendações e clique em 'Completar Agora'"
