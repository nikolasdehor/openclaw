// Microcopy do app Life Gamification
// Todas as strings em português brasileiro
// Futuramente pode ser convertido para i18n (ex: react-native-localize + i18next)

export const Copy = {
  // Common
  appName: 'Life Gamification',
  common: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Resumo das suas áreas de vida',
    level: (level: number) => `Nível ${level}`,
    totalPoints: (points: number) => `${points.toLocaleString('pt-BR')} pontos`,
    streak: (days: number) => `🔥 Streak: ${days} ${days === 1 ? 'dia' : 'dias'}`,
    emptyState: 'Nenhum dado disponível no momento',
    loading: 'Carregando...',
    recentAchievements: 'Conquistas Recentes',
    recommendations: 'Recomendações para Você',
    recSubtitle: 'Baseado no seu desempenho recente',
    startMission: 'Iniciar missão',
    noRecommendations: 'Nenhuma recomendação disponível no momento',
  },

  // Areas
  areas: {
    bolsa: {
      name: 'Bolsa',
      altName: 'Finanças',
      emoji: '💰',
    },
    mente: {
      name: 'Mente',
      altName: 'Aprendizado',
      emoji: '🧠',
    },
    vitalidade: {
      name: 'Vitalidade',
      altName: 'Saúde',
      emoji: '❤️',
    },
    proposito: {
      name: 'Propósito',
      altName: 'Crescimento',
      emoji: '✨',
    },
  },

  areaCard: {
    levelLabel: (level: number) => `LVL ${level}`,
    progress: (percent: number) => `${Math.round(percent * 100)}% completo`,
    points: (current: number, total: number) => `${current.toLocaleString('pt-BR')} / ${total.toLocaleString('pt-BR')} pontos`,
  },

  // Missions
  missions: {
    title: 'Missões',
    subtitle: 'Desafios diários e semanais',
    filters: {
      all: 'Todas',
      active: 'Ativas',
      completed: 'Concluídas',
    },
    emptyState: 'Nenhuma missão disponível no momento',
    offline: 'Você está offline. Missões carregadas localmente estão disponíveis.',
    pullToRefresh: 'Puxe para atualizar',
    completeButton: 'Completar missão',
    pointsLabel: (points: number) => `+${points} pontos`,
    difficulty: {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil',
    },
    dueLabel: (hoursOrDays: string) => `Expira em ${hoursOrDays}`,
    completed: '✓ Concluída',
    completedPoints: (points: number) => `+${points} ganhos`,
    locked: 'Bloqueada',
    confirmTitle: 'Concluir Missão',
    confirmMessage: (title: string) => `Você tem certeza que deseja marcar "${title}" como concluída?`,
    searchPlaceholder: 'Buscar missões...',
  },

  // Profile
  profile: {
    title: 'Perfil',
    subtitle: 'Seu progresso e estatísticas',
    greeting: (name: string) => `Olá, ${name}!`,
    totalPoints: (points: number) => `Total: ${points.toLocaleString('pt-BR')} pontos`,
    mainArea: (area: string) => `Área principal: ${area}`,
    streak: (days: number) => `Streak atual: ${days} ${days === 1 ? 'dia' : 'dias'}`,
    missionsCompleted: (count: number) => `Missões concluídas: ${count}`,
    achievements: (unlocked: number, total: number) => `Conquistas: ${unlocked}/${total}`,
    memberSince: (date: string) => `Membro desde: ${date}`,
    statsSection: 'Estatísticas',
    achievementsSection: 'Conquistas',
    settingsSection: 'Configurações',
    historySection: 'Histórico de Pontos',
    thisWeek: 'Esta semana',
    thisMonth: 'Este mês',
    noStats: 'Complete missões para ver estatísticas',
  },

  // Achievements
  achievements: {
    title: 'Conquistas',
    emptyState: 'Complete missões para desbloquear conquistas',
    lockedMessage: 'Desbloqueie esta conquista completando missões',
    unlockedMessage: 'Conquista desbloqueada!',
    badgeUnlocked: (value: string | number) => `${value}`,
  },

  // Onboarding
  onboarding: {
    slide1: {
      title: 'Vida em Games',
      description: 'Transforme sua vida em um jogo. Complete missões, ganhe pontos, suba de nível.',
      startButton: 'Começar',
      haveAccountButton: 'Já tenho conta',
    },
    slide2: {
      title: 'Quatro Pilares',
      bullet1: '✔ Bolsa (finanças)',
      bullet2: '✔ Mente (conhecimento)',
      bullet3: '✔ Vitalidade (saúde)',
      bullet4: '✔ Propósito (crescimento)',
      description: 'Cuide de todas para evoluir.',
      nextButton: 'Próximo',
    },
    slide3: {
      title: 'Missões Diárias',
      description1: '• Complete desafios todos os dias',
      description2: '• Ganhe pontos e mantenha sua streak',
      description3: '• Desbloqueie conquistas',
      button: 'Ver missões',
    },
    slide4: {
      title: 'Tudo pronto!',
      description: 'Sua jornada gamificada começa agora.',
      button: 'Vamos lá!',
    },
  },

  // Empty States
  emptyStates: {
    noMissions: {
      title: 'Nenhuma missão disponível',
      description: 'Volte mais tarde ou ajuste seus filtros.',
      button: 'Atualizar',
    },
    offline: {
      title: 'Você está offline',
      description: 'Missões carregadas localmente estão disponíveis. O check-in será sincronizado quando voltar online.',
      button: 'Tentar novamente',
    },
    error: {
      title: 'Ops! Algo deu errado',
      description: 'Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.',
      button: 'Tentar novamente',
    },
    noAchievements: {
      title: 'Nenhuma conquista ainda',
      description: 'Complete missões para desbloquear conquistas e badges especiais.',
      button: 'Ver missões',
    },
  },

  // Notifications (push)
  notifications: {
    missionReminder: (areaName: string) => `Sua missão de ${areaName} te espera!`,
    achievementUnlocked: (name: string) => `Parabéns! Conquista desbloqueada: ${name}`,
    streakAtRisk: (hours: number) => `Sua streak está em risco! Complete uma missão nas próximas ${hours}h.`,
    dailySummary: (points: number) => `Resumo diário: você ganhou ${points} pontos hoje!`,
  },

  // Settings
  settings: {
    title: 'Configurações',
    notifications: 'Notificações',
    sync: 'Sincronização',
    logout: 'Sair',
    language: 'Idioma',
    theme: 'Tema',
    version: 'Versão',
  },

  // Buttons
  buttons: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    back: 'Voltar',
    next: 'Próximo',
    skip: 'Pular',
    retry: 'Tentar novamente',
    close: 'Fechar',
  },

  // Feedback
  feedback: {
    missionCompleted: 'Missão completa! +{points} pontos',
    pointsEarned: (points: number) => `+${points} pontos`,
    streakExtended: (days: number) => `🔥 Streak estendida para ${days} dias!`,
    achievementUnlocked: 'Nova conquista desbloqueada!',
    syncSuccess: 'Dados sincronizados com sucesso',
    syncError: 'Erro ao sincronizar. Tente novamente.',
  },

  // Errors
  errors: {
    network: 'Sem conexão com a internet',
    server: 'Erro no servidor. Tente novamente mais tarde.',
    auth: 'Sessão expirada. Faça login novamente.',
    unknown: 'Ocorreu um erro inesperado.',
  },
};

export default Copy;
