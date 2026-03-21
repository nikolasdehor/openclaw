# 📱 Mobile User Stories & Backlog

Documento focado em User Stories, Backlog Priorizado e Acceptance Criteria para o app Life Gamification.

---

## 1. User Stories

### Formato
**Como** [persona] **Quero** [ação] **Para** [benefício]

### Persona Primária
**Nikolas** - Usuário real, quer gamificar saúde, foco, aprendizado e finanças. Usa WhatsApp para notificações e precisa de acesso rápido no celular.

### Lista Completa de User Stories

| ID | User Story | Categoria | Prioridade |
|----|------------|-----------|------------|
| US-01 | Como usuário, quero fazer login com meu número de WhatsApp para acessar meu perfil, para não precisar criar conta nova | Auth | Must Have |
| US-02 | Como usuário, quero ver meu dashboard com scores por área, nível e streaks, para acompanhar meu progresso geral | Dashboard | Must Have |
| US-03 | Como usuário, quero ver a lista de missões disponíveis para completar, para saber o que fazer hoje | Missões | Must Have |
| US-04 | Como usuário, quero completar uma missão com um toque, para registrar hábitos rapidamente | Missões | Must Have |
| US-05 | Como usuário, quero receber recomendações de missões via IA, para ter missões personalizadas | IA | Must Have |
| US-06 | Como usuário, quero ver meus achievements desbloqueados, para sentir-me motivado | Gamificação | Must Have |
| US-07 | Como usuário, quero receber notificações push quando desbloquear achievement, para celebrar conquistas | Notificações | Should Have |
| US-08 | Como usuário, quero ver uma missão "de hoje" no widget da home screen, para não esquecer de completar | Widget | Should Have |
| US-09 | Como usuário, quero que o app funcione offline (veja dados em cache), para usar sem internet | Offline | Must Have |
| US-10 | Como usuário, quero um onboarding explicando como usar o sistema, para entender rápido como gamificar | Onboarding | Should Have |
| US-11 | Como usuário, quero ver meu histórico de missões completadas, para acompanhar meu desempenho | Histórico | Should Have |
| US-12 | Como usuário, quero receber lembretes diários de missões (notificação 8h), para manter consistência | Notificações | Should Have |

---

## 2. Backlog Priorizado (MVP)

### Sprint 1 - Must Have (3 dias úteis)

**Objetivo**: App funcional básico com login, dashboard, missões e achievements.

| Ordem | ID | User Story | Estimativa | Dependências | Responsável |
|-------|---|------------|------------|--------------|-------------|
| 1 | US-01 | Login com WhatsApp | 4h | Backend auth endpoint | Frontend |
| 2 | US-02 | Dashboard Mobile | 6h | US-01 | Frontend |
| 3 | US-03 | Lista de Missões | 4h | Backend /missions | Frontend |
| 4 | US-04 | Completar Missão | 3h | US-03, Backend /complete | Frontend+Backend |
| 5 | US-06 | Achievements View | 3h | Backend /achievements | Frontend |
| 6 | US-09 | Offline Básico | 6h | US-02, US-03 | Frontend |
| 7 | US-05 | IA Recommendations | 6h | Backend /ai/recommend | Frontend+Backend |

**Total Estimado**: ~32 horas (≈ 4 dias úteis)

**Entregável Sprint 1**: App Expo com:
- Login WhatsApp funcionando
- Dashboard com scores/streaks
- Lista de missões e complete
- Achievements visíveis
- Offline cache básico
- IA recomendações integradas

---

### Sprint 2 - Should Have (se tempo permitir)

**Objetivo**: Melhorar engajamento com notificações, widget e onboarding.

| ID | User Story | Estimativa | Complexidade |
|---|------------|------------|--------------|
| US-07 | Notificações Push (WhatsApp + local) | 8h | Média |
| US-08 | Widget Home Screen | 12h | Alta |
| US-10 | Onboarding | 4h | Baixa |
| US-11 | Histórico de Missões | 6h | Média |
| US-12 | Lembretes Diários | 6h | Média |

**Total**: ~36 horas (≈ 4-5 dias)

**Entregável Sprint 2**:
- Notificações automáticas
- Widget para Android/iOS
- Tela de onboarding
- Histórico com filtros
- Lembretes 8h

---

