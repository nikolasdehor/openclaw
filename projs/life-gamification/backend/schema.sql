-- Banco de dados SQLite para Life Gamification System
-- Estrutura core com suporte a areas, missoes, achievements e logs

-- Tabela de areas
CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert inicial das 4 areas principais
INSERT OR IGNORE INTO areas (name, description, icon, color) VALUES
('saude', 'Saúde física e mental', '🏃', '#4CAF50'),
('foco', 'Foco e produtividade', '🎯', '#2196F3'),
('aprendizado', 'Aprendizado e crescimento', '📚', '#FF9800'),
('financas', 'Finanças e wealth building', '💰', '#9C27B0');

-- Tabela de missoes
CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    area_id INTEGER NOT NULL,
    mission_type TEXT NOT NULL CHECK(mission_type IN ('daily', 'weekly', 'custom')),
    points_base INTEGER NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
    target_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

-- Tabela de achievements
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT,
    area_id INTEGER, -- NULL para achievements gerais
    condition_type TEXT NOT NULL, -- 'streak_days', 'total_points', 'missions_count', 'milestone_value'
    condition_value INTEGER NOT NULL, -- valor necessário
    points_reward INTEGER DEFAULT 0,
    nft_contract TEXT DEFAULT NULL, -- contrato NFT (mock: usa imagem única)
    token_id INTEGER DEFAULT NULL, -- token ID único para NFT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- Insert inicial de achievements padrão
INSERT OR IGNORE INTO achievements (name, description, icon, area_id, condition_type, condition_value, points_reward) VALUES
('Primeiro Passo', 'Complete sua primeira missão', '🌱', NULL, 'missions_count', 1, 50),
('7 dias de Foco', 'Mantenha streak de 7 dias em qualquer área', '🔥', NULL, 'streak_days', 7, 100),
('Maratonista de Aprendizado', 'Complete 50 missões de aprendizado', '📚', (SELECT id FROM areas WHERE name='aprendizado'), 'missions_count', 50, 200),
('Primeiro Milhão', 'Acumule 1.000.000 de pontos', '💎', NULL, 'total_points', 1000000, 1000),
('Mestre da Saúde', 'Complete 100 missões de saúde', '💪', (SELECT id FROM areas WHERE name='saude'), 'missions_count', 100, 200);

-- Tabela de usuarios (simplificada para MVP)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL, -- WhatsApp para notificações
    name TEXT,
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de hábitos e missões
CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mission_id INTEGER NOT NULL,
    completion_date DATE NOT NULL,
    points_earned INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    UNIQUE(user_id, mission_id, completion_date)
);

-- Tabela de streaks por usuário e área
CREATE TABLE IF NOT EXISTS user_streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    area_id INTEGER NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completion DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
    UNIQUE(user_id, area_id)
);

-- Tabela de achievements desbloqueados
CREATE TABLE IF NOT EXISTS unlocked_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- Tabela de cron jobs (integração com sistema existente)
CREATE TABLE IF NOT EXISTS cron_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    command TEXT NOT NULL,
    schedule TEXT NOT NULL, -- cron expression
    area_id INTEGER NOT NULL,
    enabled BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

-- Tabela de recompensas por streak longo
CREATE TABLE IF NOT EXISTS streak_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    days_required INTEGER NOT NULL, -- 7, 30, 90
    area_id INTEGER, -- NULL para recompensas gerais
    badge_icon TEXT NOT NULL,
    points_bonus INTEGER DEFAULT 0,
    item_id INTEGER DEFAULT NULL, -- desbloqueia item (se houver)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
    UNIQUE(days_required, area_id)
);

-- Tabela de itens (colecionáveis, badges, perks)
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('badge', 'perk', 'cosmetic', 'boost')),
    rarity TEXT DEFAULT 'common' CHECK(rarity IN ('common', 'rare', 'epic', 'legendary')),
    metadata_json TEXT DEFAULT '{}', -- JSON com dados extras (ex: boost multiplier, discount, etc)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de missões especiais (meta-game)
CREATE TABLE IF NOT EXISTS special_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    area_id INTEGER, -- NULL para missões gerais
    requirements_json TEXT NOT NULL, -- JSON com condições (ex: {"min_streak": 7, "required_achievements": [1,2,3]})
    reward_points INTEGER DEFAULT 0,
    reward_item_id INTEGER DEFAULT NULL,
    is_active BOOLEAN DEFAULT 1,
    starts_at DATE DEFAULT NULL,
    expires_at DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (reward_item_id) REFERENCES items(id) ON DELETE SET NULL
);

-- Tabela de relacionamento usuário-missão especial (progresso)
CREATE TABLE IF NOT EXISTS user_special_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    special_mission_id INTEGER NOT NULL,
    progress_json TEXT DEFAULT '{}', -- JSON com progresso parcial (ex: {"count": 3, "target": 5})
    completed_at TIMESTAMP NULL,
    claimed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (special_mission_id) REFERENCES special_missions(id) ON DELETE CASCADE,
    UNIQUE(user_id, special_mission_id)
);

-- Tabela de inventário do usuário
CREATE TABLE IF NOT EXISTS user_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL, -- para itens consumíveis
    metadata_json TEXT DEFAULT '{}', -- dados específicos (ex: boost activation date)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE(user_id, item_id)
);

-- Tabela de históricos de recompensas de streak (audit trail)
CREATE TABLE IF NOT EXISTS streak_reward_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    streak_reward_id INTEGER NOT NULL,
    area_id INTEGER NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (streak_reward_id) REFERENCES streak_rewards(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
    UNIQUE(user_id, streak_reward_id, area_id)
);

-- Tabela de integração com stores (achievements sync)
CREATE TABLE IF NOT EXISTS store_achievements_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    store_type TEXT NOT NULL CHECK(store_type IN ('apple', 'google')), -- Game Center / Play Games
    store_achievement_id TEXT NOT NULL, -- ID externo da store
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, store_type, store_achievement_id)
);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_streak_rewards_area_days ON streak_rewards(area_id, days_required);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_special_missions_active ON special_missions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_special_missions_user ON user_special_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_store_sync_user_store ON store_achievements_sync(user_id, store_type);
-- Tabela de logs do chat da IA (AI Coach)
CREATE TABLE IF NOT EXISTS ai_chat_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    metadata_json TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_user ON ai_chat_logs(user_id, timestamp);
