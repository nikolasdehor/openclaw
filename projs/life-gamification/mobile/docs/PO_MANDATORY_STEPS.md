# 🚨 PO - MANDATORY EXECUTION STEPS

**Leia ISSO antes de qualquer coisa.** Você é o coordenador. Siga EXATAMENTE estas etapas.

---

## 📌 ETAPA 0: Setup Inicial

```bash
# Verifique que está no diretório correto
cd /data/.openclaw/workspace/projs/life-gamification/mobile

# Se a pasta mobile não existe, CRIE-A:
mkdir -p mobile
```

---

## 🚀 ETAPA 1: Spawn os 4 agentes (ordem exata)

### 1.1 Spawn DEV (FASE 1 - Setup React Native)

Use a ferramenta `sessions_spawn` com estos parâmetros:

```json
{
  "agentId": "dev",
  "task": "FASE 1 - Setup React Native + Arquitetura\n\nLocal: /data/.openclaw/workspace/projs/life-gamification/mobile/\n\nTarefas EXECUTAR em ordem:\n1. cd /data/.openclaw/workspace/projs/life-gamification/mobile\n2. npx create-expo-app . --template expo-template-blank-typescript --yes\n3. Instalar dependências: npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context axios zustand @reduxjs/toolkit react-redux expo-notifications expo-constants expo-device expo-status-bar @expo/vector-icons async-storage\n4. Criar estrutura de pastas: mkdir -p screens components navigation services utils assets\n5. Criar services/api.ts com axios config baseado em BACKEND_URL (ver .env)\n6. Testar: expo start (deve compilar sem erros)\n7. Fazer commit inicial: git init && git add . && git commit -m \"feat: setup expo + structure\"\n\nImportante: Backend URL será fornecido depois (aguarde anotação do CTO). Por enquanto use variável de ambiente.\n\nEntregável: App compila (expo start) sem erros, structure criada.\n\nPrazo: 6 horas.",
  "label": "mobile-phase1-dev",
  "timeoutSeconds": 21600
}
```

**Depois de spawnar, NÃO espere por resultado ainda.** Anote o `childSessionKey` dev.

---

### 1.2 Spawn CTO (FASE 1 - Arquitetura e CI/CD)

Imediatamente após spawnar dev:

```json
{
  "agentId": "cto",
  "task": "FASE 1 - Mobile Architecture & CI/CD\n\nLocal: /data/.openclaw/workspace/projs/life-gamification/mobile/\n\nTarefas PARALELAS ao dev:\n1. Definir navigation structure: Bottom Tabs (Dashboard, Missões, Perfil) + Stack (Settings, Achievement)\n2. Criar theme.ts com tokens de design (cores por área: Bolsa=#10B981, Mente=#3B82F6, Vitalidade=#EF4444, Propósito=#8B5CF6)\n3. Configurar EAS Build: eas build:configure (crie profiles: development, preview, production)\n4. Configurar ESLint + Prettier (extensões .ts, .tsx)\n5. Documentar arquitetura em docs/MOBILE_ARCHITECTURE.md\n6. Fornecer BACKEND_URL para o dev (IP da VPS: 76.13.164.69:8000)\n7. Garantir que o consiga rodar `expo start` sem erros.\n\nEntregável: EAS configurado, arquitetura documentada, backend URL definido.\n\nPrazo: 6h (paralelo).",
  "label": "mobile-phase1-cto",
  "timeoutSeconds": 21600
}
```

Anote o `childSessionKey` cto.

---

### 1.3 Spawn PM (FASE 2 - User Stories e QA)

```json
{
  "agentId": "pm",
  "task": "FASE 2 - User Stories & QA\n\nLocal: /data/.openclaw/workspace/projs/life-gamification/mobile/docs/\n\nTarefas:\n1. Criar user stories detalhadas (formato: Como [user], quero [feature] para [benefit]) para:\n   - Dashboard (ver áreas, streaks, level)\n   - Lista de missões (filtros, pull-to-refresh)\n   - Completar missão (button, confirmação)\n   - Perfil (stats, histórico)\n   - Notificações push\n2. Acceptance criteria por tela (Given/When/Then)\n3. QA checklist:\n   - Online vs offline\n   - Sync quando volta online\n   - Notificações (agendadas, recebidas)\n   - Erros de API (404, 500, timeout)\n   - Performance (cold start < 3s)\n4. Documentar em docs/USER_STORIES_QA.md\n\nEntregável:docs completas, critérios de aceite definidos.\n\nPrazo: 8h.",
  "label": "mobile-phase2-pm",
  "timeoutSeconds": 28800
}
```

