# Upgrading Life Gamification

Este guia descreve como migrar de versões anteriores do Life Gamification para a versão 1.0.0 (Mobile).

---

## 📦 Version History

| Version | Release Date | Highlights |
|---------|--------------|------------|
| 0.0.1-Alpha | 2025-11-01 | Projeto inicial, schema draft |
| 0.1.0-Beta | 2025-12-15 | Backend FastAPI, web dashboard, IA integration |
| 1.0.0-Mobile-Sprint1 | 2026-03-20 | React Native mobile app, offline-first, design system |
| **1.0.0-Mobile** | **2026-03-XX** | **Full release: monetização, store submission, launch** |

---

## 🎯 Upgrading to v1.0.0 (Mobile Release)

### What's New in 1.0.0

- ✅ **Mobile App**: React Native + Expo, iOS & Android
- ✅ **Offline-first**: Sincronização automática, cache local
- ✅ **Monetização**: Assinaturas mensal/anual via Stripe
- ✅ **Push Notifications**: Lembretes, achievements
- ✅ **Widget**: iOS TodayExtension (preview)
- ✅ **Health Integration**: HealthKit (iOS) + Google Fit (Android) - opcional
- ✅ **Build EAS**: CI/CD automatizado
- ✅ **Store Submission**: App Store Connect + Google Play Console

### Backward Compatibility

- **API Compatibility**: 100% backward compatible with v0.1.0-Beta endpoints
- **Database**: Schema unchanged (except optional `subscriptions` table for monetization)
- **Web Frontend**: Continua funcionando sem alterações
- **Migration**: Zero downtime, database migrations are additive only

---

## 📋 Pre-Upgrade Checklist

Before upgrading, ensure:

- [ ] **Backend**: Running FastAPI >= 1.0.0 (check `backend/main.py` version)
- [ ] **Database**: SQLite file backed up (`cp data/gamification.db data/gamification.db.backup`)
- [ ] **Mobile**: Latest Expo CLI installed (`npm i -g expo-cli`)
- [ ] **EAS**: Logged in (`eas login`) with valid token
- [ ] **Developer Accounts**: Apple Developer ($99) and Google Play ($25) if submitting to stores
- [ ] **Stripe Account**: Configured with API keys (for monetization)

---

## 🚀 Upgrade Steps

### Option A: Fresh Install (Recommended for New Users)

If you're new to Life Gamification:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nikolasdehor/life-gamification.git
   cd life-gamification
   ```

2. **Backend**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   # ou no Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edite .env: DB_PATH, OPENROUTER_API_KEY, STRIPE_SECRET_KEY (opcional)
   uvicorn main:app --reload
   ```
   Backend rodará em http://localhost:8000

3. **Mobile**:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
   Escaneie QR com Expo Go (Android/iOS)

4. **Web Frontend** (opcional):
   ```bash
   cd frontend
   # Abra index.html no navegador
   ```

---

### Option B: Update Existing Installation

If you already have v0.1.0-Beta running:

#### 1. Pull Latest Code

```bash
cd /data/.openclaw/workspace/projs/life-gamification
git fetch origin
git checkout master
git pull origin master
git checkout -b v1.0.0-upgrade
```

#### 2. Update Backend Dependencies

```bash
cd backend
source .venv/bin/activate  # ou ative seu venv
pip install -r requirements.txt --upgrade
```

#### 3. Database Migration

O schema v1.0.0 adiciona a tabela `subscriptions` (opcional, para monetização).

```bash
# Backup first
cp data/gamification.db data/gamification.db.backup

# O FastAPI auto-executa schema.sql na startup (init_db())
# Basta reiniciar o servidor
uvicorn main:app --reload
```

**Migration é automática e não destrutiva**. Novas tabelas são criadas se não existirem.

#### 4. Update Mobile App

```bash
cd mobile
npm install  # atualizar dependências
npx expo start --clear  # limpar cache
```

#### 5. Verify Compatibility

Testar os principais fluxos:

- [ ] Login com phone number
- [ ] Dashboard carrega (4 áreas)
- [ ] Lista de missões
- [ ] Completar missão (POST /mission/complete)
- [ ] Pull-to-refresh
- [ ] Offline mode (modo avião)

Se todos passarem, upgrade foi bem-sucedido.

---

## 🔄 Rolling Back

If something goes wrong:

