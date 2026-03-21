# 🚀 Demo Guide - Life Gamification Mobile

**Preparado para:** Nikolas de Hor  
**Data:** 2026-03-21  
**Versão:** 1.1.0-rc.1  

---

## 📋 Pré-requisitos

1. **Expo Go** instalado no seu dispositivo iOS ou Android
   - iOS: App Store → "Expo Go"
   - Android: Play Store → "Expo Go"

2. **Conexão com a internet** (Wi-Fi ou dados)

3. **Login de teste** (usuáriodemo):
   ```
   Telefone: +556286077431
   ```

---

## 🎯 Como Testar (3 passos)

### Passo 1: Iniciar o servidor Expo

No seu computador, dentro da pasta do projeto:

```bash
cd /data/.openclaw/workspace/projs/life-gamification/mobile
npx expo start
```

Isso vai:
- Compilar o app JavaScript/TypeScript
- Iniciar o servidor de desenvolvimento
- Mostrar um **QR Code** no terminal

### Passo 2: Escanear o QR Code

Abra o **Expo Go** no seu celular:

- **iOS**: Aperte no ícone "Camera" dentro do Expo Go e aponte para o QR code
- **Android**: Aperte no botão "Scan QR Code" e aponte para o QR code

Ou simplesmente **digitalize a tela** do computador com a câmera do Expo Go.

### Passo 3: Login e Testes

1. Ao abrir o app, você verá o **Dashboard** carregando.
2. Não há tela de login complexa — o app usa o usuário de teste automaticamente (`+556286077431`). Se aparecer pedindo telefone, insira esse número.
3. Explore as funcionalidades:

---

## 🧭 Fluxo de Teste Recomendado (10 min)

Siga esta sequência para validar a integração das 3 frentes:

### 1. Dashboard (Analytics + Gamificação)
- ✅ Verifique seu nível e barra de progresso
- ✅ 4 áreas da vida com pontuação e streak (🔥)
- ✅ Pull-to-refresh (puxe a tela para baixo) atualiza dados
- ✅ Toque nos cards de área para ir para Missões

### 2. Missões (Gamificação)
- ✅ Lista de missões disponíveis
- ✅ Use a barra de busca para filtrar
- ✅ Filtre por área (chips acima da lista)
- ✅ Toque em uma missão para ver detalhes
- ✅ Toque "Completar missão" → confirme → confete!
- ✅ Volte e veja o Dashboard atualizado

### 3. Ranking (Social + Analytics)
- ✅ Abra a aba "Ranking" (tab inferior)
- ✅ Veja a aba "Geral" (top 100 global)
- ✅ Mude para "Por Área" e selecione uma área
- ✅ Veja "Semanal" e "Mensal"
- ✅ Medalhas 🥇🥈🥉 para top 3

### 4. Coach (AI/Analytics)
- ✅ Aba "Coach" → chat com IACoach
- ✅ Digite uma mensagem (ex: "Quero uma missão de foco")
- ✅ IA responde com sugestão (funcionalidade básica)
- ✅ Histórico de chat é salvo localmente

### 5. Perfil (Gamificação + Social)
- ✅ Veja estatísticas: pontos, missões, streak
- ✅ Toque em "Conquistas" → lista de badges
- ✅ Toque em uma badge para detalhes
- ✅ Toque em "Inventário" → itens NFT (mock)
- ✅ Toque em "Sincronizar Store" → Game Center / Play Games
- ✅ Toque em "Ranking" (abre a tab Ranking)
- ✅ Toque em "Configurações" (modal aberto)

### 6. Missões Especiais (Meta-Game)
- ✅ No Dashboard, toque em "⚔️ Missões Especiais" (card grande)
- ✅ Ou navege via: Perfil → Configurações? (verifique)
- ✅ Veja missões épicas com requisitos JSON
- ✅ Complete uma missão especial → ganhe recompensa

---

## 📊 Checklist Rápido de Funcionalidades

Use esta lista para verificar se tudo está operacional:

- [ ] **Auth**: Usuário logado como `+556286077431`
- [ ] **Dashboard**: Nível, pontos, 4 áreas, streaks, achievements recentes
- [ ] **Missões**: Lista, filtros, busca, conclusão
- [ ] **Pull-to-refresh**: Funciona em Dashboard e Missões
- [ ] **Ranking**: 4 abas, medalhas, filtro por área
- [ ] **Coach**: Chat envia e recebe resposta (backend StepFun)
- [ ] **Perfil**: Estatísticas, menu navegável
- [ ] **Conquistas**: Grid, filtros, detalhe com raridade
- [ ] **Inventário**: Lista de badges/perks/cosmetics
- [ ] **Missões Especiais**: Lista, completar, recompensa
- [ ] **Navegação**: Todas as transições entre telas suaves
- [ ] **Offline**: (opcional) teste modo avião → app abre com cache

---

## 🔧 Comandos Úteis

### Parar o servidor (Ctrl+C no terminal)
Para reiniciar:
```bash
npx expo start -c  # limpa cache
```

### Build para produção (EAS)
```bash
eas build --profile preview --platform all
```
Necessário login no EAS (`eas login`) e configuração de secrets.

### Executar testes de TypeScript
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```

---

## 🐛 Problemas Comuns

| Sintoma | Solução |
|---------|---------|
| **Expo Go não encontra QR code** | Verifique se computador e celular estão na mesma rede WiFi; tente `npx expo start --tunnel` |
| **App mostra erro de API** | Backend deve estar rodando em `http://76.13.164.69:8000`; verifique se o IP está acessível |
| **Telas em branco** | Limpe cache: `npx expo start -c` |
| **Hot reload não funciona** | Reinicie o servidor Expo |
| **Build falha por falta de EAS token** | Execute `eas login` e configure `EAS_TOKEN` no GitHub Secrets |

---

## 📈 Performance Esperada

- **Cold start**: < 3s (medido do clique no ícone até Dashboard renderizado)
- **Bundle size**: ~1.8 MB gzippado (JS bundle)
- **Navegação**: transições < 300ms

---

## 📚 Documentação Adicional

- Arquitetura: `docs/MOBILE_ARCHITECTURE.md`
- Design System: `docs/DESIGN_SYSTEM.md`
- QA & User Stories: `docs/USER_STORIES_QA.md`
- Build & Deploy: `docs/BUILD.md`
- API Reference: `src/services/api.ts` (comentários em código)

---

**Divirta-se testando!** 🎉

Assinado: Dev (OpenClaw Agent)
