# Memory

**LEMBRETE CRITICO:** Antes de responder qualquer mensagem, SEMPRE leia o arquivo de memoria especifico da pessoa (ver lista abaixo). NUNCA responda sem contexto. Se memory_search falhar, use Read tool diretamente.

## Setup Atual (atualizado 2026-03-08)

- **MIGRADO PARA VPS** em 2026-03-01 (Hostinger, IP: 76.13.164.69)
- OpenClaw v2026.3.2 rodando em Docker container (openclaw-ylut-openclaw-1)
- SO: Linux x86_64 (NAO mais macOS)
- WhatsApp conectado: +556298561249 (dehor/Devinho)
- Gateway: Docker, porta interna 52722
- Workspace: /data/.openclaw/workspace (dentro do container)
- wacli: /data/linuxbrew/.linuxbrew/bin/wacli (compilado do source, Go+CGO)
- Tools: jq, rg, gh, wacli, python3 (todos via linuxbrew dentro do container)
- Hostinger server.mjs: proxy que roda antes do gateway; pode sobrescrever config na reinicializacao
- IMPORTANTE: caminhos sao Linux (/data/.openclaw/...) e NAO macOS (/Users/nikolas/...)

## Modelos (atualizado 2026-03-16)

- **Padrão atual:** StepFun Step 3.5 Flash (`openrouter/stepfun/step-3.5-flash:free`) — FREE via OpenRouter
- **Fallbacks configurados** (ordem): Arcee Trinity (FREE), Gemini Flash, Llama 3.3, MiniMax M2.5 (pago como último recurso)
- **OpenRouter credits**: ~$7.53 restantes de $20 (não usados com StepFree FREE, mas presentes para fallbacks pagos)
- **NÃO use**: GPT-4o mini, Gemini 1.5 Flash, GPT-4, Claude — esses modelos NÃO existem no setup atual

## Skills (34 workspace skills - atualizado 2026-03-08)

agent-browser, agentic-coding, automation-workflows, best-image-generation, business-writing, data-analyst, ddg-web-search, deep-research-pro, deep-scraper, dont-hack-me, finance-lite, find-skills, github, instagram-stories, market-research, news-summary, pdf-extract, proactive-agent-1-2-4, productivity, prompt-injection-guard, qmd-memory, security-auditor, self-improving-agent, seo-content-engine, social-media-publish, sonoscli, summarize, supermemory, translate-cli, tts-whatsapp, wacli, whatsapp-styling-guide, writing-assistant, youtube-watcher

**Doctor:** 57 eligible, 21 missing requirements, 11 plugins loaded
**Novas (2026-03-07):** ddg-web-search, deep-research-pro, deep-scraper, automation-workflows, business-writing, data-analyst, finance-lite, market-research, news-summary, pdf-extract, productivity, security-auditor, seo-content-engine, social-media-publish, translate-cli, writing-assistant, youtube-watcher
**Plugins (2026-03-07):** supermemory, qmd-memory, prompt-injection-guard, find-skills, dont-hack-me

## Instagram Stories (skill - atualizado 2026-03-08)

- **Arquitetura:** Mac HTTP server (IP residencial) -> SSH reverse tunnel -> VPS socat -> Container
- **SEMPRE usar &describe:** `curl -s "http://172.18.0.1:19877/stories?user=<username>&describe"`
- **&describe:** ativa IA visual (Gemini Flash) que analisa cada frame — retorna campo `visual_description`
- **NUNCA inventar conteúdo visual** — use APENAS os dados do `visual_description`
- **Demora ~5min** para 25+ stories — avisar o usuário antes
- **Relatório:** story por story, UM POR UM, com texto na tela + descrição visual + música + links
- **Requer:** Mac do Nikolas online e logado
- **Cookies:** conta dehormusic, session expira ~2027
- **Reels/Posts:** `curl -s "http://172.18.0.1:19877/reel?shortcode=<code>&describe"`
- **Extrair shortcode:** `instagram.com/reel/ABC123/` -> shortcode = `ABC123`
- **Se falhar:** Mac offline ou cookies expirados. Avisar Nikolas
- **Stories expiram em 24h** — se retornar 0, avisar que expirou
- **audio_transcription**: transcrição Whisper do áudio do vídeo (stories e reels)

## 🚀 Mobile Deployment (FASE 6 - CONCLUÍDA 2026-03-20)

