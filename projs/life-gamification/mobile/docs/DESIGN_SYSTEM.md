# Design System - Life Gamification Mobile

**Fase 2 - Design System & Microcopy**  
**Data:** 2026-03-20  
**Responsável:** CMO (Subagent)  
**Projeto:** Life Gamification Mobile (React Native + Expo)

---

## 📐 1. Visão Geral do Design System

O Design System do Life Gamification é construído sobre os **Design Tokens** já definidos em `src/theme/theme.ts`. Este documento expande esses tokens em especificações completas para desenvolvimento mobile, incluindo componentes reutilizáveis, microcopy, estados vazios e fluxos.

### Princípios de Design

- **Clareza:** Interface intuitiva, foco nas ações principais
- **Gamificação:** Visual engajador com cores vibrantes por área de vida
- **Consistência:** Tokens uniformes em todas as telas
- **Acessibilidade:** Contraste adequado, tamanhos legíveis
- **Dark Mode优先:** Design otimizado para tema escuro (primary)

---

## 🎨 2. Design Tokens (Especificações Completas)

### 2.1 Cores (Color Palette)

Baseado em `src/theme/theme.ts`, com expansão de semântica:

#### Cores de Áreas (Primary Colors)

| Área        | Nome Token | Valor Hex | Uso Principal                          | Gradiente (opcional)                |
|-------------|------------|-----------|----------------------------------------|-------------------------------------|
| Bolsa       | `bolsa`    | `#10B981` | Finanças, economia, investimentos     | `#10B981 → #34D399`                 |
| Mente       | `mente`    | `#3B82F6` | Aprendizado, conhecimento, foco       | `#3B82F6 → #60A5FA`                 |
| Vitalidade  | `vitalidade`| `#EF4444`| Saúde, exercício, energia             | `#EF4444 → #F87171`                 |
| Propósito   | `proposito`| `#8B5CF6` | Crescimento pessoal, metas, propósito | `#8B5CF6 → #A78BFA`                 |

#### Cores Neutras (Escala de Cinza)

| Token       | Valor Hex | Uso                                     | Contraste (texto) |
|-------------|-----------|-----------------------------------------|-------------------|
| `gray50`    | `#F9FAFB` | Fundo claro (raro no dark mode)        | ✅ AAA            |
| `gray100`   | `#F3F4F6` | Bordas claras, separadores leves       | ✅ AA             |
| `gray200`   | `#E5E7EB` | Input borders, hover states            | ✅ AA             |
| `gray300`   | `#D1D5DB` | Texto secundário, ícones desativados   | ✅ AA             |
| `gray400`   | `#9CA3AF` | Texto terciário, hints                 | ✅ AA             |
| `gray500`   | `#6B7280` | Labels, metadados                      | ✅ AA             |
| `gray600`   | `#4B5563` | Borders médios, texto desabilitado     | ✅ AAA            |
| `gray700`   | `#374151` | Elementos de UI (cards, botões secundários) | ✅ AAA      |
| `gray800`   | `#1F2937` | Fundo de cards, modais                 | ✅ AAA            |
| `gray900`   | `#111827` | **Fundo principal** do app (bg-primary) | ✅ AAA           |

#### Cores Semânticas

| Token       | Valor Hex | Significado                             | Exemplo de Uso                |
|-------------|-----------|-----------------------------------------|-------------------------------|
| `success`   | `#10B981` | Sucesso, conclusão, ganho              | Check-in completado, +pontos  |
| `error`     | `#EF4444` | Erro, falha, perigo                    | Erro de conexão, ação inválida|
| `warning`   | `#F59E0B` | Aviso, atenção, streak perdida        | Streak quebrada, limite       |
| `info`      | `#3B82F6` | Informação, dica, nova feature        | Novidade, ajuda              |

#### Cores de Superfície (Backgrounds)

```ts
// Para variantes de fundo em componentes
bgPrimary = theme.Colors.gray900        // Fundo principal da tela
bgSecondary = theme.Colors.gray800      // Fundo de cards, containers
bgTertiary = theme.Colors.gray700       // Fundo de botões secundários
bgInverse = theme.Colors.white          // Texto invertido (em botões primários)
```

