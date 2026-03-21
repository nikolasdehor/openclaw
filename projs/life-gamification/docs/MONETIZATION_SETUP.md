# Monetization Setup Guide

Guia completo para configurar o sistema de pagamentos (Stripe) no Life Gamification.

---

## 📋 Overview

O sistema de monetização usa **Stripe Checkout** para vender assinaturas:

- **Plano Mensal**: R$19,90/mês
- **Plano Anual**: R$199,90/ano (16% de desconto)

Fluxo:
1. Usuário clica "Assinar" no app mobile
2. App abre checkout URL (Stripe-hosted page)
3. Usuário paga com cartão/Pix
4. Stripe envia webhook para nosso backend
5. Backend atualiza status da assinatura no banco
6. App sincroniza status e desbloqueia premium features

---

## 🔑 Stripe Account Setup

### 1. Criar conta Stripe

1. Acesse https://stripe.com (registre-se)
2. Selecione país: **Brazil** (para processar em BRL)
3. Complete verificação (CNPJ/CPF, bank account)
4. Aguarde ativação da conta (~1-2 dias úteis)

### 2. Obter API Keys

No Dashboard Stripe:
1. Vá em **Developers** → **API keys**
2. Anote:
   - **Publishable key** (pk_live_xxx) - para o frontend/mobile
   - **Secret key** (sk_live_xxx) - para o backend

Adicione ao `.env` do backend:
```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # opcional, se frontend usar direto
```

### 3. Configurar Webhook

1. Em **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://seu-backend.com/api/subscription/webhook`
   - Se localhost: use Stripe CLI tunnel: `stripe listen --forward-to localhost:8000/api/subscription/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
4. Clique em **Add endpoint**
5. Copie o **Signing secret** (whsec_xxx)

Adicione ao `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4. Criar Produtos e Preços

1. Vá em **Products** → **Add product**
2. Crie "Life Gamification Premium":
   - Name: "Life Gamification Premium"
   - Description: "Assinatura premium com recursos exclusivos"
3. Crie dois preços (pricing):
   - **Mensal**: R$19,90/mês (recurring interval: month)
   - **Anual**: R$199,90/ano (recurring interval: year)

Anote os **Price IDs**:
```bash
STRIPE_PRICE_ID_MONTHLY=price_1Mxxxxx
STRIPE_PRICE_ID_ANNUAL=price_1Axxxxx
```

Adicione ao `.env`:
```bash
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_ANNUAL=price_xxx
```

---

## 🔧 Backend Configuration

### Dependencies

```bash
cd backend
pip install stripe
```

### Environment Variables

No `.env` da pasta `backend/`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_monthly_xxx
STRIPE_PRICE_ID_ANNUAL=price_annual_xxx

# Webhook base URL (para construir return_url)
BACKEND_URL=https://seu-backend.com  # produção
# Para localhost: BACKEND_URL=http://localhost:8000

# Premium features toggle
PREMIUM_ENABLED=true
```

### Database Migration

O schema já inclui a tabela `subscriptions`. Para criar:

```bash
# Reinicie o backend (init_db roda automaticamente)
uvicorn main:app --reload
```

Ou execute manualmente:
```bash
sqlite3 data/gamification.db < backend/schema.sql
```

### Endpoints

**POST /api/subscription/create**

Cria uma sessão de checkout no Stripe.

Request:
```json
{
  "user_phone": "+556286077431",
  "plan": "monthly" | "annual"
}
```

Response:
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_xxx",
  "price_id": "price_xxx",
  "plan": "monthly"
}
```

Uso no mobile:
```typescript
const response = await apiFetch('/api/subscription/create', {
  method: 'POST',
  body: { user_phone, plan: 'monthly' }
});
const { checkout_url } = response;

// Abrir no WebView ou browser
WebBrowser.openBrowserAsync(checkout_url);
```

**POST /api/subscription/webhook**

Webhook endpoint (não chamado pelo app, apenas Stripe).

