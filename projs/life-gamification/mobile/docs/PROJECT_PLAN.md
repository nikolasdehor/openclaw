# 📋 LIFE GAMIFICATION - MOBILE APP: PLANO DE EXECUÇÃO

## 🚨 **PO - LEIA PO_MANDATORY_STEPS.md PRIMEIRO!**

Antes de prosseguir, abra e leia o arquivo `PO_MANDATORY_STEPS.md`. Ele contém as instruções passo a passo EXECUTÁVEIS (comandos sessions_spawn exatos) que você deve seguir.

Resumo:

1. Siga as etapas 0-6 em ordem
2. Spawn os agentes nos horários corretos (dev+cto juntos, depois pm+cmo)
3. Monitore progresso
4. Consolide no final e reporte ao CEO

O arquivo `PO_MANDATORY_STEPS.md` é a sua fonte de verdade. Use-o como checklist.

---

## 🎯 Visão Geral

**Projeto**: Life Gamification Mobile App (React Native + Expo)
**Backend**: Já exists em `/data/.openclaw/workspace/projs/life-gamification/backend`
**Frontend Web**: Já exists em `/data/.openclaw/workspace/projs/life-gamification/frontend`
**Prazo**: 3 dias úteis (72h)
**Objetivo**: App mobile completo (iOS/Android) integrado ao backend existente

---

## 📊 Estrutura do Projeto Mobile

```
life-gamification/
├── mobile/                    # NOVO: React Native app
│   ├── App.tsx
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── MissionListScreen.tsx
│   │   ├── MissionDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── AchievementScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── MissionCard.tsx
│   │   ├── AreaProgress.tsx
│   │   ├── LevelBadge.tsx
│   │   └── StreakCounter.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── services/
│   │   ├── api.ts            # axios config + endpoints
│   │   ├── notifications.ts  # push notifications
│   │   ├── healthkit.ts      # iOS Health data (opcional)
│   │   └── googlefit.ts      # Android Google Fit (opcional)
│   ├── utils/
│   │   ├── storage.ts        # AsyncStorage
│   │   └── helpers.ts
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── app.json              # Expo config
│   ├── app.config.js         # dynamic config
│   ├── package.json
│   └── ...
├── backend/                   # EXISTENTE (reutilizar)
├── frontend/                  # EXISTENTE (web)
└── docs/
    ├── MOBILE.md             # Como rodar, build, deploy
    └── MOBILE_API.md         # API endpoints mobile
```

---

## 🏗️ Fases e Entregas

### FASE 1: Setup e Arquitetura (6h) - CTO + Dev

**CTO responsibilities:**

- Criar estrutura Expo (TypeScript)
- Configurar EAS Build (CI/CD)
- Definir arquitetura de navegação (React Navigation 6)
- Setup de theming (cores por área: Bolsa=verde, Mente=azul, Vitalidade=vermelho, Propósito=roxo)
- Configurar lint/format (ESLint + Prettier)

**Dev responsibilities:**

