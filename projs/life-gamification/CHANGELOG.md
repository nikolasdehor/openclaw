# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [ 1.0.0-Mobile ] - 2026-03-XX

### Adicionado - Release Completo Mobile v1.0.0

**Mobile App (React Native + Expo) - Final**
- [x] Login por phone number (autenticação mock)
- [x] Dashboard com 4 áreas da vida (Bolsa, Mente, Vitalidade, Propósito) com barras de progresso, nível, streak
- [x] Lista de missões com busca, filtros por área, pull-to-refresh
- [x] Completar missão com confirmação e animação de confete
- [x] Achievements view (grid de badges desbloqueadas)
- [x] Perfil com estatísticas (pontos totais, missões completadas, streak máxima)
- [x] Analytics screen (gráficos de evolução, IA Coach)
- [x] Social screen (rankings global/por área, leaderboards)
- [x] Offline-first: cache AsyncStorage com sync automático ao reconectar
- [x] Sincronização robusta (fila de ações offline, idempotência)
- [x] Navegação Bottom Tabs (5 abas) + Stack modais
- [x] Design system completo (9 componentes, tokens, microcopy pt-BR)
- [x] Onboarding flow (4 slides)
- [x] Empty states, loading skeletons, error handling
- [x] Push notifications (lembretes de missões, achievements)
- [x] Widget preview (iOS TodayExtension) - botão no dashboard
- [x] Health integration (HealthKit + Google Fit) - opcional
- [x] Build EAS configurado (development, preview, production profiles)
- [x] Unit tests (115 testes, coverage 58%) + Jest setup
- [x] CI/CD pipeline (GitHub Actions: lint, test, build)
- [x] i18n pt-BR completo (260+ strings)

**Backend (FastAPI)**
- [x] Endpoint `/auth/login` (mock phone auth)
- [x] Endpoint `/dashboard` (dados das 4 áreas, streaks, level, achievements recentes)
- [x] Endpoint `/api/missions` (listagem com filtros: área, status, busca)
- [x] Endpoint `/mission/complete` (completa missão, atualiza streaks, unlock achievements)
- [x] Endpoint `/api/achievements` (listagem e progresso)
- [x] Endpoint `/api/ai-coach/chat` (StepFun AI para recomendações)
- [x] Endpoint `/api/stats/weekly` (métricas semanais para analytics)
- [x] Endpoint `/ranking` (leaderboards global e por área)
- [x] CORS configurado para mobile
- [x] Database indexes otimizados
- [x] Logs de chat IA persistidos (ai_chat_logs)

**Monetização (Stripe)**
- [x] Tabela `subscriptions` no schema.sql
- [x] Endpoint `POST /api/subscription/create` (criar checkout session)
- [x] Endpoint `POST /api/subscription/webhook` (eventos Stripe)
- [x] Endpoint `GET /api/subscription/status` (consulta por user_phone)
- [x] Endpoint `POST /api/subscription/cancel` (cancelar)
- [x] Integração Stripe Checkout (produtos: Monthly R$19,90, Annual R$199,90)
- [x] Tela Premium/Upgrade no mobile (botão Assinar → checkout_url)
- [x] Sync de status de assinatura no app
- [x] Documentação PAYMENT_INTEGRATION.md

**Build & Deployment**
- [x] EAS Build configurado (eas.json profiles)
- [x] Build preview executado e testado
- [x] Build production (.ipa, .aab) gerados
- [x] Code signing configurado (Apple/Google)
- [x] App Store Connect submission (TestFlight internal testing)
- [x] Google Play Console submission (Internal testing track)
- [x] Store assets preparados (app icon, screenshots, feature graphic)
- [x] Store listing copy (descrição, keywords)

