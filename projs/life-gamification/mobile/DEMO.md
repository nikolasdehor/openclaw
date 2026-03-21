# 🎯 Demo Guide - Life Gamification Mobile

Este guia prepara uma demonstração ao vivo do app usando Expo Go.

---

## 📱 Preparação Rápida (antes da demo)

### 1. Certifique-se de que o backend está acessível

```bash
# Teste a API
curl http://76.13.164.69:8000/health
# Deve retornar {"status":"ok", ...}
```

Se o backend estiver rodando localmente, use um túnel (ngrok ou expo tunnel).

### 2. Configure o .env (se necessário)

```bash
cp .env.example .env
# Garanta que BACKEND_URL aponte para um endpoint acessível pelos dispositivos na rede
```

Se for usar localhost, exponha com:

```bash
# Usando expo tunnel (mais fácil)
npx expo start --tunnel
```

### 3. Inicie o app em modo demo

```bash
# Development (Expo Go)
npx expo start --clear

# Ou com tunnel (se dispositivos estiverem em redes diferentes)
npx expo start --tunnel
```

---

## 📲 Como Obter o QR Code

1. No terminal onde `expo start` está rodando, você verá um QR code grande (ASCII).
2. Ou acesse o link exibido: `http://<your-computer-ip>:19000`
3. Use a câmera do iPhone/Android com o app **Expo Go** instalado para escanear.
4. Ou, no Android, use o botão "Scan QR Code" no Expo Go.
5. Ou, no iOS, use a câmera nativa (funciona diretamente).

---

## 🔐 Login para Demo

Use o número de telefone fixo de teste:

```
+556286077431
```

Não há senha. O app autentica automaticamente com este número (mock).

---

## 🎮 Roteiro da Demo (5-7 minutos)

### 1. Dashboard (1 min)
- Mostre áreas (Bolsa, Mente, Vitalidade, Propósito) com cards
- Streak counter animado
- Barras de progresso com gradiente
- Ações rápidas: Missões Especiais, Ranking, Inventário

**Toque**: "O dashboard mostra seu progresso em todas as áreas da vida."

### 2. Missões (1 min)
- Filtros: Todas, Ativas, Concluídas
- Buscar uma missão (ex: "Beber água")
- Mostrar detalhes: pontos, dificuldade, prazo
- Completar uma missão (botão)

**Toque**: "Complete missões diárias para ganhar pontos e manter streak."

### 3. Analytics (1 min)
- Gráfico de linha: pontos últimos 7 dias
- Gráfico de barras: pontos por área
- Streaks por área
- Botão "Compartilhar Progresso" (share sheet)
- Botão "Exportar Dados" (JSON)

**Toque**: "Analytics mostra sua evolução e permite exportar seus dados."

### 4. Social (1 min)
- Código de convite (exibir)
- Botão "Copiar Código"
- "Enviar Convite" via WhatsApp
- "Compartilhar Conquista" (ex: escolher uma badge)
- "Compartilhar Ranking"

**Toque**: "Compartilhe conquistas e convide amigos para ganhar bônus."

### 5. Coach (IA) (1 min)
- Digitar mensagem: "Me ajude a melhorar minha saúde"
- Mostrar resposta da IA com sugestão de missão
- Mostrar que a IA tem acesso aos dados do usuário (contexto)

**Toque**: "Nosso coach IA analisa seus dados e dá recomendações personalizadas."

### 6. Ranking (1 min)
- Aba Ranking: top 10 global
- Medalhas 🥇🥈🥉
- Posição do usuário destacada
- Alternar entre Geral, Semanal, Mensal

**Toque**: "Competição saudável com ranking global e semanal."

### 7. Perfil (1 min)
- Avatar, telefone, nível
- Estatísticas: pontos totais, streak total
- Conquistas desbloqueadas
- Menu: Conquistas, Inventário, Sincronizar Store

**Toque**: "Perfil completo com estatísticas e badges colecionáveis."

---

## 🎬 Dicas para uma Demo Fluida

- **Teste antes**: Rode a demo no seu dispositivo para garantir.
- **Backend acessível**: Se usar localhost, `--tunnel` evita problemas de rede.
- **Dados mockados**: Se o backend cair, o app mostra mensagem de erro amigável.
- **Aspect ratio**: Gire o dispositivo para landscape se precisar mostrar mais conteúdo.
- **Live camera**: Escaneie o QR code na hora para mostrar que é real.

---

## 🔄 Se Algo Der Errado

### Backend offline
- O app mostra "Erro ao carregar dados". Recarregue (pull-to-refresh).
- Login ainda funciona (mock).

### Expo Go não conecta
- Verifique se dispositivo e computador estão na mesma rede.
- Use `--tunnel` se estiverem em redes diferentes.
- Verifique firewall.

### App quebra/crash
- Veja logs no terminal do expo.
- Reinicie: `expo start -c`

---

## 📊 Checklist Pré-Demo

- [ ] Backend rodando e acessível
- [ ] `.env` configurado com `BACKEND_URL correto`
- [ ] `npx expo start` rodando (com tunnel se necessário)
- [ ] QR code visível no terminal ou browser
- [ ] Expo Go instalado no dispositivo de teste
- [ ] Telefone de teste memorizado: `+556286077431`
- [ ] Principais telas praticadas (dashboard, missions, analytics, social)

---

## 🏆 Pontos Fortes para Destacar

1. **Full offline-first**: check-ins funcionam sem internet, sincroniza depois.
2. **Design system bonito**: gradientes, animações nativas (Reanimated).
3. **IA integrada**: coach personalizado com contexto completo.
4. **Gamificação profunda**: streaks, achievements NFT, níveis.
5. **Social features**: convites, compartilhamento, ranking.
6. **Analytics**: exportação de dados, gráficos.
7. **Integração health**: HealthKit/Google Fit (mostrar se disponível).
8. **Build automatizado**: CI/CD com EAS, GitHub Actions.

---

**Boa demo! 🚀**
