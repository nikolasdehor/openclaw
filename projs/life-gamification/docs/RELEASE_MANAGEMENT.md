# Release Management - Life Gamification

Processo completo de release desde desenvolvimento até produção.

---

## 📦 Versioning Scheme

Usamos **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

- **MAJOR** (X.0.0): Mudanças breaking, nova arquitetura
- **MINOR** (1.X.0): Novas features, backward-compatible
- **PATCH** (1.0.X): Bug fixes, melhorias menores

Para mobile, prefixamos com `Mobile-` até chegar em 1.0.0:
- `0.0.1-Alpha` → `0.1.0-Beta` → `1.0.0-Mobile-Sprint1` → **`1.0.0-Mobile`**

---

## 🚀 Release Types

### Hotfix (Critical)
- **Trigger**: P0 bug em produção (crash, dados corrompidos)
- **Branch**: `hotfix/v1.0.1` a partir de `master`
- **Timeline**: 24-48h
- **Process**:
  1. Criar hotfix branch
  2. Implementar fix
  3. Testar em QA
  4. Build de release (EAS production)
  5. Fast-track review nas stores (se crítico)
  6. Deploy backend + mobile simultâneo

### Minor Release (Regular)
- **Trigger**: Novas features, melhorias planejadas
- **Branch**: `release/v1.1.0` a partir de `develop` (se usarmos GitFlow)
- **Timeline**: 2 semanas
- **Process**:
  1. Feature freeze em `develop`
  2. Beta testing (TestFlight/Internal)
  3. QA complete
  4. Build production
  5. Store submission
  6. Release após aprovação

### Patch
- **Trigger**: Bugs menores, text updates
- **Branch**: `patch/v1.0.1`
- **Timeline**: 1 semana
- **Process**: Similar a hotfix, mas menos urgente

---

## 🏗️ Build & Release Pipeline

### GitHub Actions Workflows

#### 1. CI (Push/PR)

`.github/workflows/ci.yml`

Disparado em: push/PR para `main` ou `develop`

Passos:
1. Checkout code
2. Setup Node.js + Python
3. Install dependencies (mobile & backend)
4. Lint: `npm run lint` (mobile) + `black --check` (backend)
5. Type-check: `npx tsc --noEmit` + `mypy` (backend)
6. Test: `npm test` (Jest) + `pytest` (backend)
7. Build preview: `eas build --profile preview --platform all` (se捧 de branch)
8. Upload artifacts (build logs)
9. Status badge no README (build passing/failing)

Requirements:
- `EAS_TOKEN` secret (GitHub)
- `NODE_AUTH_TOKEN` (npm se privado)

#### 2. Release (Tag push)

`.github/workflows/release.yml`

Disparado em: push de tag `v*.*.*`

Passos:
1. Extract version from tag
2. Bump version (se necessário) - `standard-version`
3. Generate CHANGELOG entry
4. Build production: `eas build --profile production --platform all`
5. Create GitHub Release:
   - Title: `Release v1.0.0`
   - Body: auto-generated from CHANGELOG
   - Attach build artifacts (.ipa, .aab)
6. Notify Slack/Discord (opcional)
7. Trigger store submission (manual ou automático com secrets)

Requirements:
- `EAS_TOKEN`
- `APPLE_CERTIFICATES` (para iOS build automático) - opcional
- `GOOGLE_SERVICE_ACCOUNT` (para Android) - opcional

#### 3. E2E Tests (Schedule)

`.github/workflows/e2e.yml`

Disparado: manual + diariamente às 03:00

Passos:
1. Build development client: `eas build --profile development --platform all`
2. Install on emulator/simulator
3. Run Detox tests
4. Upload test results (JUnit XML) para Codecov/Sentry

---

## 📱 Mobile Build Process

### Local Build (Development)

```bash
cd mobile
npm install
npx expo start
```

Para device físico: escaneie QR com Expo Go.

### EAS Build (Staging/Preview)

```bash
cd mobile
eas login
eas build --profile preview --platform all
```

Builds em ~15-30min. Artifacts no link fornecido.

### EAS Build (Production)

```bash
eas build --profile production --platform all
```

**Build profiles** em `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "distribution": "store",
      "channel": "production"
    }
  }
}
```

---

## 🏪 Store Submission Process

### iOS (App Store Connect)

**Pré-requisitos**:
- Apple Developer account ($99/ano)
- Bundle ID registrado
- Certificados válidos