### Pós-MVP - Could Have (priorizar conforme feedback)

| ID | User Story | Prioridade | Complexidade |
|----|------------|------------|--------------|
| C-01 | Sync multi-device (cloud backup) | Alta | Alta |
| C-02 | Temas customizados (dark/light mode) | Baixa | Baixa |
| C-03 | Social sharing (compartilhar achievements) | Média | Média |
| C-04 | Widget avançado (múltiplas missões) | Média | Alta |

---

## 3. Acceptance Criteria Detalhada

Todas as US seguem formato: **Given** + **When** + **Then** (+ optional **And**)

### US-01: Login com WhatsApp

**Cenário 1: Primeiro acesso (novo usuário)**
```
Given que sou um novo usuário sem conta no sistema
When abro oapp pela primeira vez
And digito meu número de WhatsApp válido no formato +556286077431
And recebo o código OTP de 6 dígitos no WhatsApp
And digito o código corretamente
Then sou autenticado com sucesso
And sou redirecionado automaticamente para o Dashboard
And meu perfil é criado no backend com o phone informado
And vejoToast "Login realizado com sucesso!"
```

**Cenário 2: Login de usuário existente (auto-login)**
```
Given que já tenho conta no sistema
And já fiz login anteriormente (token salvo localmente)
When abro o aplicativo
Then sou automaticamente logado sem precisar digitar número
And o dashboard é carregado com meus dados
```

**Cenário 3: Número inválido**
```
Given que estou na tela de login
When digito um número inválido (ex: "123456")
And toco em "Continuar"
Then vejo mensagem de erro: "Número inválido. Use o formato internacional: +556286077431"
And o foco retorna para o campo de número
```

**Cenário 4: OTP incorreto**
```
Given que recebi OTP no meu WhatsApp
When digito um código incorreto (ex: "123456")
And toco em "Verificar"
Then vejo erro: "Código incorreto. Tente novamente."
And posso solicitar novo código tocando em "Reenviar OTP"
And o campo de OTP é limpo automaticamente
```

**Cenário 5: OTP expirado**
```
Given que recebi OTP mas passaram mais de 5 minutos
When tento usar o código antigo
Then vejo erro: "Código expirado. Solicite um novo."
And o botão "Reenviar OTP" é habilitado
```

---

### US-02: Dashboard Mobile

**Cenário 1: Carregar dashboard completo**
```
Given que estou logado
When abro o aplicativo (ou toco na tab "Dashboard")
Then vejo no header:
  - Meu nome ou telefone
  - Nível atual (ex: "Nível 5")
  - Total de pontos (ex: "2.350 pts")
And vejo 4 cards das áreas (Saúde, Foco, Aprendizado, Finanças)
And cada card mostra:
  - Ícone da área
  - Nome da área
  - Total de pontos na área
  - Streak atual (dias consecutivos)
  - Barra de progresso (porcentagem vs maior área)
And os dados são carregados da API (ou do cache se offline)
```

**Cenário 2: Ordenação automática por pontuação**
```
Given que tenho pontuações diferentes nas áreas:
  - Saúde: 1200 pts
  - Foco: 800 pts
  - Aprendizado: 350 pts
  - Finanças: 0 pts
When carrego o dashboard
Then as área cards são ordenadas: Saúde, Foco, Aprendizado, Finanças
And a barra de progresso da Saúde atinge 100% (referência)
```

**Cenário 3: Modo offline (cache disponível)**
```
Given que já carreguei o dashboard anteriormente online
When fico sem internet
And abro o app novamente
Then vejo os dados do cache AsyncStorage
And aparece banner amarelo: "⚡ Modo offline - dados podem estar desatualizados"
And posso visualizar scores, streaks e achievements
But não posso completar missões (ou vão para fila)
```

**Cenário 4: Modo offline (sem cache - primeira vez)**
```
Given que é minha primeira vez no app
And estou sem conexão com a internet
When tento abrir o dashboard
Then vejo tela: "Sem conexão - conecte-se para ver seus dados"
And apenas opção de "Tentar novamente" está disponível
```

**Cenário 5: Pull-to-refresh**
```
Given que estou online
When faço gesture de pull-to-refresh no dashboard
Then vejo spinner de carregamento
And os dados são buscados novamente da API
And o cache AsyncStorage é atualizado
And toast "Dados atualizados" aparece ao final
```

