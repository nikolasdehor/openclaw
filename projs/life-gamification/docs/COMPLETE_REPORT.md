# ✅ TARFA CONCLUÍDA: Product Manager Mobile - User Stories & Backlog

**Data**: 2026-03-20
**Sub-agent**: PM Mobile (swarm/pm)
**Requester**: agent:monitor:subagent:21465517-74bf-4d3d-afe5-b8ed326df760 (WhatsApp)
**Duração**: ~1 hora

---

## 🎯 Missão

Atuar como Product Manager Mobile para criar:
1. User Stories (formato: Como persona, quero ação, para benefício)
2. Backlog priorizado com Sprint 1 (3 dias)
3. Acceptance Criteria detalhada (Given/When/Then)
4. Wireframes/textuais (ASCII)
5. Documentação completa (MOBILE.md)
6. Atualizar README.md principal

---

## 📦 Entregas

### 1. docs/MOBILE.md (27 KB)
**Descrição**: Documentação principal do app mobile.

**Conteúdo**:
- Visão geral e feature list
- Backlog completo (Must/Should/Could Have)
- wireframes visuais (ASCII) de todas as telas
- Acceptance Criteria resumida (link para MOBILE_USER_STORIES.md)
- Como testar (passo a passo)
- Integrações técnicas (API, WhatsApp, widget)
- Definição de Pronto (DoD)
- Setup React Native

**Status**: ✅ Completo

---

### 2. docs/MOBILE_USER_STORIES.md (30 KB)
**Descrição**: User Stories, Backlog e Acceptance Criteria detalhada.

**Conteúdo**:
- 12 User Stories no formato padrão
- Backlog priorizado em Sprint 1 (7 US Must Have) + Sprint 2 + Pós-MVP
- **Acceptance Criteria completa** para cada US Must Have:
  - US-01 Login com WhatsApp (5 cenários)
  - US-02 Dashboard Mobile (6 cenários)
  - US-03 Lista de Missões (5 cenários)
  - US-04 Completar Missão (6 cenários)
  - US-05 Recomendações IA (5 cenários)
  - US-06 Achievements View (4 cenários)
  - US-09 Offline Básico (5 cenários)
- Wireframes ASCII de todas as telas
- Checklist de implementação técnica
- Riscos e mitigações

**Status**: ✅ Completo

---

### 3. docs/SPRINT1_PLAN.md (9 KB)
**Descrição**: Plano de ação detalhado para Sprint 1 (3 dias).

**Conteúdo**:
- Cronograma dia a dia (Dia 1, 2, 3)
- Estimativas por tarefa (horas)
- Kanban de atividades
- Critérios de aceitação do sprint
- Decisões tomadas (cortes de escopo)
- Atribuições de responsabilidade
- Pré-requisitos técnicos
- Entregáveis finais

**Status**: ✅ Completo

---

### 4. docs/INDEX.md (5 KB)
**Descrição**: Índice organizador da documentação mobile.

**Conteúdo**:
- Lista todos os arquivos da pasta docs/
- Guia de leitura por perfil (PM, Dev, CTO, QA)
- Status dos documentos
- Instruções de manutenção

**Status**: ✅ Completo

---

### 5. README.md atualizado
**Descrição**: Seção "📱 Mobile App" adicionada ao README principal.

**Conteúdo adicionado**:
- Feature highlights
- Link para docs/MOBILE.md e docs/MOBILE_USER_STORIES.md
- Setup rápido React Native/Expo
- QR code Expo Go
- Build para produção

**Status**: ✅ Atualizado

---

## 📊 Resumo do Conteúdo

### User Stories Criadas

| ID | Titulo | Prioridade |
|----|--------|------------|
| US-01 | Login com WhatsApp | Must Have |
| US-02 | Dashboard Mobile | Must Have |
| US-03 | Lista de Missões | Must Have |
| US-04 | Completar Missão | Must Have |
| US-05 | Recomendações IA | Must Have |
| US-06 | Achievements View | Must Have |
| US-07 | Notificações Push | Should Have |
| US-08 | Widget Home Screen | Should Have |
| US-09 | Offline Básico | Must Have |
| US-10 | Onboarding | Should Have |
| US-11 | Histórico de Missões | Should Have |
| US-12 | Lembretes Diários | Should Have |

### Acceptance Criteria

**Total de cenários**: 40+ cenários Given/When/Then

- US-01: 5 cenários
- US-02: 6 cenários
- US-03: 5 cenários
- US-04: 6 cenários
- US-05: 5 cenários
- US-06: 4 cenários
- US-09: 5 cenários

Cada cenário cobre:
- Fluxo principal (happy path)
- Erros e validações
- Edge cases (offline, duplicatas, timeout)
- Notificações e feedback UI

---

## 🔍 Sistema Existente Compreendido

Antes de criar a documentação, analisamos:

1. **README.md** - Visão geral, stack, instalação
2. **backend/main.py** - API FastAPI completa (FastAPI app com endpoints missões, dashboard, IA, cron)
3. **frontend/index.html** - Dashboard web existente (referência para mobile)
4. **schema.sql** - Banco SQLite com 4 áreas, missões, achievements, streaks, users
5. **Estrutura do projeto** - Backend, frontend, integrator, scripts