**Steps**:

1. **Upload build**:
   ```bash
   # Via Transporter (Mac) ou Xcode
   # Baixe .ipa do EAS build
   # Abra Transporter, arraste .ipa, Deliver
   ```
   Ou Xcode: `Window > Organizer > Distribute App`

2. **Preencher metadata**:
   - Description, Keywords, Screenshots
   - Support URL, Marketing URL
   - Privacy Policy URL
   - Review notes (ex: "Test account: +556286077431")

3. **In-App Purchases** (se monetização):
   - Criar products no App Store Connect
   - SKUs: `premium_monthly`, `premium_annual`
   - Preços: R$19,90 e R$199,90
   - Tipo: `Auto-Renewable Subscription`

4. **Submit para Review**:
   - Selecione build em `TestFlight` ou `App Store`
   - Clique `Submit for Review`
   - Responder perguntas (export compliance, encryption)
   - Aguardar 1-3 dias úteis

5. **Release**:
   - Manual: approve após review
   - Automático: release on approval (data futura)

### Android (Google Play Console)

**Pré-requisitos**:
- Google Play Developer account ($25 one-time)
- App signing by Google ativado

**Steps**:

1. **Upload build**:
   ```bash
   # Via Play Console ou fastlane
   # Upload .aab
   ```
   No Console: `Release > Production > Create new release`

2. **Preencher listing**:
   - App name, description (short/full)
   - Graphics (icon, feature graphic, screenshots)
   - Category: `Productivity` ou `Health & Fitness`
   - Content rating questionnaire
   - Privacy policy URL
   - Contact details

3. **In-app products**:
   - `Products > Subscriptions`
   - Create `premium_monthly` (R$19,90/mês)
   - Create `premium_annual` (R$199,90/ano)
   - Base plan ID (gerado automaticamente)

4. **Rollout**:
   - Internal testing: max 100 testers, aprovação em horas
   - Closed testing: max 2000 testers, aprovação ~1 dia
   - Production rollout: gradual (10% → 50% → 100%) ou full

5. **Publish**:
   - Submit para review (1-2 dias)
   - Após aprovação, release na production

---

## 📢 Release Communication

### GitHub Release

```bash
# Bump version
npm version patch -m "chore: bump to v1.0.1"

# Push tag (trigger GitHub Actions)
git push --tags

# Edit release notes on GitHub website (hook from CHANGELOG.md)
```

**Release Notes Template**:

```markdown
## 🎉 Release v1.0.0 - Life Gamification Mobile

### ✨ New Features
- Mobile app para iOS e Android (React Native + Expo)
- Offline-first com sincronização automática
- Push notifications (lembretes, achievements)
- Design system completo com cores por área
- Monetização: assinaturas mensal/anual

### 🐛 Bug Fixes
- Fix #001: Pull-to-refresh travava em lista vazia
- Fix #002: Streak não atualizava após completar missão

### 📱 App Store & Play Store
- Disponível para download:
  - [App Store](https://apps.apple.com/...)
  - [Google Play](https://play.google.com/store/apps/details?id=com.lifegamification.app)

### 🧑‍💻 For Developers
- Backend API: v1.0.0 (compatible)
- Database schema: unchanged (add: subscriptions table)

See [UPGRADE_GUIDE.md](link) for upgrade instructions.

**Full Changelog**: https://github.com/nikolasdehor/life-gamification/compare/v0.1.0...v1.0.0
```

### Social Media Announcements

**Twitter/X Thread**:

```text
1/5 🚀 ANÚNCIO: Life Gamification Mobile finalmente no ar!

Após meses de desenvolvimento, lançamos o app completo para iOS e Android.

Thread 🧵 👇
```

**LinkedIn Post**:

```text
Tenho o prazer de anunciar o lançamento do Life Gamification Mobile! 🎮

Transforme sua vida em um jogo: complete missões, ganhe pontos, suba de nível.

Disponível para iOS e Android.

#gamificação #produtividade #mobile #startup
```

**Email Newsletter**:

Subject: Life Gamification está no ar! 🎉

```markdown
Olá!

O app Life Gamification finalmente está disponível.

📱 Download:
- iOS: [link App Store]
- Android: [link Play Store]

✨ O que há de novo:
- Missões diárias/semanais personalizadas
- Sistema de streaks e achievements
- Offline-first (funciona sem internet)
- Assinaturas premium com recursos exclusivos

Comece agora: https://lifegamification.com

Dúvidas? Reply este email.

Abraços,
Equipe Life Gamification
```