### 2.2 Tipografia (Typography System)

#### Font Family

- **Family:** `Inter` (carregada via `expo-font` em `App.tsx`)
- **Weights disponíveis:**
  - `Inter-Regular` → 400
  - `Inter-Medium` → 500
  - `Inter-SemiBold` → 600
  - `Inter-Bold` → 700

#### Escala Tipográfica (Font Size Scale)

| Token       | Tamanho (px) | Uso Sugerido                                       | Line Height |
|-------------|--------------|----------------------------------------------------|-------------|
| `xs`        | 12           | Captions, hints, metadados pequenos               | `tight` (1.2)|
| `sm`        | 14           | Texto secundário, labels de input                 | `normal` (1.5)|
| `base`      | 16           | **Texto padrão** (body)                           | `normal` (1.5)|
| `lg`        | 18           | Subtítulos, textos de destaque                    | `normal` (1.5)|
| `xl`        | 20           | Títulos de cartões, seções                        | `tight` (1.2)|
| `2xl`       | 24           | Títulos de tela (ícone + texto)                   | `tight` (1.2)|
| `3xl`       | 30           | Cabeçalhos principais (Dashboard)                | `tight` (1.2)|
| `4xl`       | 36           | Título hero (onboarding), level badge            | `tight` (1.2)|

#### Line Heights

- `tight`: 1.2 (para títulos grandes)
- `normal`: 1.5 (para textos longos)
- `relaxed`: 1.75 (para leitura estendida, termos de uso)

#### Text Styles Predefinidos

```ts
const textStyles = {
  // Headings
  h1: { fontSize: 36, fontFamily: bold, lineHeight: 1.2 },
  h2: { fontSize: 30, fontFamily: bold, lineHeight: 1.2 },
  h3: { fontSize: 24, fontFamily: semibold, lineHeight: 1.2 },
  h4: { fontSize: 20, fontFamily: semibold, lineHeight: 1.2 },

  // Body
  body: { fontSize: 16, fontFamily: regular, lineHeight: 1.5 },
  bodySmall: { fontSize: 14, fontFamily: regular, lineHeight: 1.5 },

  // Labels
  label: { fontSize: 14, fontFamily: medium, lineHeight: 1.5 },
  caption: { fontSize: 12, fontFamily: regular, lineHeight: 1.2 },

  // Numbers
  numberLarge: { fontSize: 32, fontFamily: bold, lineHeight: 1.2 },
  numberSmall: { fontSize: 18, fontFamily: semibold, lineHeight: 1.2 },
};
```

### 2.3 Spacing (8px Grid System)

Todos os espaçamentos são múltiplos de 8px (4px como menor unidade):

| Token | Valor (px) | Uso Típico                                    |
|-------|------------|-----------------------------------------------|
| `0`   | 0          | Sem espaçamento                              |
| `1`   | 4          | Padding inside chips, small gaps            |
| `2`   | 8          | Gutter padrão, padding de botões            |
| `3`   | 12         | Espaçamento entre texto e ícone             |
| `4`   | 16         | **Padding padrão** de tela/card             |
| `5`   | 20         | Espaçamento médio, seções                   |
| `6`   | 24         | Espaçamento entre blocos, headings         |
| `7`   | 28         | Espaçamento generoso, titulos com ícone    |
| `8`   | 32         | Espaçamento entre seções principais        |
| `9`   | 36         | Espaçamento extra, mobile portrait         |
| `10`  | 40         | Espaçamento entre áreas/gráficos          |
| `12`  | 48         | Espaçamento entre cards grandes           |
| `16`  | 64         | Espaçamento de seções hero                |
| `20`  | 80         | Espaçamento super generoso (landscape)    |
| `24`  | 96         | Espaçamento full-width (raro)             |

#### Padding Patterns

```ts
// Paddings reutilizáveis
paddingScreen = {
  paddingHorizontal: 16, // spacing[4]
  paddingVertical: 16,
}

paddingCard = {
  padding: 16, // spacing[4]
}

paddingCompact = {
  padding: 12, // spacing[3]
}
```

### 2.4 Border Radius