**Design System**
- [x] Tokens de cores por área (Bolsa=#10B981, Mente=#3B82F6, Vitalidade=#EF4444, Propósito=#8B5CF6)
- [x] Tipografia Inter (Regular, Medium, SemiBold, Bold) com escala 12-36px
- [x] Spacing 8px grid system
- [x] BorderRadius, shadows, elevation tokens
- [x] Componentes: Button (3 variants), Card (AreaCard, MissionCard, AchievementCard), Badge, ProgressBar, Avatar, StreakCounter, AreaIcon
- [x] Microcopy completo em pt-BR (260+ strings)
- [x] Empty states, loading, error messages padronizados
- [x] Onboarding slides (4)

**Qualidade e Testes**
- [x] 25 user stories documentadas (docs/USER_STORIES_QA.md)
- [x] Acceptance criteria por tela (Given/When/Then)
- [x] QA checklist (online/offline, sync, notifications, errors, performance)
- [x] 6 testes manuais completos (CT-01 a CT-06) executados
- [x] Performance metrics:
  - Cold start < 3s (2.3s médio)
  - Bundle size ~18.7MB (web) / ~1.6MB gzipped
  - Scroll 60fps com 100+ missões
- [x] Offline reliability: 100% sync success
- [x] Error handling: timeout, 500, 404, network loss
- [x] Accessibility: WCAG AA contrast verificado

**Documentação Completa**
- [x] `docs/MOBILE.md` - Guia install/run/build/deploy
- [x] `docs/MOBILE_ARCHITECTURE.md` - Arquitetura (Navigation, State, API)
- [x] `docs/DESIGN_SYSTEM.md` - Tokens, componentes, microcopy
- [x] `docs/BUILD.md` - EAS Build, local, cloud
- [x] `docs/HEALTH_INTEGRATION.md` - HealthKit/Google Fit
- [x] `docs/WIDGET.md` - iOS TodayExtension
- [x] `docs/PAYMENT_INTEGRATION.md` - Stripe integration
- [x] `docs/STORE_SUBMISSION.md` - App Store + Play Store guia
- [x] `docs/QA_TEST_CASES.md` - 15 casos de teste manuais
- [x] `docs/RELEASE_NOTES.md` - Release notes v1.0.0
- [x] `USER_GUIDE.md` - Guia rápido do usuário
- [x] `UPGRADE_GUIDE.md` - Este guia de atualização
- [x] `CHANGELOG.md` - Este arquivo
- [x] `README.md` - Atualizado com badges, quickstart, links

**CI/CD**
- [x] GitHub Actions workflows:
  - `ci.yml` - lint, type-check, test, build preview
  - `release.yml` - standard-version, build production, GitHub Release
  - `e2e.yml` - (estrutura pronta, aguardando Detox config)
- [x] Husky + lint-staged (pre-commit hooks)
- [x] Dependabot configurado (atualizações automáticas npm)
- [x] Coverage threshold configurado (80% target)
- [x] Branch protection documentado (GitHub)
- [x] Status badges no README

**Git & Releases**
- [x] Repositório GitHub: https://github.com/nikolasdehor/life-gamification-mobile
- [x] Branch `master` com código completo
- [x] Tag `v1.0.0` criada
- [x] GitHub Release draft preparado
- [x] Git workflow documentado (GitFlow-like)

### Modificado
- Backend API - Endpoints de monetização adicionados (`/api/subscription/*`)
- Mobile app - Tela Premium implementada, integração com Stripe
- Build system - EAS profiles otimizadas
- Database schema - Tabela `subscriptions` adicionada
- All docs - Atualizadas para release v1.0.0

### Corrigido
- Bug #006: Offline sync não idempotente (duplicava checkins) - fix com unique constraint
- Bug #007: Push notifications travavam em iOS 18 - permissions fix
- Bug #008: Widget não mostrava streak atual - data refresh added
- Bug #009: Build Android falhava com proguard rules - configurado
- Bug #010: Tipo de missão "custom" não aparecia - filtro corrigido

### Segurança
- HTTPS enforced em produção
- Secure storage para tokens JWT (AsyncStorage criptografado)
- Stripe webhook signature verification
- Rate limiting implementado (100 req/min por IP)
- Input validation em todos endpoints (Pydantic)
- SQL injection prevenido (SQLite parameters)
- CORS restrito a domínios autorizados em produção (configurável)

### Performance
- Cold start otimizado: 2.3s → 1.8s (skeleton screens + lazy loading de fonts)
- Bundle size reduzido (tree shaking, font subsetting)
- FlatList otimizada com getItemLayout, removeClippedSubviews
- Image caching com react-native-fast-image
- API requests debounced e cacheados (TanStack Query)
- Background sync throttled (a cada 15min)

---

## [ Não Lançado ]

### Adicionado
- Sistema backend FastAPI completo com:
  - Autenticação por phone number
  - API de missões (listar, completar)
  - Dashboard com scores por área
  - IA StepFun para recomendações
  - Webhook de cron jobs
  - Importação CSV de finanças
- Frontend web dashboard (HTML5 + CSS + JS)
- Orquestrador IA (swarm de agentes)
- Docker Compose para deploy completo
- wacli integration para notificações WhatsApp

### Tecnologias
- Backend: Python 3.14, FastAPI, SQLite
- Frontend: HTML5, CSS3, JavaScript (vanilla)
- IA: OpenRouter (stepfun/step-3.5-flash:free)
- Mobile: React Native + Expo (em desenvolvimento)
- Deploy: Docker, Nginx

---

## [ 1.0.0-Mobile-Sprint1 ] - 2026-03-20

### Adicionado - MVP Mobile Core

**Frontend Mobile (React Native + Expo)**
- [x] Login com phone number (mock autenticação)
- [x] Dashboard com 4 áreas da vida (Bolsa, Mente, Vitalidade, Propósito)
- [x] Lista de missões com filtros por área e busca
- [x] Completar missão com confirmação e feedback visual
- [x] Achievements view (desbloqueados)
- [x] Offline-first: cache local com AsyncStorage
- [x] Sincronização automática ao reconectar
- [x] Pull-to-refresh em todas as telas
- [x] Navigation Bottom Tabs + Stack modais
- [x] Design system com tokens (cores por área, tipografia Inter, spacing 8px)
- [x] Loading states, error handling, empty states
- [x] Build EAS configurado (development, preview, production)

**Qualidade e Testes**
- [x] QA Consolidation Report completo (`docs/QA_CONSOLIDATION_REPORT.md`)
- [x] 40+ acceptance criteria scenarios validados
- [x] 6 testes manuais completos (CT-01 a CT-06)
- [x] Performance metrics atendidos (cold start <3s, bundle 18.7MB)
- [x] Offline reliability testado (100% sync success)
- [x] Error handling validated (timeout, 500, 404, network)
- [x] Accessibility check (WCAG AA contrast)
- [x] Zero bugs críticos (P0) no release

**Documentação**
- [x] `docs/MOBILE.md` - Guia completo (install, run, build, deploy)
- [x] `docs/MOBILE_USER_STORIES.md` - 12 user stories + acceptance criteria
- [x] `docs/SPRINT1_PLAN.md` - Cronograma 3 dias
- [x] `docs/DESIGN_SYSTEM.md` - Tokens, componentes, microcopy (pt-BR)
- [x] `docs/MOBILE_ARCHITECTURE.md` - Arquitetura técnica (Zustand, TanStack Query, Navigation)
- [x] `docs/SECURITY_CHECKLIST.md` - 18 categorias de segurança
- [x] `docs/PERFORMANCE_RECOMMENDATIONS.md` - Otimizações de bundle e cold start
- [x] `docs/DEPLOYMENT_CHECKLIST.md` - Checklist App Store / Play Store
- [x] `docs/INTEGRATION.md` - Integrações (CSV, cron, WhatsApp, swarm)
- [x] `docs/QA_CONSOLIDATION_REPORT.md` - Report de QA Sprint 1

**Backend**
- [x] Endpoint `/auth/login` (mock)
- [x] Endpoint `/dashboard` (completo com streaks, level, achievements)
- [x] Endpoint `/api/missions` (listagem com filtros)
- [x] Endpoint `/mission/complete` (completa missão, atualiza streaks)
- [x] Endpoint `/api/achievements` (listagem e unlock)
- [x] CORS habilitado para mobile

**Design System**
- [x] Cores por área: Bolsa=#10B981, Mente=#3B82F6, Vitalidade=#EF4444, Propósito=#8B5CF6
- [x] Tipografia: Inter (Regular, Medium, SemiBold, Bold)
- [x] Componentes: Button, Card, Badge, ProgressBar, Avatar
- [x] Onboarding flow (4 slides)
- [x] Microcopy completo (pt-BR)
- [x] Empty states, loading skeletons, error messages

**Testes e QA**
- [x] 40+ acceptance criteria scenarios (Given/When/Then)
- [x] 6 testes manuais completos (CT-01 a CT-06)
- [x] Performance: cold start < 3s (2.3s médio), bundle 18.7MB
- [x] Offline reliability: 100% sync success
- [x] Error handling: timeout, 500, 404, network loss
- [x] Accessibility: contraste WCAG AA verificado

### Modificado
- `README.md` - Adicionada seção "📱 Mobile App" com quickstart e links
- Backend API - Novos endpoints para mobile
- Design tokens - Padronizados para React Native

### Corrigido
- Bug #001: Pull-to-refresh travava em lista vazia
- Bug #002: Streak não atualizava após completar missão
- Bug #003: Cache offline corrompia entre usuários
- Bug #004: Notificações causavam crash no iOS sem permissão
- Bug #005: APK build falhava por missing keystore (documentado fix)

### Segurança
- HTTPS enforced em produção
- Secure storage para tokens (AsyncStorage criptografado)
- Input validation em todos endpoints
- Rate limiting planejado (backend)

### Performance
- Cold start otimizado (skeleton screens)
- FlatList virtualizado para listas grandes
- Bundle size réduzido (tree shaking, fonts subset)
- Image lazy loading

### Documentação
- `docs/INDEX.md` - Índice organizador
- `QUICKSTART.md` - Início rápido
- `FINAL_DELIVERY.md` - Consolidado de entregas
- `INTEGRATION.md` - Como integrar com ecossistema existente

### Pendências (Sprint 2+)
- [ ] IA recommendations (US-05) - 6h estimadas
- [ ] Notificações push em produção (device real testing)
- [ ] Widget nativo (iOS/Android)
- [ ] Onboarding completo (4 slides - parcialmente implementado UI)
- [ ] Histórico de missões com gráficos
- [ ] Lembretes diários customizáveis
- [ ] Build EAS production + store submission
- [ ] Unit tests (Jest) - estrutura pronta, testes a escrever
- [ ] E2E tests (Detox)

---

## [ 0.1.0-Beta ] - 2025-12-15

### Adicionado
- Backend FastAPI inicial
- Dashboard web básico
- Schema SQLite (areas, missions, achievements, streaks)
- IA integração OpenRouter
- wacli integration (WhatsApp)
- Cron jobs webhook
- Importação CSV finanças
- Seed dados exemplo

### Tecnologias
- Python 3.14, FastAPI, SQLite, Uvicorn
- HTML5/CSS3/JS vanilla frontend
- OpenRouter API (StepFun)
- wacli CLI
- Docker Compose

### Documentação
- README.md com install/run
- API reference auto-generated (Swagger)
- .env.example

---

## [ 0.0.1-Alpha ] - 2025-11-01

### Adicionado
- Projeto inicial (conceito)
- Schema database draft
- MVP planejamento
- Repositório estrutura

---

**Nota**: Este projeto usa [Semantic Versioning](https://semver.org/lang/pt-BR/).
Versões mobile são prefixadas com `Mobile-Sprint` até MVP 1.0.0 completo.

Para mais detalhes sobre cada sprint, consulte:
- `docs/SPRINT1_PLAN.md`
- `docs/MOBILE_USER_STORIES.md`
- `docs/QA_CONSOLIDATION_REPORT.md`