**Cenário 6: Indicador de loading**
```
Given que a rede está lenta
When abro o dashboard
Then vejo loading spinner nos cards áreas
And os dados aparecem progressivamente conforme carregam
```

---

### US-03: Lista de Missões

**Cenário 1: Carregar lista de missões**
```
Given que estou logado
When navego para a tab "Missões"
Then vejo lista de missões disponíveis
And cada missão mostra:
  - Título (negrito)
  - Descrição (texto menor)
  - Badge da área (ícone + cor)
  - Badge de dificuldade (fácil/médio/difícil)
  - Pontos (ex: "+100 pts")
  - Botão "Completar" grande e visível
And missões da IA aparecem em seção separada com badge "✨ IA"
```

**Cenário 2: Filtrar por área**
```
Given que estou na tela de Missões
When toco no filtro "Saúde"
Then apenas missões da área Saúde são exibidas
And o contador mostra "X missões de Saúde"
When toco em "Todas"
Then todas as missões voltam a aparecer
```

**Cenário 3: Ver detalhes da missão**
```
Given que vejo uma missão na lista
When toco no card da missão (fora do botão completar)
Then vejo modal/detalhes expandidos com:
  - Título completo
  - Descrição detalhada
  - Área e dificuldade
  - Pontuação base
  - Botão "Completar" destacado
  - Botão "Cancelar" para fechar modal
```

**Cenário 4: Missões ordenadas**
```
Given que existem missões de diferentes dificuldades
When carrego a lista
Then missões são ordenadas por pontos_base (maior primeiro)
And missões IA aparecem TOPO (sempre primeiro)
```

**Cenário 5: Scroll infinito (muitas missões)**
```
Given que há mais de 20 missões cadastradas
When rolo até o final da lista
Then mais 10 missões são carregadas automaticamente
And o loading aparece durante o fetch
```

---

### US-04: Completar Missão

**Cenário 1: Completa missão com confirmação**
```
Given que estou na lista de missões
When toco no botão "Completar" de uma missão
Then aparece modal de confirmação com:
  - Título da missão
  - Campo "Notas (opcional)" para adicionar comentários
  - Botões "Cancelar" e "Confirmar"
When toco em "Confirmar"
Then vejo loading spinner por 1-2 segundos
And a missão é marcada como completa no backend
And recebo toast: "+100 pontos! Streak: 5 dias 🔥"
And o dashboard é atualizado automaticamente
And se um achievement foi desbloqueado:
    recebo toast extra: "🏆 Achievement: Primeiro Passo!"
```

**Cenário 2: Quick complete (sem confirmação)**
```
Given que nas configurações habilitei "Complete rápido"
When toco em "Completar" na lista
Then a missão é completada imediatamente (sem modal)
And vejo toast de sucesso
And o dashboard já mostra os novos pontos
```

**Cenário 3: Prevenção de duplicata diária**
```
Given que já completei a missão "Correr 5km" hoje
When tento completá-la novamente
Then recebo erro: "Você já completou esta missão hoje"
And a missão não é contabilizada novamente
And não recebo pontos extras
```

**Cenário 4: Offline - completar e fila**
```
Given que estou offline
When toco em "Completar" em qualquer missão
Then a missão é adicionada à fila offline (AsyncStorage)
And vejo toast: "✓ Salvo offline - sincronizará quando online"
And a interface mostra a missão como "pendente sync"
When volto a ficar online
Then a fila é enviada automaticamente ao backend
And recebo toast: "3 missões sincronizadas com sucesso"
And dashboard reflete os pontos ganhos
```

**Cenário 5: Streak bonus aplicado**
```
Given que tenho streak de 5 dias na área Saúde
When completo uma missão de Saúde
Then meus pontos base são 100
And recebo bônus de 50% (50 pontos extras)
And total recebido: 150 pontos
And streak é incrementado para 6 dias
```