| Token  | Valor (px) | Uso                                       |
|--------|------------|-------------------------------------------|
| `sm`   | 4          | Chips pequenos, badges                    |
| `md`   | 8          | Botões, inputs, cards secundários        |
| `lg`   | 12         | **Cards principais**, modais, dialogs    |
| `xl`   | 16         | Avatares circulares, floating buttons   |
| `full` | 9999       | Avatar circular completely round         |

### 2.5 Shadows (Elevation)

Para React Native (cross-platform):

```ts
shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Android
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
}
```

### 2.6 Responsividade (Breakpoints)

Para tablets e diferentes tamanhos de tela:

```ts
const breakpoints = {
  sm: 640,   //phones small
  md: 768,   // tablets portrait
  lg: 1024,  // tablets landscape / small tablets
  xl: 1280,  // large tablets
};

// Hook para uso
const useResponsive = () => {
  const windowWidth = Dimensions.get('window').width;
  return {
    isPhone: windowWidth < 768,
    isTablet: windowWidth >= 768,
    isLarge: windowWidth >= 1024,
  };
};
```

---

## 🧩 3. Component Library

Todos os componentes devem ser criados em `src/components/` e usar o `ThemeProvider` para acessar tokens.

### 3.1 Button

**Propriedades:**

| Prop        | Tipo                | Default   | Descrição                                  |
|-------------|---------------------|-----------|--------------------------------------------|
| `variant`   | `'primary'` \| `'secondary'` \| `'ghost'` | `'primary'` | Variante visual                      |
| `size`      | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Tamanho do botão                     |
| `label`     | `string`            | required  | Texto do botão                            |
| `onPress`   | `() => void`        | required  | Callback ao tocar                          |
| `disabled`  | `boolean`           | `false`   | Estado desabilitado                       |
| `icon`      | `ReactElement`      | optional  | Ícone à esquerda (import de `@expo/vector-icons`)|
| `loading`   | `boolean`           | `false`   | Loading spinner                           |
| `fullWidth` | `boolean`           | `false`   | Ocupar largura total                      |

**Tokens por Variante:**

```tsx
// Primary (gradiente da área atual ou accent-primary)
variant="primary" => {
  backgroundColor: theme.Colors.gray800, // fallback
  // OU gradiente: LinearGradient com cor da área
  color: theme.Colors.white,
}

// Secondary (outline)
variant="secondary" => {
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: theme.Colors.gray600,
  color: theme.Colors.gray200,
}

// Ghost (texto apenas)
variant="ghost" => {
  backgroundColor: 'transparent',
  color: theme.Colors.gray300,
}
```

**Tokens por Tamanho:**

```tsx
size="small" => { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }
size="medium" => { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 }
size="large" => { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 }
```

**Implementação Sugerida:** `src/components/Button/Button.tsx`

**Exemplo de Uso:**

```tsx
<Button
  variant="primary"
  size="medium"
  label="Completar missão"
  onPress={handleComplete}
  icon={<Ionicons name="checkmark-circle" size={20} color="white" />}
/>
```

---

### 3.2 Card

**Tipos de Card:**

1. **AreaCard** - Mostra progresso de uma área de vida (Bolsa, Mente, etc)
2. **MissionCard** - Missão individual (com botão completar)
3. **AchievementCard** - Conquista (desbloqueada/pendente)
4. **RecommendationCard** - Recomendação da IA (coach)

**Tokens Comuns:**

```tsx
cardStyle = {
  backgroundColor: theme.Colors.gray800,
  borderRadius: theme.BorderRadius.lg,
  padding: theme.Spacing[4],
  borderWidth: 1,
  borderColor: theme.Colors.gray700,
  ...shadows.sm,
}
```

#### AreaCard

**Propriedades:**

| Prop         | Tipo                   | Descrição                              |
|--------------|------------------------|----------------------------------------|
| `area`       | `'bolsa'` \| `'mente'` \| `'vitalidade'` \| `'proposito'` | Área de vida |
| `areaName`   | `string`               | Nome exibido (ex: "Finanças")         |
| `icon`       | `string`               | Nome do ícone (MaterialCommunityIcons)|
| `level`      | `number`               | Nível atual (1-100)                   |
| `points`     | `number`               | Pontos na área                        |
| `totalPoints`| `number`               | Pontos necessários para próximo nível |
| `progress`   | `number` (0-1)         | Progresso percentual                  |

