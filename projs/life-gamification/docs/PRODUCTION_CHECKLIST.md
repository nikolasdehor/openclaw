# Production Deployment Checklist

Final checklist before launching Life Gamification Mobile v1.0.0 to production.

---

## 🎯 Pre-Launch Sign-off

### Team Sign-offs

| Role | Sign-off | Date | Notes |
|------|----------|------|-------|
| CTO (Architecture) | [ ] | ____ | Backend stable, APIs tested, monetização integrada |
| DEV (Build) | [ ] | ____ | Builds gerados, stores submetidas |
| CMO (Marketing) | [ ] | ____ | Assets prontos, copy aprovado |
| PM (Documentation) | [ ] | ____ | Docs completas, CHANGELOG atualizado |
| CEO (Final Approval) | [ ] | ____ | Release approval |

---

## 📦 Backend Production Readiness

### Infrastructure
- [ ] Backend rodando em VPS/Docker com IP fixo (exemplo: `76.13.164.69:8000`)
- [ ] HTTPS configurado (Nginx reverse proxy + SSL cert)
- [ ] Firewall: porta 8000 aberta apenas para IPs específicos (ou 0.0.0.0 se público)
- [ ] Database `data/gamification.db` com backup automático daily
- [ ] Logs rotacionados (logrotate ou similar)
- [ ] Monitoramento: health check endpoint `/health` retornando 200

### Secrets & Configuration
- [ ] `.env` arquivo com todas variáveis preenchidas:
  - `DB_PATH=data/gamification.db`
  - `OPENROUTER_API_KEY` (configurado)
  - `STRIPE_SECRET_KEY` (se monetização ativa)
  - `STRIPE_WEBHOOK_SECRET`
  - `FCM_SERVER_KEY` (Android push)
  - `APNS_*` variáveis (iOS push)
  - `JWT_SECRET_KEY` (se autenticação real implementada)
- [ ] Secrets NÃO commitadas no git (`.env` no `.gitignore`)
- [ ] `.env.production` separado (opcional)

### API Stability
- [ ] Todos endpoints testados com curl/Postman:
  - `GET /dashboard` (200 OK, JSON válido)
  - `GET /api/missions` (200 OK)
  - `POST /mission/complete` (200 OK, streak atualizado)
  - `GET /api/subscription/status` (200 ou 402 se não assinante)
- [ ] Rate limiting configurado (ex: 100 req/min)
- [ ] CORS: `allow_origins=["*"]` em dev, alterar para domínio específico em prod
- [ ] Error logging estruturado (JSON logs) ou Sentry integrado

### Database
- [ ] Schema migrado para última versão (`schema.sql` executado)
- [ ] Tabela `subscriptions` criada (se monetização)
- [ ] Índices criados (`idx_*` no schema)
- [ ] Teste de restore de backup executado com sucesso

---

## 📱 Mobile Production Readiness

### Build Configuration
- [ ] `app.json` ou `app.config.js` com `expo.updates.url` apontando para CDN (ota updates)
- [ ] `eas.json` profiles:
  - `development` - dev client
  - `preview` - internal testing
  - `production` - store submission
- [ ] Code signing configured:
  - iOS: Apple Developer account, provisioning profile, certificate
  - Android: Keystore gerado e backupado

### EAS Build
- [ ] `eas login` executado com token válido
- [ ] Build iOS production executado: `eas build --platform ios --profile production`
- [ ] Build Android production executado: `eas build --platform android --profile production`
- [ ] Artifacts baixados:
  - iOS: `.ipa` (ou `.zip` com `.ipa`)
  - Android: `.aab` (Android App Bundle)
- [ ] Builds assinados corretamente (verificar em dispositivo)

### Testing on Real Devices
- [ ] iOS: TestFlight internal testing (10+ testers) - app abre, login funciona, missões completam
- [ ] Android: Internal testing track (10+ testers) - app abre, push funciona
- [ ] Push notifications recebidas em dispositivos reais (iOS e Android)
- [ ] Offline mode testado (modo avião, sync após reconectar)
- [ ] Health integration (se aplicável) testada em device com sensors

