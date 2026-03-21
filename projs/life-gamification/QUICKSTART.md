# 🚀 Quick Start - Life Gamification

MVP funcional em 5 minutos.

## Pré-requisitos

- Docker + Docker Compose (ou Python 3.14+ local)
- OpenRouter API key (gratuita): https://openrouter.ai

## Passo 1: Clone e configure

```bash
cd /data/.openclaw/workspace/projs/life-gamification
cp .env.example .env
# Edite .env e adicione sua OPENROUTER_API_KEY
```

## Passo 2: Docker (Mais fácil)

```bash
docker-compose up -d
```

Acesse:
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## Passo 3: Testar

No frontend, clique em **"Gerar Missões Personalizadas"** → Depois **"Completar Agora"** em qualquer missão.

Ou via API:

```bash
# Dashboard
curl "http://localhost:8000/dashboard?user_phone=+556286077431"

# IA recomenda
curl -X POST http://localhost:8000/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_phone":"+556286077431","limit":2}'

# Completar missão da IA
curl -X POST http://localhost:8000/mission/quick-complete \
  -H "Content-Type: application/json" \
  -d '{"user_phone":"+556286077431","title":"Teste","description":"Minha missão","area_name":"foco","difficulty":"easy"}'
```

## Configurações opcionais

### WhatsApp (wacli)

```bash
npm install -g wacli
wacli login
```

Edite `.env`:
```env
WACLI_ENABLED=true
WACLI_PHONE_NUMBER=+556286077431
```

### Planilha financeira

```bash
curl -X POST http://localhost:8000/admin/import-finances \
  -H "Content-Type: application/json" \
  -d '{"csv_path":"~/documentos/financas.csv"}'
```

### Cron jobs

```bash
# Auto-checkin a cada hora
0 * * * * curl -s http://localhost:8000/cron/checkin > /dev/null
```

## 📂 Estrutura

```
├── backend/         # FastAPI + SQLite
├── frontend/        # Dashboard HTML/JS
├── integrator/      # IA + Swarm
├── scripts/         # Utilitários
├── docker-compose.yml
└── README.md        # Docs completos
```

## 🆘 Problemas?

- **Erro 500 da IA**: Verifique OPENROUTER_API_KEY no `.env`
- **Porta ocupada**: Altere as portas no `docker-compose.yml`
- **wacli não envia**: Execute `wacli login` e escaneie o QR code
- **Banco vazio**: Rode `./scripts/reset_db.sh`

Veja `README.md` e `INTEGRATION.md` para mais detalhes.

---

🎮 **Divirta-se gamificando sua vida!**
