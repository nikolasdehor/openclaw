# Arquitetura Mobile - Life Gamification

## 1. Visão Geral

Aplicativo React Native com Expo SDK 55, focado em gamificação de áreas da vida (Bolsa, Mente, Vitalidade, Propósito).

**Stack Principal:**

- React Native 0.83.2
- Expo SDK 55
- TypeScript 5.9
- React Navigation 7.x

## 2. Navegação (Navigation)

### Estrutura de Navegadores

```
RootNavigator (Stack)
├── MainTabs (Bottom Tabs)
│   ├── Dashboard
│   ├── Missões
│   └── Perfil
├── Settings (Stack - modal)
└── AchievementDetail (Stack)
```

**Componentes:**

- `RootNavigator`: Stack principal que gerencia transições entre contexto de tabs e telas modais.
- `BottomTabsNavigator`: Navegação por tabs inferior (3 abas). Cada tab é uma tela independente.
- `SettingsStackNavigator`: Stack para tela de configurações (apresentada como modal).
- `AchievementDetailStackNavigator`: Stack para detalhes de conquistas.

**Parametros de Rota (TypeScript):**

- `RootStackParamList`: MainTabs, Settings, AchievementDetail
- `BottomTabParamList`: Dashboard, Missoes, Perfil
- `SettingsStackParamList`: Settings
- `AchievementDetailStackParamList`: AchievementDetail (requer achievementId)

## 3. Gerenciamento de Estado (State)

**Abordagem:** React Context + Hooks (local state para telas simples). Futuramente pode-se integrar Zustand ou Redux Toolkit conforme complexidade.

**Contextos:**

- `ThemeProvider`: Fornece tokens de design (cores, tipografia, espaçamento, etc.) globalmente.

**Recomendação Futura:**

- Use `useState` para estado local de telas.
- Para estado compartilhado (usuário, conquistas, missões), considere Zustand (leve) ou Redux Toolkit (estruturado).

## 4. Camada de API (API Layer)

**Arquivo:** `src/services/api.ts`

**Configuração:**

- `BACKEND_URL`: `http://76.13.164.69:8000`

**Funções:**

- `apiFetch<T>(endpoint, options)`: Wrapper around fetch com Content-Type application/json padronizado e tratamento de erros.

**Uso:**

```typescript
import { apiFetch } from '@/services/api';

const users = await apiFetch<User[]>('/api/users');
```

**Headers de Autenticação:** Futuramente adicionar token JWT.

## 5. Design System (Theme)

**Arquivo:** `src/theme/theme.ts`

### Tokens

**Cores:**

- Cores por área: Bolsa (#10B981), Mente (#3B82F6), Vitalidade (#EF4444), Propósito (#8B5CF6)
- Neutros: escala de cinza (gray50 a gray900)
- Semânticas: success, info, error, warning

**Tipografia:**

- Font family: Inter (Regular, Medium, SemiBold, Bold) - carregada via `expo-font`
- Tamanhos: xs (12), sm (14), base (16), lg (18), xl (20), 2xl (24), 3xl (30), 4xl (36)
- Line heights: tight (1.2), normal (1.5), relaxed (1.75)

**Espaçamento:**

- Grid de 8px: 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 64, 80, 96

**Bordas:**

- BorderRadius: sm (4), md (8), lg (12), xl (16), full (9999)

**Sombras:**

- sm, md, lg - elevações para cards e modais

**ThemeProvider:** Contexto React para acessar tokens globalmente via `useTheme()`.

## 6. Configuração de Build (EAS Build)

**Arquivo:** `eas.json`

**Profiles:**

- `development`: developmentClient true, distribution internal, channel "development". Para desenvolvimento local com client.
- `preview`: distribution internal, channel "preview". Para testes internos (TestFlight/Internal).
- `production`: distribution store, channel "production". Para lojas (App Store / Play Store).

**Uso:**

```bash
eas build --profile development   # Build de desenvolvimento
eas build --profile preview      # Build de preview
eas build --profile production   # Build de produção
```

## 7. Linting e Formatação

**Ferramentas:**

- ESLint 9 + config Expo + TypeScript ESLint
- Prettier 3.8

**Arquivos de Config:**

- `.eslintrc.js`: Regras baseadas em Expo + TypeScript + regras personalizadas.
- `.prettierrc`: Configuração de formatação (2 espaços, aspas simples, etc.)

**Scripts npm:**

```bash
npm run lint    # Executa ESLint em todos arquivos .ts e .tsx
npm run format  # Formata código com Prettier
```

**Integração com Editor:** Recomenda-se instalar extensões ESLint e Prettier no VS Code.

## 8. Estrutura de Pastas

```
mobile/
├── assets/
│   └── fonts/           # Fontes Inter
├── src/
│   ├── navigation/      # Navigators (Root, BottomTabs, Stacks)
│   ├── screens/         # Telas da aplicação
│   ├── theme/           # Design tokens e ThemeProvider
│   ├── services/        # API layer
│   ├── components/      # Componentes reutilizáveis (futuro)
│   └── store/           # Gerenciamento de estado (futuro)
├── docs/
│   └── MOBILE_ARCHITECTURE.md  # Este arquivo
├── App.tsx              # Componente raiz
├── index.ts             # Entry point
├── package.json
├── tsconfig.json
├── eas.json             # EAS Build config
├── .eslintrc.js
└── .prettierrc
```

## 9. Backend URL

Para ambiente de desenvolvimento, o backend está configurado em:

```
http://76.13.164.69:8000
```

Este valor está definido em `src/services/api.ts` como `BACKEND_URL`.

## 10. Executando o Projeto

### Pré-requisitos

- Node.js 18+
- Expo CLI (global ou npx)
- Expo Go app no dispositivo (Android/iOS) para desenvolvimento

### Instalação

```bash
cd mobile
npm install
```

### Iniciar

```bash
npm start
```

Escaneie o QR code com Expo Go (Android) ou use o simulador iOS com `npm run ios` (requiere Xcode) ou Android com `npm run android` (requiere Android Studio).

## 11. Guidelines de Código

- Use TypeScript para todos arquivos `.ts` e `.tsx`.
- Siga a regra de componentes de tela em `src/screens/` e components reutilizáveis em `src/components/`.
- Navegação: use os navigators pré-configurados. Adicione novas rotas nos arquivos de navegação apropriados.
- Estilos: Prefira StyleSheet com tokens do theme via `useTheme()`.
- Nomes de arquivos: PascalCase para componentes (ex: `DashboardScreen.tsx`), camelCase para utils (ex: `api.ts`).
- Imports: Use alias `@/` para raiz `src/` (configurar tsconfig se necessário).
- Commit messages: siga Conventional Commits (feat:, fix:, docs:, chore:, etc.).

## 12. Próximos Passos (Futuro)

- Integração com Zustand para estado global.
- Implementação de telas reais (UI completa).
- Conexão com backend real (autenticação, missões, conquistas).
- Testes unitários e de integração (Jest + React Native Testing Library).
- CI/CD completo com EAS Update para OTA.

---

**CTO responsável:** Subagent FASE 1
**Data:** 2026-03-20