Verifica assinatura do webhook e processa eventos:
- `checkout.session.completed`: cria subscription no banco
- `customer.subscription.updated`: atualiza status
- `invoice.payment_failed`: marca subscription como `past_due`

Response:
```json
{ "status": "ok" }
```

Configure Stripe para enviar webhooks para este endpoint.

**GET /api/subscription/status?user_phone=...**

Retorna status da assinatura do usuário.

Response:
```json
{
  "user_phone": "+556286077431",
  "subscription": {
    "status": "active" | "canceled" | "expired" | "none",
    "plan": "monthly" | "annual",
    "current_period_end": "2026-04-20T12:00:00Z",
    "cancel_at_period_end": false
  },
  "premium_features": ["double_points", "no_ads", "priority_support"]
}
```

**POST /api/subscription/cancel**

Cancela assinatura no Stripe (cancela imediatamente ou no final do período).

Request:
```json
{ "user_phone": "+556286077431" }
```

Response:
```json
{ "status": "canceled", "canceled_at": "2026-03-21T..." }
```

---

## 📱 Mobile Integration

### Tela Premium/Upgrade

Criar tela `PremiumScreen.tsx`:

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { WebBrowser } from 'expo-web-browser';

const PremiumScreen = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    const res = await apiFetch(`/api/subscription/status?user_phone=${user.phone}`);
    setSubscription(res.subscription);
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setLoading(true);
    const res = await apiFetch('/api/subscription/create', {
      method: 'POST',
      body: { user_phone: user.phone, plan }
    });
    await WebBrowser.openBrowserAsync(res.checkout_url);
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  return (
    <ScrollView>
      <Text>Assine para desbloquear features premium:</Text>
      <Feature title="+2x pontos em todas as missões" icon="✨" />
      <Feature title="Widget nativo (iOS/Android)" icon="📱" />
      <Feature title="Suporte prioritário" icon="🎧" />
      <Feature title="Sem anúncios" icon="🚫" />

      {subscription?.status === 'active' ? (
        <Text>⭐ Assinatura ativa até {new Date(subscription.current_period_end).toLocaleDateString()}</Text>
      ) : (
        <>
          <Button label="Mensal - R$19,90/mês" onPress={() => handleSubscribe('monthly')} />
          <Button label="Anual - R$199,90/ano (16% OFF)" onPress={() => handleSubscribe('annual')} />
        </>
      )}
    </ScrollView>
  );
};
```

### Premium Features Unlock

Em components que usam premium features (ex: double points):

```tsx
const { subscription } = useAuth(); // extends AuthContext para buscar subscription

const points = basePoints * (subscription?.status === 'active' ? 2 : 1);
```

---

## 🧪 Testing

### Stripe Test Mode

1. No Dashboard Stripe, ative **Test mode** (toggle no topo)
2. Use API keys de teste (`sk_test_xxx`, `pk_test_xxx`)
3. Crie produtos e preços de teste (use mesmo valores)
4. Para webhooks locais, instale Stripe CLI:

```bash
# Login
stripe login

# Listen e forward para localhost
stripe listen --forward-to localhost:8000/api/subscription/webhook

# Trigger manual de eventos
stripe trigger checkout.session.completed
```

Test cards (test mode):
- Sucesso: `4242 4242 4242 4242` (qualquer future, CVC, ZIP)
- Falha: `4000 0000 0000 0002`

### Test Flow

1. No mobile (Expo Go), entre na tela Premium
2. Clique "Mensal" → abre checkout Stripe
3. Use cartão de teste `4242...`
4. Complete pagamento
5. Verifique webhook recebido no backend logs
6. Verifique banco: `SELECT * FROM subscriptions WHERE user_id = X`
7. No app, refresh tela Premium → deve mostrar "Assinatura ativa"

---

## 🚀 Go-Live

### Switch to Live Mode

1. No Stripe Dashboard, saia do **Test mode**
2. Substitua API keys no `.env`:
   - `STRIPE_SECRET_KEY=sk_live_xxx`
   - `STRIPE_PRICE_ID_MONTHLY` e `ANNUAL` (preços de live)
3. Reinicie backend
4. Teste com valor mínimo (R$1) antes de liberar preços cheios

### Webhook Production

1. Configure webhook endpoint para produção URL:
   - `https://seu-backend.com/api/subscription/webhook`
