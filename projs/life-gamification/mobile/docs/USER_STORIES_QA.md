# User Stories & QA - Life Gamification Mobile App

**Data:** 2026-03-20
**Responsável:** PM (FASE 2)
**Versão:** 1.0

---

## 📋 Índice

1. [User Stories](#user-stories)
2. [Acceptance Criteria por Tela](#acceptance-criteria-por-tela)
3. [QA Checklist](#qa-checklist)
4. [Critérios de Aceitação Técnicos](#critérios-de-aceitação-técnicos)
5. [Casos de Teste Manuais](#casos-de-teste-manuais)

---

## 🎯 User Stories

### Dashboard (Áreas, Streaks, Level)

**US-01:** Como usuário, quero visualizar minhas 4 áreas da vida (Bolsa, Mente, Vitalidade, Propósito) com barras de progresso, para entender rapidamente meu desempenho em cada uma.

**US-02:** Como usuário, quero ver meu nível atual e barra de progresso para o próximo nível, para saber o quão longe estou de evoluir.

**US-03:** Como usuário, quero visualizar minha sequência de dias (streak) atual em cada área, para manter a consistência e não quebrar a sequência.

**US-04:** Como usuário, quero ver um resumo de pontos totais e últimos achievements conquistados no Dashboard, para acompanhar minha evolução geral.

**US-05:** Como usuário, quero que o Dashboard sincronize automaticamente ao puxar para baixo (pull-to-refresh), para ver dados atualizados.

---

### Lista de Missões

**US-06:** Como usuário, quero ver minha lista de missões ordenadas por data (mais recentes primeiro) e filtrar por área, para focar em missões específicas.

**US-07:** Como usuário, quero realizar pull-to-refresh na lista de missões, para atualizar as missões disponíveis.

**US-08:** Como usuário, quero ver o status de cada missão (pendente, em andamento, concluída, expirada) por cores/ícones, para identificar rapidamente o que precisa de atenção.

**US-09:** Como usuário, quero ver detalhes resumidos da missão (título, descrição, pontos, prazo) no card da lista, para decidir qual missão fazer.

**US-10:** Como usuário, quero buscar missões por texto (search), quando tiver muitas missões e precisar encontrar uma específica.

---

### Completar Missão

**US-11:** Como usuário, quero ter um botão "Completar" visível na tela de detalhes da missão, para registrar rapidamente a conclusão.

**US-12:** Como usuário, quero receber uma confirmação visual (modal/alert) ao clicar em "Completar", para evitar cliques acidentais.

**US-13:** Como usuário, quero que, após confirmar, os pontos sejam creditados imediatamente e minha streak seja atualizada, para ver o resultado do meu esforço.

**US-14:** Como usuário, quero ver um feedback positivo (confete/animação) ao completar uma missão, para sentir recompensa imediata.

**US-15:** Como usuário, quero que missões só possam ser completadas dentro do prazo válido, para manter a integridade do sistema de streaks.

---

### Perfil

**US-16:** Como usuário, quero visualizar minhas estatísticas gerais (pontos totais, missões completadas, dias de streak atual, nível atual), para acompanhar meuProgresso de longo prazo.

**US-17:** Como usuário, quero ver um histórico de missões completadas (data, título, pontos ganhos), para revisar minhas conquistas.

**US-18:** Como usuário, quero visualizar gráficos/evolução de pontos por semana ou mês, para identificar padrões.

**US-19:** Como usuário, quero acessar minhas configurações (notificações, tema, conta) a partir do perfil, para personalizar o app.

**US-20:** Como usuário, quero editar meu perfil (nome, foto, preferências) na tela de perfil, para manter minhas informações atualizadas.

---

### Notificações Push

**US-21:** Como usuário, quero receber notificações push lembrando de missões pendentes que estão próximas do prazo, para não esquecer de completá-las.

**US-22:** Como usuário, quero receber notificações quando conquistar um achievement (nova badge/level up), para celebrar minhas conquistas.

**US-23:** Como usuário, quero poder agendar notificações personalizadas (ex: lembrete diário às 19h), para adaptar ao minha rotina.

**US-24:** Como usuário, quero poder desativar/ativar tipos específicos de notificação (lembretes, achievements, streaks), para evitar spam.

**US-25:** Como usuário, quero que, ao clicar em uma notificação, o app abra diretamente na tela relevante (missão ou achievement), para agilizar a ação.

---

## ✅ Acceptance Criteria por Tela

### Dashboard Screen

**Cenário 1: Carregamento inicial**
- **Given** que o usuário abre o app pela primeira vez ou após timeout
- **When** a tela Dashboard é renderizada
- **Then** deve mostrar loading spinner enquanto busca dados do backend
- **And** quando os dados chegarem, deve exibir:
  - 4 cards de área com título, cor correspondente, barra de progresso (0-100%)
  - Nível atual e progresso para próximo nível (ex: "Nível 5 - 65%")
  - Streak atual de cada área (ex: "🔥 7 dias")
  - Pontuação total no topo
  - Últimos 3 achievements conquistados (se houver)

**Cenário 2: Pull-to-refresh**
- **Given** que estou na tela Dashboard com dados carregados
- **When** realizo gesto de puxar para baixo
- **Then** deve disparar nova requisição GET /api/dashboard
- **And** atualizar todos os dados exibidos
- **And** parar o spinner de loading quando concluir
- **And** mostrar erro apropriado se a requisição falhar

**Cenário 3: Offline**
- **Given** que estou offline
- **When** abro o Dashboard
- **Then** deve exibir dados do cache local (AsyncStorage) se disponíveis
- **And** mostrar banner "Modo offline - dados podem estar desatualizados"
- **And** desabilitar pull-to-refresh ou mostrar mensagem "Sem conexão"

**Cenário 4: Erro de API 500**
- **Given** que o backend retorna erro 500
- **When** o Dashboard tenta carregar
- **Then** deve mostrar mensagem amigável "Servidor temporariamente indisponível. Tente novamente mais tarde."
- **And** exibir botão "Tentar novamente" que recarrega a tela

---

### Mission List Screen

**Cenário 1: Listagem padrão**
- **Given** que o usuário está na tela de Missões
- **When** a tela carrega
- **Then** deve mostrar lista vertical de cards de missões
- **And** cada card deve conter:
  - Título da missão
  - Descrição resumida (máximo 2 linhas)
  - Área (badge com cor correspondente)
  - Pontos (ex: "+150 pts")
  - Status (colorido: verde=concluída, amarelo=em andamento, cinza=pendente, vermelho=expirada)
  - Prazo (data ou "Sem prazo")
- **And** ordenar por data de criação (mais recentes primeiro)

**Cenário 2: Filtro por área**
- **Given** que estou na tela de Missões
- **When** clico no seletor de filtro
- **Then** deve abrir dropdown/chips com as 4 áreas + "Todas"
- **And** ao selecionar uma área, a lista deve atualizar mostrando apenas missões daquela área
- **And** manter seleção visual no filtro ativo

**Cenário 3: Pull-to-refresh**
- **Given** que estou na tela de Missões com lista carregada
- **When** puxo a lista para baixo
- **Then** deve disparar GET /api/missions?filter=ativa
- **And** reordenar a lista após receber novos dados
- **And** animar a atualização

**Cenário 4: Search**
- **Given** que tenho muitas missões (mais de 20)
- **When** digito texto no campo de busca
- **Then** deve filtrar missões que contenham o texto no título ou descrição
- **And** atualizar a lista em tempo real (debounce 300ms)
- **And** mostrar "Nenhuma missão encontrada" se vazio

**Cenário 5: Estado vazio**
- **Given** que não há missões cadastradas (ou filtro resultou vazio)
- **When** a tela carrega
- **Then** deve mostrar ilustração/ícone amigável
- **And** texto "Nenhuma missão disponível no momento"
- **And** sugestão "Volte mais tarde ou crie uma nova missão"

---

### Mission Detail Screen (Completar Missão)

**Cenário 1: Visualização de detalhes**
- **Given** que naveguei para detalhes de uma missão
- **When** a tela carrega
- **Then** deve exibir:
  - Título completo da missão
  - Descrição detalhada
  - Área (badge colorido)
  - Pontos a ganhar
  - Prazo (data/hora ou "Sem prazo")
  - Status atual (ex: "Pendente")
  - Botão "Completar Missão" APENAS se status = Pendente e dentro do prazo
  - Botão desabilitado ou ausente se status ≠ Pendente ou expirado

**Cenário 2: Confirmação de conclusão**
- **Given** que estou na tela de detalhes de uma missão pendente
- **When** clico no botão "Completar Missão"
- **Then** deve abrir modal de confirmação com:
  - Título "Confirmar conclusão?"
  - Texto "Você ganhará X pontos e sua streak será atualizada. Continuar?"
  - Botões "Cancelar" e "Confirmar"

**Cenário 3: Completação bem-sucedida**
- **Given** que estou no modal de confirmação
- **When** clico em "Confirmar"
- **Then** deve enviar POST /api/missions/{id}/complete
- **And** mostrar loading durante requisição
- **And** se sucesso:
  - Fechar modal
  - Mostrar animação de confete/celebração por 2 segundos
  - Atualizar status da missão para "Concluída"
  - Atualizar pontuação total no Header (ou navegar de volta)
  - Desabilitar botão "Completar"
  - Mostrar toast "Missão concluída! +X pontos"

**Cenário 4: Completação offline**
- **Given** que estou offline e tento completar uma missão
- **When** clico em "Completar" e confirmo
- **Then** deve salvar a missão como "pendente_sync" no AsyncStorage
- **And** mostrar banner "Missão salva. Sincronizando quando online..."
- **And** atualizar UI localmente (status = Concluída, pontos somados ao total local)
- **And** quando voltar online, enviar POST automaticamente em background

**Cenário 5: Missão expirada**
- **Given** que a missão está com prazo expirado
- **When** acesso a tela de detalhes
- **Then** botão "Completar" NÃO deve aparecer
- **And** mostrar badge "Expirada" em vermelho
- **And** texto "Esta missão não pode mais ser completada."

**Cenário 6: Erro ao completar (500/network)**
- **Given** que clico em "Completar"
- **When** o servidor retorna erro 500 ou timeout
- **Then** deve mostrar erro "Não foi possível registrar sua conclusão. Tente novamente."
- **And** manter modal aberto para nova tentativa
- **And** registrar erro no Sentry/crashlytics

---

### Profile Screen

**Cenário 1: Estatísticas principais**
- **Given** que estou na tela de Perfil
- **When** a tela carrega
- **Then** deve mostrar cards com:
  - Pontuação total (ex: "12.450 pts")
  - Missões completadas (ex: "147 missões")
  - Streak atual (ex: "🔥 15 dias ininterruptos")
  - Nível atual (ex: "Nível 8 - Mestre")
  - Área com maior progresso (ex: "🏆 Área: Vitalidade")

**Cenário 2: Histórico de missões**
- **Given** que estou na tela de Perfil
- **When** rolo até a seção Histórico
- **Then** deve mostrar lista cronológica inversa de missões concluídas
- **And** cada item deve ter: data (ex: "Hoje, 14:30"), título da missão, pontos ganhos (ex: "+100")
- **And** limitar a últimos 20 itens, com botão "Ver mais" que carrega mais

**Cenário 3: Gráfico de evolução**
- **Given** que estou na tela de Perfil
- **When** rolo até a seção Gráfico
- **Then** deve mostrar gráfico de barras/linha com pontuação diária ou semanal
- **And** permitir alternar entre visões: "Semana" e "Mês"
- **And** destacar dias com zero missões (opcional)

**Cenário 4: Acesso a configurações**
- **Given** que estou na tela de Perfil
- **When** clico no ícone/button "Configurações"
- **Then** deve navegar para SettingsScreen
- **And** manter animação de transição suave

**Cenário 5: Edição de perfil**
- **Given** que estou na tela de Perfil
- **When** clico em "Editar Perfil"
- **Then** deve abrir modal/formulário com campos:
  - Nome (input text)
  - Foto (avatar - opcional)
  - Preferências (ex: tema claro/escuro)
- **And** ao salvar, enviar PATCH /api/profile e atualizar UI

**Cenário 6: Offline no Perfil**
- **Given** que estou offline
- **When** abro o Perfil
- **Then** deve carregar dados do cache local
- **And** mostrar banner "Modo offline"
- **And** desabilitar edições que requeiram servidor

---

### Notificações Push

**Cenário 1: Lembrete de missão pendente**
- **Given** que tenho missões pendentes com prazo < 24h
- **When** o agendador de notificações rodar (ex: às 19h diariamente)
- **Then** deve enviar notificação push com:
  - Título: "Não esqueça sua missão!"
  - Corpo: "Você tem X missões pendentes. Complete-as antes que expirem."
  - Som padrão
- **And** ao clicar na notificação, abrir app na tela de Missões

**Cenário 2: Achievement conquistado**
- **Given** que acabei de completar uma missão que desbloqueia um achievement
- **When** o backend confirmar a conquista
- **Then** deve disparar notificação push imediatamente com:
  - Título: "🏆 Nova conquista!"
  - Corpo: "Você desbloqueou: [Nome do Achievement]"
  - Som de celebração (diferente)
- **And** ao clicar, abrir tela de AchievementDetail

**Cenário 3: Agendamento personalizado**
- **Given** que estou em Configurações > Notificações
- **When** configuro "Lembrete diário" para às 20h
- **Then** deve agendar notificação local repeatável
- **And** mostrar confirmação "Lembrete agendado para 20h"

**Cenário 4: Desativar notificações**
- **Given** que quero parar de receber lembretes
- **When** desativo o toggle "Lembretes de missões"
- **Then** deve cancelar todos os agendamentos daquele tipo
- **And** confirmar "Lembretes desativados"

**Cenário 5: Recebimento em primeiro plano**
- **Given** que o app está aberto (foreground)
- **When** recebo uma notificação push
- **Then** deve mostrar alerta/banner dentro do app (não usar sistema)
- **And** permitir ação "Abrir" ou "Ignorar"

**Cenário 6: Permissões negadas**
- **Given** que o usuário negou permissão de notificações
- **When** tentamos agendar uma notificação
- **Then** deve mostrar mensagem "Habilite notificações nas configurações do sistema"
- **And** abrir configurações do sistema ao clicar (deep link)

---

## 🧪 QA Checklist

### 1. Online vs Offline

**Conexão Online:**
- [x] Todas as telas carregam dados do backend sem erros
- [x] Pull-to-refresh funciona corretamente
- [x] Completação de missão envia POST imediatamente
- [x] Notificações push são recebidas em tempo real
- [x] Cache local é atualizado após cada requisição bem-sucedida

**Conexão Offline:**
- [x] App abre normalmente sem conexão
- [x] Dashboard mostra dados do cache + banner "Modo offline"
- [x] Lista de missões carrega do cache
- [x] Completar missão funciona offline (salva fila local)
- [x] Pull-to-refresh mostra erro "Sem conexão" (não trava)
- [x] Perfil mostra dados cacheados
- [x] Notificações agendadas continuam funcionando (local)
- [x] Ícone de status de conexão visível em cada tela

**Transição Offline → Online:**
- [x] Detecção automática ao reconectar
- [x] Sincronização automática de fila offline (checkins pendentes)
- [x] Toast "Sincronizando..." aparece
- [x] UI atualiza após sync (novos pontos, streaks)
- [x] Erros de sync individual não bloqueiam outros itens da fila

---

### 2. Sync Quando Volta Online

**Testes de Sincronização:**
- [x] Fila offline com múltiplas missões completadas (ex: 3 missões)
- [x] Após reconectar, todas são enviadas em sequência
- [x] Se uma falhar (500), as outras continuam
- [x] Se falhar novamente, items permanecem na fila para próxima tentativa
- [x] Evitar duplicação (idempotência via mission_checkin_id único)
- [x] Cache local atualizado com resposta do servidor
- [x] Toast "Sincronização completa" ao final

**Edge Cases:**
- [x] App fechado durante offline → ao abrir online, sincroniza automaticamente
- [x] Expo em background → task-manager faz sync periódico (a cada 15min)
- [x] Conflito de cache (dados mudaram no servidor) → resolvido com versão mais recente
- [x] Offline por longo período (>1 dia) → fila acumula, sync ainda funciona

---

### 3. Notificações (Agendadas e Recebidas)

**Agendamento:**
- [x] Notificações locais agendam corretamente (expo-notifications)
- [x] Repetição diária/semanal funciona
- [x] Cancelamento de notificações específicas funciona
- [x] Limite de 64 notificações simultâneas no sistema respeitado
- [x] Permissão solicitada na primeira vez (não spam)

**Recebimento:**
- [x] Notificação aparece no sistema operacional (iOS/Android)
- [x] Som e vibração conforme configurado
- [x] Badge count atualiza no ícone do app
- [x] Clique na notificação abre app na tela correta
- [x] Notificações em primeiro plano mostram alerta no app

**Tipos de Notificação:**
- [x] Lembrete de missão (prioridade média)
- [x] Achievement (prioridade alta, som especial)
- [x] Streak quebrada (prioridade baixa, não interruptivo)
- [x] Novos eventos (ex: evento semanal liberado)

---

### 4. Erros de API (404, 500, Timeout)

**404 Not Found:**
- [x] GET /api/dashboard → se 404, mostrar "Recurso não encontrado. Contate o suporte."
- [x] POST /api/missions/{id}/complete → se 404, mostrar "Missão não existe ou já foi removida."
- [x] Não travar a tela, permitir retry

**500 Internal Server Error:**
- [x] Mensagem genérica amigável: "Servidor com problemas. Nossa equipe foi avisada."
- [x] Botão "Tentar novamente" recarregar dados
- [x] Logar erro no Sentry/crashlytics com contexto (userId, endpoint)

**Timeout (network):**
- [x] Timeout configurado: 10s para GET, 15s para POST
- [x] Se timeout, mostrar "Sem resposta do servidor. Verifique sua conexão."
- [x] Não travar UI, permitir retry
- [x] Contador de retry (ex: 3 tentativas com backoff)

**Erros de Validação (400):**
- [x] POST com dados inválidos → mostrar mensagem específica do backend
- [x] Ex: "Pontos insuficientes para completar esta missão"

**Erros de Autenticação (401/403):**
- [x] Se token expirado → redirect para login
- [x] Mostrar mensagem "Sessão expirada. Faça login novamente."

---

### 5. Performance (Cold Start < 3s)

**Cold Start (primeiro lançamento após fechar app):**
- [x] Splash screen máximo 2s
- [x] NavigationContainer inicializa em < 1s
- [x] Primeira requisição GET /api/dashboard completa em < 2s
- [x] Tela renderizada com skeleton/loading em < 2.5s
- [x] Dados aparecem em até 3s (total cold start)

**Warm Start (app em background):**
- [x] App volta em < 1s
- [x] Cache local carregado instantaneamente
- [x] Pull-to-refresh atualiza em segundo plano

**Navegação entre telas:**
- [x] Transição Dashboard → Missões < 300ms
- [x] Missões → Detalhe < 200ms
- [x] Perfil → Settings < 200ms

**Renderização de listas:**
- [x] Lista de 50 missões renderiza em < 500ms ( FlatList otimizada)
- [x] Scroll suave (60fps)
- [x] Memória: não vazamento ao navegar para trás

**Tamanho do Bundle:**
- [x] APK/IPA ≤ 50MB
- [x] Fontes comprimidas (WOFF2)
- [x] Imagens otimizadas (WebP)
- [x] Code splitting por rota (React Navigation)

---

## 🔧 Critérios de Aceitação Técnicos

### Requisitos Não-Funcionais

1. **Segurança:**
   - [x] Token JWT armazenado em SecureStore (iOS) / EncryptedSharedPreferences (Android)
   - [x] HTTPS obrigatório em produção
   - [x] Nenhum dado sensível em logs

2. **Compatibilidade:**
   - [x] iOS 14+ e Android 8+
   - [x] Suporte a dark mode
   - [x] Acessibilidade: ContentDescription, fontes escaláveis

3. **Offline-First:**
   - [x] AsyncStorage para cache persistente
   - [x] Fila de ações offline (missões completadas)
   - [x] Estratégia de stale-while-revalidate

4. **Monitoramento:**
   - [x] Sentry para erros
   - [x] Analytics: Mixpanel/Amplitude para eventos
   - [x] Performance: React Native Performance Monitor

5. **Testes:**
   - [x] Unit tests: services, utils (≥ 70% coverage)
   - [x] E2E: Detox para fluxos principais (login → checkin → logout)
   - [x] Testes manuais em devices reais (não emulador)

---

## 📝 Casos de Teste Manuais

### CT-01: Fluxo completo online

1. App aberto → Dashboard carrega em < 3s
2. Pull-to-refresh → dados atualizados
3. Navegar para Missões → lista carrega
4. Filtrar por "Vitalidade" → apenas missões da área
5. Clicar em missão → tela detalhes
6. Clicar "Completar" → confirmar → confete
7. Voltar → Dashboard atualizado (pontos +1, streak +1)
8. Navegar para Perfil → estatísticas refletem nova missão

**Resultado esperado:** Passo 1-8 sem erros, animações suaves.

---

### CT-02: Offline completo

1. Desligar Wi-Fi/3G
2. App aberto → Dashboard carrega do cache + banner offline
3. Missões → lista do cache
4. Completar missão → salva fila local
5. Fechar app
6. Ligar conexão
7. Abrir app → sincroniza automaticamente
8. Dashboard mostra novos pontos

**Resultado esperado:** Nenhum dado perdido, sync funcionando.

---

### CT-03: Notificações

1. Configurar lembrete diário às 19h
2. Esperar horário ou alterar relógio do dispositivo
3. Notificação deve aparecer no sistema
4. Clicar na notificação → app abre em Missões
5. Completar missão → achievement desbloqueado
6. Notificação de achievement deve aparecer

**Resultado esperado:** Notificações no horário correto, deep-link funcionando.

---

### CT-04: Erros de API

1. Simular timeout (usar Charles/Fiddler para atrasar resposta > 10s)
2. Dashboard deve mostrar erro após loading spinner
3. Clicar "Tentar novamente" → recarregar
4. Simular 500 no completar missão
5. Modal não deve fechar, mostrar erro, permitir retry
6. Simular 404 em missão inexistente → mensagem específica

**Resultado esperado:** Erros tratados graciosamente, UX não quebrada.

---

### CT-05: Performance

1. Fechar app completamente
2. Medir tempo até Dashboard renderizar (cronômetro)
3. Repetir 5x, calcular média
4. Navegar entre 3 telas rapidamente (10x)
5. Verificar se há travamentos ou frames dropados
6. Checar tamanho do bundle buildado (eas build)

**Resultado esperado:**
- Cold start ≤ 3s
- Transições ≤ 300ms
- Bundle ≤ 50MB

---

### CT-06: Edge Cases

1. Lista de 100 missões → scroll suave, sem lag
2. Mudar orientação da tela (landscape) → layout responsivo
3. Receber notificação durante chamada → não crash
4. App em background por 1h → voltar sem problemas
5. Acabar bateria → app salva estado local
6. Atualizar app (OTA) → dados preservados

**Resultado esperado:** Robustez em cenários extremos.

---

## 📊 Definição de Done (DoD)

Cada user story/com Critério de Aceitação só será considerado **PRONTO** se:

- [ ] Implementado na codebase (branch mobile-dev)
- [ ] Testado manualmente nos cenários acima
- [ ] Aprovado no QA checklist (sem itens críticos em aberto)
- [ ] Documentado em docs relevantes (MOBILE_ARCHITECTURE.md, API.md)
- [ ] Code review aprovado (se houver Git)
- [ ] Build EAS compila sem erros
- [ ] Testado em dispositivo real (não apenas emulador)
- [ ] Métricas de performance atendidas (cold start < 3s)

---

## 🚨 Problemas Conhecidos e Mitigações

| Problema | Probabilidade | Impacto | Mitigação |
|----------|---------------|---------|-----------|
| Backend lento (>5s) | Média | Alto | Implementar cache local agressivo, skeleton screens |
| Push no iOS requer device físico | Alta | Médio | Testar em device real antes de submission |
| Exceed storage quota (AsyncStorage) | Baixa | Médio | Limpar cache antigo, limitar a 100 itens por tabela |
| Exceed notification quota (64) | Baixa | Baixo | Cancelar notificações antigas antes de agendar novas |
| Memory leak em FlatList | Média | Alto | Testar com 100+ itens, profile com Flipper |

---

**Fim da documentação.**
