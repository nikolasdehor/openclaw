# Checklist de Segurança para Skills (antes de instalar/rodar)

Objetivo: reduzir risco de *supply-chain* (skill maliciosa roubando credenciais, executando código escondido, etc.).

## Nível 0 (30 segundos)
- O repositório/autor é confiável?
- A skill pede pra colar tokens/keys em texto? Se sim, suspeito.
- A skill roda comandos tipo `curl | bash`, `npx <coisa>@latest`, `eval`, `chmod/chown`, `sudo`? Se sim, pare.

## Nível 1 (2 a 5 minutos) 
1) Leia o `SKILL.md`
- Procure por: `rm`, `sudo`, `chmod`, `chown`, `launchctl`, `crontab`, `brew install`, `npm i -g`, `pip install`, `curl`, `wget`, `base64`, `openssl`, `ssh`.
- Procure por coleta de segredos: `~/.env`, `~/.ssh`, `credentials`, `tokens`, `keychain`, `op`, `1password`.

2) Veja o que a skill executa de verdade
- Se tiver scripts, leia os arquivos referenciados (ex: `scripts/*.sh`, `*.mjs`, `*.py`).
- Desconfie de binários baixados na hora.

3) Grep rápido por chamadas de rede e exfiltração
- Procure por: `webhook`, `requestbin`, `webhook.site`, `discord.com/api`, `telegram`, `pastebin`, `ngrok`, `http://`, `https://`.
- Se a skill manda dados pra fora, precisa de justificativa clara.

## Nível 2 (quando for importante)
- Rode em ambiente isolado / usuário sem acesso a segredos.
- Evite dar acesso amplo a variáveis de ambiente.
- Prefira segredos via gerenciador (ex: 1Password) e escopo mínimo.

## Regras de ouro (padrão aqui)
- Segredo nunca vai em arquivo do repo.
- Se uma skill precisar de permissões elevadas, eu te peço ok antes.
- Se eu não conseguir explicar em 1 frase por que um comando é necessário, eu não rodo.
