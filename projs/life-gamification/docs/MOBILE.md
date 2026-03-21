# 📱 Mobile App - Life Gamification

Documentação completa do aplicativo móvel para o sistema de gamificação de vida.

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Feature List](#feature-list)
3. [User Stories](#user-stories)
4. [Backlog Priorizado](#backlog-priorizado)
5. [Acceptance Criteria](#acceptance-criteria)
6. [Wireframes e Flows](#wireframes-e-flows)
7. [Definição de Pronto (DoD)](#definição-de-pronto-dod)
8. [Como Testar](#como-testar)
9. [Integrações Técnicas](#integrações-técnicas)

---

## Visão Geral

Aplicativo móvel para o sistema de gamificação Life Quest, permitindo que o usuário Nikolas:

- Acesse rapidamente seu dashboard pelo celular
- Complete missões diárias/semanais com um toque
- Receba notificações via WhatsApp
- Visualize achievements e streaks
- Use funcionalidades offline (cache)
- Adicione widget na home screen
- Receba recomendações de IA personalizadas

**Plataforma**: React Native (Expo) para iOS e Android
**Backend**: API existente em FastAPI (porta 8000)
**Login**: Número de WhatsApp (phone number)

---

## Feature List

### Funcionalidades Core (MVP)

- **Autenticação por WhatsApp**
  - Login com número de telefone
  - OTP via WhatsApp para verificação
  - Perfil persistente local (offline)

- **Dashboard Mobile**
  - Scores por área com barras de progresso
  - Nível global e total de pontos
  - Streaks atuais por área
  - Layout otimizado para mobile (vertical scrolling)

- **Lista de Missões**
  - Missões disponíveis agrupadas por área
  - Filtro por área (saúde, foco, aprendizado, finanças)
  - Dificuldade visual (cores/badges)
  - Completa com um toque

- **Completar Missão (Quick Complete)**
  - Botão grande "Completar" em cada missão
  - Confirmação opcional (toggle on/off)
  - Feedback visual imediato (toast/success message)
  - Atualização automática do dashboard

- **Achievements**
  - Lista de achievements desbloqueados
  - Achievement pendentes (próximos)
  - Ícones e descrições
  - Progresso visual

- **IA Recommendations**
  - Botão "Gerar Missões Personalizadas"
  - IA analisa histórico e sugere 3 missões
  - Cards com título, descrição, área, dificuldade
  - Quick complete direto das recomendações
  - Modo offline cached das últimas recomendações

### Funcionalidades Secundárias

- **Notificações WhatsApp**
  - Confirmação de missão completada
  - Achievement desbloqueado (com emoji)
  - Streak quebrado (motivação)
  - Lembretes diários (8h da manhã)

- **Widget Home Screen**
  - Widget 2x2 ou 4x1
  - Missão "de hoje" sugerida
  - Status de streak principal
  - Botão "Completar" direto no widget
  - Background update automático

- **Onboarding**
  - Telas explicativas (3-5 slides)
  - GIFs/exemplos animados
  - Botão "Começar Agora"
  - Skip disponível

- **Histórico de Missões**
  - Lista das últimas N missões completadas
  - Filtro por data (hoje, semana, mês)
  - Filtro por área
  - Pontos por missão visível

- **Modo Offline (MVP Básico)**
  - Cache local de:
    - Dashboard (last sync)
    - Missões disponíveis
    - Achievements
  - Quick complete funciona offline (salva fila)
  - Sync automático quando voltar online
  - Indicador de status offline/online

---

## User Stories

### Persona Primária: Nikolas

**Contexto**: Nikolas é um profissional que quer gamificar sua vida nas 4 áreas principais. Usa WhatsApp como principal canal de comunicação e quer acesso rápido no celular para registrar hábitos.

### User Stories - Baseline

| ID | User Story | Prioridade |
|----|------------|------------|
| US-01 | Como usuário, quero fazer login com meu número de WhatsApp para acessar meu perfil, para não precisar criar conta nova | Must Have |
| US-02 | Como usuário, quero ver meu dashboard com scores por área, nível e streaks, para acompanhar meu progresso geral | Must Have |
| US-03 | Como usuário, quero ver a lista de missões disponíveis para completar, para saber o que fazer hoje | Must Have |
| US-04 | Como usuário, quero completar uma missão com um toque, para registrar hábitos rapidamente | Must Have |
| US-05 | Como usuário, quero receber recomendações de missões via IA, para ter missões personalizadas | Must Have |
| US-06 | Como usuário, quero ver meus achievements desbloqueados, para sentir-me motivado | Must Have |
| US-07 | Como usuário, quero receber notificações push quando desbloquear achievement, para celebrar conquistas | Should Have |
| US-08 | Como usuário, quero ver uma missão "de hoje" no widget da home screen, para não esquecer de completar | Should Have |
| US-09 | Como usuário, quero que o app funcione offline (veja dados em cache), para usar sem internet | Must Have |
| US-10 | Como usuário, quero um onboarding explicando como usar o sistema, para entender rápido como gamificar | Should Have |
| US-11 | Como usuário, quero ver meu histórico de missões completadas, para acompanhar meu desempenho | Should Have |
| US-12 | Como usuário, quero receber lembretes diários de missões (notificação 8h), para manter consistência | Should Have |

---

## Backlog Priorizado

### Sprint 1 (3 dias) - MVP Must Have

| Ordem | ID | User Story | Estimativa | Responsável |
|-------|----|------------|------------|-------------|
| 1 | US-01 | Login com WhatsApp | 4h | Frontend + Auth API |
| 2 | US-02 | Dashboard Mobile | 6h | Frontend |
| 3 | US-03 | Lista de Missões | 4h | Frontend |
| 4 | US-04 | Completar Missão | 3h | Frontend + Backend |
| 5 | US-06 | Achievements View | 3h | Frontend |
| 6 | US-09 | Offline Básico | 6h | Frontend (AsyncStorage) |
| 7 | US-05 | IA Recommendations | 6h | Frontend + Backend |

**Total estimado**: ~32 horas (4 dias úteis considerando revisão/ajustes)

### Sprint 2 (opcional) - Should Have

| ID | User Story | Estimativa |
|----|------------|------------|
| US-07 | Notificações Push (WhatsApp + local) | 8h |
| US-08 | Widget Home Screen | 12h |
| US-10 | Onboarding | 4h |
| US-11 | Histórico de Missões | 6h |
| US-12 | Lembretes Diários | 6h |

**Total**: ~36 horas

### Pós-MVP - Could Have

| ID | User Story | Complexidade |
|----|------------|--------------|
| C-01 | Sync multi-device (cloud backup) | Alta |
| C-02 | Temas customizados (dark/light) | Baixa |
| C-03 | Social sharing (compartilhar achievements) | Média |
| C-04 | Widget avançado (múltiplas missões) | Média |

---

## Acceptance Criteria

### US-01: Login com WhatsApp

**Cenário 1: Primeiro acesso**
- **Given** que sou um novo usuário sem conta
- **When** abro o app pela primeira vez
- **And** digito meu número de WhatsApp válido
- **And** recebo o OTP no WhatsApp
- **And** digito o código corretamente
- **Then** sou autenticado e redirecionado ao dashboard
- **And** meu perfil é criado automaticamente no backend

**Cenário 2: Login existente**
- **Given** que já tenho conta no sistema
- **When** abro o app
- **Then** sou automaticamente logado (token local)
- **And** vejo meu dashboard carregado

**Cenário 3: Número inválido**
- **Given** que digito um número inválido
- **When** submito o formulário
- **Then** recebo erro: "Número inválido, use formato +556286077431"

**Cenário 4: OTP errado**
- **Given** que recebi OTP no WhatsApp
- **When** digito código incorreto
- **Then** vejo "Código incorreto, tente novamente"
- **And** posso solicitar novo código

---

### US-02: Dashboard Mobile

**Cenário 1: Carregar dashboard**
- **Given** que estou logado
- **When** abro o app
- **Then** vejo meu nível e pontos totais no header
- **And** vejo 4 cards das áreas (saúde, foco, aprendizado, finanças)
- **And** cada card mostra: pontos, streak atual, barra de progresso
- **And** os dados são carregados da API (ou cache se offline)

**Cenário 2: Ordenação por pontos**
- **Given** que existem áreas com diferentes pontuações
- **When** carrego o dashboard
- **Then** as áreas são ordenadas por pontos (maior primeiro)

**Cenário 3: Offline**
- **Given** que estou offline
- **When** abro o app
- **Then** vejo dados em cache do último sync
- **And** mostra banner "Modo offline - dados podem estar desatualizados"

**Cenário 4: Pull to refresh**
- **Given** que estou online
- **When** faço pull-to-refresh
- **Then** os dados são recarregados da API
- **And** o cache é atualizado

---

### US-03: Lista de Missões

**Cenário 1: Ver missões disponíveis**
- **Given** que estou na tela de missões
- **When** a página carrega
- **Then** vejo lista de missões disponíveis
- **And** cada missão mostra: título, descrição, área, dificuldade, pontos
- **And** há badges visuais de dificuldade (fácil/medio/dificil)

**Cenário 2: Filtrar por área**
- **Given** que quero focar em uma área específica
- **When** toco no filtro "Saúde"
- **Then** apenas missões de saúde são mostradas
- **And** o contador de missões é atualizado

**Cenário 3: Ver missões IA**
- **Given** que gerei recomendações de IA
- **When** vou para lista de missões
- **Then** vejo seção separada "Recomendações da IA"
- **And** as missões IA têm badge "✨ IA" ou similar

**Cenário 4: Scroll infinito**
- **Given** que há muitas missões
- **When** rolo até o final
- **Then** mais missões são carregadas automaticamente

---

### US-04: Completar Missão

**Cenário 1: Completa missão da lista**
- **Given** que estou na lista de missões
- **When** toco em uma missão e depois em "Completar"
- **Then** a missão é marcada como completa
- **And** meus pontos aumentam (mostrar toast "+100 pts")
- **And** meu streak naquela área é atualizado
- **And** se achievement desbloquear, mostrar celebração

**Cenário 2: Quick complete (sem confirmação)**
- **Given** que habilitei "complete rápido" nas configurações
- **When** toco em "Completar" direto na lista
- **Then** a missão é completada imediatamente
- **And** não preciso confirmar

**Cenário 3: Duplicata diária**
- **Given** que já completei uma missão hoje
- **When** tento completá-la novamente
- **Then** recebo erro: "Missão já completada hoje"
- **And** a missão não é contabilizada novamente

**Cenário 4: Offline complete**
- **Given** que estou offline
- **When** completo uma missão
- **Then** a missão é salva na fila offline
- **And** mostra toast "Salvo offline - sincronizará quandoOnline"
- **And** quando voltar online, a fila é enviada ao backend

---

### US-05: Recomendações IA

**Cenário 1: Gerar recomendações**
- **Given** que estou no dashboard ou tela de IA
- **When** toco em "Gerar Missões Personalizadas"
- **Then** vejo loading "Analisando seu histórico..."
- **And** após 2-5 segundos, vejo 3 cards de missões sugeridas
- **And** cada card mostra: título, descrição, área, dificuldade, pontos
- **And** há uma explicação "Por que sugerimos isso: ..."

**Cenário 2: Complete missão IA**
- **Given** que tenho recomendações da IA
- **When** toco em "Completar Agora" em uma recomendação
- **Then** a missão é criada e completada em uma operação
- **And** recebo feedback de sucesso com pontos ganhos
- **And** o dashboard é atualizado automaticamente

**Cenário 3: Fallback (sem API key)**
- **Given** que o backend não tem OPENROUTER_API_KEY
- **When** peço recomendações
- **Then** recebo missões genéricas (ex: "Caminhada de 10 min")
- **And** aviso "Modo fallback" é exibido

**Cenário 4: Erro de API**
- **Given** que a API da IA falhou
- **When** peço recomendações
- **Then** vejo erro amigável: "Não foi possível gerar recomendações agora"
- **And** botão de retry disponível

---

### US-06: Achievements View

**Cenário 1: Ver achievements desbloqueados**
- **Given** que tenho achievements desbloqueados
- **When** abro a aba "Achievements"
- **Then** vejo lista dos últimos 10 desbloqueados
- **And** cada item mostra: ícone, nome, descrição, badge "✓"
- **And** há contador "X de Y desbloqueados"

**Cenário 2: Ver achievements pendentes**
- **Given** que não desbloqueei todos achievements
- **When** rolo para baixo na página de achievements
- **Then** vejo seção "Próximos Achievements"
- **And** cada item mostra: ícone (cinza), nome, condição de desbloqueio

**Cenário 3: Trigger de achievement**
- **Given** que completei uma missão que atende condição de achievement
- **When** a missão é completada
- **Then** vejo toast "🏆 Achievement desbloqueado: [NOME]"
- **And** o achievement aparece imediatamente na lista
- **And** posso ver detalhes tocando nele

---

### US-09: Offline Básico

**Cenário 1: Cache de dashboard**
- **Given** que já carreguei o dashboard online
- **When** fico offline
- **And** abro o app novamente
- **Then** vejo o dashboard do cache
- **And**rono banner amarelo "Modo offline"
- **And** posso ver scores, streaks, achievements

**Cenário 2: Cache de missões**
- **Given** que carreguei lista de missões online
- **When** fico offline
- **And** abro a lista de missões
- **Then** vejo as missões do cache
- **And** posso completar missões (vão para fila)

**Cenário 3: Fila de sync**
- **Given** que completei 3 missões offline
- **When** volto a ficar online
- **Then** as missões são enviadas automaticamente ao backend
- **And** vejo toast "3 missões sincronizadas"
- **And** meus pontos e streaks são atualizados corretamente

**Cenário 4: Sem cache**
- **Given** que é primeira vez e estou offline
- **When** abro o app
- **Then** vejo tela "Sem conexão - conecte-se para ver seus dados"
- **And** apenas funcionalidades básicas (login não funciona)

---

## Wireframes e Flows

### Navegação (Tab Bar Inferior)

```
┌─────────────────────────────────────────┐
│      🔵 Dashboard (ativa)               │
│  🎯 Missões                            │
│  🏆 Achievements                       │
│  👤 Perfil                             │
└─────────────────────────────────────────┘
```

**Página 1: Dashboard**
```
┌─────────────────────────────┐
│  👤 Nikolas    Nível 5       │
│  Total: 2.350 pts           │
├─────────────────────────────┤
│  🏃 Saúde      1.200 pts    │
│     ████████░░ 80%         │
│     🔥 5 dias               │
│                             │
│  🎯 Foco        800 pts     │
│     ██████░░░░ 60%         │
│     🔥 3 dias               │
│                             │
│  📚 Aprendizado 350 pts     │
│     ████░░░░░░ 30%         │
│     🔥 0 dias               │
│                             │
│  💰 Finanças    0 pts       │
│     █░░░░░░░░░ 0%          │
│     🔥 0 dias               │
├─────────────────────────────┤
│  🏆 Achievements            │
│  • 🌱 Primeiro Passo ✓      │
│  • 📚 Maratonista ✓         │
│  • 💎 Primeiro Milhão ░ 85% │
├─────────────────────────────┤
│ [🤖 Gerar Missões IA]       │
└─────────────────────────────┘
```

**Página 2: Missões**
```
┌─────────────────────────────┐
│  Missões                    │
│  [✓ Todas] [Saúde] [Foco]  │
├─────────────────────────────┤
│  🎯 Recomendações IA        │
│  ✨ Caminhada 10min         │
│     Saúde • Fácil • +50 pts │
│     [ ✅ Completar ]        │
│                             │
│  📋 Missões Disponíveis     │
│  🏃 Correr 5km             │
│     Saúde • Médio • +100    │
│     [ ✅ Completar ]        │
│                             │
│  🎯 Bloqueador de sites    │
│     Foco • Fácil • +50     │
│     [ ✅ Completar ]        │
└─────────────────────────────┘
```

**Página 3: Achievements**
```
┌─────────────────────────────┐
│  🏆 Achievements            │
│  3/12 desbloqueados         │
├─────────────────────────────┤
│  Desbloqueados              │
│  🌱 Primeiro Passo ✓        │
│     Complete 1ª missão      │
│                             │
│  📚 Maratonista ✓           │
│     50 missões aprend.      │
│                             │
│  🔥 7 dias de Foco ✓        │
│     Streak de 7 dias        │
├─────────────────────────────┤
│  Próximos                   │
│  💎 Primeiro Milhão ░ 85%   │
│     1.000.000 de pontos     │
│                             │
│  💪 Mestre da Saúde ░ 30%   │
│     100 missões saúde       │
└─────────────────────────────┘
```

**Página 4: Perfil**
```
┌─────────────────────────────┐
│  👤 Perfil                  │
│                             │
│  Nikolas                    │
│  +55 62 8607-7431           │
│  Nível 5 • 2.350 pts        │
│                             │
│  📊 Estatísticas            │
│  • Missões completadas: 47 │
│  • Maior streak: 12 dias   │
│  • Média diária: 2 missões │
│                             │
│  ⚙️ Configurações           │
│  [ ] Complete rápido       │
│  [✓] Notificações WhatsApp │
│  [ ] Widget home screen     │
│                             │
│  [Sair]                     │
└─────────────────────────────┘
```

### Key Flows

**Flow 1: Completar Missão**
```
1. User vê lista de missões
2. Toca em "Completar" (botão grande)
3. (Opcional) confirmação modal
4. Loading spinner 1s
5. Toast: "+100 pts! Streak: 5 dias"
6. Dashboard atualizado automaticamente
7. Se achievement: Toast extra "🏆 Primeiro Passo!"
```

**Flow 2: IA Recommendations**
```
1. User toca "Gerar Missões IA"
2. Loading: "Analisando histórico..."
3. Backend chama StepFun API com contexto
4. Recebe 3 missões personalizadas
5. Cards são exibidos com "Por que sugerimos"
6. User pode completar direto dos cards
```

**Flow 3: Offline Sync**
```
1. User completa missão offline
2. Missão é salva em AsyncStorage (fila offline)
3. Toast: "Salvo offline - sincronizará"
4. App monitora conectividade (NetInfo)
5. Quando online: envia fila para /mission/quick-complete
6. recebe pontos/streaks do backend
7. Atualiza cache
8. Toast: "3 missões sincronizadas"
```

**Flow 4: Widget Home Screen**
```
1. User habilita widget em Configurações
2. Android: adiciona widget 2x2 à home
3. iOS: widget Today/Home Screen
4. Widget mostra:
   - Missão sugerida de hoje
   - Streak atual (main área)
   - Botão "Completar"
5. Tocar no widget abre app na missão
6. Completa direto do widget (deep link)
```

---

## Definição de Pronto (DoD)

### DoD Geral (Todas as US)

- [ ] **Código testado manualmente** (pelo menos uma vez em dispositivo real ou emulador)
- [ ] **Integração com API funcionando** (todos os endpoints testados)
- [ ] **Offline mode básico** (cache e fila funcionando)
- [ ] **Documentado em MOBILE.md** (este arquivo atualizado)
- [ ] **QR code Expo Go gerado** para testes rápidos

### DoD Técnico

- [ ] **React Native (Expo)** configurado
- [ ] **AsyncStorage** implementado para cache offline
- [ ] **NetInfo** para detecção de conectividade
- [ ] **React Navigation** para tabs
- [ ] **Axios/Fetch** configurado para API calls
- [ ] **Toast notifications** funcionando
- [ ] **Deep linking** para widget (se aplicável)
- [ ] **Erros tratados** graciosamente (try/catch, fallbacks)
- [ ] **Loading states** em todas as ações assíncronas
- [ ] **Pull-to-refresh** no dashboard
- [ ] **Logs de debug** (console.log removidos em produção)

### DoD de Deploy

- [ ] **APK/IPA gerado** (Android APK, iOS via Expo)
- [ ] **App publicado** (Expo EAS ou lojas)
- [ ] **Backend acessível** (NGROK ou domínio público)
- [ ] **.env configurado** com OPENROUTER_API_KEY
- [ ] **SSL/HTTPS** configurado (obrigatório para iOS widget)
- [ ] **CORS** permitindo origem do app
- [ ] **Notificações WhatsApp** testadas (wacli configurado)

---

## Como Testar

### Pré-requisitos

1. Backend rodando (docker-compose up -d)
2. OPENROUTER_API_KEY configurada no .env
3. Expo CLI instalado: `npm install -g expo-cli`
4. wacli configurado (opcional): `wacli login`

### Testes Manuais

#### 1. Login
```bash
# No emulador/dispositivo:
- Abra o app
- Digite: +556286077431
- Receba OTP no WhatsApp real
- Digite código
- Deve redirecionar ao dashboard
```

#### 2. Dashboard
```bash
# Após login:
- Verifique 4 área cards com pontos/streaks
- Verifique nível e pontos totais no header
- Faça pull-to-refresh
- Teste offline (desligue Wi-Fi) - deve mostrar cache
```

#### 3. Missões
```bash
- Vá em "Missões" tab
- Filtre por "Saúde"
- Toque em "Completar" em uma missão fácil
- Veja toast de sucesso
- Atualize dashboard - streak deve ter aumentado
```

#### 4. IA
```bash
- No dashboard, toque "Gerar Missões IA"
- Aguarde 2-5 segundos
- 3 cards devem aparecer
- Toque "Completar Agora" em um
- Veja feedback e atualização
```

#### 5. Offline
```bash
- Com Wi-Fi ligado, carregue dashboard
- Desligue Wi-Fi
- Complete 2 missões (devem ir para fila)
- Ligue Wi-Fi novamente
- Veja toast "Sincronizando..."
- Dashboard atualiza com novos pontos
```

#### 6. Achievements
```bash
- Complete missões até desbloquear algo
- Veja toast de celebration
- Vá em "Achievements" tab
- Achievement deve aparecer em "Desbloqueados"
```

### Testes de Regressão Rápida

- [ ] Login/Logout funciona
- [ ] Dashboard carrega com/sem internet
- [ ] Completar missão atualiza pontos
- [ ] Streak aumenta/diminui corretamente
- [ ] IA retorna 3 recomendações
- [ ] Offline queue funciona
- [ ] Toast messages aparecem
- [ ] Navegação entre tabs sem travamentos

---

## Integrações Técnicas

### API Endpoints (Já Existentes)

| Método | Endpoint | Descrição | Usado em |
|--------|----------|-----------|----------|
| GET | `/dashboard?user_phone=X` | Dashboard completo | Dashboard tab |
| GET | `/api/missions` | Lista missões | Missões tab |
| POST | `/mission/complete` | Completa missão existente | Botão completar |
| POST | `/mission/quick-complete` | Cria + completa missão custom | IA + Widget |
| POST | `/ai/recommend` | IA recomenda missões | Botão "Gerar IA" |
| GET | `/api/achievements?user_phone=X` | Achievements | Achievements tab |
| GET | `/health` | Health check | Startup |

### WhatsApp Integration (wacli)

```javascript
// Envio de notificação via wacli (backend)
POST /admin/trigger-achievement/+556286077431/Primeiro%20Passo

// Ou chamada direta CLI:
wacli send "+556286077431" "🏆 Achievement desbloqueado: Primeiro Passo!"
```

**Notificações automáticas** (backend precisa implementar):

- Missão completada: "✅ Missão completada: Correr 5km (+100 pts)"
- Achievement: "🏆 Novo achievement: 7 dias de Foco!"
- Streak quebrado: "❌ Streak quebrada em Saúde. Vamos recuperar?"
- Lembrete 8h: "🌅 Bom dia! Não esqueça de completar suas missões hoje"

### Widget Implementation

**Android** (react-native-widgetkit ou widget nativo):
```javascript
// AppWidgetProvider (Java/Kotlin)
- Expõe deep link: lifequest://complete-mission?title=...
- App aberto via widget recebe intent
- Auto-completa missão ao abrir
```

**iOS** (WidgetKit + Swift):
```swift
// Widget.swift
- TimelineProvider busca missão de hoje da API
- Exibe em Widget 2x2
- Deep link para app: "lifequest://"
```

### Offline Strategy

```javascript
// storage.js
const store = {
  // Chaves
  DASHBOARD_CACHE: '@lifequest_dashboard',
  MISSIONS_CACHE: '@lifequest_missions',
  OFFLINE_QUEUE: '@lifequest_queue',

  // Funções
  saveDashboard(data) { AsyncStorage.setItem(DASHBOARD_CACHE, JSON.stringify(data)); },
  getDashboard() { return JSON.parse(AsyncStorage.getItem(DASHBOARD_CACHE)); },

  addToQueue(mission) {
    const queue = this.getQueue() || [];
    queue.push({ ...mission, timestamp: Date.now() });
    AsyncStorage.setItem(OFFLINE_QUEUE, JSON.stringify(queue));
  },

  getQueue() { return JSON.parse(AsyncStorage.getItem(OFFLINE_QUEUE)) || []; },

  clearQueue() { AsyncStorage.removeItem(OFFLINE_QUEUE); }
};

// sync.js
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    const queue = store.getQueue();
    queue.forEach(item => {
      apiCall('/mission/quick-complete', 'POST', item)
        .then(() => store.clearQueue());
    });
  }
});
```

---

## Próximos Passos

1. **Setup React Native (Expo)**
   ```bash
   npx create-expo-app mobile --template
   cd mobile
   npm install @react-navigation/native @react-navigation/bottom-tabs
   npm install @react-native-async-storage/async-storage
   npm install @react-native-community/netinfo
   ```

2. **Estrutura de pastas**
   ```
   mobile/
   ├── src/
   │   ├── screens/
   │   │   ├── DashboardScreen.js
   │   │   ├── MissionsScreen.js
   │   │   ├── AchievementsScreen.js
   │   │   ├── ProfileScreen.js
   │   │   └── OnboardingScreen.js
   │   ├── components/
   │   │   ├── AreaCard.js
   │   │   ├── MissionItem.js
   │   │   ├── AchievementItem.js
   │   │   └── Toast.js
   │   ├── services/
   │   │   ├── api.js
   │   │   ├── auth.js
   │   │   ├── storage.js
   │   │   └── sync.js
   │   ├── navigation/
   │   │   └── TabNavigator.js
   │   └── utils/
   │       ├── formatters.js
   │       └── constants.js
   ├── App.js
   └── app.json
   ```

3. **Implementação顺序** (sugerida):
   - Dia 1: Setup + Login + Dashboard
   - Dia 2: Missões + Achievements + IA
   - Dia 3: Offline + Widget + Onboarding
   - Dia 4: Testes + ajustes + documentação

4. **Testar em dispositivo real**
   - Exponha backend via NGROK: `ngrok http 8000`
   - Configure API_BASE no app para URL pública
   - Teste WhatsApp real (wacli)

---

**Última atualização**: 2026-03-20
**Responsável**: PM Mobile (Sub-agent)
**Status**: Em planejamento - aguardando aprovação do Dev/CTO
