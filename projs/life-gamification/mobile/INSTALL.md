# 🚀 Instalação e Configuração - Life Gamification Mobile

Este guia explica como configurar e rodar o app Life Gamification no seu ambiente de desenvolvimento.

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Expo CLI (`npm install -g expo-cli`)
- Git
- iOS: macOS + Xcode (para simulador) ou iPhone com Expo Go
- Android: Android Studio + emulador ou dispositivo com Expo Go

## ⚡ Quick Start (5 minutos)

### 1. Clone o repositório

```bash
cd /data/.openclaw/workspace/projs/life-gamification
git clone <repo-url> mobile
cd mobile
```

### 2. Instale dependências

```bash
npm install
```

### 3. Configure o ambiente

```bash
cp .env.example .env
```

Edite `.env` se necessário. O padrão já funciona com o backend de produção:

```env
BACKEND_URL=http://76.13.164.69:8000
```

### 4. Rode o app

```bash
npx expo start
```

- **iOS**: aperte `i` ou escaneie o QR com o app Expo Go (câmera)
- **Android**: aperte `a` ou escaneie o QR com Expo Go
- **Web**: aperte `w`

### 5. Faça login

Use o número: `+556286077431` (telefone de teste)

---

## 🔧 Configuração Detalhada

### Variáveis de Ambiente (.env)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `BACKEND_URL` | URL da API backend | `http://76.13.164.69:8000` |
| `EXPO_PUBLIC_APP_VERSION` | Versão do app | `1.1.0-rc.1` |
| `FEATURE_ANALYTICS` | Habilitar telas de Analytics | `1` |
| `FEATURE_SOCIAL` | Habilitar telas de Social | `1` |
| `FEATURE_HEALTH_INTEGRATION` | Integração Health/Google Fit | `1` |
| `DEBUG` | Modo debug (logs extras) | `0` |

> **Nota**: Variáveis com `EXPO_PUBLIC_` ficam disponíveis no cliente via `process.env.EXPO_PUBLIC_...`.

### Backend

O backend deve estar rodando em `BACKEND_URL`. Para rodar local:

```bash
cd ../backend
docker-compose up -d
```

ou

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🏗️ Build de Desenvolvimento

### Expo Go (development)

```bash
npx expo start
```

### Development Build (com native modules)

```bash
npx expo run:ios   # iOS
npx expo run:android   # Android
```

### Preview Build (EAS)

```bash
eas build --profile preview --platform all
```

Disponível via link de distribuição interna.

---

## 📦 Build de Produção

### EAS Build

```bash
# Login (uma vez)
eas login

# Build iOS
eas build --profile production --platform ios

# Build Android
eas build --profile production --platform android
```

Os arquivos `.ipa` e `.aab` serão gerados no Expo dashboard.

### Build Local (não recomendado)

```bash
# Android APK
npx expo export --platform android

# iOS (requiere Xcode)
npx expo export --platform ios
```

---

## 🧪 Testes

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

### Format

```bash
npm run format
```

### Testes Unitários (Jest)

```bash
npm test
# ou cobertura
npm test -- --coverage
```

### Testes E2E (Detox) - WIP

```bash
# Android
detox test -c android.emu.release

# iOS
detox test -c ios.sim.release
```

---

## 📱 Funcionalidades Principais

- **Dashboard**: Resumo das áreas (Bolsa, Mente, Vitalidade, Propósito)
- **Missões**: Lista de missões diárias/semanais, filtros, busca
- **Ranking**: Leaderboards global e por área
- **Coach**: Chat com IA (StepFun) para planos e dicas
- **Analytics**: Gráficos de performance, export de dados
- **Social**: Compartilhar conquistas, convites, código de indicação
- **Perfil**: Estatísticas, conquistas, inventário, sincronização store

---

## 🐛 Troubleshooting

### `expo start` não inicia

- Verifique se o Node.js é 18+
- Limpe cache: `npx expo start -c`
- Delete `node_modules` e reinstale

### Erro de conexão com backend

- Verifique se `BACKEND_URL` está acessível
- Teste: `curl $BACKEND_URL/health`
- Se local, verifique firewall/VPN

### Push notifications não funcionam

- Build preview/production é necessário (não funciona em Expo Go)
- Configure FCM (Android) e APNs (iOS) no backend

### Gráficos não aparecem (Analytics)

- `react-native-svg` deve estar instalado. Se faltar: `npm install react-native-svg`
- Rebuild se necessário: `npx expo prebuild && npx expo run:ios`

---

## 📚 Documentação Adicional

- `docs/MOBILE_ARCHITECTURE.md` - Arquitetura técnica
- `docs/DESIGN_SYSTEM.md` - Design tokens e componentes
- `docs/PROJECT_PLAN.md` - Plano de execução original
- `docs/STATUS_BOARD.md` - Status das fases e agentes

---

## 🤝 Contribuindo

1. Fork o repo
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: adiciona ...'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

**Versão**: 1.1.0-rc.1  
**Última atualização**: 2026-03-21  
**Maintainer**: DeHor (OpenClaw Agent)