**Layout:**

```
┌─────────────────────────────┐
│ [Ícone]  Nome da Área    LVL │
│         ──────────────────   │
│         Progress Bar         │
│   Pontos: X / Y              │
└─────────────────────────────┘
```

**Cores:** border-left-color = cor da área (verde/azul/vermelho/roxo)

#### MissionCard

**Propriedades:**

| Prop          | Tipo                  | Descrição                              |
|---------------|-----------------------|----------------------------------------|
| `title`       | `string`              | Título da missão                      |
| `area`        | área (string)         | Área de vida                          |
| `points`      | `number`              | Pontos ao completar                   |
| `difficulty`  | `'easy'` \| `'medium'` \| `'hard'` | Dificuldade (afeta badges)    |
| `completed`   | `boolean`             | Se já foi completada                  |
| `onComplete`  | `() => void`          | Callback ao completar                 |
| `dueDate`     | `Date` \| `null`      | Data limite (exibe se válida)         |

**Layout (pendente):**

```
┌─────────────────────────────┐
│ 🎯 Título da Missão          │
│   Área: Finanças  •  +50 pts │
│   Dificuldade: Fácil         │
│                              │
│   [Completar missão]         │
└─────────────────────────────┘
```

**Layout (completada):**

```
┌─────────────────────────────┐
│ ✅ Título da Missão          │
│   Concluída                 │
│   +50 pontos ganhos         │
└─────────────────────────────┘
```

---

### 3.3 Badge

**Tipos de Badge:**

1. **PointsBadge** - Pontos da área (pequeno)
2. **LevelBadge** - Nível do usuário (com emoji)
3. **AchievementBadge** - Conquista (pequeno ícone)
4. **StatusBadge** - Estado (completada, ativa, expirada)

**Tokens:**

```tsx
badgeStyle = {
  backgroundColor: theme.Colors.gray700,
  borderRadius: theme.BorderRadius.full, // circular
  paddingHorizontal: theme.Spacing[3],
  paddingVertical: theme.Spacing[1],
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.Spacing[2],
}
```

**Cores Semânticas:**

- `success` (verde) - completado, positivo
- `warning` (laranja) - pendente, streak
- `error` (vermelho) - expirado, erro
- `info` (azul) - informativo

**Exemplo - LevelBadge:**

```tsx
<Badge
  variant="level"
  value={user.level}
  icon="star"
  color={getAreaColor(user.mainArea)}
/>
```

---

### 3.4 ProgressBar

**Uso principal:** Barras de progresso das áreas (Bolsa, Mente, Vitalidade, Propósito)

**Propriedades:**

| Prop        | Tipo     | Default | Descrição                              |
|-------------|----------|---------|----------------------------------------|
| `progress`  | `number` | required| Valor entre 0 e 1 (0-100%)             |
| `color`     | `string` | `theme.Colors.info` | Cor da barra (pode ser cor da área) |
| `height`    | `number` | `8`     | Altura em pixels                       |
| `animated`  | `boolean`| `true`  | Animação de preenchimento              |
| `showLabel` | `boolean`| `false` | Mostrar percentual (ex: "75%")         |

**Tokens:**

```tsx
progressContainer = {
  height: height,
  backgroundColor: theme.Colors.gray700,
  borderRadius: theme.BorderRadius.full,
  overflow: 'hidden',
}

progressFill = {
  height: '100%',
  backgroundColor: color,
  borderRadius: theme.BorderRadius.full,
  width: `${progress * 100}%`,
  // Se animated: use Animated.View com timing
}
```

**Animações:**

```tsx
// Com Animated API para preenchimento suave
const animatedWidth = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(animatedWidth, {
    toValue: progress,
    duration: 800,
    easing: Easing.out(Easing.ease),
    useNativeDriver: false, // width não suporta native driver
  }).start();
}, [progress]);
```

---

### 3.5 Avatar

**Propriedades:**

