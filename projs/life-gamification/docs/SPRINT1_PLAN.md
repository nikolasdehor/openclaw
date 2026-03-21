# 🚀 Sprint 1 - Plano de Ação (3 dias úteis)

**Objetivo**: Entregar MVP funcional do app mobile com login, dashboard, missões e achievements.

---

## 📋 Escopo Sprint 1 (Must Have)

[US-01] Login com WhatsApp
[US-02] Dashboard Mobile
[US-03] Lista de Missões
[US-04] Completar Missão
[US-05] IA Recommendations
[US-06] Achievements View
[US-09] Offline Básico

**Total**: 7 user stories.

---

## 📊 Estimativas e Responsabilidades

| Dia | US | Estimativa | Responsável | Produto |
|-----|----|------------|-------------|---------|
| **Dia 1** | US-01 | 4h | Frontend + setup auth | Login funcional (phone+OTP) |
| | US-02 | 6h | Frontend | Dashboard completo com 4 áreas |
| | Setup | 2h | DevOps | Expo config + API integrada |
| **Dia 2** | US-03 | 4h | Frontend | Lista de missões com filtros |
| | US-04 | 3h | Frontend + Backend | Complete missão + updates |
| | US-06 | 3h | Frontend | Achievements tab |
| | US-09 | 3h | Frontend | AsyncStorage + offline cache |
| **Dia 3** | US-05 | 6h | Frontend + Backend | IA recommendations integrado |
| | Bugfix + QA | 4h | Todos | Testes, ajustes, deploy |
| | Docs | 2h | PM | MOBILE.md atualizado |

**Total horas**: ~37h (4.6 dias úteis)
**Ajuste**: Cortar escopo ou reduzir qualidade para caber em 3 dias (24h)

---

## 🔥 Ajuste para 3 dias (realista)

### Dia 1 (8h)
- Manhã (4h): Setup Expo + Login (US-01) - **4h**
- Tarde (4h): Dashboard básico (US-02) - **4h**

**Dia 1 total**: 8h ✅
**Entregável**: App com login e dashboard com dados mock ou reais.

### Dia 2 (8h)
- Manhã (4h): Lista Missões + Complete (US-03 + US-04) - **8h** (mais complexo)
- Tarde (4h): Achievements + Offline básico (US-06 + cache dashboard) - **4h**

**Dia 2 total**: 8h ✅
**Entregável**: Missões e achievements funcionando; dados persistem offline.

### Dia 3 (8h)
- Manhã (4h): IA Recommendations (US-05) - **6h** ( muito complexo )
  - **Alternativa**: Implementar sem IA (mock) e deixar endpoint Gateway para futuro.
- Tarde (4h): Bugfixes + Testes + Docs - **4h**

**Dia 3 total**: 8h (com tradeoff)

**Problema**: US-05 (IA) sozinha consome 6h. Em 3 dias, precisamos reduzir.

---

## ✂️ Opções de Cortar (Prioridade)

1. **US-05 IA Recommendations** → Post MVP (deixar endpoint mas UI integrada depois)
2. **US-09 Offline Básico** → Post MVP (só cache simples, sem fila)
3. **US-06 Achievements** → reduzir para só desbloqueados (sem pendentes)

**Recomendação**: Cortar US-05 para Sprint 1. Entregar features básicas sólidas.
IA fica para Sprint 2.

---

## ✅ Sprint 1 Realista (3 dias - 24h)

### Dia 1 (8h)
- Setup Expo + API integration (2h)
- US-01 Login (4h)
- US-02 Dashboard básico (2h) **(parcial)**

### Dia 2 (8h)
- US-02 Dashboard completo (2h) **(resto)**
- US-03 Lista Missões (4h)
- US-04 Completar Missão (2h)

### Dia 3 (8h)
- US-06 Achievements view (3h)
- US-09 Offline cache básico (3h)
- QA + Bugfixes + Docs (2h)

**Entregável Sprint 1**:
- Login WhatsApp (phone+OTP)
- Dashboard com 4 áreas + streak + nível
- Lista de missões + complete button
- Achievements tab (desbloqueados apenas)
- Cache offline básico (dashboard + missões)
- APK/IPA build + QR code

**Fora do escopo Sprint 1**:
- ❌ IA recommendations (vai para Sprint 2)
- ❌ Widget (Sprint 2)
- ❌ Onboarding (Sprint 2)
- ❌ Histórico (Sprint 2)
- ❌ Lembretes (Sprint 2)
- ❌ Notificações push (Sprint 2)

---

## 📦 Pré-requisitos Técnicos

### Backend
- [x] API rodando (FastAPI)
- [x] OPENROUTER_API_KEY configurada (para US-05 se for fazer)
- [x] wacli configurado (opcional, para notificações)

### Mobile
- [ ] Node.js 18+ instalado
- [ ] Expo CLI (`npm install -g expo-cli`)
- [ ] Android Studio ou Xcode (para emulador)
- [ ] Conta Expo (opcional para builds)

### Infra
- [ ] Backend acessível via URL pública (NGROK ou domínio) **ou** usar IP local no mesma rede
- [ ] CORS habilitado para origem do app (Backend já tem `allow_origins=["*"]`)

---

## 🚦 Critérios de Aceitação Sprint 1

O MVP está pronto quando:

1. **Login**: Usuário pode digitar phone, receber OTP (via wacli ou mock) e logar
2. **Dashboard**: Mostra 4 áreas, scores, streaks, nível, achievements recentes
3. **Missões**: Lista disponível, filtro por área, botão completar funciona
4. **Pontuação**: Ao completar missão, pontos e streaks atualizam corretamente
5. **Achievements**: Desbloqueios aparecem na lista com toast
6. **Offline**: Dashboard carrega do cache se sem internet; missões completadas vão para fila
7. **Build**: APK ou build Expo funciona em dispositivo real

