#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Seed inicial do banco de dados com missões padrão
Execute: python seed.py
"""

import sqlite3
from pathlib import Path

DB_PATH = "data/gamification.db"

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def seed_missions():
    """Insere missões padrão para todas as áreas"""
    conn = connect()
    cur = conn.cursor()

    # Busca IDs das áreas
    cur.execute("SELECT id, name FROM areas")
    areas = {row["name"]: row["id"] for row in cur.fetchall()}

    missions = [
        # Saúde
        ("Caminhada de 10 min", "Caminhe ao ar livre por pelo menos 10 minutos", areas["saude"], "daily", 50, "easy"),
        ("Beber 2L de água", "Beba pelo menos 2 litros de água hoje", areas["saude"], "daily", 50, "easy"),
        ("Alongamento matinal", "Faça 10 minutos de alongamento ao acordar", areas["saude"], "daily", 30, "easy"),
        ("Treino de força", "Complete uma sessão de exercícios de força", areas["saude"], "weekly", 150, "medium"),
        ("Dormir 8h", "Durma pelo menos 8 horas hoje à noite", areas["saude"], "daily", 60, "medium"),

        # Foco
        ("Pomodoro de 25 min", "Use a técnica Pomodoro por 25 minutos focados", areas["foco"], "daily", 80, "medium"),
        ("Planejamento diário", "Planeje suas 3 principais tarefas do dia", areas["foco"], "daily", 40, "easy"),
        ("Digital detox 1h", "Fique 1 hora sem redes sociais", areas["foco"], "daily", 50, "medium"),
        ("Reunião de 30 min", "Agende e participe de uma reunião produtiva", areas["foco"], "weekly", 100, "medium"),
        ("Bloquear distrações", "Desative notificações por 2 horas", areas["foco"], "daily", 60, "easy"),

        # Aprendizado
        ("Ler 20 páginas", "Leia 20 páginas de qualquer livro hoje", areas["aprendizado"], "daily", 70, "easy"),
        ("Curso online 30min", "Assista 30 minutos de um curso online", areas["aprendizado"], "daily", 80, "medium"),
        ("Anotar insights", "Escreva 3 insights que aprendeu hoje", areas["aprendizado"], "daily", 40, "easy"),
        ("Aprender novo skill", "Pratique uma nova habilidade por 20 minutos", areas["aprendizado"], "weekly", 150, "medium"),
        ("Ler notícias", "Leia 5 artigos sobre tecnologia/mercado", areas["aprendizado"], "daily", 50, "easy"),

        # Finanças
        ("Registrar gastos", "Cadastre todos os gastos do dia na planilha", areas["financas"], "daily", 60, "easy"),
        ("Análise semanal", "Analise seus gastos da semana atual", areas["financas"], "weekly", 100, "medium"),
        ("Investir 5%", "Auste 5% da sua renda para investimentos", areas["financas"], "weekly", 150, "hard"),
        ("Negociar dívida", "Negocie uma dívida ou taxa", areas["financas"], "monthly", 200, "hard"),
        ("Orçamento mensal", "Revise ou crie seu orçamento do mês", areas["financas"], "monthly", 120, "medium"),
    ]

    for title, desc, area_id, mtype, points, diff in missions:
        cur.execute("""
            INSERT OR IGNORE INTO missions (title, description, area_id, mission_type, points_base, difficulty)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (title, desc, area_id, mtype, points, diff))

    conn.commit()
    print(f"✅ Inseridas {len(missions)} missões")

    conn.close()