| Prop         | Tipo                   | Default | Descrição                              |
|--------------|------------------------|---------|----------------------------------------|
| `source`     | `{ uri: string }`      | required| URL da imagem (ou local asset)        |
| `size`       | `number`               | `48`    | Tamanho em pixels (largura = altura)  |
| `borderColor`| `string`               | optional| Cor da borda (ex: área principal)     |
| `borderWidth`| `number`               | `2`     | Espessura da borda                    |
| `badge`      | `'online'` \| `null`   | `null`  | Indicador online (ponto verde)       |

**Tokens:**

```tsx
avatarContainer = {
  width: size,
  height: size,
  borderRadius: size / 2, // circular
  borderWidth: borderWidth,
  borderColor: borderColor || theme.Colors.gray600,
  overflow: 'hidden',
}

avatarImage = {
  width: '100%',
  height: '100%',
  resizeMode: 'cover' as const,
}

// Badge online
badgeStyle = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: size * 0.3,
  height: size * 0.3,
  borderRadius: size * 0.15,
  backgroundColor: theme.Colors.success,
  borderWidth: 2,
  borderColor: theme.Colors.gray800,
}
```

---

## 📝 4. Microcopy (Copy para Todas as Telas)

Todo o texto do app em **português brasileiro**, tom motivacional e direto.

### 4.1 Dashboard

| Elemento               | Texto (pt-BR)                          | Notas                                     |
|------------------------|----------------------------------------|-------------------------------------------|
| Título da tela         | "Dashboard"                            |                                           |
| Subtítulo              | "Resumo das suas áreas de vida"        |                                           |
| Nível                  | "Nível {nível}"                        | Ex: "Nível 12"                            |
| Pontos totais          | "{pontos} pontos"                      |                                           |
| Streak                 | "🔥 Streak: {dias} dias"               | Destaque para sequência                   |
| Empty state            | "Nenhum dado disponível no momento"   | Se API falhar ou vazio                   |
| Loading                | "Carregando..."                        | Spinner                                   |

#### Cartão de Área (AreaCard)

| Elemento          | Texto                                     |
|-------------------|-------------------------------------------|
| Bolsa             | "Bolsa" (ou "Finanças")                   |
| Mente             | "Mente" (ou "Aprendizado")                |
| Vitalidade        | "Vitalidade" (ou "Saúde")                 |
| Propósito         | "Propósito" (ou "Crescimento")            |
| Nível label       | "LVL {nível}"                             |
| Progresso         | "{percentual}% completo"                  |
| Pontos            | "{atual} / {necessário} pontos"           |

**Exemplo completo:**

```
💰 Bolsa
LVL 8 • 75% completo
1,250 / 1,667 pontos
[████████░░░░] 
```

#### Seção de Achievements

| Elemento          | Texto                                     |
|-------------------|-------------------------------------------|
| Título            | "Conquistas"                              |
| Empty state       | "Complete missões para desbloquear conquistas" |
| Locked            | "Desbloqueie esta conquista completando missões" |
| Unlocked          | "Conquista desbloqueada!"                 |

#### Seção de Recomendações IA

| Elemento          | Texto                                     |
|-------------------|-------------------------------------------|
| Título            | "Recomendações para você"                 |
| Subtítulo         | "Baseado no seu desempenho recente"      |
| Botão             | "Iniciar missão"                         |
| Empty state       | "Nenhuma recomendação disponível no momento" |

---

### 4.2 Missões

| Elemento               | Texto (pt-BR)                          |
|------------------------|----------------------------------------|
| Título da tela         | "Missões"                              |
| Subtítulo              | "Desafios diários e semanais"          |
| Filter全部             | "Todas"                                |
| Filterativas           | "Ativas"                               |
| Filter completas       | "Concluídas"                           |
| Empty state            | "Nenhuma missão disponível no momento" |
| Offline                | "Você está offline. Missões carregadas localmente." |
| Pull to refresh        | "Puxe para atualizar"                  |

#### Mission Card

| Elemento             | Texto (pendente)                       | Texto (completada)               |
|----------------------|----------------------------------------|----------------------------------|
| Botão                | "Completar missão"                     | "✓ Concluída"                    |
| Points label         | "+{pontos} pontos"                     | "+{pontos} ganhos"               |
| Dificuldade          | "Fácil" / "Médio" / "Difícil"         | (remover)                        |
| Área tag             | "Finanças" / "Saúde" / etc            | (remover)                        |
| Prazo                | "Expira em {data}"                     | (remover)                        |