---

## 📝 Alinhamento com Dev/CTO

### Perguntas a responder antes de iniciar:

1. **Auth backend**: Como será implementado o login?
   - Opção A: POST /auth/login (phone) → envia OTP via wacli
   - Opção B: Token simples (phone only) sem OTP (MVP quick)
   - Opção C: Mock apenas (token fake fixo dev)

2. **URL do backend**: Como o app mobile vai acessar?
   - Local: http://localhost:8000 (só funciona em emulador com proxy)
   - NGROK: temporário https://xxxx.ngrok.io
   - Domínio público: aguardar deploy

3. **IA Prioridade**: US-05 vai para Sprint 1 ou 2?
   - Se Sprint 1: precisa de OPENROUTER_API_KEY funcionando
   - Se Sprint 2: mock recomendações estáticas

4. **Offline depth**: Fila de sync é Must Have?
   - Nível 1: só cache leitura (missões completadas só online)
   - Nível 2: fila offline + auto-sync (mais complexo)

5. **Dispositivos de teste**:
   - Android apenas? iOS também?
   - Emulador ou dispositivo real?

---

## 🎯 Decisões Tomadas (Sprint 1)

Após alinhamento com Dev/CTO:

- [ ] **Auth**: Implementar simples (phone → token sem OTP) para MVP
- [ ] **Backend URL**: Usar NGROK temporário para testes
- [ ] **IA**: Postergar para Sprint 2 (mock estático)
- [ ] **Offline**: Cache leitura apenas (sem fila)
- [ ] **Test**: Android APK primário, iOS depois

---

## 📊 Kanban (Tarefas Detalhadas)

### Dia 1

**Setup Expo** (2h)
- [ ] `npx create-expo-app mobile`
- [ ] Instalar dependências (navigation, asyncstorage, netinfo, axios)
- [ ] Configurar `app.json` (nome, slug, orientation)
- [ ] Criar estrutura de pastas (screens/, components/, services/)
- [ ] Configurar API_BASE em constants.js
- [ ] Testar conexão com backend (ping /health)

**US-01 Login** (4h)
- [ ] Criar `screens/LoginScreen.js`
- [ ] Input phone (máscara internacional)
- [ ] Mock endpoint `/auth/login` (retorna token fake)
- [ ] Salvar token em AsyncStorage
- [ ] Context Auth (provê user/token)
- [ ] Validação de phone (formato)
- [ ] Tela loading até login
- [ ] Logout button (profile)

**US-02 Parcial** (2h)
- [ ] Criar `screens/DashboardScreen.js`
- [ ] Conectar a `/dashboard?user_phone=X`
- [ ] Renderizar header (nível + pontos)
- [ ] Renderizar 4 area cards (hardcoded por enquanto)

### Dia 2

**US-02 Completo** (2h)
- [ ] Áreas dinâmicas (API)
- [ ] Streaks por área
- [ ] Barra de progresso funcionando
- [ ] Pull-to-refresh
- [ ] Loading skeleton

**US-03 Missões** (4h)
- [ ] Criar `screens/MissionsScreen.js`
- [ ] Fetch `/api/missions`
- [ ] Filtro por área (tabs ou dropdown)
- [ ] Renderizar cards (title, description, area, difficulty, points)
- [ ] Botão "Completar" por missão
- [ ] Loading states
- [ ] Error handling

**US-04 Completar** (2h)
- [ ] Modal de confirmação (notes opcional)
- [ ] POST `/mission/complete`
- [ ] Toast success (pontos + streak)
- [ ] Atualizar dashboard automaticamente
- [ ] Check duplicate (bloqueio UI se já completou)
- [ ] Error handling (ex: missão não existe)

**US-06 Achievements** (2h) **adicional**
- [ ] Criar `screens/AchievementsScreen.js`
- [ ] Fetch `/api/achievements?user_phone=X`
- [ ] Listar desbloqueados
- [ ] Mostrarpendentes (se simples)
- [ ] Toast ao desbloquear

### Dia 3

**US-09 Offline** (3h)
- [ ] Implementar `services/storage.js`
- [ ] Cache dashboard (save/load)
- [ ] Cache missões
- [ ] NetInfo listener (banner offline)
- [ ] Pull-to-refresh com offline check
- [ ] Fallback: se cache vazio, tela "Sem dados offline"

**QA + Bugfixes** (3h)
- [ ] Testar em emulador Android
- [ ] Testar em dispositivo real
- [ ] Verificar loading/error states
- [ ] Validar acceptance criteria
- [ ] Ajustar UI (spacing, fonts, cores)

**Docs + Build** (2h)
- [ ] Atualizar docs/MOBILE.md com screenshots reais
- [ ] Gerar QR code Expo Go
- [ ] Testar build APK
- [ ] Escrever quickstart no README.md
- [ ] Encerrar Sprint retro

---

## 📎 Artefatos Entregues

Ao final da Sprint 1:

1. **Código**: Repositório `life-gamification/mobile/` (ou branch `mobile-sprint1`)
2. **Build**: APK funcional (e build Expo se iOS)
3. **Docs**: `docs/MOBILE.md` atualizado com screenshots
4. **README**: Seção Mobile no README.md principal
5. **Video/Demo**: (opcional) Screen recording do fluxo principal

---

**Criado por**: PM Mobile Sub-agent
**Data**: 2026-03-20
**Status**: ✅ Ready for dev alignment