### Performance Validation
- [ ] Cold start < 3s (medir com cronômetro)
- [ ] Bundle size < 50MB (verificar em build report)
- [ ] Memory usage < 200MB (perfil com Flipper)
- [ ] No memory leaks detectados (testar 30min contínuo)

---

## 🏪 Store Submission

### App Store Connect (iOS)

#### Account & Setup
- [ ] Apple Developer account ativo ($99/ano)
- [ ] Account com permissões de Admin/App Manager
- [ ] Bundle ID `com.lifegamification.app` registrado
- [ ] Provisioning profile (App Store) criado e válido

#### App Record
- [ ] App criado no App Store Connect:
  - Nome: "Life Gamification"
  - SKU: `lifegamification-001`
  - Bundle ID: selecionado
  - Primary Language: Portuguese
  - Category: `Health & Fitness` ou `Productivity`
  - Content Rights: `All content owned by [Nome da Empresa]`
  - Child Category: `None` ou `Game Center` se aplicável

#### Pricing & Availability
- [ ] Price: `Free` (com In-App Purchases)
- [ ] In-App Purchases criadas:
  - `premium_monthly` - R$19,90/mês (Subscription, 1 month)
  - `premium_annual` - R$199,90/ano (Subscription, 1 year)
- [ ] Availability: `All territories` ou selecionar Mercosul primeiro

#### Metadata
- [ ] Description (4000 chars) - revisado e aprovado
- [ ] Keywords (100 chars) - `gamificação,hábitos,produtividade,saúde,finanças`
- [ ] Support URL (link para site/FAQ)
- [ ] Marketing URL (opcional)
- [ ] Copyright: `© 2026 Nikolas de Hor. All rights reserved.`
- [ ] Review Contact: email e telefone da equipe

#### Screenshots & Media
- [ ] 6.7" screenshots (iPhone 15 Pro Max) - 5 imagens
- [ ] 5.5" screenshots (iPhone 8 Plus) - pelo menos 1 (ou usar 6.7")
- [ ] App Icon (1024x1024) - fornecido
- [ ] Promo text (170 chars) - opcional
- [ ] Trailer (15-30s) - opcional

#### Build Upload
- [ ] .ipa uploaded via Transporter (Mac) ou Xcode
- [ ] Build process finished sem erros
- [ ] Build status: `Processing` → `Ready for Sale` (ou `In Review`)

#### Submission
- [ ] App submit para App Review
- [ ] Contact information preenchido (review pode ligar)
- [ ] Demo account credentials (se houver login) - informar `+556286077431` (phone)
- [ ] Notes para reviewer: "Teste a tela de missões, completar uma missão, pull-to-refresh, offline mode"

---

### Google Play Console (Android)

#### Account & Setup
- [ ] Google Play Developer account ativo ($25 one-time)
- [ ] Account com permissões de Admin/Release manager
- [ ] Organization name (se aplicável)
- [ ] Developer name público configurado

#### App Creation
- [ ] App criada no Play Console:
  - App name: "Life Gamification"
  - Default language: Portuguese (Brazil)
  - Category: `Productivity` (ou `Health & Fitness`)
  - App ou jogo? `App`

#### Store Listing
- [ ] Short description (80 chars) - "Transforme sua vida em um jogo. Complete missões, ganhe pontos, suba de nível."
- [ ] Full description (4000 chars) - revisado
- [ ] Graphics:
  - App icon (512x512) - fornecido
  - Feature graphic (1024x500) - fornecido
  - Phone screenshots (1080x1920) - 5 imagens
  - Tablet screenshots (opcional) - pelo menos 1
  - Promo video (YouTube link) - opcional
- [ ] `Contact details`:
  - Email de suporte
  - Website (se houver)
  - Phone number (opcional)
- [ ] `Privacy Policy` - link para `PRIVACY_POLICY.md` (criar se não existir)

#### Pricing & Distribution
- [ ] Price: `Free` (com In-app Products)
- [ ] Countries: `Brazil` primeiro, depois `All countries`
- [ ] `Content Rating` - questionnaire preenchido (IARC)
- [ ] `Target audience and content` - marcar como `Children? No`
- [ ] `Data safety` - declarar dados coletados (phone number, usage data)