2. Adicione eventos novamente (checkout, subscription, invoice)
3. Copie signing secret para `STRIPE_WEBHOOK_SECRET`

### Mobile App

Se o mobile usa `STRIPE_PUBLISHABLE_KEY` (não recomendado), atualize no `app.config.js`:
```js
export default {
  extra: {
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};
```

---

## 📊 Monitoring & Webhooks

### Monitorar Key Events

No Stripe Dashboard → **Developers** → **Events**:

- `checkout.session.completed` - novas assinaturas
- `customer.subscription.deleted` - cancelamentos
- `invoice.payment_failed` - pagamentos falhados

Configure alertas no Stripe (webhook failures, disputes).

### Backend Logs

Adicione logging nos webhook handlers:

```python
@app.post("/api/subscription/webhook")
async def stripe_webhook(request: Request, payload: dict = Body(...)):
    logger.info(f"Webhook received: {payload.get('type')}")
    # ...
```

Verifique logs (`tail -f backend/logs/app.log`) durante testes.

---

## 🔐 Security Considerations

- **Never expose** `STRIPE_SECRET_KEY` no frontend/mobile
- Webhook endpoints devem usar HTTPS em produção
- Verify webhook signatures (Stripe already does this)
- Rate limit `/api/subscription/create` (ex: 5req/min por user)
- Validate `user_phone` exists in DB before creating checkout

---

## 💳 Refund & Cancellation Policy

### Cancellation
- Usuário pode cancelar a qualquer momento via botão no app
- Cancellation efetivado no final do período pago (Stripe default)
- Acesso premium até `current_period_end`

### Refunds
- Política: 14 dias para refund (Lei do Consumidor)
- Processar manualmente no Stripe Dashboard → Subscriptions → Select customer → Refund
- Atualizar subscription status no banco se necessário

### Failed Payments
- Stripe retry automático (dunning)
- Após 3 falhas, subscription vira `canceled`
- Notificar usuário por email/whatsapp (backend pode enviar wacli)

---

## 🧰 Troubleshooting

### Webhook não está recebendo eventos

1. Verifique URL acessível publicamente (use ngrok/Cloudflare Tunnel para localhost)
2. Verifique se eventos corretos selecionados no Dashboard Stripe
3. Cheque logs: `stripe listen` mostra eventos recebidos
4. Teste com `stripe trigger checkout.session.completed`

### Checkout URL retorna erro

- Verifique price IDs são de LIVE mode (não de test)
- Verifique user_phone existe no banco (criar user se não existir)

### Subscription status não atualiza

- Verifique webhook secret correto
- Verifique logs do backend (erros no handler)
- Verifique Stripe Dashboard → subscription status

### Build falha por缺少 Stripe API key

- Certifique-se `STRIPE_SECRET_KEY` está no `.env`
- Backend reiniciado após alterar `.env`

---

## 📈 Metrics & Dashboards

### Key Metrics
- **MRR** (Monthly Recurring Revenue)
- **Conversion rate**:visitas → checkout → pagamento
- **Churn rate**: cancelamentos/mês
- **LTV** (Lifetime Value)
- **ARPU** (Average Revenue Per User)

### Stripe Reports

Dashboard → **Reports** → **MRR**, **Churn**, **Subscriptions**

Export CSV para análise externa.

---

## 🔄 Future Improvements

- **Trials**: 7-day free trial antes de cobrar
- **Coupons**: código de desconto ( Black Friday )
- **Multiple plans**: Família, Empresarial
- **Tax calculation**: ICMS/ISS automático
- **Invoices**: PDF invoice por email

---

## 📞 Support

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Life Gamification: support@lifegamification.com

---

**Last updated**: 2026-03-XX  
**Maintained by**: CTO (Payment Integration)