**Exemplo completo (pendente):**

```
🎯 Economize R$100 este mês
💰 Finanças • +50 pts • Fácil
Expira em 3 dias

[Completar missão]
```

---

### 4.3 Perfil

| Elemento               | Texto (pt-BR)                          |
|------------------------|----------------------------------------|
| Título da tela         | "Perfil"                               |
| Subtítulo              | "Seu progresso e estatísticas"         |
| Nível badge            | "Nível {nível}"                        |
| Pontos totais          | "Total: {pontos} pontos"               |
| Área principal         | "Área principal: {área}"               |
| Streak atual           | "Streak atual: {dias} dias"            |
| Missões completas      | "Missões concluídas: {qtd}"            |
| Conquistas             | "Conquistas: {unlocked}/{total}"       |
| Header greeting        | "Olá, {nome}!"                         |
| Empty states           | "Complete missões para ver estatísticas"|

#### Estatísticas Avançadas (opcional)

| Elemento               | Texto (pt-BR)                          |
|------------------------|----------------------------------------|
| Seção "Histórico"      | "Histórico de pontos"                  |
| Semana label           | "Esta semana"                          |
| Mês label              | "Este mês"                             |
| Gráfico                | (sem texto, apenas visual)             |

---

### 4.4 Onboarding (3-4 Slides)

**Slide 1 - Boas-vindas:**

```
🎯 Vida em Games
Transforme sua vida em um jogo.
Complete missões, ganhe pontos, suba de nível.

[Começar]
```

**Slide 2 - Áreas de Vida:**

```
📊 Quatro Pilares
✔ Bolsa (finanças)
✔ Mente (conhecimento)
✔ Vitalidade (saúde)
✔ Propósito (crescimento)

Cuide de todas para evoluir.

[Próximo]
```

**Slide 3 - Missões Diárias:**

```
📅 Missões Diárias
• Complete desafios todos os dias
• Ganhe pontos e mantenha sua streak
• Desbloqueie conquistas

[Ver missões]
```

**Slide 4 - Pronto! (call to action):**

```
🚀 Tudo pronto!
Sua jornada gamificada começa agora.

[Vamos lá!]
```

---

### 4.5 Empty States

#### Nenhuma Missão

```
🎮 Nenhuma missão disponível

Volte mais tarde ou ajuste seus filtros.

[Atualizar]
```

#### Offline

```
📡 Você está offline

Missões carregadas localmente estão disponíveis.
O check-in será sincronizado quando voltar online.

[Tentar novamente]
```

#### Erro de Carregamento

```
⚠️ Ops! Algo deu errado

Não foi possível carregar seus dados.
Verifique sua conexão e tente novamente.

[Tentar novamente]
```

#### Nenhuma Conquista

```
🏆 Nenhuma conquista ainda

Complete missões para desbloquear conquistas e badges especiais.

[Ver missões]
```

---

## 🖼️ 5. Mockups (Descrições das 4 Telas Principais)

*(Nota: Mockups visuais podem ser criados posteriormente em ferramentas como Figma. Aqui estão descrições textuais para referência.)*

### Tela 1 - Dashboard (Home)

```
┌─────────────────────────────────────┐
│  [Ícone perfil]  Olá, João!         │
│  Nível 12 • 🔥 7 dias               │
│  Total: 4,250 pontos               │
├─────────────────────────────────────┤
│ 📊 Suas Áreas                      │
│  ┌────────────────────┐ ┌─────────┐│
│  │ 💰 Bolsa           │ │🧠 Mente ││
│  │ Nível 8           │ │Nível 10 ││
│  │ 75% ███████░░░   │ │60% ████░░││
│  │ 1,250/1,667 pts   │ │900/1,500││
│  └────────────────────┘ └─────────┘│
│  ┌────────────────────┐ ┌─────────┐│
│  │ ❤️ Vitalidade     │ │✨ Propósito││
│  │ Nível 6           │ │Nível 9  ││
│  │ 45% ███░░░░░░░   │ │55% █████░░││
│  │ 600/1,333 pts    │ │800/1,455││
│  └────────────────────┘ └─────────┘│
├─────────────────────────────────────┤
│ 🏆 Conquistas Recentes             │
│  ✓ streaks (7 dias)     +100 pts    │
│  ✓ first check-in       +50 pts     │
│  🔒complete 10 missões            ? │
├─────────────────────────────────────┤
│ 💡 Recomendação IA                 │
│  [Card with gradient border]       │
│  "Hora de focar: faça uma missão   │
│   de Mente agora por +50% extra!"  │
│  [Iniciar missão]                  │
└─────────────────────────────────────┘
```

