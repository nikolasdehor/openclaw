<div align="center">

# Life Gamification System 🎮

[![Build Status](https://github.com/nikolasdehor/life-gamification/actions/workflows/ci.yml/badge.svg)](https://github.com/nikolasdehor/life-gamification/actions)
[![Coverage](https://img.shields.io/codecov/c/github/nikolasdehor/life-gamification)](https://codecov.io/gh/nikolasdehor/life-gamification)
[![Latest Release](https://img.shields.io/github/v/release/nikolasdehor/life-gamification)](https://github.com/nikolasdehor/life-gamification/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.14](https://img.shields.io/badge/python-3.14-blue.svg)](https://www.python.org/downloads/)
[![React Native](https://img.shields.io/badge/React_Native-0.83-61dafb.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_51-ffffff.svg?logo=expo)](https://expo.dev/)

**Transforme sua vida em um jogo. Complete missões, ganhe pontos, suba de nível.**

[Quick Start](#-instalação-rápida) • [Mobile App](#-mobile-app) • [Documentação](#-documentação) • [Release v1.0.0](#-release)

</div>

---

## 🧠 Visão Geral

Life Gamification é um sistema completo de gamificação para 4 áreas da vida:

- **Bolsa** 💰 - Finanças e wealth building
- **Mente** 🧠 - Aprendizado e foco
- **Vitalidade** ❤️ - Saúde e energia
- **Propósito** ✨ - Crescimento pessoal

Complete missões diárias/semanais, mantenha streaks, desbloqueie achievements e deixe a IA te recomendar missões personalizadas.

### MVP v1.0.0 - Funcionalidades

✅ **Backend FastAPI** - API REST completa com SQLite
✅ **Frontend Web** - Dashboard HTML5 puro
✅ **Mobile App** - React Native + Expo (iOS/Android)
✅ **Offline-first** - Cache local + sync automático
✅ **Push Notifications** - Lembretes e conquistas
✅ **IA StepFun** - Recomendações inteligentes
✅ **Monetização** - Assinaturas mensal/anual (Stripe)
✅ **CI/CD** - GitHub Actions, EAS Build
✅ **Store Submission** - TestFlight + Play Console

---

## 📦 Stack Tecnológica

| Layer | Tech | Version |
|-------|------|---------|
| Backend | Python + FastAPI | 3.14 / 0.115 |
| Database | SQLite | 3 |
| Frontend Web | HTML5 + CSS3 + JS | vanilla |
| Mobile | React Native + Expo | 0.83 / SDK 51 |
| State Mgmt | Zustand (mobile) | - |
| API Client | TanStack Query (mobile) | - |
| IA | StepFun Step 3.5 Flash (OpenRouter) | - |
| Payments | Stripe Checkout | - |
| Push | Expo Notifications (FCM/APNs) | - |
| CI/CD | GitHub Actions + EAS Build | - |
| Deploy | Docker + Nginx | - |

---

## 📁 Estrutura do Projeto

```text
life-gamification/
├── backend/              # FastAPI backend
│   ├── main.py           # API principal
│   ├── schema.sql        # Database schema
│   ├── seed.py           # Dados exemplo
│   └── requirements.txt  # Dependências
├── frontend/             # Dashboard web (HTML/CSS/JS)
├── mobile/               # React Native app (Expo)
│   ├── src/
│   │   ├── screens/      # Telas
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── navigation/   # React Navigation
│   │   ├── services/     # API layer
│   │   └── theme/        # Design system
│   ├── app.json
│   ├── eas.json          # EAS Build config
│   └── package.json
├── integrator/           # Swarm de agentes IA
├── docs/                 # Documentação completa
│   ├── INDEX.md          # Índice navegável
│   ├── MOBILE.md         # Guia mobile
│   ├── MOBILE_ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── PAYMENT_INTEGRATION.md
│   ├── PRODUCTION_CHECKLIST.md
│   └── RELEASE_MANAGEMENT.md
├── .env.example
├── docker-compose.yml
├── CHANGELOG.md
├── UPGRADE_GUIDE.md
├── README.md
└── LICENSE
```

---

## 🚀 Instalação Rápida

## 🧠 Visão Geral

Transforme sua vida em um jogo! Complete missões diárias/semanais, ganhe pontos, mantenha streaks e desbloqueie achievements. A IA analisa seu comportamento e sugere missões personalizadas.

## 📦 Stack

- **Backend**: Python 3.14, FastAPI, SQLite
- **Frontend**: HTML5 puro + CSS + JavaScript (sem frameworks)
- **IA**: StepFun Step 3.5 Flash (OpenRouter)
- **Integrações**: wacli (WhatsApp), cron jobs, importação CSV

## 📁 Estrutura

```
life-gamification/
├── backend/
│   ├── main.py           # API FastAPI completa
│   ├── schema.sql        # Schema do banco SQLite
│   ├── seed.py           # Dados de exemplo
│   ├── requirements.txt  # Dependências Python
│   └── Dockerfile        # Imagem backend
├── frontend/
│   ├── index.html        # Dashboard
│   ├── styles.css        # Estilos
│   ├── app.js            # Lógica frontend
│   ├── Dockerfile        # Imagem frontend (nginx)
│   └── nginx.conf        # Config nginx
├── integrator/
│   ├── integrator.py     # Orquestrador IA + Swarm
│   └── agents.json       # Definição dos agentes
├── docker-compose.yml    # Deploy completa
├── .env.example          # Variáveis de ambiente
└── README.md             # Este arquivo
```

## 🚀 Instalação Rápida

### Opção 1: Docker Compose (Recomendado)

```bash
# Clone ou navegue para a pasta
cd /data/.openclaw/workspace/projs/life-gamification

# Copie o arquivo .env
cp .env.example .env
# Edite .env e adicione sua OpenRouter API key

# Suba tudo
docker-compose up -d

# Acesse
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Docs API: http://localhost:8000/docs
```

### Opção 2: Execução Local

```bash
cd backend

# Crie venv
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou .venv\Scripts\activate no Windows

# Instale depedências
pip install -r requirements.txt

# Configure .env
cp ../.env.example ../.env
# Edite ../.env com sua OPENROUTER_API_KEY

# Inicialize o banco
python seed.py

# Rode a API
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Acesse: http://localhost:8000 (docs interativos)

## ⚙️ Configuração

### 1. OpenRouter API Key

Obtenha uma chave gratuita em: https://openrouter.ai

Configure no `.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

**Nota**: O modelo `stepfun/step-3.5-flash:free` é gratuito no OpenRouter.

### 2. WhatsApp (wacli) - Opcional

Para notificações de achievements no WhatsApp do Nikolas:

```bash
# Instale wacli (CLI WhatsApp)
npm install -g wacli

# Configure wacli (escaneie QR code)
wacli login

# Habilite no .env
WACLI_ENABLED=true
WACLI_PHONE_NUMBER=+556286077431
```

O backend enviará automaticamente notificações quando achievements forem desbloqueados.

### 3. Cron Jobs Externos

O sistema suporta integração com cron jobs existentes. Adicione no banco:

```sql
INSERT INTO cron_jobs (name, command, schedule, area_id, enabled)
VALUES ('Health Checkin', '/usr/local/bin/health_check', '0 8 * * *', (SELECT id FROM areas WHERE name='saude'), 1);
```

Ou use o endpoint admin: `POST /admin/trigger-job/{job_name}` (WIP)

### 4. Planilha Financeira (CSV)

Coloque sua planilha em `~/documentos/financas.csv` (ou outro caminho) e importe:

```bash
curl -X POST "http://localhost:8000/admin/import-finances?csv_path=~/documentos/financas.csv"
```

A IA gerará missões baseadas nas suas transações.

## 📡 API Endpoints

### Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/mission/complete` | Completa uma missão existente |
| `POST` | `/mission/quick-complete` | Cria E completa missão personalizada (IA) |
| `GET` | `/dashboard?user_phone=X` | Dashboard completo |
| `POST` | `/ai/recommend` | IA sugere missões personalizadas |
| `POST` | `/cron/checkin` | Webhook para auto-checkin |
| `GET` | `/api/missions` | Lista missões disponíveis |
| `GET` | `/api/achievements?user_phone=X` | Achievements do usuário |
| `GET` | `/health` | Health check |

### Admin

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/admin/import-finances` | Importa CSV e gera missões de finanças |
| `POST` | `/admin/trigger-achievement/{user_phone}/{achievement_name}` | Força desbloqueio (debug) |

## 🧪 Demonstração com curl

```bash
# 1. Ver dashboard (usuário inicial sem dados)
curl "http://localhost:8000/dashboard?user_phone=+556286077431"

# 2. IA recomenda missões
curl -X POST "http://localhost:8000/ai/recommend" \
  -H "Content-Type: application/json" \
  -d '{"user_phone": "+556286077431", "limit": 3}'

# 3. Completar missão da IA (exemplo)
curl -X POST "http://localhost:8000/mission/quick-complete" \
  -H "Content-Type: application/json" \
  -d '{
    "user_phone": "+556286077431",
    "title": "Caminhada de 10 min",
    "description": "Caminhe ao ar livre por 10 minutos",
    "area_name": "saude",
    "difficulty": "easy"
  }'

# 4. Completar missão existente (ID=1)
curl -X POST "http://localhost:8000/mission/complete" \
  -H "Content-Type: application/json" \
  -d '{"user_phone": "+556286077431", "mission_id": 1}'

# 5. Listar achievements
curl "http://localhost:8000/api/achievements?user_phone=+556286077431"

# 6. Importar planilha financeira
curl -X POST "http://localhost:8000/admin/import-finances" \
  -H "Content-Type: application/json" \
  -d '{"csv_path": "~/documentos/financas.csv"}'

# 7. Trigger manual de achievement (debug)
curl -X POST "http://localhost:8000/admin/trigger-achievement/+556286077431/Primeiro%20Passo"

# 8. Testar webhook de cron
curl -X POST "http://localhost:8000/cron/checkin"
```

## 🎯 Gamificação

### Pontos por Área

- Missões **fáceis**: 50 pontos
- Missões **médias**: 100 pontos
- Missões **difíceis**: 200 pontos

**Bônus de streak**: +10% por dia de streak consecutive (max +50% se streak >= 3 dias)

### Níveis

Fórmula: `nível = floor(sqrt(pontos_totais / 100))`

Exemplo:
- 0 pontos → Nível 1
- 1.000 pontos → Nível 3
- 10.000 pontos → Nível 10
- 1.000.000 pontos → Nível 100

### Streaks

Contador de dias consecutivos por área. Se quebrar, reseta para 0.

### Achievements Padrão

- 🌱 **Primeiro Passo**: Complete sua primeira missão
- 🔥 **7 dias de Foco**: Streak de 7 dias em qualquer área
- 📚 **Maratonista de Aprendizado**: 50 missões de aprendizado
- 💎 **Primeiro Milhão**: 1.000.000 de pontos totais
- 💪 **Mestre da Saúde**: 100 missões de saúde

## 🤖 Orquestrador IA (Integrator)

O módulo `integrator/` contém swarm de agentes especializados:

- **health_coach**: Missões de saúde
- **focus_specialist**: Produtividade e foco
- **learning_guide**: Aprendizado contínuo
- **financial_advisor**: Finanças pessoais
- **pattern_detector**: Analisa histórico e detecta padrões

### Como usar o integrator

```python
from integrator import Integrator

integrator = Integrator()
result = await integrator.orchestrate(user_data, mission_count=3)
# result: {
#   "mission_suggestions": [...],
#   "patterns_detected": [...],
#   "coaching_advice": "...",
#   "confidence": 0.85
# }
```

Pode rodar standalone:

```bash
python integrator/integrator.py user_data.json
```

## 🔧 Cron Jobs e Integrações

### Auto-checkin de hábitos

Configure o endpoint `/cron/checkin` no seu crontab:

```bash
# A cada hora
0 * * * * curl -s http://localhost:8000/cron/checkin > /dev/null
```

### Conectar com cron jobs existentes

Adicione no banco:

```sql
INSERT INTO cron_jobs (name, command, schedule, area_id, enabled)
VALUES ('Health Job', '/path/to/health_script.sh', '0 8 * * *', (SELECT id FROM areas WHERE name='saude'), 1);
```

O webhook pode processar automaticamente e converter execuções em missões.

## 📱 Mobile App

Aplicativo móvel (React Native/Expo) para acesso rápido no celular. Permite registrar missões, ver dashboard e receber notificações mesmo offline.

### Funcionalidades

- Login com número de WhatsApp
- Dashboard com scores, streaks e nível
- Lista de missões com complete em 1 toque
- Recomendações de IA integradas
- Achievements desbloqueados
- Modo offline (cache + sincronização)
- Widget home screen (planejado)
- Notificações WhatsApp (wacli)

### Documentação Completa

Ver [`docs/MOBILE.md`](docs/MOBILE.md) para:
- User Stories detalhadas
- Backlog priorizado
- Acceptance Criteria
- Wireframes e flows
- Definição de Pronto (DoD)

Ver [`docs/MOBILE_USER_STORIES.md`](docs/MOBILE_USER_STORIES.md) para:
- Lista completa de user stories
- Backlog em formato tabela
- Acceptance Criteria por US
- Wireframes ASCII

### Setup Rápido (Desenvolvimento)

```bash
# 1. Instalar Expo CLI
npm install -g expo-cli

# 2. Criar app (ou navegar para pasta mobile existente)
npx create-expo-app mobile --template
cd mobile

# 3. Instalar dependências
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install axios

# 4. Configurar API_BASE (apontar para backend rodando)
# Ex: http://localhost:8000 ou https://seu-domain.ngrok.io

# 5. Rodar
npx expo start
```

### QR Code Expo Go

Após iniciar com `expo start`, escaneie o QR code no app Expo Go (Android/iOS) para testar instantaneamente.

### Build para Produção

```bash
# Android APK
npx expo build:android

# iOS (requer conta Apple)
npx expo build:ios

# Ou usar EAS Build (recomendado)
eas build --platform android
```

### Testes Offline

1. Carregue app online (dashboard)
2. Desligue Wi-Fi/dados
3. Abra app novamente
4. Deve mostrar dados em cache
5. Complete missões (vão para fila)
6. Reative internet
7. Sync automático ocorre

---

## 📊 Dashboard Frontend

O frontend (em `frontend/`) é um dashboard SPA que:

- Mostra scores por área com barras de progresso
- Exibe streaks atuais
- Lista achievements desbloqueados
- Mostra histórico de missões
- Gera recomendações via IA com 1 clique
- Permite completar missões diretamente

### Acessando

Se rodando local (sem docker):

```bash
cd frontend
python -m http.server 3000
```

Ou acesse `http://localhost:3000` se usando docker-compose.

## 🐛 Troubleshooting

### Erro: "No module named 'uvicorn'"

```bash
cd backend
pip install -r requirements.txt
```

### Erro: "Unable to open database file"

Garanta que a pasta `data/` existe e tem permissões:

```bash
mkdir -p data
chmod 755 data
```

### IA não responde

Verifique sua OpenRouter API key no `.env`:

```bash
grep OPENROUTER_API_KEY .env
```

### Porta 8000 em uso

Mude a porta no docker-compose.yml ou use:

```bash
uvicorn main:app --port 8001
```

### wacli não envia mensagens

Execute `wacli login` para autenticar. Verifique logs:

```bash
wacli send +556286077431 "teste"
```

### Banco vazio após seed

Rode manualmente:

```bash
cd backend
python seed.py
```

## 📱 Mobile App (React Native + Expo)

Aplicativo móvel completo para registrar missões, ver dashboard e receber notificações mesmo offline.

### Funcionalidades
- Login com WhatsApp phone number
- Dashboard: scores, streaks, nível, achievements, IA recommendations
- Missões: lista + complete em 1 toque + quick mission (IA)
- Achievements grid
- Perfil com estatísticas
- Offline-first: cache local + sync automático
- Push notifications (lembrete 8h, achievements)
- Widget home screen "Missão de Hoje"

### Tech Stack
- React Native + Expo (SDK 51)
- TypeScript
- Zustand (state management)
- TanStack Query (server state)
- AsyncStorage (offline cache)
- Expo Notifications (push)
- React Navigation (tabs + modal)

### Quick Start

```bash
cd /data/.openclaw/workspace/swarm/dev/mobile
npm install
npx expo start
```

Escaneie QR com Expo Go (Android/iOS).

### Build Produção

```bash
npx eas build --platform all --profile production
```

### Documentação Completa

- **MOBILE.md** — Guia completo install/run/build/deploy
- **docs/MOBILE_UI.md** — Design System, UX, Onboarding, Push copy
- **docs/MOBILE_ARCHITECTURE.md** — Arquitetura técnica (Zustand, Query, CI/CD)
- **docs/MOBILE_USER_STORIES.md** — Backlog, User Stories, Acceptance Criteria
- **docs/WIDGET.md** — Implementação nativa iOS/Android
- **docs/SECURITY_CHECKLIST.md** — Segurança (18 categorias)
- **docs/PERFORMANCE_RECOMMENDATIONS.md** — Otimizações
- **docs/DEPLOYMENT_CHECKLIST.md** — Checklist lojas

Ver `MOBILE.md` para todas as details.

---

## 📈 Próximos Passos (Roadmap)

- [x] ✅ Mobile app (React Native + Expo) - **v1.0.0 released**
- [x] ✅ Assinaturas Premium (Stripe)
- [ ] Widget nativo completo (iOS today + Android home)
- [ ] Multiplayer (leaderboards friends, competitions)
- [ ] Advanced gamification (store items, avatares, boosts)
- [ ] Export dados (CSV, PDF report)
- [ ] Wearable integration (Apple Watch, Wear OS)
- [ ] Multi-language (i18n: en, es)

Ver [`docs/RELEASE_MANAGEMENT.md`](docs/RELEASE_MANAGEMENT.md) para roadmap detalhado.

---

## 🎉 Release v1.0.0 - Mobile Complete!

**Status**: ✅ MVP completo, pronto para produção

### Download
- **iOS**: [App Store](https://apps.apple.com/app/life-gamification/idXXXXX) *(em review)*
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=com.lifegamification.app) *(em review)*

### Features
- ✅ React Native app (iOS/Android)
- ✅ Offline-first com sync automático
- ✅ Push notifications (lembretes, achievements)
- ✅ Design system completo (cores por área, Inter font)
- ✅ Onboarding flow (4 slides)
- ✅ Monetização (assinaturas mensal R$19,90 / anual R$199,90)
- ✅ CI/CD automatizado (GitHub Actions + EAS)
- ✅ Store submissions iniciadas

Ver [`CHANGELOG.md`](CHANGELOG.md) para lista completa de mudanças.

---

## 📚 Documentação

| Categoria | Documento | Descrição |
|-----------|-----------|-----------|
| **Mobile** | [docs/MOBILE.md](docs/MOBILE.md) | Guia completo (install, run, build) |
| | [docs/MOBILE_ARCHITECTURE.md](docs/MOBILE_ARCHITECTURE.md) | Arquitetura técnica |
| | [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Tokens, componentes, microcopy |
| | [docs/QA_TEST_CASES.md](docs/QA_TEST_CASES.md) | Testes manuais |
| **Monetização** | [docs/MONETIZATION_SETUP.md](docs/MONETIZATION_SETUP.md) | Stripe integration |
| | [docs/PAYMENT_INTEGRATION.md](docs/PAYMENT_INTEGRATION.md) | API payment endpoints |
| **Deploy** | [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) | Checklist pré-lançamento |
| | [docs/RELEASE_MANAGEMENT.md](docs/RELEASE_MANAGEMENT.md) | Processo de release |
| | [docs/UPGRADE_GUIDE.md](UPGRADE_GUIDE.md) | Como migrar de versões anteriores |
| **Backend** | [backend/main.py](backend/main.py) | Código fonte API |
| | [backend/schema.sql](backend/schema.sql) | Database schema |
| | [`/docs`](http://localhost:8000/docs) | Swagger UI (runtime) |

Ver [docs/INDEX.md](docs/INDEX.md) para índice completo navegável.

---

## 📄 Licença

MIT License - Sinta-se livre para modificar e usar.

**Desenvolvido para Nikolas de Hor** 🚀

Sistema MVP completo em ~12 horas de desenvolvimento paralelo com agentes AI especializados.