# 📚 Documentation Index - Life Gamification

Bem-vindo à documentação oficial do Life Gamification.

Este índice organiza todos os documentos por categoria. Use este guia para encontrar rapidamente o que precisa.

---

## 🚀 Quick Start

- **README.md** (raiz) - Visão geral, instalação rápida, links
- **QUICKSTART.md** (raiz) - Início rápido (5 minutos)
- **MOBILE.md** (raiz) - Como rodar o app mobile (Expo Go)
- **MOBILE.md** (docs/) - Guia completo mobile (install/run/build/deploy)

---

## 📱 Mobile App (React Native + Expo)

### Guias Principais
- **docs/MOBILE.md** - Guia completo: instalação, execução, build, deploy
- **docs/MOBILE_ARCHITECTURE.md** - Arquitetura técnica:
  - Navegação (React Navigation 7)
  - Gerenciamento de estado (Context, futuramente Zustand)
  - Camada de API (FastAPI integration)
  - Configuração EAS Build

### Design System
- **docs/DESIGN_SYSTEM.md** - Tokens de design, componentes, microcopy (pt-BR)
  - Cores por área (Bolsa, Mente, Vitalidade, Propósito)
  - Tipografia (Inter font, escala 12-36px)
  - Componentes: Button, Card, Badge, ProgressBar, Avatar
  - Onboarding flow, Empty states
  - Responsividade (breakpoints)

### User Stories & QA
- **docs/USER_STORIES_QA.md** - 25 user stories + acceptance criteria
- **docs/QA_CONSOLIDATION_REPORT.md** - Relatório consolidado de QA (Sprint 1)
- **docs/QA_TEST_CASES.md** - 15 casos de teste manuais (CT-01 a CT-06)

### Build & Deployment
- **docs/BUILD.md** - Como buildar (EAS local/cloud)
- **docs/DEPLOYMENT_CHECKLIST.md** - Checklist App Store/Play Store
- **docs/WIDGET.md** - iOS TodayExtension widget
- **docs/HEALTH_INTEGRATION.md** - HealthKit + Google Fit integration
- **docs/PAYMENT_INTEGRATION.md** - Stripe monetização setup

### Reports & Summaries
- **mobile/COMPLETION_REPORT.md** - Report de conclusão Sprint 1
- **mobile/INTEGRATION_SUMMARY.md** - Integração das 3 frentes
- **mobile/FINAL_REPORT.md** - Relatório final MVP completo
- **mobile/DEMO_GUIDE.md** - Como demonstrar o app (demo mode)

---

## 🔧 Backend (FastAPI)

### Arquitetura & API
- **docs/INTEGRATION.md** - Integração com ecossistema existente (CSV, cron, WhatsApp)
- **backend/main.py** - Código fonte principal (documentação inline via docstrings)
- **backend/schema.sql** - Database schema completo

### API Reference
O backend gera documentação automática via Swagger:

```
http://localhost:8000/docs  # Swagger UI (development)
http://localhost:8000/redoc  # ReDoc
```

Endpoints principais:
- `GET /dashboard` - Dashboard com scores por área
- `GET /api/missions` - Lista de missões
- `POST /mission/complete` - Completar missão
- `GET /api/achievements` - Achievements list
- `POST /api/subscription/create` - Criar checkout (Stripe)
- `POST /api/subscription/webhook` - Stripe webhook
- `GET /api/subscription/status` - Status da assinatura
- `POST /api/ai-coach/chat` - Chat com IA StepFun

---

## 💳 Monetização (Stripe)

- **docs/MONETIZATION_SETUP.md** - Guia completo de setup:
  - Criar conta Stripe
  - Obter API keys
  - Configurar webhook
  - Criar produtos (monthly R$19,90, annual R$199,90)
  - Testar em modo de teste
  - Go-live

- **docs/PAYMENT_INTEGRATION.md** - Detalhes da integração técnica (se separado de MONETIZATION_SETUP.md)

---

## 🚀 Release & Deployment

### Processo de Release
- **docs/RELEASE_MANAGEMENT.md** - Processo completo:
  - Versioning scheme (SemVer)
  - Build pipeline (GitHub Actions)
  - Store submission (iOS/Android)
  - Communication plan
  - Post-release monitoring
  - Hotfix process

### Checklists
- **docs/PRODUCTION_CHECKLIST.md** - Checklist final de produção:
  - Backend readiness
  - Mobile build verification
  - Store submission items
  - QA final validation
  - Monitoring setup
  - Legal/compliance

### Deployment Architecture
- **docs/DEPLOYMENT_ARCHITECTURE.md** - Diagrama de arquitetura de deploy
- **docs/GIT_CI_CD.md** - Git workflow + CI/CD
- **docs/RUNBOOKS.md** - Troubleshooting runbooks

---

## 📊 Sprint Reports (Development History)

### Sprint 1 (Mobile MVP)
- **docs/SPRINT1_PLAN.md** - Cronograma 3 dias
- **docs/SPRINT1_DELIVERY.md** - Entregas consolidadas
- **docs/SPRINT1_COORDINATION_SUMMARY.md** - Resumo da coordenação
- **mobile/SPRINT1_COMPLETE.md** - Relatório final sprint 1

### Sprint 2 (Launch Preparation) - Current
- **SPRINT2_ACTION_PLAN.md** (raiz) - Plano de ação Sprint 2
- (Documentação sendo criada durante sprint)

---

## 📝 License & Legal

- **LICENSE** (raiz) - Licença MIT
- **PRIVACY_POLICY.md** (criar se necessário) - Política de privacidade
- **TERMS.md** (criar se necessário) - Termos de serviço

---

## 🧑‍💻 For Contributors

### Development Setup
- **backend/requirements.txt** - Dependências Python
- **mobile/package.json** - Dependências Node/Expo
- **.eslintrc.js**, **.prettierrc** - Linting/formatting rules
- **tsconfig.json** - TypeScript configuration

### Testing
- **docs/QA_TEST_CASES.md** - Testes manuais
- **mobile/__tests__/** - Unit tests (Jest)
- **mobile/e2e/** - E2E tests (Detox) - estrutura

### Git Workflow
- **docs/GIT_CI_CD.md** - Branch strategy, commit conventions, PR process
- **.github/workflows/** - GitHub Actions (ci, release, e2e)

---

## 🔗 External Resources

### APIs & Services
- **Stripe**: https://stripe.com/docs
- **Expo**: https://docs.expo.dev/
- **FastAPI**: https://fastapi.tiangolo.com/
- **React Native**: https://reactnative.dev/docs/getting-started

### Tools
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI**: `npm install -g eas-cli`
- **Stripe CLI**: `brew install stripe/stripe-cli/stripe`

---

## 📞 Support

- **GitHub Issues**: https://github.com/nikolasdehor/life-gamification/issues
- **Email**: support@lifegamification.com (futuro)
- **Chat IA**: Use o botão "Coach" no app

---

**Last updated**: 2026-03-21 (Sprint 2)  
**Maintained by**: PM (Project Manager)