### Tela 2 - Missões (Lista)

```
┌─────────────────────────────────────┐
│  Missões                          🔍│
│  [Todas] [Ativas] [Concluídas]     │
├─────────────────────────────────────┤
│  🎯 Economize R$100 este mês       │
│    💰 Finanças • +50 pts • Fácil   │
│    Expira em 3 dias                │
│    [Completar missão] ✓            │
├─────────────────────────────────────┤
│  🎯 Medite 10 minutos hoje         │
│    ❤️ Vitalidade • +30 pts • Médio │
│    Expira em 12h                   │
│    [Completar missão]              │
├─────────────────────────────────────┤
│  🎯 Leia 20 páginas                │
│    🧠 Mente • +40 pts • Difícil   │
│    Expira em 2 dias                │
│    [Completar missão]              │
├─────────────────────────────────────┤
│  🎯 Corra 5km                      │
│    ❤️ Vitalidade • +60 pts • Difícil│
│    Concluída • +60 ganhos         ✓ │
└─────────────────────────────────────┘
```

### Tela 3 - Perfil

```
┌─────────────────────────────────────┐
│  [Avatar 80px]                     │
│  João Silva                        │
│  Nível 12 • 4,250 pontos           │
│  🔥 7 dias • 🏆 8/15 conquistas    │
├─────────────────────────────────────┤
│  📈 Estatísticas                   │
│  Missões completas: 47             │
│  Streak máxima: 14 dias            │
│  Área principal: Mente             │
│  Membro desde: Jan 2025            │
├─────────────────────────────────────┤
│  🏆 Conquistas                     │
│  [Badge] streaks (7 dias)          │
│  [Badge] first check-in            │
│  [Badge] 1000 pontos               │
│  [🔒] complete 50 missões          │
├─────────────────────────────────────┤
│  ⚙️ Configurações                  │
│  Notificações                      │
│  Sincronização                    │
│  Sair                              │
└─────────────────────────────────────┘
```

### Tela 4 - Onboarding (Slide 1)

```
┌─────────────────────────────────────┐
│                                     │
│            🎯 Vida em Games        │
│                                     │
│   Transforme sua vida em um jogo.  │
│   Complete missões, ganhe pontos,  │
│   suba de nível.                   │
│                                     │
│            [Começar]               │
│            [Já tenho conta]        │
└─────────────────────────────────────┘
```

---

## 📚 6. Especificações Técnicas para Desenvolvedores

### 6.1 Criando Novos Componentes

Estrutura de pasta sugerida:

```
src/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
├── Card/
│   ├── AreaCard.tsx
│   ├── MissionCard.tsx
│   ├── index.ts
├── Badge/
│   ├── Badge.tsx
│   └── index.ts
├── ProgressBar/
│   ├── ProgressBar.tsx
│   └── index.ts
├── Avatar/
│   ├── Avatar.tsx
│   └── index.ts
└── index.ts (reexports all)
```

**index.ts exemplo:**

```ts
export { default as Button } from './Button/Button';
export { default as AreaCard } from './Card/AreaCard';
export { default as MissionCard } from './Card/MissionCard';
export { default as Badge } from './Badge/Badge';
export { default as ProgressBar } from './ProgressBar/ProgressBar';
export { default as Avatar } from './Avatar/Avatar';
```

### 6.2 Acessando Tokens

Sempre use o ThemeProvider:

```tsx
import { useTheme } from '../theme/ThemeProvider';

const MyComponent = () => {
  const theme = useTheme();

  return (
    <View style={{ padding: theme.Spacing[4] }}>
      <Text style={{ color: theme.Colors.gray100 }}>
        Texto acessível
      </Text>
    </View>
  );
};
```