- Criar App.tsx com NavigationContainer
- Implementar ThemeContext (dark/light mode)
- Configurar axios base (http://IP_VPS:8000)
- Criar services/api.ts com todos os endpoints
- Testar conexão com backend

**Entregáveis:**

- `mobile/` com estrutura completa
- `mobile/package.json` com dependências
- `mobile/app.json` (Expo config)
- Conexão API testada (GET /dashboard)

---

### FASE 2: Telas Core (12h) - Dev + CMO

**Dev (前端):**

- DashboardScreen: cards de áreas, barras de progresso, nível, streak
- MissionListScreen: lista de missões (filtradas por área), pull-to-refresh
- MissionDetailScreen: detalhes, botão completar, timer (missões em andamento)
- ProfileScreen: stats, histórico, configurações

**CMO (UX/UI):**

- Prototype Figma (ou esboço) das 4 telas principais
- Design system:
  - Typography (Inter, 14-18px body)
  - Colors (primary=#4F46E5, secondary=#10B981, etc.)
  - Spacing (8px grid)
  - Components (Button, Card, Badge) specs
- Copy microcopy: "Completar missão", "Streak de X dias", "Novo achievement!"

**Entregáveis:**

- Telas funcionais (pelo menos 3/4)
- Design system aplicado
- Navegação entre telas
- Testes manuais (click, scroll, load)

---

### FASE 3: Gamificação Completa (10h) - Dev + PM

**Dev:**

- Implementar Zustand/Context para state global (pontos, streaks, user)
- Service de persistência local (AsyncStorage) - cache dashboard
- Offline mode: salvar checkins locally, sync when online
- Lógica de pontos, streaks, level calculation (client + server sync)
- Achievement unlock local + server confirmation

**PM:**

- User stories detalhados (1-2-3-4)
- Acceptance criteria por tela
- Checklist de QA (cenários: online/offline,\_notifications, widgets)
- Definição de missões types (daily, weekly, custom)

**Entregáveis:**

- State management funcionando
- Offline checkin (sync after) -成就 badges UI
- QA approved (no críticos)

---

### FASE 4: Notificações Push & Widgets (12h) - Dev + CTO + CMO

**Dev:**

- expo-notifications setup (iOS/Android)
- Schedule de notificações (lembrete missão não feita, achievement unlocked)
- Handlers: onNotificationOpened, onNotificationReceived
- Background tasks (expo-task-manager) para sync periódico
- Widget de Hoje (iOS TodayExtension, Android AppWidget)
  - Mostrar: próxima missão, streak atual, pontos do dia

**CTO:**

- EAS Build profile (development, preview, production)
- Code signing setup (Apple Developer, Google Play Console)
- OTA updates config (expo-updates)
- Crash reporting (Sentry ou expo)
- Security: embed backend URL securely (app.config.js)

**CMO:**

- Copy notificações: "Sua missão de Vitalidade te espera!", "Parabéns! +200 pontos"
- Onboarding screens (3-4 slides) explicando gamificação
- Empty states (nenhuma missão, offline)
- Localization (pt-BR) preparação (i18n)

**Entregáveis:**

- Push notifications funcionando (teste real)
- Widget básico (mostra 1 missão + streak)
- EAS Build rodando (build preview)
- Onboarding flow
- i18n estrutura pronta

---

### FASE 5: Integração Health/Google Fit (6h) - Dev (opcional)

**Dev:**

- expo-health (iOS HealthKit) + expo-google-fit (Android)
- Permissões solicitadas no primeiro uso
- Sync automático: passos, sono, heart rate → Vitalidade area
- Dashboard mostra dados health integrados (gráfico semanal)

**Entregável:**

- Funcionalidade health opcional (pode ser desligada)
- Dados sync a cada 1h (background fetch)

---

### FASE 6: Testes e Deploy (8h) - Todos

**Dev:**

- Unit tests (Jest) para services, utils (50% coverage)
- E2E tests (Detox) login + checkin + notifications
- Fix bugs críticos (crash, sync errors)
- Build produção: eas build --platform all

**CTO:**

- App Store Connect setup (metadata, screenshots, keywords)
- Google Play Console setup (beta track)
- Submit para review (Apple ~1-3 dias, Google ~1-2 dias) -配置 TestFlight internal testing (iOS)
- Configurar Firebase Cloud Messaging (FCM) para Android

**PM:**

- Release notes (v1.0.0)
- FAQ document (app/issues)
- User guide quick (how to use daily)
- Monitoring plan (crashlytics, analytics)

**CMO:**

- Screenshots para stores (5+ mobile)
- App icon set (1024x1024 + variations)
- Feature graphic (Google Play)
- Promo video (15s optional)

**Entregáveis:**

- App built e assinado (.ipa, .aab)
- Submetido às stores (pelo menos em beta/internal)
- Docs de deploy
- Monitoring ativo

---

## 📋 Checklist de Sucesso (Definition of Done)

**Must-have (MVP):**

- [ ] App abre, Dashboard carrega dados do backend
- [ ] Missões listadas, completar funciona (POST /mission/complete)
- [ ] Notificações push agendadas e recebidas
- [ ] Offline checkin (AsyncStorage + sync)
- [ ] Level/streak/achievements calculados corretamente
- [ ] Integração com backend 100% (mesma API do web)
- [ ] Build EAS sucesso (iOS + Android)
- [ ] Submetido a pelo menos 1 loja (TestFlight/internal)

**Nice-to-have:**

- [ ] Widget Hoje
- [ ] Health/Google Fit integration
- [ ] Onboarding completo
- [ ] i18n completo
- [ ] E2E tests

---

## 🧩 Atribuição de Responsabilidades

| Agente  | Responsabilidades                                               | Foco (h) |
| ------- | --------------------------------------------------------------- | -------- |
| **CTO** | Arquitetura, EAS Build, code signing, security, CI/CD           | 16h      |
| **Dev** | Implementação React Native, APIs, state, offline, notifications | 40h      |
| **PM**  | User stories, QA checklist, acceptance criteria, release notes  | 8h       |
| **CMO** | Design system, copy, onboarding, store assets                   | 12h      |

Total: ~76 horas (distribuídas em 3 dias, 4 agentes em paralelo)

---

## ⚠️ Riscos e Mitigações

| Risco                                  | Prob | Impact | Mitigação                                                                    |
| -------------------------------------- | ---- | ------ | ---------------------------------------------------------------------------- |
| Backend unavailable during dev         | M    | A      | Mock API service ( MirageJS ) - Dev implementa                               |
| Expo Go limitations (push not in dev)  | M    | M      | Use EAS build preview para testar push                                       |
| Apple review delays (novo developer)   | M    | H      | Submeter cedo, usar TestFlight interno primeiro                              |
| Health APIs复杂 e device-specific      | M    | M      | Feature flag (desligado por default), só quem tem iPhone/Android com sensors |
| State management bugs (offline/online) | L    | H      | Testes manuais + Detox E2E                                                   |
| Team dependencies blocking             | L    | H      | Daily sync (PO) + blockers escalated imediato                                |

---

## 🔄 Fluxo de Trabalho Diário

**PO (monitor):**

- Daily standup virtual com agentes (mensagem)
- Track progress contra Timeline
- Remove blockers
- Consolidate PRs (quando houver Git)
- Report status final a Nikolas

**Git:**

- Repo: `/data/.openclaw/workspace/projs/life-gamification`
- Branch: `mobile-dev` (cada agente trabalha em sua branch, merge via PO)
- Commits semânticos (feat, fix, chore)

---

## 📦 Entregas Finais ao Nikolas

1. **mobile/** com código completo e testado
2. **docs/MOBILE.md** com:
   - Como rodar com Expo Go
   - Como fazer build (EAS)
   - Como configurar push notifications (FCM/APNs)
   - Troubleshooting
3. **README.md** atualizado com seção mobile
4. **build artifacts** (.ipa, .aab) stores-ready
5. **store listing assets** (screenshots, icon, description)
6. **user guide** rápido (PDF/HTML)
7. **monitoring dashboard** (crashlytics, analytics setup)

---

## 🚀 Sinal Verde para Iniciar

Se esse plano está aprovado, o PO deve:

1. Spawnar agentes: dev, cto, pm, cmo
2. Distribuir tarefas (cada um recebe sua Fase + deliverables)
3. Estabelecer daily sync (ex: 10h manhã)
4. Começar imediatamente

---

**Nota**: Backend permanece inalterado. Apenas extensões (`/admin/import-finances` já existe). Mobile app consome API existente.

**Estimativa real**: 3 dias se tudo corre bem. Pois:

- EAS Build pode dar金牌 no primeiro iOS (precisa Apple Developer account)
- Push notifications testing takes time (device real)
- Store review unpredictable

**Recomendação**: Submeter first para TestFlight (iOS) e Internal Testing (Android) mesmo que incompleto, para já startar review timer.