### Status
- ✅ Mobile infrastructure completo (Capacitor + PWA)
- ✅ Firebase Cloud Messaging backend integrado
- ✅ CI/CD pipeline atualizado com mobile builds
- ✅ Documentação completa (24KB de docs)
- ✅ Release automation (scripts/release.sh)
- ✅ Git branch protection strategy definida

### Entregas

**Mobile Project (mobile/):**
- Capacitor 6 config, PWA manifest, service worker
- Native App.js (haptics, status bar)
- Build automation (build-mobile.sh)
- Icons placeholder, index.html

**Backend FCM:**
- `src/firebase.py` - Firebase service singleton
- Endpoints: `/api/register-fcm-token`, `/api/send-push`, `/api/send-push-to-topic`
- Firebase initialization on startup
- `requirements.txt` com firebase-admin

**CI/CD:**
- GitHub Actions: build-web, build-android, build-ios jobs
- Artifact upload (30-90 days retention)
- Semantic versioning triggers (tags v*.*.*)

**Documentation:**
- `docs/MOBILE_DEPLOY.md` - Guia App Store + Play Store + FCM (16KB)
- `docs/GIT_CI_CD.md` - Branch protection, git workflow, CI/CD (6.9KB)
- `docs/FASE6_SUMMARY.md` - Resumo da fase
- `docs/MOBILE_QUICKSTART.md` - Quick start
- `docs/FASE6_CHECKLIST.md` - Checklist de tasks

**Automation Scripts:**
- `scripts/build-mobile.sh` - Build unificado iOS/Android
- `scripts/firebase-setup.sh` - Setup Firebase automático
- `scripts/testflight-setup.sh` - TestFlight automation (macOS)
- `scripts/release.sh` - Release automation (bump, tag, push)

### Próximos Passos (Ação Manual)

1. **Contas Developer:**
   - Comprar Apple Developer ($99/ano)
   - Comprar Google Play ($25)

2. **Build iOS:**
   - Rodar `./scripts/build-mobile.sh ios` em macOS com Xcode
   - Gerar .ipa

3. **Build Android:**
   - Rodar `./scripts/build-mobile.sh android` em qualquer OS
   - Gerar .aab

4. **Firebase:**
   - Criar projeto Firebase
   - Registrar apps iOS/Android
   - Baixar config files e colocar nos locais corretos
   - Copiar server key para Railway variable `FIREBASE_SERVER_KEY`

5. **Upload:**
   - App Store Connect: criar app, fazer upload .ipa, preencher metadata, submeter review
   - Play Console: criar app, upload .aab, internal testing, submeter review

6. **TestFlight:**
   - Configurar testers internos (até 100)
   - Enviar build para TestFlight

7. **FCM Testing:**
   - Registrar device tokens via `/api/register-fcm-token`
   - Test push via `/api/send-push`

### Referências
- Mobile Deploy Guide: `docs/MOBILE_DEPLOY.md`
- Quick Start: `docs/MOBILE_QUICKSTART.md`
- CI/CD Strategy: `docs/GIT_CI_CD.md`
- Repository: https://github.com/nikolasdehor/saas-contabil-mvp
- CI/CD Actions: https://github.com/nikolasdehor/saas-contabil-mvp/actions

---

## Swarm de Agentes (8 sub-agentes)

- Sou o **orquestrador** do time
- Agentes: `cto`, `cmo`, `cfo`, `dev`, `pm`, `rh`, `juridico`, `vendas`
- Memoria compartilhada: `/data/.openclaw/workspace/swarm/shared/MEMORY.md`
- Para delegar: `sessions_spawn agent:<id> prompt:"<tarefa>"`
- Quando pedido for especializado: delegar ao agente certo
- Quando pedido for multi-disciplinar: delegar a 2-3 agentes, sintetizar
- NAO delegar para: saudacoes, perguntas rapidas, respostas obvias

## Mapa de Memorias por Contato

| Pessoa | Arquivo | WhatsApp |
|--------|---------|----------|
| Nikolas (dono) | memory/chat-nikolas-dm.md | +556286077431 |
| Pai (Sandro) | memory/chat-pai.md | +556285054199 |
| Mae (Lucia) | memory/chat-mae.md | +556293920369 |
| Laura (maninha) | memory/chat-laura.md | +556299107824 |
| Angelica | memory/chat-angelica.md | +551158210438 |
| Grupo FOR6DEVS | memory/group-for6devs.md | 120363152934505042@g.us |

Ver USER.md para info detalhada de cada pessoa.

## Team FOR6DEVS