Anote `childSessionKey` pm.

---

### 1.4 Spawn CMO (FASE 2 - Design System e Copy)

```json
{
  "agentId": "cmo",
  "task": "FASE 2 - Design System & Microcopy\n\nLocal: /data/.openclaw/workspace/projs/life-gamification/mobile/\n\nTarefas:\n1. Criar design system spec (cores, tipografia, spacing) baseado no dashboard web existente\n2. Definir componentes: Button, Card, Badge, ProgressBar, Avatar\n3. Copy microcopy para todas as telas (ex: \"Completar missão\", \"Parabéns!\", \"Sua streak: X dias\")\n4. Screenshots mockup (pode ser texto ASCII ou descrição) para 4 telas principais\n5. Onboarding flow (3-4 slides)\n6. Empty states (nenhuma missão, offline, erro)\n7. Documentar em docs/DESIGN_SYSTEM.md\n\nEntregável: Design system aplicado, copy pronto, specs claras para dev.\n\nPrazo: 12h.",
  "label": "mobile-phase2-cmo",
  "timeoutSeconds": 43200
}
```

Anote `childSessionKey` cmo.

---

## 📊 ETAPA 2: Monitore as Fases 1 e 2

- **Fase 1** (dev + cto): devem terminar em ~6h. Verifique se a pasta `mobile/` foi criada com arquivos.
- **Fase 2** (pm + cmo): em paralelo, ~12h.

**Como verificar?** Use `exec` para listar arquivos:

```bash
ls -la /data/.openclaw/workspace/projs/life-gamification/mobile/
```

Se os agentes terminarem, seus relatórios virão como eventos automáticos. **NÃO os interrompa**.

---

## 🔄 ETAPA 3: Spawn Fases 3-6 (após Fase 1 e 2 concluídas)

Só spawn as próximas fases DEPOIS que os agentes das fases anteriores tiverem completado (com status "completed successfully").

Use `sessions_list` (se tiver permissão) ou aguarde eventos de conclusão. Se não souber, espere ~8h e então spawn as próximas.

### Fase 3: Dev + PM (state + offline)

```json
{
  "agentId": "dev",
  "task": "FASE 3 - State Management + Offline\n\nImplementar:\n1. Zustand stores: useStore (user, missions, achievements)\n2. AsyncStorage helpers (salvar checkins localmente)\n3. Offline mode: quando offline, salvar em fila e sincronizar quando voltar\n4. Sync logic: POST /mission/complete com flag offline_synced\n5. Testar: iniciar app, marcar missão offline, reconectar, verificar sync.\n\nPrazo: 10h.",
  "label": "mobile-phase3-dev"
}
```

```json
{
  "agentId": "pm",
  "task": "FASE 3 - QA Acceptance\n\nElaborar:\n1. Testes de aceitação para offline/online\n2. Cenários de erro (API down, timeout)\n3. Checklist de QA para state management\n4. Priorizar bugs críticos.\n\nPrazo: 10h (paralelo).",
  "label": "mobile-phase3-pm"
}
```

### Fase 4: Dev + CTO + CMO (notificações + build)

```json
{
  "agentId": "dev",
  "task": "FASE 4 - Push Notifications + Widget\n\nImplementar:\n1. expo-notifications: solicitar permissões, agendar lembretes\n2. onNotificationOpened: abrir tela da missão\n3. Background task (expo-task-manager) para sync periódico\n4. Widget Hoje (iOS TodayExtension) - mostrar próxima missão e streak\n5. Testar em dispositivo real (não emulator).\n\nPrazo: 12h.",
  "label": "mobile-phase4-dev"
}
```

```json
{
  "agentId": "cto",
  "task": "FASE 4 - EAS Build & Store Prep\n\n1. Configurar EAS profiles (development, preview, production)\n2. Gerar build preview (iOS simulator, Android APK)\n3. Configurar code signing (se tiver certificados)\n4. Preparar App Store Connect metadata (se possível)\n5. Documentar processo de build em docs/BUILD.md\n\nPrazo: 12h.",
  "label": "mobile-phase4-cto"
}
```

```json
{
  "agentId": "cmo",
  "task": "FASE 4 - Onboarding + Store Assets\n\n1. Criar onboarding screens (3-4 slides)\n2. Feature graphic (Google Play), App Icon (1024x1024)\n3. Screenshots (5+ posições) para iOS e Android\n4. Copy para stores (descrição, changelog)\n5. Localização (i18n) estrutura (pt-BR primeiro).\n\nPrazo: 12h.",
  "label": "mobile-phase4-cmo"
}
```

### Fase 5: Dev (Health integration - opcional)