#### In-App Products (Monetization)
- [ ] Products created:
  - `premium_monthly` - `Subscripton` - R$19,90/mês (billing period: 1 month)
  - `premium_annual` - `Subscription` - R$199,90/ano (billing period: 1 year)
- [ ] Product status: `Active`
- [ ] Base plan ID correct

#### Production Release
- [ ] Upload `.aab` (Android App Bundle)
- [ ] Release track:
  - Option 1: `Internal testing` (max 100 testers) - rápido (horas)
  - Option 2: `Closed testing` (max 2000 testers) - review ~1 dia
  - Option 3: `Production` - review ~2-7 dias
- [ ] Release name: `v1.0.0-beta` (ou `v1.0.0`)
- [ ] Release notes: same as RELEASE_NOTES.md

#### Submit for Review
- [ ] `Start rollout to production` (ou testing track)
- [ ] `App integrity` check pass (assinatura, target SDK >= 34)
- [ ] `Content rating` aprovado
- [ ] `Privacy policy` fornecido
- [ ] `App signing by Google Play` ativo

---

## 🔍 QA Final (Pré-Launch)

### Functional Tests
- [ ] Login: phone number works (mock ok)
- [ ] Dashboard: 4 áreas, streaks, level, pull-to-refresh
- [ ] Missões: listagem, busca, filtros, completar com confirmação
- [ ] Achievements: grid desbloqueados, lock icons
- [ ] Perfil: estatísticas, menu, settings
- [ ] Offline: modo avião, cache carrega, sync após reconectar
- [ ] Notificações: push recebida, clica e abre no destino

### Edge Cases
- [ ] API 500: mensagem amigável, retry button
- [ ] Network timeout: loading spinner timeout, error toast
- [ ] Backend down: app mostra cached data, banner offline
- [ ] Missão expirada: botão completar desabilitado, badge expirada

### Platform-Specific
- [ ] iOS: Notifications permission, HealthKit permission
- [ ] Android: Push FCM, Google Fit permission
- [ ] Tablet: layout responsivo (landscape/portrait)
- ]


- [ ] iOS: Widget TodayExtension funciona (se implementado)

### Performance
- [ ] Cold start < 3s (iOS e Android)
- [ ] Memory < 200MB (ativo)
- [ ] Battery: sem drain excessivo (testar 1h)
- [ ] Network: < 10MB por sessão típica

---

## 📊 Monitoring & Observability

### Crash Reporting
- [ ] Sentry configured (ou Firebase Crashlytics)
- [ ] DSN keys loaded em produção
- [ ] Test crash: app.reportError mock
- [ ] Alerts configurados (crash rate > 1%)

### Analytics
- [ ] Mixpanel / Amplitude / Google Analytics 4 configured
- [ ] Events tracked:
  - `app_open`
  - `mission_completed`
  - `achievement_unlocked`
  - `subscription_purchased`
  - `push_notification_received`
- [ ] User properties: `area_focus`, `level`, `streak_days`

### Backend Monitoring
- [ ] Uptime monitoring (UptimeRobot, Pingdom) - ping `/health` every 5min
- ] Log aggregation (Papertrail, Loggly, ou CloudWatch)
- ] Database connection pool monitor
- ] API latency metrics (P50, P95)

---

## 🚀 Launch Day

### 24h Before
- [ ] Final build artifacts baixados e backupados
- [ ] Store listings preenchidas (screenshots, descrições)
- [ ] GitHub Release draft finalizado
- [ ] Communication plan ready (emails, tweets, posts)

### Launch Day
- [ ]提交最终构建到商店（如果尚未提交）
- [ ] Agendar posts nas redes sociais (LinkedIn, Twitter)
- [ ] Enviar email announcement para beta testers
- [ ] Ativar monitoramento (Sentry, analytics)
- [ ] Designar pessoa para responder reviews (primeiras 24h)

### Post-Launch (Days 1-7)
- [ ] Monitorar crash rate diariamente
- [ ] Responder reviews (App Store/Play Store) within 24h
- [ ] Coletar feedback dos primeiros usuários
- [ ] Analisar métricas (DAU, retention, mission completion rate)
- [ ] Planear hotfix se necessário (se P0 bugs aparecerem)