def seed_items():
    """Insere itens colecionáveis e perks"""
    conn = connect()
    cur = conn.cursor()

    items = [
        # Badges NFT (mock - icons únicos)
        ("Badge 7 Dias de Streak", "NFT badge por manter 7 dias consecutivos", "🔥", "badge", "rare"),
        ("Badge 30 Dias de Streak", "NFT badge lendário por 30 dias consecutivos", "💎", "badge", "epic"),
        ("Badge 90 Dias de Streak", "NFT badge lendário ultimate por 90 dias", "👑", "badge", "legendary"),
        ("Badge Mestre da Saúde", "NFT badge por dominar a área de saúde", "💪", "badge", "epic"),
        ("Badge Mestre do Foco", "NFT badge por dominar a área de foco", "🎯", "badge", "epic"),
        ("Badge Mestre do Aprendizado", "NFT badge por dominar aprendizado", "📚", "badge", "epic"),
        ("Badge Mestre das Finanças", "NFT badge por dominar finanças", "💰", "badge", "epic"),

        # Perks (boost temporário)
        ("Boost de Pontos +50%", "Aumenta pontos ganhos em 50% por 24h", "⚡", "perk", "rare"),
        ("Streak Protector", "Protege seu streak se perder um dia (consumível)", "🛡️", "perk", "rare"),
        ("Missão Extra Diária", "Desbloqueia uma missão extra hoje", "➕", "perk", "common"),

        # Cosméticos
        ("Título: Ninja da Produtividade", "Título exclusivo no perfil", "🥷", "cosmetic", "epic"),
        ("Emoji Exclusivo: 🦄", "Emoji raro para usar no app", "🦄", "cosmetic", "legendary"),
        ("Frame de Perfil Dourado", "Borda dourada no avatar", "✨", "cosmetic", "epic"),
    ]

    for name, desc, icon, type_, rarity in items:
        cur.execute("""
            INSERT OR IGNORE INTO items (name, description, icon, type, rarity, metadata_json)
            VALUES (?, ?, ?, ?, ?, '{}')
        """, (name, desc, icon, type_, rarity))

    conn.commit()
    print(f"✅ Inseridos {len(items)} itens")
    conn.close()

def seed_cron_jobs():
    """Cria cron jobs de exemplo (integra com sistema existente)"""
    conn = connect()
    cur = conn.cursor()

    cron_jobs = [
        ("Health Checkin", "openclaw health check", "0 8 * * *", "saude"),
        ("Prayer Time", "/usr/bin/notify-send 'Hora da oração'", "0 9,12,18 * * *", "foco"),
        ("Finance Import", "python ~/scripts/import_finances.py", "0 22 * * *", "financas"),
        ("Learning Reminder", "openclaw notify 'Hora do estudo'", "30 19 * * 1-5", "aprendizado"),
    ]

    for name, command, schedule, area_name in cron_jobs:
        cur.execute("SELECT id FROM areas WHERE name = ?", (area_name,))
        area_id = cur.fetchone()["id"]
        cur.execute("""
            INSERT OR IGNORE INTO cron_jobs (name, command, schedule, area_id, enabled)
            VALUES (?, ?, ?, ?, 1)
        """, (name, command, schedule, area_id))

    conn.commit()
    print(f"✅ Inseridos {len(cron_jobs)} cron jobs")

    conn.close()

def seed_streak_rewards():
    """Cria recompensas automáticas por streak longo"""
    conn = connect()
    cur = conn.cursor()

    # Busca IDs das áreas e dos itens
    cur.execute("SELECT id, name FROM areas")
    areas = {row["name"]: row["id"] for row in cur.fetchall()}

    cur.execute("SELECT id, name FROM items WHERE type='badge'")
    badges = {row["name"]: row["id"] for row in cur.fetchall()}

    rewards = [
        # Streak 7 dias: badge + pontos
        (7, None, "🔥", 500, badges.get("Badge 7 Dias de Streak")),
        (7, areas["saude"], "🧘‍♂️", 200, None),
        (7, areas["foco"], "🎯", 200, None),
        (7, areas["aprendizado"], "📖", 200, None),
        (7, areas["financas"], "💳", 200, None),

        # Streak 30 dias: badge épico + perk
        (30, None, "💎", 2000, badges.get("Badge 30 Dias de Streak")),
        (30, None, None, 0, badges.get("Boost de Pontos +50%")),

        # Streak 90 dias: badge lendário + item cosmético
        (90, None, "👑", 10000, badges.get("Badge 90 Dias de Streak")),
        (90, None, None, 0, badges.get("Emoji Exclusivo: 🦄")),
    ]

    for days, area_id, badge_icon, points_bonus, item_id in rewards:
        # Se area_id é nulo, é recompensa geral (todos as áreas)
        area = area_id if area_id else None
        cur.execute("""
            INSERT OR IGNORE INTO streak_rewards (days_required, area_id, badge_icon, points_bonus, item_id)
            VALUES (?, ?, ?, ?, ?)
        """, (days, area, badge_icon, points_bonus, item_id))

    conn.commit()
    print(f"✅ Inseridas {len(rewards)} recompensas de streak")
    conn.close()