**Cenário 6: Level up**
```
Given que estou no nível 4 com 900 pontos
And a fórmula de nível é sqrt(pontos/100)
When completo uma missão que me dá 200 pontos
Then meu total vai para 1100 pontos
And novo nível calculado: sqrt(1100/100) = sqrt(11) ≈ 3.31 → nível 3 não
Wait, recalcular:
  Nível antigo: sqrt(900/100) = sqrt(9) = 3
  Novo total: 1100
  Novo nível: sqrt(1100/100) = sqrt(11) ≈ 3.31 → ainda nível 3? floor() = 3
  Precisa de 1600 pontos para nível 4? Vamos ver:
  Para subir de 3 para 4: precisa de sqrt(pontos/100) >= 4 → pontos >= 1600
  Portanto se estava no nível 3 (900 pontos) e ganha 200 (1100), ainda continua nível 3
  Ok Cenário Inválido! Preciso ajustar:

**Cenário 6: Level up correto**
```
Given que estou no nível 3 com 1500 pontos (sqrt(15)=3.87→floor=3)
When completo uma missão que me dá 200 pontos
Then meu total vai para 1700 pontos
And novo nível calculado: sqrt(1700/100) = sqrt(17) ≈ 4.12 → nível 4
And recebo toast: "🎉 Parabéns! Você alcançou o nível 4!"
And o nível no dashboard é atualizado para 4
```

---

### US-05: Recomendações IA

**Cenário 1: Gerar recomendações com sucesso**
```
Given que estou no dashboard
When toco no botão "Gerar Missões Personalizadas"
Then vejo loading: "🤖 Analisando seu histórico..."
And após 2-5 segundos vejo 3 cards de recomendações
And cada card contém:
  - Título da missão
  - Descrição curta
  - Badge da área (correspondente)
  - Badge de dificuldade (easy/medium/hard)
  - Pontos sugeridos
  - Texto "Por que sugerimos isso: <motivo>"
And botão "✅ Completar Agora" em cada card
And as missões aparecem também na lista principal
```

**Cenário 2: Complete missão da IA**
```
Given que tenho recomendações da IA visíveis
When toco em "Completar Agora" em um card
Then a missão é:
  - Criada automaticamente no backend (tipo 'custom')
  - Completada em uma única operação
And vejo toast: "+50 pontos! Missão completada"
And dashboard é atualizado
And recomendações são recarregadas (ou removidas a missão completada)
```

**Cenário 3: Fallback - sem API key**
```
Given que o backend não tem OPENROUTER_API_KEY
When toco em "Gerar Missões Personalizadas"
Then recebo 3 missões genéricas pré-definidas
And vejo aviso: "⚠️ Modo fallback - IA indisponível"
And posso completar normalmente
```

**Cenário 4: Erro de API (timeout ou erro)**
```
Given que a API da IA está lenta ou falhando
When solicito recomendações
After 10 segundos de timeout
Then vejo erro: "Não foi possível gerar recomendações agora"
And botão "Tentar novamente" é exibido
And as recomendações anteriores permanecem visíveis (se houver)
```

**Cenário 5: Offline - IA indisponível**
```
Given que estou offline
When toco em "Gerar Missões Personalizadas"
Then vejo erro: "Recomendações IA requerem conexão"
And sugiro usar missões da lista padrão
```

---

### US-06: Achievements View

**Cenário 1: Lista de desbloqueados**
```
Given que desbloqueei 3 achievements:
  - 🌱 Primeiro Passo
  - 🔥 7 dias de Foco
  - 📚 Maratonista de Aprendizado
When abro a aba "Achievements"
Then veho seção "Desbloqueados (3/12)"
And cada achievement mostra:
  - Ícone colorido
  - Nome em negrito
  - Descrição
  - Badge "✓" ou data de desbloqueio
And são ordenados por data de desbloqueio (mais recente primeiro)
```

**Cenário 2: Lista de pendentes**
```
Given que ainda não desbloqueei todos
When rolo a tela de Achievements para baixo
Then vejo seção "Próximos Achievements"
And cada pending mostra:
  - Ícone em cinza/desabilitado
  - Nome
  - Condição de desbloqueio (ex: "Complete 100 missões de saúde")
  - Barra de progresso (se aplicável, ex: 30/100)