---

## 📝 Legal & Compliance

### Terms of Service & Privacy Policy
- [ ] `TERMS.md` criado (aceitação via app)
- [ ] `PRIVACY_POLICY.md` criado (dados coletados, uso, armazenamento)
- [ ] Links incluídos no app (Settings > Legal)
- [ ] Links incluídos nas stores (App Store/Play Store)

### Data Protection
- [ ] GDPR compliance (se UE users) - consentimento para dados
- [ ] LGPD compliance (Brasil) - política de privacidade clara
- [ ] Dados sensíveis: phone number criptografado no banco
- [ ] Right to be forgotten: endpoint para deletar conta (se necessário)

### Monetization Compliance
- [ ] Stripe terms followed (no fraudulent charges)
- [ ] Subscription cancellation fácil (botão no app)
- [ ] Refund policy documentado (14 dias por lei)
- [ ] In-app purchase disclosure claro

---

## 🔄 Rollback Plan

### If Critical Bug Found

**iOS**:
```bash
# 1. Remove build da App Store Connect (reject binary)
# 2. Revert code para tag anterior: git checkout v1.0.0-beta
# 3. Rebuild e submeter nova versão (2-3 dias)
```

**Android**:
```bash
# 1. Pause production rollout no Play Console
# 2. Revert code, rebuild, upload nova versão
# 3. Retomar rollout
```

**Database**:
```bash
# Restore backup do dia anterior (se dados corrompidos)
cp data/gamification.db.backup data/gamification.db
```

### Hotfix Process
1. Criar branch `hotfix/v1.0.1` a partir de `master`
2. Implementar fix
3. Tag `v1.0.1`
4. Build e submit às stores (fast-track review se possível)
5. Deploy backend fix (se backend change)

---

## ✅ Final Sign-off Checklist

Use este checklist na reunião de go/no-go:

### Must-Have (P0) - Sem isso, NÃO lança
- [ ] Backend APIs estáveis em produção (no downtime por 48h)
- [ ] Build iOS aprovado no TestFlight (sem crashes)
- [ ] Build Android aprovado no Internal Testing
- [ ] Monetização funcionando (checkout, webhook, status)
- [ ] Push notifications funcionando em devices reais
- [ ] Offline mode validado
- [ ] Legal docs (Terms & Privacy) finalizados
- [ ] Monitoramento ativo (Sentry, analytics)

### Should-Have (P1) - Deveria ter, mas pode adiar
- [ ] Widget nativo completo (não apenas preview)
- [ ] Health integration testada em múltiplos devices
- [ ] App Store screenshots fine-tuned
- [ ] Promo video finalizado
- [ ] Full CI/CD (EAS Update para OTA)
- [ ] E2E tests automatizados (Detox)

### Nice-to-Have (P2) - Pode ficar para v1.1.0
- [ ] Multi-language (i18n além de pt-BR)
- [ ] Apple Watch app
- [ ] Android Widget
- [ ] Advanced analytics dashboards
- [ ] Social sharing features

---

## 📞 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Backend Engineer | CTO | Via OpenClaw session |
| Mobile Engineer | DEV | Via OpenClaw session |
| Product Manager | PM | Via OpenClaw session |
| Marketing | CMO | Via OpenClaw session |
| Stakeholder | Nikolas de Hor | +556286077431 |

---

## 📚 Related Documents

- `docs/DEPLOYMENT_CHECKLIST.md` - Version de pré-Sprint 2
- `docs/DEPLOYMENT_ARCHITECTURE.md` - Diagrama de deploy
- `docs/RELEASE_PROCESS.md` - Processo de release passo a passo
- `docs/RUNBOOKS.md` - Troubleshooting runbooks
- `docs/PAYMENT_INTEGRATION.md` - Stripe setup
- `docs/STORE_SUBMISSION.md` - Store submission detalhado

---

**Signed**: PM (Project Manager)  
**Date**: 2026-03-XX  
**Status**: Draft pending final validation