def seed_special_missions():
    """Cria missões especiais (meta-game)"""
    conn = connect()
    cur = conn.cursor()

    # Busca IDs das áreas
    cur.execute("SELECT id, name FROM areas")
    areas = {row["name"]: row["id"] for row in cur.fetchall()}

    # Busca itens
    cur.execute("SELECT id, name FROM items")
    items = {row["name"]: row["id"] for row in cur.fetchall()}

    special_missions = [
        {
            "title": "Mestre das 4 Áreas",
            "desc": "Complete um total de 100 missões distribuídas igualmente entre as 4 áreas da vida",
            "area_id": None,
            "requirements": {"total_missions_per_area": 25, "min_level": 5},
            "points": 1000,
            "item": items.get("Título: Ninja da Produtividade")
        },
        {
            "title": "Lenda do Streak",
            "desc": "Mantenha streak de 30 dias em TODAS as 4 áreas simultaneamente",
            "area_id": None,
            "requirements": {"min_streak_all_areas": 30},
            "points": 5000,
            "item": items.get("Badge Lenda do Streak")  # Criaremos depois
        },
        {
            "title": "Colecionador de Badges",
            "desc": "Desbloqueie 10 achievements diferentes",
            "area_id": None,
            "requirements": {"achievements_count": 10},
            "points": 500,
            "item": None
        },
        {
            "title": "Milhão de Pontos",
            "desc": "Alcance 1.000.000 de pontos totais",
            "area_id": None,
            "requirements": {"total_points": 1000000},
            "points": 2000,
            "item": items.get("Frame de Perfil Dourado")
        },
        {
            "title": "Mestre da Saúde",
            "desc": "Complete 50 missões de saúde com streak ativo de pelo menos 7 dias",
            "area_id": areas["saude"],
            "requirements": {"min_missions": 50, "min_streak": 7},
            "points": 800,
            "item": items.get("Badge Mestre da Saúde")
        },
        {
            "title": "Investidor Iniciante",
            "desc": "Complete 10 missões de finanças",
            "area_id": areas["financas"],
            "requirements": {"min_missions": 10},
            "points": 300,
            "item": items.get("Boost de Pontos +50%")
        },
    ]

    import json
    for sm in special_missions:
        req_json = json.dumps(sm["requirements"])
        cur.execute("""
            INSERT OR IGNORE INTO special_missions (title, description, area_id, requirements_json, reward_points, reward_item_id, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (sm["title"], sm["desc"], sm["area_id"], req_json, sm["points"], sm["item"]))

    conn.commit()
    print(f"✅ Inseridas {len(special_missions)} missões especiais")
    conn.close()

def seed_nft_achievements():
    """Atualiza achievements existentes com NFT metadata"""
    conn = connect()
    cur = conn.cursor()

    # Atualiza achievements existentes com NFTs mock
    nft_updates = [
        ("Primeiro Passo", "contract_step_achievements", 1),
        ("7 dias de Foco", "contract_step_achievements", 7),
        ("Maratonista de Aprendizado", "contract_learning_badges", 100),
        ("Primeiro Milhão", "contract_millionaire", 1000000),
        ("Mestre da Saúde", "contract_health_masters", 100),
    ]

    for name, contract, token_id in nft_updates:
        cur.execute("""
            UPDATE achievements
            SET nft_contract = ?, token_id = ?
            WHERE name = ?
        """, (contract, token_id, name))

    conn.commit()
    print(f"✅ Atualizados {len(nft_updates)} achievements com NFT metadata")
    conn.close()

def init_db():
    """Executa schema.sql"""
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        conn = connect()
        try:
            conn.executescript(f.read())
            conn.commit()
            print("✅ Schema inicializado")
        finally:
            conn.close()

if __name__ == "__main__":
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    init_db()
    seed_missions()
    seed_cron_jobs()
    seed_items()
    seed_streak_rewards()
    seed_special_missions()
    seed_nft_achievements()
    print("🎉 Seed completo!")