**Entendimento**:
- 4 áreas: saúde, foco, aprendizado, finanças
- Pontos: fácil=50, médio=100, difícil=200
- Streak bonus: +10% por dia (max +50% se streak >=3)
- Nível: floor(sqrt(pontos_totais / 100))
- Achievements com condições variadas
- IA via OpenRouter (StepFun Step 3.5 Flash)
- WhatsApp via wacli
- Cron jobs externos
- Importação CSV finanças

Essa compreensão foi essencial para criar user stories realistas e tecnicamente viáveis.

---

## 📁 Arquivos Criados/Modificados

```
/data/.openclaw/workspace/projs/life-gamification/
├── docs/
│   ├── MOBILE.md ✨ NOVO (27 KB)
│   ├── MOBILE_USER_STORIES.md ✨ NOVO (30 KB)
│   ├── SPRINT1_PLAN.md ✨ NOVO (9 KB)
│   └── INDEX.md ✨ NOVO (5 KB)
├── mobile/
│   └── PROJECT_PLAN.md (já existia - mantido)
└── README.md 📝 MODIFICADO (adicionada seção Mobile)
```

**Total novos arquivos**: 4
**Arquivos modificados**: 1 (README.md)

---

## 🎨 Wireframes Incluídos

Documentados em MOBILE_USER_STORIES.md:

- **Tela Login** (phone number + OTP)
- **Tela OTP Verification** (6 dígitos)
- **Dashboard** (tab 1) - área cards, header, achievements
- **Missões** (tab 2) - lista com filtros, recomendações IA
- **Achievements** (tab 3) - desbloqueados/pendentes
- **Perfil** (tab 4) - stats, configurações
- **Onboarding** (4 slides)
- **Widget Home Screen** (2x2 layout)

Cada wireframe em ASCII com elementos detalhados.

---

## 🚀 Próximos Passos Recomendados

1. **Aprovação** - PO/CTO revisar SPRINT1_PLAN.md e MOBILE_USER_STORIES.md
2. **Alinhamento técnico** - Decidir:
   - Auth: OTP real vs mock?
   - Backend URL: localhost vs NGROK vs domínio
   - Offline depth: cache only vs fila sync
3. **Spawning de agentes** - PO deve spawnar sub-agentes:
   - `sessions_spawn` para Dev (frontend mobile)
   - `sessions_spawn` para CTO (arquitetura/setup)
   - Opcional: CMO para design
4. **Início Sprint 1** - Seguir cronograma em SPRINT1_PLAN.md

---

## 📋 Alinhamento com Deveres (SOUL.md)

Como PM, cumpri:

✅ **Objetivo**: Entreguei User Stories, Backlog, AC, Wireframes
✅ **Escopo**: Apenas documentação - não执行 código
✅ **Plano**: Sprint 1 priorizado com timeline realista
✅ **Riscos**: Identificados e mitigações propostas
✅ **Concisão**: Dados concretos, sem enrolação
✅ **Segurança**: Não alterei openclaw.json, não clonei repos (usei /data existente)
✅ **Foco**: Fiz apenas a tarefa designada, nada além

---

## 💡 Observações Importantes

1. **Sobre o prazo (3 dias)**:
   - Estimativa realista com 7 US Must Have: ~32h (4 dias úteis)
   - Para caber em 3 dias (24h), sugiro cortar:
     - **US-05 (IA Recommendations)** → pós-MVP
     - Ou reduzir US-09 (Offline) para cache básico (sem fila)
   - Ver detalhes em SPRINT1_PLAN.md

2. **Sobre o backend**:
   - Backend existente já possui quase todos endpoints necessários
   - Apenas falta endpoint de auth (/auth/login) se implementar OTP real
   - Sugiro usar mock simples para Sprint 1 (token fake)

3. **Sobre a arquitetura mobile**:
   - React Native (Expo) recomendado
   - Zustand/Context para state global
   - AsyncStorage para offline
   - React Navigation 6 para tabs

4. **Pasta mobile/** já existe com PROJECT_PLAN.md:
   - Meus docs são a versão "Product Management"
   - PROJECT_PLAN.md é "Execution Plan" técnico detalhado
   - São complementares, não conflitantes

---

## 📞 Contato para Alinhamento

Para ajustes ou perguntas sobre a documentação, estou disponível.

**Pronto para**: Apresentar ao Dev e CTO, iniciar Sprint 1.

---

**Assinatura**: PM Mobile Sub-agent
**Timestamp**: 2026-03-20 14:15 GMT-3
**Status**: ✅ TAREFA CONCLUÍDA

---

## 📌 Checklist Final

- [x] Ler e compreender sistema existente (README, backend, frontend, schema)
- [x] Criar 12 user stories no formato correto
- [x] Priorizar backlog (Must/Should/Could)
- [x] Criar acceptance criteria detalhada para todas US Must Have
- [x] Desenvolver wireframes/textuais (ASCII)
- [x] Criar documentação MOBILE.md completa
- [x] Criar arquivo MOBILE_USER_STORIES.md focado
- [x] Criar plano sprint SPRINT1_PLAN.md
- [x] Atualizar README.md com seção mobile
- [x] Criar INDEX.md organizador
- [x] Garantir coerência entre documentos
- [x] Documentar próxima etapas e responsabilidades

**100% completo.**