### Database Rollback

```bash
# Restore backup
cp data/gamification.db.backup data/gamification.db
```

### Code Rollback

```bash
git checkout 0.1.0-Beta  # ou commit anterior
```

Then restart services.

---

## ⚠️ Breaking Changes

**None**. v1.0.0 é 100% backward compatible.

**However, note**:

- **API rate limits**: Se habilitado, podem aplicar limits novos (configure em `main.py`)
- **Monetization endpoints**: Requer Stripe configurado, senão retornam 503
- **Push notifications**: Requer configuração de FCM (Android) e APNs (iOS)

---

## 🔧 Configuration Changes

### New .env Variables (v1.0.0)

Adicione ao seu `.env` no backend:

```bash
# Stripe (monetização) - OPTCIONAL
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_ANNUAL=price_xxx

# Firebase Cloud Messaging (Android push) - OPTCIONAL
FCM_SERVER_KEY=xxx
FCM_SENDER_ID=xxx

# APNs (iOS push) - OPTCIONAL
APNS_KEY_ID=xxx
APNS_TEAM_ID=xxx
APNS_PRIVATE_KEY_PATH=path/to/key.p8
APNS_BUNDLE_ID=com.lifegamification.app

# Premium features (toggle)
PREMIUM_ENABLED=true
```

Se não for usar monetização ou push, pode ignorar.

---

## 📊 New Features in v1.0.0

### Mobile App (React Native)

- **Platforms**: iOS 14+, Android 8+
- **Offline-first**: AsyncStorage cache, fila de sync
- **Push notifications**: expo-notifications
- **Widget**: iOS TodayExtension preview
- **Health integration**: expo-health (iOS), expo-google-fit (Android)
- **Design system**: Complete token system (cores por área, Inter font)
- **i18n**: pt-BR completo (260+ strings)

### Backend Additions

**Monetization** (if Stripe configured):
- `POST /api/subscription/create` - criar checkout
- `POST /api/subscription/webhook` - receber eventos
- `GET /api/subscription/status` - consultar assinatura
- `POST /api/subscription/cancel` - cancelar

**New endpoints**:
- `POST /api/mission/complete` - já existia, agora com suporte a offline sync
- `GET /api/dashboard` - retorna área scores + streaks

---

## 🐛 Known Issues

- **iOS Build**: Require Apple Developer account ($99/ano) para App Store submission
- **Push no Android**: Precisa configurar Firebase Cloud Messaging
- **Widget**: Apenas iOS, implementação Android pendente
- **Health Integration**: Funciona apenas em devices com sensores (iPhone/Android Wear)

---

## 📚 Documentation Updates

- `docs/MOBILE.md` - Guia completo do app mobile
- `docs/MOBILE_ARCHITECTURE.md` - Arquitetura técnica
- `docs/DESIGN_SYSTEM.md` - Design tokens e componentes
- `docs/BUILD.md` - Build & deploy (EAS)
- `docs/HEALTH_INTEGRATION.md` - HealthKit/Google Fit
- `docs/PAYMENT_INTEGRATION.md` - Monetização (Stripe)
- `docs/STORE_SUBMISSION.md` - App Store + Play Store
- `docs/QA_TEST_CASES.md` - Testes manuais
- `docs/RELEASE_NOTES.md` - Release notes v1.0.0
- `docs/USER_GUIDE.md` - Guia rápido do usuário

---

## 🆘 Support

If you encounter issues:

1. **Check documentation**: Veja arquivos em `docs/`
2. **GitHub Issues**: Abra issue em https://github.com/nikolasdehor/life-gamification/issues
3. **Chat IA**: Use o botão "Coach" no app para perguntar
4. **Email**: support@lifegamification.com (futuro)

---

## 🙏 Credits

v1.0.0 foi desenvolvido por uma equipe de agentes AI especializados:

- **Dev** (Coding Agent) - Implementação React Native
- **CTO** (Tech Lead) - Arquitetura, EAS Build, Monetização
- **PM** (Project Manager) - Coordenação, documentação
- **CMO** (Marketing Officer) - Design system, copy, assets

E claro, **Nikolas de Hor** - Product Owner.

---

## 📄 License

Este projeto está sob licença MIT. Veja `LICENSE` para detalhes.

---

**Life Gamification** - Transforme sua vida em um jogo. 🎮