---

## 🏥 Post-Release Monitoring

### Week 1: Daily Checks

- **Crash rate**: < 1% (Sentry dashboard)
- **DAU/MAU**: > 20% (initial target)
- **Conversion**: Free → Premium > 2%
- **Reviews**: Monitor 1-5 star, respond within 24h
- **Support tickets**: categorize e prioritize

### Week 2-4: Weekly

- **Retention**: D1, D7, D30
- **Mission completion rate**: > 30% of active users complete at least 1 mission/day
- **Avg session duration**: > 5 min
- **Premium adoption**: track MRR growth
- **Feedback**: collect from users, categorize for roadmap

### Alerts Setup

Configure em Sentry/Firebase:

- Crash rate spike > 5%
- API error rate > 1%
- Backend downtime > 5min
- Stripe webhook failures > 5%

---

## 🔄 Hotfix Process

### When to Hotfix

- **P0**: App crash on launch, data loss,支付失败 - release em 24h
- **P1**: Feature broken, major UX issue - release em 3 dias
- **P2**: Minor bug, text error - include in next minor release

### Steps

1. **Assess impact**:
   - How many users affected?
   - Severity (crash vs minor inconvenience)

2. **Create hotfix branch**:
   ```bash
   git checkout master
   git pull origin master
   git checkout -b hotfix/v1.0.1
   ```

3. **Implement fix** (cherry-pick commits se necessário)

4. **QA verification** (same test suite as release)

5. **Build & submit**:
   - Build production (EAS)
   - Upload to stores
   - Use "expedited review" (Apple) se crítico

6. **Merge hotfix to master**:
   ```bash
   git checkout master
   git merge --no-ff hotfix/v1.0.1
   git tag v1.0.1
   git push origin master --tags
   ```

7. **Deploy backend** (se backend changes)

8. **Monitor** post-release for fix validation

---

## 📊 Release Metrics Dashboard

Track em spreadsheet ou dashboard:

| Metric | Target (v1.0.0) | Actual | Status |
|--------|-----------------|---------|--------|
| Downloads (Day 1) | 100 | | |
| Installs (iOS) | 50 | | |
| Installs (Android) | 50 | | |
| DAU (Day 1) | 50 | | |
| DAU (Day 7) | 75 | | |
| Retention D7 | 30% | | |
| Mission completions/day | 30 | | |
| Premium conversions | 2% | | |
| MRR (Month 1) | R$1.000 | | |
| Crash rate | <1% | | |
| App Store rating | >4.0 | | |
| Play Store rating | >4.0 | | |

---

## 🧑‍💻 Rollback Procedures

### Mobile Rollback

**iOS**:
1. App Store Connect → My Apps → Select app
2. Versions → Select previous version
3. Click "Remove from Sale" (current) or "Submit new version" (previous)
4. Note: Users com versão atual continuam com ela até atualizar

**Android**:
1. Play Console → Release > Production
2. Manage track: pause current rollout
3. Create new rollout com versão anterior
4. Publish

### Backend Rollback

```bash
cd backend
git log --oneline  #找到上次 versão estável commit hash
git checkout <stable_commit>
# Reiniciar serviço
systemctl restart lifegamification  # ou docker-compose restart backend
```

Database rollback (se migration problema):
```bash
cp data/gamification.db.backup data/gamification.db
```

---

## 🔄 Continuous Delivery Improvements

Future enhancements:

1. **Automated Store Submission**:
   - Fastlane para iOS/Android upload
   - Auto-fill metadata from JSON
   - Triggered por GitHub Actions release tag

2. **Feature Flags**:
   - LaunchDarkly ou custom (Redis-backed)
   - Enable/disable features sem deploy
   - A/B testing rollout

3. **Canary Releases**:
   - Roll out para 10% de usuários primeiro
   - Monitor metrics, increase gradually
   - Fast rollback se problemas

4. **Beta Testing Automation**:
   - Auto-invite TestFlight/Internal testers
   - Distribuição via Firebase App Distribution
   - Collect feedback automaticamente

---

## 📚 References

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Stripe Documentation](https://stripe.com/docs)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Semantic Versioning](https://semver.org/)

---

**Last updated**: 2026-03-XX  
**Maintained by**: PM (Release Manager)
