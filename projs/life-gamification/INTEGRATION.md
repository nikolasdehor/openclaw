# Integração com Ecossistema Existente

Este documento detalha como conectar o Life Gamification com ferramentas que você já usa.

## 📊 Planilha Financeira (CSV)

### Formato esperado

Seu CSV deve ter colunas como:

```csv
data,descricao,categoria,valor,tipo
2025-03-20,Almoço,alimentacao,-35,despesa
2025-03-20,Salário,renda,5000,receita
```

**Importante**: A IA gera missões baseadas nas categorias que encontrar.

### Importação manual

```bash
# Via API
curl -X POST "http://localhost:8000/admin/import-finances" \
  -H "Content-Type: application/json" \
  -d '{"csv_path": "~/documentos/financas.csv"}'
```

### Importação automática (via cron)

```bash
# No crontab:
0 22 * * * curl -s -X POST "http://localhost:8000/admin/import-finances" \
  -H "Content-Type: application/json" \
  -d '{"csv_path": "~/documentos/financas.csv"}' > /dev/null
```

### Localização padrão

O sistema espera o arquivo em:
- `~/documentos/financas.csv` (Linux/Mac)
- `%USERPROFILE%\Documents\financas.csv` (Windows)

## ⏰ Cron Jobs Existentes

### Conectando cron jobs atuais

Se você já tem cron jobs como:

```bash
0 8 * * * /path/to/health_script.sh
```

Pode registrar no sistema:

```sql
INSERT INTO cron_jobs (name, command, schedule, area_id, enabled)
VALUES (
  'Health Morning',
  '/path/to/health_script.sh',
  '0 8 * * *',
  (SELECT id FROM areas WHERE name='saude'),
  1
);
```

### Auto-checkin via webhook

O endpoint `/cron/checkin` lê todos os `cron_jobs` habilitados e pode executar:

```bash
# A cada hora, chama o webhook e ele processa jobs na hora certa
0 * * * * curl -s http://localhost:8000/cron/checkin > /dev/null
```

**Nota**: No MVP, o webhook apenas loga. Para executar comandos de verdade, edite `main.py` na função `cron_checkin` para rodar subprocess.

## 📱 WhatsApp (wacli)

### Instalação

```bash
npm install -g wacli
wacli login
```

### Configuração

No `.env`:

```env
WACLI_ENABLED=true
WACLI_PHONE_NUMBER=+556286077431
```

### O que dispara notificações

Atualmente, achievements desbloqueados enviam automaticamente. Para customizar:

```python
# No backend, modifique a função check_achievements
# ou adicione novas chamadas wacli em:
# - mission_complete (completion)
# - streak milestones (3, 7, 30 dias)
```

Exemplo:

```python
if result.leveled_up:
    send_whatsapp_notification(
        user["phone"],
        f"🎉 Parabéns! Você subiu para o nível {new_level} no Life Quest!"
    )
```

## 🧠 Swarm Agents

### Estrutura

Agentes são definidos em `integrator/agents.json`:

```json
{
  "role": "health_coach",
  "instructions": "Você é um coach de saúde...",
  "model": "openrouter/stepfun/step-3.5-flash:free"
}
```

### Adicionando novos agentes

1. Edite `agents.json`
2. Reinicie o integrator
3. Use no código:

```python
await integrator._call_agent("seu_novo_agente", "prompt aqui")
```

### Agentes padrão

| Agente | Foco |
|--------|------|
| health_coach | Exercícios, sono, nutrição |
| focus_specialist | Produtividade, Pomodoro |
| learning_guide | Cursos, leitura |
| financial_advisor | Investimentos, orçamento |
| motivation_coach | Engajamento, recuperação |

## 🔔 Exemplo: Integração Completa

### Cenário: Notificar no WhatsApp quando streak quebrar

1. Modifique `main.py` na função `update_streaks`:

```python
def update_streaks(...):
    # ... código existente

    if current_streak == 1 and previous_streak >= 3:
        # Streak quebrou!
        from fastapi import BackgroundTasks
        background_tasks.add_task(
            send_whatsapp_notification,
            user_phone,
            f"⚠️ Streak quebrada em {area_name}! Você tinha {previous_streak} dias. Vamos recuperar?"
        )
```

2. Ajuste a assinatura de `update_streaks` para receber `BackgroundTasks`.

### Cenário: Importar gastos do banco (auto)

```python
# No integrator, adicione:
async def import_daily_expenses():
    # Conecta no seu banco financeiro
    # Gera missões como " Cortar gastos اليوم "
    pass

# Agende no cron:
# 0 6 * * * python integrator/import_daily.py
```

## 🛠️ Debug

### Ver logs

```bash
# Backend (uvicorn)
journalctl -u life-gamification-api -f

# Docker
docker logs -f life-gamification-api

# Frontend (nginx)
docker logs -f life-gamification-frontend
```

### Testar wacli

```bash
wacli send +556286077431 "Teste do Life Gamification"
```

### Simular completion de missão

```bash
curl -X POST "$BASE/mission/quick-complete" \
  -H "Content-Type: application/json" \
  -d '{"user_phone":"+556286077431","title":"Teste","description":"...","area_name":"foco","difficulty":"easy"}'
```

## 📈 Monitoramento

### Métricas

- Pontos por área: `GET /dashboard`
- Taxa de completions: contagem de `habit_logs` por dia
- Streak médio: `SELECT AVG(current_streak) FROM user_streaks`

### Health checks

```bash
curl $BASE/health  # Deve retornar {"status":"ok",...}
```

### Backup do banco

```bash
# Se usar Docker
docker exec life-gamification-db sqlite3 /data/gamification.db ".backup /backup/gamification_backup_$(date +%Y%m%d).db"

# Local
sqlite3 data/gamification.db ".backup backup.db"
```

## 🔄 Atualizações

1. Atualize código
2. Rode `docker-compose pull && docker-compose up -d` (se usando Docker)
3. Backend: `uvicorn main:app --reload` (local)
4. Frontend: recarregue navegador (static)

---

**Problemas?** Veja a seção Troubleshooting no README.md.