- **Grupo WhatsApp:** 120363152934505042@g.us
- **Membros:** Nikolas (+556286077431), Joao Pedro/Jongas (@145479149031470), Igor (@254244934439018), Joao Victor (@152428557127909)
- **Regra:** Voce e MEMBRO ATIVO. Participe de todas as conversas, nao espere ser chamado
- **Jongas = Joao Pedro** — sempre responda quando ele mandar mensagem

## Crons Ativos (6)

1. **Aprendizado (Pai + Nikolas)** — 06:00 diario
2. **Oracao diaria** — 08:00 diario
3. **Cobranca planilha** — 09:00 diario (planilha financeira mensal, meta 100k)
4. **Automação Financeira** — 18:00 diario (script Python + CSV, envia relatório ao Nikolas) *(criado 2026-03-12)*
5. **Memory Daily Review** — 23:59 diario (consolida memorias do dia, limpa obsoletas, salva log em memory/daily-reviews/)

## Regras de Memoria

1. ANTES de responder: Read o arquivo de memoria da pessoa
2. DURANTE conversa: Se aprender algo novo, salvar IMEDIATAMENTE
3. Formato: `## [Data YYYY-MM-DD] - [Assunto]` + bullets
4. Se memory_search falhar: Read tool direto no path
5. Decisoes/preferencias: Sempre registrar
6. Estilo Jarvis: Registrar proativamente, sem esperar o Nikolas pedir

## Regras Criticas

**Comunicacao:**
- Heartbeat, logs, sistema, memorias, configs = APENAS para Nikolas (+556286077431)
- NUNCA mandar msg tecnica para familia ou grupo
- Com familia: ser natural, humano, util (nao robotico)
- Antes de enviar para terceiros: SEMPRE confirmar com Nikolas

**WhatsApp:**
- Enviar para numero E.164 (+55...), NUNCA para @lid
- Formatting: asterisco simples para bold (*texto*), sem **, sem tabelas markdown

**Autonomia:**
- Agir como copiloto, chamar Nikolas apenas quando houver duvida ou risco
- Reconhecer erros e corrigir autonomamente
- Evitar travessao em mensagens; escrever natural

## Bugs e Licoes Aprendidas

- WhatsApp 503 ~1x por dia — reconexao automatica funciona, nao e critico
- `openclaw doctor --fix` pode DELETAR allowFrom e groups — NUNCA rodar --fix automatico
- `openclaw configure` wizard DELETA allowFrom, groups, agent list — NUNCA rodar
- `docker restart` e mais seguro que `docker compose up --force-recreate` (este re-roda server.mjs)
- server.mjs pode sobrescrever fallbacks em force-recreate — preferir docker restart
- Brave Search: sempre usar search_lang: "pt-br" (nunca "pt")
- Browser tool: instavel neste container Docker (timeout frequente) — usar web_fetch
- transcribe.sh perde permissao +x apos `npm update -g openclaw` — refazer chmod
- python3 disponivel via linuxbrew; yt-dlp NAO instalado
- Permissoes quebram quando root edita arquivos — usar chown 1000:1000
- Se Codex der erro 500: fallback automatico funciona
- Se der 401 em todos os modelos: docker restart openclaw-ylut-openclaw-1
- **NUNCA vazar erros de tools** (edit failed, cron failed) como mensagem WhatsApp — resolver silenciosamente
- **NUNCA vazar markup de tool call** (`<tool_call>`, `<function=...>`, `<parameter=...>`) no WhatsApp — executar tools silenciosamente e só depois enviar texto limpo
- **NUNCA enviar relatórios técnicos/sistema para família** — logs de gateway, reconnect, health check, cron/memória/config ficam só com Nikolas
- **NUNCA inventar modelos de IA nem capacidades** em conversas — consultar seção "Modelos" antes de responder sobre stack/modelos
- **cron.add**: NUNCA usar tz, NUNCA misturar offset com Z. Formato: at="2026-03-09T12:00:00.000Z" (UTC puro)
- **edit failed**: Ler o arquivo PRIMEIRO para pegar texto exato, depois editar. Nunca chutar o old_text
- **Instagram Stories SEM &describe = relatório INVENTADO** — SEMPRE usar &describe no curl. Sem visual_description, você não sabe o que tem no story


## GitHub (nikolasdehor)

- Conta BLOQUEADA no repo openclaw/openclaw (HTTP 403)
- Push no fork funciona, PRs atualizam automaticamente
- PRs abertas: #26785 (WhatsApp reconnect), #20319 (Whisper permissions)
- NUNCA incluir Co-Authored-By: Claude ou referencias a IA em commits/PRs