```json
{
  "agentId": "dev",
  "task": "FASE 5 - Health/Google Fit Integration (opcional)\n\n1. Instalar expo-health (iOS) e expo-google-fit (Android)\n2. Solicitar permissões na primeira execução\n3. Sync passos, sono, heart rate a cada 1h (background fetch)\n4. Mostrar dados no dashboard (gráfico semanal Vitalidade)\n5. Feature flag para desabilitar se não suportado.\n\nPrazo: 6h.",
  "label": "mobile-phase5-dev"
}
```

### Fase 6: Todos (Testes finais + Deploy)

```json
{
  "agentId": "dev",
  "task": "FASE 6 - Final Tests & Build Production\n\n1. Unit tests (Jest) para services, utils (>=50% coverage)\n2. E2E tests (Detox) - fluxo completo\n3. Fix bugs críticos (crash, sync failures)\n4. Build produção: eas build --platform all\n5. Gerar artifacts (.ipa, .aab).\n\nPrazo: 8h.",
  "label": "mobile-phase6-dev"
}
```

```json
{
  "agentId": "cto",
  "task": "FASE 6 - Store Submission\n\n1. App Store Connect: criar app, upload .ipa via Transporter, preencher metadata, submeter review\n2. Google Play: criar internal testing, upload .aab, submeter review\n3. Configurar TestFlight (iOS) para testes internos\n4. Documentar processo em docs/DEPLOY.md\n\nPrazo: 8h (paralelo).",
  "label": "mobile-phase6-cto"
}
```

```json
{
  "agentId": "pm",
  "task": "FASE 6 - Release Notes & User Guide\n\n1. Escrever release notes (v1.0.0)\n2. Criar user guide rápido (PDF/HTML)\n3. FAQ de problemas comuns\n4. Plano de monitoramento (crashlytics, analytics).\n\nPrazo: 8h.",
  "label": "mobile-phase6-pm"
}
```

```json
{
  "agentId": "cmo",
  "task": "FASE 6 - Final Assets & Localization\n\n1. Revisar screenshots finais\n2. Criar promo video (15s) se possível\n3. Finalizar i18n strings (pt-BR)\n4. Validar copy nas stores.\n\nPrazo: 8h.",
  "label": "mobile-phase6-cmo"
}
```

---

## 🎯 ETAPA 4: Consolidação Final (Sua Responsabilidade como PO)

Depois que TODOS os agentes das fases 1-6 tiverem completado:

1. **Consolidate** todo o código na branch `mobile-dev` (se houver Git)
2. **Verifique** se os builds EAS foram gerados (.ipa, .aab)
3. **Confirme** submissão às stores (pelo menos TestFlight/internal)
4. **Crie** relatório final em `docs/FINAL_REPORT.md` com:
   - O que foi entregue
   - Como rodar (Expo Go)
   - Como buildar (EAS)
   - Status de cada store
   - Problemas conhecidos
5. **Reporte ao CEO (main session)** usando `sessions_send` para a sessão principal (sessionKey da main). Se não souber a sessionKey, use `sessions_list` para encontrar ou simplesmente escreva o arquivo `MOBILE_COMPLETE.md` na raiz.

---

## ⚠️ REGRAS CRÍTICAS

- **NÃO spawn agentes fora de ordem** (Fase 1 -> 2 -> 3 -> 4 -> 5 -> 6)
- **AGUARDE conclusão** antes de spawnar a próxima fase
- **MONITORE** progresso (listar arquivos na pasta mobile/)
- **SE algum agente falhar** (timeout/erro), spawn novamente com tarefa simplificada
- **SE backend unavailable**, peça ao dev para mockar API (MirageJS) temporariamente
- **SE EAS Build falhar**, peça ao CTO para revisar config

---

## 📍 LOCAIS IMPORTANTES

- Backend: `/data/.openclaw/workspace/projs/life-gamification/backend/`
- Backend URL: `http://76.13.164.69:8000` (ajuste se necessário)
- Mobile code: `/data/.openclaw/workspace/projs/life-gamification/mobile/`
- Docs: `/data/.openclaw/workspace/projs/life-gamification/docs/`

---

## 🚨 COMEÇA AGORA

1. Confirmar que está no diretório correto: `pwd` deve mostrar `/data/.openclaw/workspace/projs/life-gamification/mobile` ou pai. Se não, cd até lá.
2. Spawn dev e cto (FASE 1) IMEDIATAMENTE.
3. Aguarde ~6h, verifique se criaram arquivos.
4. Spawn pm e cmo (FASE 2).
5. Continue.

**Boa sorte. Você está no comando.**
