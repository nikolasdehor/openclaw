# OpenClaw Workspace

> Workspace principal do assistente OpenClaw (dehor/Devinho)

---

## 📋 Sobre

Este repositório contém o workspace do assistente **OpenClaw**, também conhecido como **dehor** ou **Devinho**. É um assistente virtual baseado em IA para automação de tarefas, gestão de projetos e suporte técnico.

**Compatibilidade:** Linux x86_64 (Docker)  
**Workspace:** `/data/.openclaw/workspace`  
**Cliente WhatsApp:** +556298561249 (dehor/Devinho)

---

## 🚀 quick start

### Pré-requisitos

- Docker + Docker Compose
- OpenClaw CLI instalado globalmente
- Conta OpenRouter com API key (ou outro provider)
- Credenciais OAuth para serviços integrados (WhatsApp Business, Google, etc.)

### Instalação

1. Clone o repositório (se for sua cópia pessoal):
   ```bash
   git clone <seu-fork>
   cd openclaw
   ```

2. Configure as variáveis de ambiente (veja `docs/.env.example`):
   ```bash
   cp docs/.env.example .env
   # Edite .env com suas credenciais
   ```

3. Suba os containers:
   ```bash
   docker compose up -d
   ```

4. Acesse o serviço:
   - Web UI: http://localhost:3000
   - Gateway: http://localhost:52722

5. Conecte o WhatsApp via QR code (primeira execução):
   ```bash
   openclaw whatsapp connect
   ```

### Configuração Inicial

Após a instalação, execute o assistente de configuração:

```bash
openclaw configure
```

**Atenção:** Este wizard pode sobrescrever configurações importantes. Em produção, prefira editar `openclaw.json` diretamente ou usar `openclaw config set`.

---

## 🏗️ Deploy em Produção

Para部署 em ambiente de produção, consulte o guia completo:

**[📖 Deploy em Produção (docs/deploy.md)](docs/deploy.md)**

O guia inclui:
- ✅ Configuração de variáveis de ambiente (.env)
- ✅ OpenRouter API key (obrigatório)
- ✅ PostgreSQL requirement
- ✅ HTTPS e domínio (Nginx, Let's Encrypt, Cloudflare Tunnel)
- ✅ Healthcheck endpoint (`/health`)
- ✅ Docker e Docker Compose
- ✅ Monitoramento e manutenção
- ✅ Troubleshooting

### Healthcheck

Após o deploy, verifique a saúde do sistema:

```bash
curl https://seusite.com/health
# Ou local:
curl http://localhost:3000/health
```

---

## 🗂️ Estrutura do Projeto

```
.openclaw/
├── README.md                 # Este arquivo
├── MEMORY.md                 # Memória de longo prazo do assistente
├── docs/                     # Documentação detalhada
│   ├── onboarding.md         # Guia para novos desenvolvedores
│   ├── architecture/         # ADRs (Architecture Decision Records)
│   │   └── adr-template.md   # Template para ADRs
│   ├── templates/            # Templates para PRs e commits
│   │   ├── PULL_REQUEST_TEMPLATE.md
│   │   └── COMMIT_MESSAGE_TEMPLATE.md
│   └── development/          # Guias de desenvolvimento
│       └── development-setup.md
├── skills/                   # Skills personalizadas
├── swarm/                    # Agentes especializados
├── reports/                  # Relatórios automáticos
├── logs/                     # Logs do sistema
├── memory/                   # Notas diárias (YYYY-MM-DD.md)
├── config/                   # Configurações do OpenClaw
├── agents/                   # Configuração de agentes
├── projs/                    # Projetos ativos
├── scripts/                  # Scripts auxiliares
└── .github/                  # Templates do GitHub
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE/
```

---

## 📚 Documentação

- **[Guia de Contribuição](docs/Contributing.md)** – Como contribuir com código, issues e PRs
- **[Deploy em Produção](docs/deploy.md)** – Guia completo de instalação, configuração de `.env`, OpenRouter API key, PostgreSQL, HTTPS, healthcheck e manutenção
- **[Onboarding](docs/onboarding.md)** – Primeiros passos para novos desenvolvedores
- **[Arquitetura](docs/architecture/)** – DECISÕES ARQUITETURAIS (ADRs)
- **[Changelog](CHANGELOG.md)** – Histórico de mudanças

---

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

O arquivo `.env` contém todas as configurações necessárias:

```bash
# OpenRouter API (obrigatório)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL=openrouter/stepfun/step-3.5-flash

# Banco de Dados PostgreSQL
DATABASE_URL=postgresql://openclaw:senha123@postgres:5432/openclaw?sslmode=prefer
POSTGRES_USER=openclaw
POSTGRES_PASSWORD=senha123
POSTGRES_DB=openclaw

# Segurança
SECRET_KEY=chave-secreta-super-random-64-characters-minimum
JWT_SECRET=outra-chave-secreta-para-jwt-64-chars-min
ENCRYPTION_KEY=chave-de-criptografia-32-bytes-base64

# WhatsApp Business
WHATSAPP_PHONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=token-verificacao-webhook

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=https://seusite.com/auth/google/callback
```

**Importante:** Copie o exemplo antes de editar:
```bash
cp docs/.env.example .env
```

### Banco de Dados

- **PostgreSQL é requerido** para produção
- Use o Docker Compose incluso ou um banco externo (RDS, Cloud SQL)
- A string de conexão deve estar em `DATABASE_URL`

### OpenRouter API Key

- Necessária para LLM (modelos Step, Gemini, etc)
- Obtenha em https://openrouter.ai
- Configure como `OPENROUTER_API_KEY` no `.env`

---

## 🛠️ Ferramentas e Skills

O workspace inclui 34+ skills para diversas funções:

- `agent-browser` – Automação de navegador
- `github` – Interação com GitHub
- `wacli` – Gerenciamento de WhatsApp
- `summarize` – Resumos de URLs e arquivos
- `deep-research-pro` – Pesquisa aprofundada
- `seo-content-engine` – Criação de conteúdo otimizado
- E muito mais...

Lista completa em `MEMORY.md`.

---

## 🤖 Agentes do Swarm

O sistema utiliza uma orquestração de agentes especializados para tarefas complexas:

| Agente   | Especialidade           | Uso                              |
|----------|------------------------|----------------------------------|
| `cto`    | Tecnologia/Infra       | Stack, API, Docker, performance |
| `cmo`    | Marketing/Copy         | Anúncios, posts, estratégia     |
| `cfo`    | Finanças/Precificação  | Custos, preços, ROI             |
| `dev`    | Código/Automação       | Scripts, debugging, integração  |
| `pm`     | Gestão/Roadmap         | Planejamento, escopo, tarefas   |
| `rh`     | Recursos Humanos       | Documentação, onboarding        |
| `juridico`| Jurídico/Compliance   | Contratos, termos               |
| `vendas` | Vendas/CRM             | Propostas, follow-up            |

Para delegar tarefas:
```bash
openclaw sessions spawn --agent cto --task "Recomende uma stack para o projeto"
```

---

## 📈 Roadmap

O planejamento de duas semanas está em `roadmap-2-semanas.md`.

---

## 📝 Licença

Projeto proprietário – Todos os direitos reservados.

---

## 📞 Contato

- **Dono:** Nikolas (+556286077431)
- **Assistente:** dehor/Devinho (+556298561249)

---

*Última atualização: 2026-03-12*