```

**Cenário 3: Trigger - achievement desbloqueado**
```
Given que completei uma missão que satisfaz condição de achievement
When a API retorna unlocked_achievements na resposta
Then vejo toast imediato: "🏆 Achievement desbloqueado: Primeiro Passo!"
And o achievement aparece automaticamente na lista de desbloqueados
And bounce animation no novo card
```

**Cenário 4: Ver detalhes do achievement**
```
Given que estou na tela de Achievements
When toco em um achievement card
Then vejo modal/detalhes com:
  - Ícone grande
  - Nome
  - Descrição completa
  - Data de desbloqueio (se já desbloqueado)
  - Condição atual/progresso (se pendente)
  - Botão "Fechar"
```

---

### US-09: Offline Básico

**Cenário 1: Cache de dashboard**
```
Given que já carreguei o dashboard estando online
When fico offline
And abro o app novamente
Then o dashboard é carregado do AsyncStorage
And aparece banner informativo: "⚡ Modo offline"
And posso ver:
  - Nível e pontos totais
  - Scores por área
  - Streaks
  - Achievements desbloqueados
But ao tentar completar missão:
  - Ou vai para fila
  - Ou mostra erro "Completa uma missão online"
```

**Cenário 2: Cache de missões**
```
Given que carreguei a lista de missões online anteriormente
When estou offline e abro a tela de Missões
Then vejo a lista do cache
And cada missão mostra botão "Completar"
But ao completar, a missão vai para fila offline
And toast: "✓ Salvo offline - sincronizará quando online"
```

**Cenário 3: Fila de sincronização**
```
Given que estou offline
When completo 3 missões
Then elas são adicionadas à fila em AsyncStorage com timestamp
And cada uma tem status "pending"
When volto a ficar online
Then o serviço de sync automaticamente envia cada item da fila para /mission/quick-complete
And após cada sucesso, remove da fila
When todas sincronizadas
Then vejo toast: "3 missões sincronizadas com sucesso"
And dashboard atualiza com os novos pontos/streaks
```

**Cenário 4: Erro de sync**
```
Given que tenho 3 missões na fila offline
When volto online mas a API retorna erro 500
Then as missões permanecem na fila
And vejo toast: "Erro ao sincronizar - tentará novamente"
And o sistema tenta novamente em 30 segundos (retry automático)
```

**Cenário 5: Limpeza de cache antigo**
```
Given que tenho cache com mais de 7 dias
When abro o app online
Then o cache é validado (ETag/version)
If cache muito antigo
Then recarregar completamente da API
And limpar cache antigo
```

---

## 4. Wireframe Textual (ASCII)

### Tela 1: Login
```
┌─────────────────────────────┐
│          Life Quest          │
│        🔐 Login WhatsApp     │
│                             │
│  +55                     btn │
│  [ Digite seu número ]      │
│                             │
│  [ Continuar ]              │
│                             │
│  OU                          │
│                             │
│  [  Login com Google  ]     │
│  [    Login com Apple   ]   │
│                             │
│  Ao continuar, você aceita  │
│  nossos termos e privacidade│
└─────────────────────────────┘
```

### Tela 2: OTP Verification
```
┌─────────────────────────────┐
│   Verificação de 2 fatores  │
│                             │
│  Enviamos código para:      │
│  +55 62 8607-7431           │
│                             │
│  [  1 ][  2 ][  3 ][  4  ] │
│  [  5 ][  6 ][  7 ][  8  ] │
│  [  9 ][  0 ][  C ][  ✓  ] │
│                             │
│  Não recebeu? [Reenviar]    │
└─────────────────────────────┘
```

### Tela 3: Dashboard (Tab 1)
```
┌─────────────────────────────┐
│  👤 Nikolas       Nível 5   │
│  Total: 2.350 pts    🔄    │
├─────────────────────────────┤
│  🏃 Saúde         ████████░│
│     1.200 pts    80%       │
│     🔥 5 dias              │
│                             │
│  🎯 Foco          ██████░░░│
│     800 pts      60%       │
│     🔥 3 dias              │
│                             │
│  📚 Aprendizado   ████░░░░░│
│     350 pts      30%       │
│     🔥 0 dias              │
│                             │
│  💰 Finanças      █░░░░░░░░│
│     0 pts        0%        │
│     🔥 0 dias              │
├─────────────────────────────┤
│  🏆 Achievements           │
│  • 🌱 Primeiro Passo ✓     │
│  • 📚 Maratonista ✓        │
│  • 💎 Primeiro Milhão ░85% │
├─────────────────────────────┤
│  [ 🤖 Gerar Missões IA ]   │
└─────────────────────────────┘
```

### Tela 4: Missões (Tab 2)
```
┌─────────────────────────────┐
│  Missões           [Filtro] │
│  ✨ Recomendações IA        │
│  ┌───────────────────────┐ │
│  │ 🏃 Caminhada 10min    │ │
│  │ Saúde • Fácil • +50   │ │
│  │ 💡 Para relaxar       │ │
│  │ [ ✅ Completar ]      │ │
│  └───────────────────────┘ │
│                             │
│  📋 Missões Disponíveis     │
│  ┌───────────────────────┐ │
│  │ 🏃 Correr 5km         │ │
│  │ Saúde • Médio • +100  │ │
│  │ [ ✅ Completar ]      │ │
│  └───────────────────────┘ │
│  ┌───────────────────────┐ │
│  │ 🎯 Bloquear sites     │ │
│  │ Foco • Fácil • +50    │ │
│  │ [ ✅ Completar ]      │ │
│  └───────────────────────┘ │
│  [Carregando mais...]       │
└─────────────────────────────┘
```

### Tela 5: Achievements (Tab 3)
```
┌─────────────────────────────┐
│  🏆 Achievement   (3/12)   │
├─────────────────────────────┤
│  ✅ Desbloqueados            │
│  ┌───────────────────────┐ │
│  │ 🌱 Primeiro Passo      │ │
│  │ Complete sua 1ª missão │ │
│  └───────────────────────┘ │
│  ┌───────────────────────┐ │
│  │ 📚 Maratonista         │ │
│  │ 50 missões de ap.- 37  │ │
│  └───────────────────────┘ │
│                             │
│  🔒 Pendentes               │
│  ┌───────────────────────┐ │
│  │ 💎 Primeiro Milhão ░85%│ │
│  │ 1.000.000 de pontos   │ │
│  └───────────────────────┘ │
│  ┌───────────────────────┐ │
│  │ 💪 Mestre da Saúde ░30%│ │
│  │ 100 missões de saúde  │ │
│  └───────────────────────┘ │
└─────────────────────────────┘
```

### Tela 6: Perfil (Tab 4)
```
┌─────────────────────────────┐
│  👤 Perfil                  │
│                             │
│  Nikolas                    │
│  +55 62 8607-7431           │
│  Nível 5 • 2.350 pts        │
│                             │
│  📊 Estatísticas            │
│  • Missões: 47 completas    │
│  • Maior streak: 12 dias    │
│  • Média diária: 2 missões  │
│                             │
│  ⚙️ Configurações           │
│  [✓] Complete rápido       │
│  [✓] Notificações WhatsApp │
│  [ ] Widget home screen     │
│  [✓] sincronização auto    │
│                             │
│  [🔔 Notificações]          │
│  [❓ Ajuda & Suporte]       │
│  [📖 Sobre]                 │
│                             │
│  [ Sair ]                   │
└─────────────────────────────┘
```

### Tela 7: Onboarding (primeira vez)
```
┌─────────────────────────────┐
│  → Slide 1 de 4             │
│  🎮 Gamifique sua vida      │
│  Transforme hábitos em      │
│  pontos, streaks e levels   │
│  [ Pular ]   [ Próximo → ]  │
├─────────────────────────────┤
│  → Slide 2                  │
│  📊 4 Áreas principais      │
│  Saúde • Foco • Aprendizado │
│  • Finanças                 │
│  Acompanhe cada separadamente│
├─────────────────────────────┤
│  → Slide 3                  │
│  🤖 IA Personalizada        │
│  Receba missões sugeridas   │
│  baseadas no seu histórico  │
├─────────────────────────────┤
│  → Slide 4                  │
│  🚀 Comece Agora!           │
│  Faça login com WhatsApp    │
│  e complete sua 1ª missão   │
│  [ Começar ]                │
└─────────────────────────────┘
```

### Widget Home Screen (Android/iOS):
```
┌────────┐
│ Life   │
│ Quest  │
├────────┤
│ 🏃     │
│ Caminh│
│ 10min │
│        │
│ +50 pts│
│ 🔥 5d  │
├────────┤
│ [ ✓ ]  │
└────────┘
```

---

## 5. Checklist de Implementação Técnica

### Frontend (React Native/Expo)

- [ ] `create-expo-app` setup + dependências instaladas
- [ ] Navegação: React Navigation (Bottom Tabs)
- [ ] Screens:
  - [ ] LoginScreen (telas login+otp)
  - [ ] DashboardScreen
  - [ ] MissionsScreen
  - [ ] AchievementsScreen
  - [ ] ProfileScreen
  - [ ] OnboardingScreen
- [ ] Components:
  - [ ] AreaCard
  - [ ] MissionItem
  - [ ] AchievementItem
  - [ ] Toast (custom)
  - [ ] LoadingSpinner
- [ ] Services:
  - [ ] `api.js` (axios config + endpoints)
  - [ ] `auth.js` (login, logout, token storage)
  - [ ] `storage.js` (AsyncStorage - cache + queue)
  - [ ] `sync.js` (NetInfo listener + auto-sync)
- [ ] Utils:
  - [ ] `formatters.js` (pontos, datas, numbers)
  - [ ] `constants.js` (cores, ícones, URLs)
- [ ] Estados globais (Context API ou Zustand):
  - [ ] AuthContext (user, token)
  - [ ] OfflineContext (isOnline, queue)
- [ ] Validação de formulários (telas de login)
- [ ] Tratamento de erros (boundaries + toasts)
- [ ] Loading states (skeletons/spinners)
- [ ] Pull-to-refresh (Dashboard + Missions)
- [ ] Testes manuais em Android e iOS

### Integrações

- [ ] Login WhatsApp (backend /auth endpoint necessário? ou manter phone+OTP manual?)
  - **Nota**: Backend atual não tem endpoint de auth. Precisa criar:
    - POST /auth/request-otp (phone) → envia OTP via wacli
    - POST /auth/verify-otp (phone, code) → retorna token JWT
- [ ] API calls testadas (todos endpoints)
- [ ] wacli notifications (backend)
- [ ] Widget (nativo Android/iOS)
- [ ] Onboarding flow (first-run detection)

### Offline

- [ ] AsyncStorage setup
- [ ] Cache implementation:
  - [ ] dashboard cache
  - [ ] missions cache
  - [ ] achievements cache
- [ ] Fila offline (offline queue)
- [ ] NetInfo listener
- [ ] Auto-sync ao voltar online
- [ ] Indicador offline banner

---

## 6. Definição de Pronto (DoD)

Cada User Story Must Have deve ter:

**Código**:
- [ ] Implementado na branch correspondente
- [ ] Testado manualmente em emulador/dispositivo
- [ ] Sem erros no console (apenas warnings ok)
- [ ] Código revisado (code review)

**Funcional**:
- [ ] Funciona em Android e iOS (pelo menos um de cada)
- [ ] API integration testada (backend rodando)
- [ ] Offline mode testado (cache + queue)
- [ ] Loading/error states implementados
- [ ] Navegação fluida (sem travamentos)

**Documentação**:
- [ ] MOBILE.md atualizado com screenshots (se possível)
- [ ] README.md principal contém seção "Mobile App"
- [ ] CHANGELOG.md atualizado
- [ ] Comentários no código (snippets importantes)

**QA**:
- [ ] Testes manuais aprovados (checklist acima)
- [ ] Performance ok (carregamento < 3s)
- [ ] Não vaza dados sensíveis (logs, tokens)
- [ ] Modo escuro (se aplicável)

**Deploy**:
- [ ] APK gerado (Android)
- [ ] Build Expo (iOS) preparado
- [ ] QR code Expo Go disponível
- [ ] Backend acessível via URL pública (NGROK/domain)

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Backend não ter endpoint de auth | Alta | Alto | Criar POST /auth/simple-login (phone → token fake) para MVP |
| Widget complexidade alta | Média | Alto | Deferir para Sprint 2; usar widget simples primeiro |
| IA lenta/offline frequently | Média | Médio | Implementar fallback e cache de recomendações |
| Offline queue pode perder dados | Baixa | Alto | Validar com idempotency keys + retry robusto |
| wacli não configurado no backend | Alta | Médio | Mockar notificações no MVP; só ativar depois |

---

**Documento preparado por**: PM Mobile Sub-agent
**Data**: 2026-03-20
**Versão**: 0.1 (Draft)
**Próxima revisão**: Após Sprint 1