### 6.3 Animações

Use `react-native-reanimated` para animações performáticas:

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const ProgressBar = ({ progress }) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
};
```

### 6.4 Gradientes

Para botões primários e cards especiais, use `expo-linear-gradient`:

```tsx
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={[theme.Colors.bolsa, '#34D399']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.gradient}
>
  <Text style={styles.text}>Completar</Text>
</LinearGradient>
```

---

## 🎯 7. Checklist de Implementação (Para o Dev)

### Componentes a Criar

- [ ] `Button` (variants: primary, secondary, ghost; sizes: small, medium, large)
- [ ] `Card` (AreaCard, MissionCard, AchievementCard, RecommendationCard)
- [ ] `Badge` (PointsBadge, LevelBadge, StatusBadge)
- [ ] `ProgressBar` (com animação opcional)
- [ ] `Avatar` (com badge online opcional)
- [ ] `StreakCounter` (componente separado para display de streak com fogo emoji)
- [ ] `AreaIcon` (ícone colorido por área)

### Telas a Atualizar com Design System

- [ ] DashboardScreen - implementar layout com AreaCards, achievements, recomendações
- [ ] MissoesScreen - lista de MissionCards com filtros
- [ ] PerfilScreen - estatísticas, avatar, conquistas
- [ ] SettingsScreen - opções básicas (notificações, tema, logout)

### Estados (Empty States, Loading, Error)

- [ ] Componente `EmptyState` genérico (com ícone, título, mensagem, botão)
- [ ] Loading spinner consistente
- [ ] Toast notifications para feedback (sucesso, erro)

### Microcopy

- [ ] Todas as strings definidas em arquivo `src/constants/copy.ts` (para future i18n)
- [ ] Copys aplicados nas telas respectivas

### Documentação

- [ ] DESIGN_SYSTEM.md completo (este arquivo)
- [ ] COMPONENTS.md com exemplos de uso de cada componente
- [ ] Storybook? (opcional, para visualização isolada)

---

## 📖 8. Apêndices

### A. Paleta de Cores para Prototipagem (CSS/Web)

Se precisar prototipar no navegador rapidamente:

```css
:root {
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-card: #374151;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  
  --area-bolsa: #10B981;
  --area-mente: #3B82F6;
  --area-vitalidade: #EF4444;
  --area-proposito: #8B5CF6;
  
  --semantic-success: #10B981;
  --semantic-error: #EF4444;
  --semantic-warning: #F59E0B;
  --semantic-info: #3B82F6;
}
```

### B. Fontes para Web

Se precisar mockup em HTML:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', sans-serif; background: #111827; color: #F9FAFB; }
</style>
```

### C. Referências de Ícones

- **Biblioteca recomendada:** `@expo/vector-icons` (inclui MaterialCommunityIcons, Ionicons, FontIcons)
- Ícones por área:
  - Bolsa: `"cash"`, `"currency-usd"`, `"chart-line"`
  - Mente: `"brain"`, `"book-open"`, `"lightbulb"`
  - Vitalidade: `"heart"`, `"run"`, `"dumbbell"`
  - Propósito: `"target"`, `"rocket"`, `"star"`

---

## ✅ Status da Fase 2

**Entregáveis:**

1. ✅ Design System Spec (core tokens, componentes, microcopy, empty states)
2. ✅ Microcopy completo em português brasileiro
3. ✅ Mockups textuais das 4 telas principais
4. ✅ Onboarding flow (4 slides)
5. ✅ Empty states (3 cenários)
6. ✅ Especificações técnicas para desenvolvedores
7. ✅ Este documento (`docs/DESIGN_SYSTEM.md`)

**Próximos passos (para o Dev):**

1. Criar componentes em `src/components/` seguindo as specs
2. Aplicar tokens nas telas existentes (Dashboard, Missões, Perfil)
3. Implementar microcopy nos Text components
4. Testar em dispositivos (iOS/Android) para validar contraste e spacing

**Prazo:** 12h a partir de 2026-03-20 14:30 GMT-3

---

**Assinado,**  
*CMO - Chief Marketing Officer*  
*DevTeam Agent*  
