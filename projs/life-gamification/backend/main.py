# -*- coding: utf-8 -*-
"""
Backend FastAPI para Life Gamification System
Stack: Python 3.14, FastAPI, SQLite
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import sqlite3
import json
import os

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
import httpx
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configurações
DB_PATH = os.getenv("DB_PATH", "data/gamification.db")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Garante que o diretório do banco existe
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

# FastAPI app
app = FastAPI(
    title="Life Gamification API",
    description="Sistema de gamificação para vida + IA",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== DATABASE ==========

def get_db() -> sqlite3.Connection:
    """Conexão thread-safe com SQLite"""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    """Inicializa banco com schema se não existir"""
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = get_db()
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()

# Inicializa na startup
@app.on_event("startup")
def startup_event() -> None:
    init_db()

# ========== MODELS ==========

class MissionCompleteRequest(BaseModel):
    """Request para completar missão"""
    user_phone: str = Field(..., description="WhatsApp do usuário")
    mission_id: int = Field(..., description="ID da missão")
    notes: Optional[str] = Field(None, description="Notas adicionais")

class MissionResponse(BaseModel):
    """Response de missão"""
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: Optional[str]
    area_id: int
    area_name: str
    mission_type: str
    points_base: int
    difficulty: Optional[str]
    target_count: int

class UserStats(BaseModel):
    """Stats do usuário"""
    level: int
    total_points: int
    area_scores: Dict[str, int]
    streaks: Dict[str, int]
    unlocked_achievements: List[Dict[str, Any]]

class DashboardResponse(BaseModel):
    """Response do dashboard"""
    user: UserStats
    recent_missions: List[Dict[str, Any]]
    available_missions: List[MissionResponse]
    next_achievements: List[Dict[str, Any]]

class AIRecommendRequest(BaseModel):
    """Request para recomendação de IA"""
    user_phone: str
    limit: int = 3

class AIRecommendResponse(BaseModel):
    """Response de recomendação da IA"""
    recommendations: List[Dict[str, Any]]
    reasoning: str
    confidence: float

class AchievementUnlocked(BaseModel):
    """Achievement desbloqueado"""
    id: int
    name: str
    description: str
    icon: str
    points_reward: int

# ========== AI COACH MODELS ==========

class ChatMessage(BaseModel):
    """Mensagem do chat"""
    id: Optional[str] = None
    role: str  # 'user' | 'assistant' | 'system'
    content: str
    timestamp: int
    metadata: Optional[Dict[str, Any]] = None

class ActiveMission(BaseModel):
    """Missão ativa do usuário"""
    id: int
    title: str
    description: str
    area: str
    progress: str  # JSON string
    due_date: str
    points_award: int

class HealthData(BaseModel):
    """Dados de saúde (HealthKit/Google Fit)"""
    steps_today: int
    steps_goal: int
    sleep_last_night: Optional[float] = None
    sleep_goal: Optional[float] = None
    heart_rate_avg: Optional[float] = None
    water_intake: Optional[float] = None
    water_goal: Optional[float] = None

class PerformanceMetrics(BaseModel):
    """Métricas de performance"""
    avg_daily_points_7d: float
    completion_rate_7d: float
    favorite_area: str
    engagement_score: float

class UserDataSnapshot(BaseModel):
    """Snapshot completo de dados do usuário para contexto da IA"""
    phone: str
    name: Optional[str] = None
    level: int
    points: int
    active_missions: List[ActiveMission]
    completed_missions_today: int
    missions_completed_this_week: int
    current_streak: int
    longest_streak: int
    streak_area: Optional[str] = None
    health: Optional[HealthData] = None
    performance: Optional[PerformanceMetrics] = None

class PlanMission(BaseModel):
    """Missão em um plano gerado"""
    mission_id: int
    title: str
    area: str
    reason: str
    estimated_difficulty: str

class DailyPlan(BaseModel):
    """Plano diário"""
    date: str
    missions: List[PlanMission]
    goals: Dict[str, Optional[int]]
    tips: List[str]

class WeeklyPlan(BaseModel):
    """Plano semanal"""
    week_start: str
    daily_plans: List[DailyPlan]
    overall_focus: str
    encouragement: str

class MoodPrediction(BaseModel):
    """Predição de humor/performance"""
    predicted_mood: str
    confidence: float
    factors: List[str]
    recommendation: str

class AIChatRequest(BaseModel):
    """Request para chat com IA"""
    user_phone: str
    message: str
    history: List[ChatMessage]
    user_data_snapshot: Optional[UserDataSnapshot] = None

class AIChatResponse(BaseModel):
    """Response do chat"""
    response: str
    metadata: Optional[Dict[str, Any]] = None

class SaveChatHistoryRequest(BaseModel):
    """Request para salvar histórico"""
    user_phone: str
    messages: List[ChatMessage]

class AIPlanRequest(BaseModel):
    """Request para gerar plano"""
    user_phone: str
    user_data_snapshot: UserDataSnapshot
    plan_type: str  # 'daily' | 'weekly'
    preferences: Optional[Dict[str, Any]] = None

class ProactiveSuggestion(BaseModel):
    """Sugestão proativa para notificação"""
    type: str  # 'mission_suggestion' | 'encouragement' | 'warning'
    message: str
    suggested_mission_id: Optional[int] = None
    priority: str  # 'low' | 'medium' | 'high'

# ========== CORE LOGIC ==========

def calculate_level(points: int) -> int:
    """Calcula nível baseado em pontos totais"""
    # Fórmula simples: level = floor(sqrt(points / 100))
    import math
    return max(1, int(math.sqrt(points / 100)))

def get_or_create_user(conn: sqlite3.Connection, phone: str, name: Optional[str] = None) -> sqlite3.Row:
    """Obtém ou cria usuário por telefone"""
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE phone = ?", (phone,))
    user = cur.fetchone()

    if not user:
        cur.execute(
            "INSERT INTO users (phone, name, level, total_points) VALUES (?, ?, 1, 0)",
            (phone, name or f"User {phone[-4:]}")
        )
        conn.commit()
        cur.execute("SELECT * FROM users WHERE phone = ?", (phone,))
        user = cur.fetchone()

    return user

def update_streaks(
    conn: sqlite3.Connection,
    user_id: int,
    area_id: int,
    completion_date: date
) -> Tuple[int, int]:
    """
    Atualiza streak de usuário por área
    Retorna: (current_streak, longest_streak)
    """
    cur = conn.cursor()

    # Busca streak atual
    cur.execute("""
        SELECT current_streak, longest_streak, last_completion
        FROM user_streaks WHERE user_id = ? AND area_id = ?
    """, (user_id, area_id))
    row = cur.fetchone()

    if not row:
        # Primeiro completion
        cur.execute("""
            INSERT INTO user_streaks (user_id, area_id, current_streak, longest_streak, last_completion)
            VALUES (?, ?, 1, 1, ?)
        """, (user_id, area_id, completion_date))
        conn.commit()
        return 1, 1

    current, longest, last = row
    last_date = date.fromisoformat(last) if last else None

    if last_date == completion_date - timedelta(days=1):
        # Streak continua
        current += 1
    elif last_date != completion_date:
        # Streak quebrada, reseta
        current = 1
    else:
        # Mesmo dia (duplicate completion), não altera
        return current, longest

    longest = max(longest, current)

    cur.execute("""
        UPDATE user_streaks
        SET current_streak = ?, longest_streak = ?, last_completion = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND area_id = ?
    """, (current, longest, completion_date, user_id, area_id))
    conn.commit()

    return current, longest

def check_achievements(
    conn: sqlite3.Connection,
    user_id: int,
    mission_points: int,
    area_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """Verifica e desbloqueia achievements"""
    cur = conn.cursor()
    unlocked = []

    # Busca stats atuais
    cur.execute("SELECT total_points, level FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()

    # Busca achievements que ainda não foram desbloqueados
    cur.execute("""
        SELECT a.* FROM achievements a
        LEFT JOIN unlocked_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        WHERE ua.id IS NULL
    """, (user_id,))
    potential = cur.fetchall()

    for ach in potential:
        condition_type = ach["condition_type"]
        condition_value = ach["condition_value"]

        unlocked_this_time = False

        if condition_type == "missions_count":
            # Conta missões na área específica ou geral
            if ach["area_id"]:
                cur.execute("""
                    SELECT COUNT(*) as count FROM habit_logs hl
                    JOIN missions m ON hl.mission_id = m.id
                    WHERE hl.user_id = ? AND m.area_id = ?
                """, (user_id, ach["area_id"]))
            else:
                cur.execute("SELECT COUNT(*) as count FROM habit_logs WHERE user_id = ?", (user_id,))
            count = cur.fetchone()["count"]
            if count >= condition_value:
                unlocked_this_time = True

        elif condition_type == "streak_days":
            if ach["area_id"]:
                cur.execute("""
                    SELECT current_streak FROM user_streaks
                    WHERE user_id = ? AND area_id = ?
                """, (user_id, ach["area_id"]))
                row = cur.fetchone()
                if row and row["current_streak"] >= condition_value:
                    unlocked_this_time = True
            else:
                # Melhor streak entre todas as áreas
                cur.execute("SELECT MAX(current_streak) as max_streak FROM user_streaks WHERE user_id = ?", (user_id,))
                row = cur.fetchone()
                if row and row["max_streak"] and row["max_streak"] >= condition_value:
                    unlocked_this_time = True

        elif condition_type == "total_points":
            if user["total_points"] >= condition_value:
                unlocked_this_time = True

        elif condition_type == "milestone_value" and area_id:
            # Para achievements específicos de área (ex:_primeiro_milhao_financas)
            cur.execute("""
                SELECT SUM(hl.points_earned) as area_points FROM habit_logs hl
                JOIN missions m ON hl.mission_id = m.id
                WHERE hl.user_id = ? AND m.area_id = ?
            """, (user_id, area_id))
            row = cur.fetchone()
            area_points = row["area_points"] or 0
            if area_points >= condition_value:
                unlocked_this_time = True

        if unlocked_this_time:
            cur.execute("""
                INSERT INTO unlocked_achievements (user_id, achievement_id)
                VALUES (?, ?)
            """, (user_id, ach["id"]))
            unlocked.append({
                "id": ach["id"],
                "name": ach["name"],
                "description": ach["description"],
                "icon": ach["icon"],
                "points_reward": ach["points_reward"]
            })

    if unlocked:
        conn.commit()

    return unlocked

# ========== ENDPOINTS ==========

class QuickMissionRequest(BaseModel):
    """Request para crear e completar missão custom (IA)"""
    user_phone: str
    title: str
    description: str
    area_name: str  # saud, foco,aprendizado, financas
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    notes: Optional[str] = None

class QuickMissionResponse(BaseModel):
    """Response de missão quick"""
    success: bool
    points_earned: int
    current_streak: int
    area: str
    mission_id: int
    newly_unlocked_achievements: List[Dict[str, Any]]

@app.post("/mission/quick-complete", response_model=QuickMissionResponse)
async def quick_complete_mission(request: QuickMissionRequest) -> QuickMissionResponse:
    """
    Cria uma missão custom (gerada pela IA) e registra conclusão imediata.
    Usado para missões sugeridas pela IA que não existem no banco.
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        # Busca ou cria área
        cur.execute("SELECT id FROM areas WHERE name = ?", (request.area_name,))
        area_row = cur.fetchone()
        if not area_row:
            raise HTTPException(status_code=400, detail=f"Área inválida: {request.area_name}")

        area_id = area_row["id"]

        # Determina pontos base pela dificuldade
        points_map = {"easy": 50, "medium": 100, "hard": 200}
        points_base = points_map.get(request.difficulty, 100)

        # Verifica se já existe missão com mesmo título na área (para evitar duplicatas)
        cur.execute("""
            SELECT id FROM missions
            WHERE title = ? AND area_id = ? AND mission_type = 'custom'
        """, (request.title, area_id))
        existing = cur.fetchone()

        if existing:
            mission_id = existing["id"]
        else:
            # Cria missão custom
            cur.execute("""
                INSERT INTO missions (title, description, area_id, mission_type, points_base, difficulty)
                VALUES (?, ?, ?, 'custom', ?, ?)
            """, (request.title, request.description, area_id, points_base, request.difficulty))
            mission_id = cur.lastrowid
            conn.commit()

        # Agora usa o mesmo fluxo de mission_complete
        # Para não duplicar código, chamo via programação
        user = get_or_create_user(conn, request.user_phone)
        user_id = user["id"]
        completion_date = date.today()

        # Verifica duplicata diária
        cur.execute("""
            SELECT id FROM habit_logs WHERE user_id = ? AND mission_id = ? AND completion_date = ?
        """, (user_id, mission_id, completion_date))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Missão já completada hoje")

        # Calcula streak bonus (mesma lógica)
        points = points_base
        streak_bonus = 0
        cur.execute("""
            SELECT current_streak FROM user_streaks WHERE user_id = ? AND area_id = ?
        """, (user_id, area_id))
        streak_row = cur.fetchone()
        if streak_row and streak_row["current_streak"] >= 3:
            streak_bonus = int(points * 0.1 * min(streak_row["current_streak"], 5))
            points += streak_bonus

        cur.execute("""
            INSERT INTO habit_logs (user_id, mission_id, completion_date, points_earned, notes)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, mission_id, completion_date, points, request.notes))

        cur.execute("UPDATE users SET total_points = total_points + ? WHERE id = ?", (points, user_id))

        current_streak, longest_streak = update_streaks(conn, user_id, area_id, completion_date)

        # Verifica e entrega recompensas de streak (avançado)
        check_and_award_streak_rewards(conn, user_id, area_id, current_streak)

        newly_unlocked = check_achievements(conn, user_id, points, area_id)

        # Verifica level up
        cur.execute("SELECT total_points FROM users WHERE id = ?", (user_id,))
        new_total = cur.fetchone()["total_points"]
        new_level = calculate_level(new_total)
        cur.execute("SELECT level FROM users WHERE id = ?", (user_id,))
        old_level = cur.fetchone()["level"]
        leveled_up = new_level > old_level
        if leveled_up:
            cur.execute("UPDATE users SET level = ? WHERE id = ?", (new_level, user_id))

        conn.commit()

        return QuickMissionResponse(
            success=True,
            points_earned=points,
            current_streak=current_streak,
            area=request.area_name,
            mission_id=mission_id,
            newly_unlocked_achievements=newly_unlocked
        )

    finally:
        conn.close()

@app.post("/mission/complete")
async def mission_complete(request: MissionCompleteRequest) -> Dict[str, Any]:
    """
    Registra conclusão de missão e calcula pontos.
    Atualiza streaks, verifica achievements e retorna resultados.
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        # Busca missão
        cur.execute("""
            SELECT m.*, a.name as area_name, a.id as area_id
            FROM missions m
            JOIN areas a ON m.area_id = a.id
            WHERE m.id = ?
        """, (request.mission_id,))
        mission = cur.fetchone()

        if not mission:
            raise HTTPException(status_code=404, detail="Missão não encontrada")

        # Get ou create user
        user = get_or_create_user(conn, request.user_phone)
        user_id = user["id"]

        completion_date = date.today()

        # Verifica se já completou hoje
        cur.execute("""
            SELECT id FROM habit_logs
            WHERE user_id = ? AND mission_id = ? AND completion_date = ?
        """, (user_id, request.mission_id, completion_date))

        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Missão já completada hoje")

        # Calcula pontos (pode ter bonus por streak)
        points = mission["points_base"]
        streak_bonus = 0

        # Verifica streak na área
        cur.execute("""
            SELECT current_streak FROM user_streaks
            WHERE user_id = ? AND area_id = ?
        """, (user_id, mission["area_id"]))
        streak_row = cur.fetchone()
        if streak_row and streak_row["current_streak"] >= 3:
            streak_bonus = int(points * 0.1 * min(streak_row["current_streak"], 5)) # 10% por dia, max 50%
            points += streak_bonus

        # Insere log
        cur.execute("""
            INSERT INTO habit_logs (user_id, mission_id, completion_date, points_earned, notes)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, request.mission_id, completion_date, points, request.notes))

        # Atualiza total de pontos do usuário
        cur.execute("UPDATE users SET total_points = total_points + ? WHERE id = ?", (points, user_id))

        # Atualiza streak
        current_streak, longest_streak = update_streaks(conn, user_id, mission["area_id"], completion_date)

        # Verifica e entrega recompensas de streak (avançado)
        check_and_award_streak_rewards(conn, user_id, mission["area_id"], current_streak)

        # Verifica achievements
        newly_unlocked = check_achievements(conn, user_id, points, mission["area_id"])

        # Calcula novo nível
        cur.execute("SELECT total_points FROM users WHERE id = ?", (user_id,))
        new_total = cur.fetchone()["total_points"]
        new_level = calculate_level(new_total)

        # Se subiu de nível
        leveled_up = new_level > user["level"]
        if leveled_up:
            cur.execute("UPDATE users SET level = ? WHERE id = ?", (new_level, user_id))
            conn.commit()

        # Notificações WhatsApp (wacli) para achievements - async
        if newly_unlocked:
            # Envia async para não bloquear response
            from fastapi import BackgroundTasks
            # TODO: implementar wacli notification

            pass

        conn.commit()

        return {
            "success": True,
            "points_earned": points,
            "streak_bonus": streak_bonus,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "area": mission["area_name"],
            "newly_unlocked_achievements": newly_unlocked,
            "leveled_up": leveled_up,
            "new_level": new_level if leveled_up else None
        }

    finally:
        conn.close()

@app.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(user_phone: str) -> DashboardResponse:
    """
    Retorna dashboard completo do usuário:
    - Scores por área (pontuação total + streak)
    - Nível global
    - Achievements desbloqueados
    - Missões recentes
    - Próximos achievements
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        # Get ou create user
        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        # Busca scores por área
        cur.execute("""
            SELECT
                a.name as area_name,
                a.icon,
                a.color,
                COALESCE(SUM(hl.points_earned), 0) as total_points,
                COALESCE(MAX(us.current_streak), 0) as current_streak,
                COALESCE(MAX(us.longest_streak), 0) as longest_streak
            FROM areas a
            LEFT JOIN missions m ON m.area_id = a.id
            LEFT JOIN habit_logs hl ON hl.mission_id = m.id AND hl.user_id = ?
            LEFT JOIN user_streaks us ON us.area_id = a.id AND us.user_id = ?
            GROUP BY a.id
            ORDER BY total_points DESC
        """, (user_id, user_id))
        area_rows = cur.fetchall()

        area_scores: Dict[str, int] = {}
        streaks: Dict[str, int] = {}
        for row in area_rows:
            area_scores[row["area_name"]] = row["total_points"]
            streaks[row["area_name"]] = row["current_streak"]

        # Busca achievements desbloqueados
        cur.execute("""
            SELECT ua.unlocked_at, a.* FROM unlocked_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at DESC
        """, (user_id,))
        unlocked_achievements = [
            {
                "id": row["id"],
                "name": row["name"],
                "description": row["description"],
                "icon": row["icon"],
                "points_reward": row["points_reward"],
                "unlocked_at": row["unlocked_at"]
            }
            for row in cur.fetchall()
        ]

        # Missões recentes (últimas 10)
        cur.execute("""
            SELECT hl.*, m.title as mission_title, a.name as area_name
            FROM habit_logs hl
            JOIN missions m ON hl.mission_id = m.id
            JOIN areas a ON m.area_id = a.id
            WHERE hl.user_id = ?
            ORDER BY hl.completion_date DESC, hl.created_at DESC
            LIMIT 10
        """, (user_id,))
        recent_missions = [dict(row) for row in cur.fetchall()]

        # Missões disponíveis (todas ativas - simplificado para MVP)
        cur.execute("""
            SELECT m.*, a.name as area_name FROM missions m
            JOIN areas a ON m.area_id = a.id
            ORDER BY RANDOM() LIMIT 10
        """)
        available_missions = [MissionResponse(**dict(row)) for row in cur.fetchall()]

        # Próximos achievements (não desbloqueados)
        cur.execute("""
            SELECT a.* FROM achievements a
            LEFT JOIN unlocked_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE ua.id IS NULL
            ORDER BY a.id
            LIMIT 5
        """, (user_id,))
        next_achievements = [dict(row) for row in cur.fetchall()]

        user_stats = UserStats(
            level=user["level"],
            total_points=user["total_points"],
            area_scores=area_scores,
            streaks=streaks,
            unlocked_achievements=unlocked_achievements
        )

        return DashboardResponse(
            user=user_stats,
            recent_missions=recent_missions,
            available_missions=available_missions,
            next_achievements=next_achievements
        )

    finally:
        conn.close()

@app.post("/ai/recommend", response_model=AIRecommendResponse)
async def ai_recommend(request: AIRecommendRequest) -> AIRecommendResponse:
    """
    Orquestrador IA: sugere próxima missão baseada no histórico.
    Usa StepFun Step 3.5 Flash via OpenRouter.
    Pode spawnar agentes especializados do swarm.
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        # Busca dados do usuário
        user = get_or_create_user(conn, request.user_phone)
        user_id = user["id"]

        # Histórico recente (últimos 30 dias)
        cur.execute("""
            SELECT
                a.name as area_name,
                COUNT(*) as mission_count,
                SUM(hl.points_earned) as total_points,
                MAX(hl.completion_date) as last_completed
            FROM habit_logs hl
            JOIN missions m ON hl.mission_id = m.id
            JOIN areas a ON m.area_id = a.id
            WHERE hl.user_id = ? AND hl.completion_date >= date('now', '-30 days')
            GROUP BY a.id
        """, (user_id,))
        history = cur.fetchall()

        # Streaks atuais
        cur.execute("""
            SELECT a.name as area_name, us.current_streak
            FROM user_streaks us
            JOIN areas a ON us.area_id = a.id
            WHERE us.user_id = ?
        """, (user_id,))
        streaks = {row["area_name"]: row["current_streak"] for row in cur.fetchall()}

        # Achievements recentes (últimos 7 dias)
        cur.execute("""
            SELECT a.name as achievement_name
            FROM unlocked_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ? AND ua.unlocked_at >= datetime('now', '-7 days')
        """, (user_id,))
        recent_achievements = [row["achievement_name"] for row in cur.fetchall()]

        # Prepara prompt para IA
        history_summary = "\n".join([
            f"- {row['area_name']}: {row['mission_count']} missões, {row['total_points'] or 0} pontos, última: {row['last_completed']}"
            for row in history
        ])

        streaks_summary = "\n".join([
            f"- {area}: {count} dias"
            for area, count in streaks.items()
        ])

        prompt = f"""Você é um Personal Coach de Vida gamificado.

Contexto do usuário:
- Histórico últimos 30 dias:
{history_summary}
- Streaks atuais:
{streaks_summary}
- Achievements recentes: {', '.join(recent_achievements) if recent_achievements else 'Nenhuma'}

Com base nisso, sugira 3 missões específicas e equilibradas para o usuário completar HOJE.

Regras:
1. Equilibre entre as 4 áreas (saúde, foco, aprendizado, finanças)
2. Se uma área está com streak alto, mantenha com missão simples
3. Se uma área está abandonada (nenhuma missão nos últimos 5+ dias), priorize essa área
4. Se usuário teve achievements recentes, recompense com missões de maior dificuldade
5. Missões devem ser:
   - Realistas (fáceis de completar em 1 dia)
   - Com pontos adequados à dificuldade: fácil=50, médio=100, difícil=200
   - Claras e mensuráveis

Formato de resposta (JSON):
{{
  "recommendations": [
    {{
      "title": "string",
      "description": "string",
      "area": "string (saude/foco/aprendizado/financas)",
      "difficulty": "easy/medium/hard",
      "points": "number",
      "reason": "string (explicação curta)"
    }}
  ],
  "reasoning": "string (raciocínio geral)",
  "confidence": "float entre 0 e 1"
}}

Retorne apenas JSON válido. Não adicione texto extra."""

        # Chama StepFun via OpenRouter
        if not OPENROUTER_API_KEY:
            # Fallback: recomendações simples se sem API key
            return AIRecommendResponse(
                recommendations=[
                    {
                        "title": "Caminhada de 10 min",
                        "description": "Saia para caminhar pelo menos 10 minutos hoje",
                        "area": "saude",
                        "difficulty": "easy",
                        "points": 50,
                        "reason": "Saúde precisa de movimento diário"
                    }
                ],
                reasoning="Modo fallback (sem API key)",
                confidence=0.5
            )

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://life-gamification.local",
                    "X-Title": "Life Gamification MVP"
                },
                json={
                    "model": "openrouter/stepfun/step-3.5-flash:free",
                    "messages": [
                        {"role": "system", "content": "Você é um assistente de gamificação de vida experiente."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 800
                },
                timeout=30.0
            )

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"OpenRouter error: {response.text}")

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            # Parse JSON
            try:
                data = json.loads(content)
                return AIRecommendResponse(**data)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=500, detail=f"Invalid AI response: {str(e)}")

    finally:
        conn.close()

# AI Coach Endpoints - Adicionar ao main.py antes de @app.post("/cron/checkin") (linha 899)

# ========== AI COACH HELPERS ==========

def build_user_data_snapshot(conn: sqlite3.Connection, user_id: int, phone: str, name: Optional[str] = None) -> UserDataSnapshot:
    """Constrói snapshot completo de dados do usuário para IA"""
    cur = conn.cursor()

    # User basic info
    cur.execute("SELECT level, total_points, name FROM users WHERE id = ?", (user_id,))
    user_row = cur.fetchone()
    level = user_row["level"] if user_row else 1
    points = user_row["total_points"] if user_row else 0
    user_name = user_row["name"] if user_row else name

    # Active missions: missões disponíveis que o usuário ainda não completou hoje
    today = date.today().isoformat()
    cur.execute("SELECT DISTINCT mission_id FROM habit_logs WHERE user_id = ? AND completion_date = ?", (user_id, today))
    completed_today_ids = {row["mission_id"] for row in cur.fetchall()}

    # Busca missões disponíveis (todas as missões ativas no sistema)
    cur.execute("""
        SELECT m.id, m.title, m.description, a.name as area, m.points_base as points_award, m.difficulty
        FROM missions m
        JOIN areas a ON m.area_id = a.id
    """)
    all_missions = cur.fetchall()

    # Constrói lista de missões ativas (não completadas hoje)
    active_missions = []
    for row in all_missions:
        if row["id"] not in completed_today_ids:
            active_missions.append(ActiveMission(
                id=row["id"],
                title=row["title"],
                description=row["description"] or "",
                area=row["area"],
                progress="{}",
                due_date=today,
                points_award=row["points_award"]
            ).dict())
            if len(active_missions) >= 10:  # Limita a 10
                break

    completed_today = len(completed_today_ids)

    # Missions completed this week (Monday to today)
    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()
    cur.execute("""
        SELECT COUNT(*) as count FROM habit_logs
        WHERE user_id = ? AND completion_date >= ?
    """, (user_id, week_start))
    completed_week = cur.fetchone()["count"]

    # Streaks
    cur.execute("""
        SELECT a.name as area_name, us.current_streak
        FROM user_streaks us
        JOIN areas a ON us.area_id = a.id
        WHERE us.user_id = ?
    """, (user_id,))
    streaks_data = cur.fetchall()
    current_streak = max([s["current_streak"] for s in streaks_data] + [0])
    longest_streak = max([s["current_streak"] for s in streaks_data] + [0])
    streak_area = streaks_data[0]["area_name"] if streaks_data else None

    # Health data (if health_integration table exists)
    health = None
    try:
        cur.execute("""
            SELECT steps, steps_goal, sleep, sleep_goal, heart_rate, water, water_goal
            FROM health_integration
            WHERE user_id = ? AND date = ?
        """, (user_id, today))
        health_row = cur.fetchone()
        if health_row:
            health = HealthData(
                steps_today=health_row["steps"] or 0,
                steps_goal=health_row["steps_goal"] or 10000,
                sleep_last_night=health_row["sleep"],
                sleep_goal=health_row["sleep_goal"],
                heart_rate_avg=health_row["heart_rate"],
                water_intake=health_row["water"],
                water_goal=health_row["water_goal"]
            ).dict()
    except sqlite3.OperationalError:
        pass

    # Performance metrics (7-day avg)
    cur.execute("""
        SELECT
            AVG(hl.points_earned) as avg_points,
            COUNT(*) as total_logs,
            COUNT(DISTINCT DATE(hl.completion_date)) as active_days
        FROM habit_logs hl
        WHERE hl.user_id = ? AND hl.completion_date >= date('now', '-7 days')
    """, (user_id,))
    perf_row = cur.fetchone()
    avg_points_7d = perf_row["avg_points"] or 0
    completion_rate_7d = (perf_row["active_days"] or 0) / 7

    # Favorite area by points earned last 30 days
    cur.execute("""
        SELECT a.name as area_name, SUM(hl.points_earned) as total
        FROM habit_logs hl
        JOIN missions m ON hl.mission_id = m.id
        JOIN areas a ON m.area_id = a.id
        WHERE hl.user_id = ? AND hl.completion_date >= date('now', '-30 days')
        GROUP BY a.id
        ORDER BY total DESC
        LIMIT 1
    """, (user_id,))
    fav_row = cur.fetchone()
    favorite_area = fav_row["area_name"] if fav_row else "N/A"

    engagement_score = completion_rate_7d

    performance = PerformanceMetrics(
        avg_daily_points_7d=avg_points_7d,
        completion_rate_7d=completion_rate_7d,
        favorite_area=favorite_area,
        engagement_score=engagement_score
    ).dict()

    return UserDataSnapshot(
        phone=phone,
        name=user_name,
        level=level,
        points=points,
        active_missions=active_missions,
        completed_missions_today=completed_today,
        missions_completed_this_week=completed_week,
        current_streak=current_streak,
        longest_streak=longest_streak,
        streak_area=streak_area,
        health=health,
        performance=performance
    ).dict()



# ========== AI COACH ENDPOINTS ==========

@app.post("/ai/chat")
async def ai_chat(request: AIChatRequest) -> AIChatResponse:
    """
    Chat com AI Coach.
    Recupera contexto do usuário, envia para StepFun via OpenRouter com contexto.
    """
    conn = get_db()
    try:
        # Get or create user
        user = get_or_create_user(conn, request.user_phone)
        user_id = user["id"]

        # Build user data snapshot if not provided
        user_data = request.user_data_snapshot
        if not user_data:
            user_data = build_user_data_snapshot(conn, user_id, request.user_phone, user.get("name"))

        # Build prompt with history and user context
        system_prompt = f"""Você é um AI Coach pessoal para Life Gamification.
Você ajuda o usuário com:
- Sugestões de missões
- Análise de desempenho
- Planos personalizados
- Dicas de melhoria
- Predições de humor/performance

Contexto do usuário agora:
- Nível: {user_data['level']}
- Pontos: {user_data['points']}
- Streak atual: {user_data['current_streak']} dias
- Missões ativas: {len(user_data['active_missions'])}
- Missões completadas hoje: {user_data['completed_missions_today']}
- Missões esta semana: {user_data['missions_completed_this_week']}
- Área favorita (por pontos): {user_data['performance']['favorite_area'] if user_data.get('performance') else 'N/A'}
- Engajamento (7 dias): {(user_data['performance']['engagement_score']*100 if user_data.get('performance') else 0):.0f}%

Use essas informações para personalizar suas respostas. Seja motivador, prático e específico.
Responda em português brasileiro, linguagem natural e amigável. Use emojis moderadamente.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            *[{"role": m.role, "content": m.content} for m in request.history[-10:]],  # last 10 messages for context
            {"role": "user", "content": request.message}
        ]

        if not OPENROUTER_API_KEY:
            # Fallback simple response
            fallback_resp = "Estou sem conexão com a IA no momento. Tente novamente mais tarde. Enquanto isso, que tal focar em completar suas missões ativas?"
            return AIChatResponse(response=fallback_resp)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://life-gamification.local",
                    "X-Title": "Life Gamification AI Coach"
                },
                json={
                    "model": "openrouter/stepfun/step-3.5-flash:free",
                    "messages": messages,
                    "temperature": 0.8,
                    "max_tokens": 1000
                },
                timeout=45.0
            )

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"OpenRouter error: {response.text}")

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            # Try to detect if response includes a plan or command
            metadata = {}
            # Simple heuristics: if it mentions "plano" and "diário" or "semanal", mark as plan
            if "plano" in content.lower() and ("diário" in content.lower() or "hoje" in content.lower()):
                metadata["command"] = "generate_plan"
            # If it mentions "previsão" or "humor", mark as prediction
            elif "previsão" in content.lower() or "humor" in content.lower():
                metadata["command"] = "predict_mood"
            # If it suggests a mission
            elif any(word in content.lower() for word in ["missão", "sugiro", "recomendo"]):
                metadata["command"] = "suggest_mission"

            return AIChatResponse(response=content, metadata=metadata if metadata else None)

    finally:
        conn.close()


@app.post("/ai/chat/history")
async def save_chat_history(request: SaveChatHistoryRequest) -> Dict[str, Any]:
    """
    Salva histórico de chat no banco.
    Espera lista de mensagens (user + assistant).
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        user = get_or_create_user(conn, request.user_phone)
        user_id = user["id"]

        saved_count = 0
        for msg in request.messages:
            # Store in chat_history table (if exists) or a generic table
            # For now, we'll store in a simple table: ai_chat_logs(user_id, role, content, timestamp, metadata)
            # Ensure table exists (could be created in schema.sql)
            try:
                cur.execute("""
                    INSERT INTO ai_chat_logs (user_id, role, content, timestamp, metadata)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    user_id,
                    msg.role,
                    msg.content,
                    datetime.fromtimestamp(msg.timestamp / 1000),
                    json.dumps(msg.metadata) if msg.metadata else None
                ))
                saved_count += 1
            except sqlite3.OperationalError:
                # Table doesn't exist, skip silently (could create on the fly)
                pass

        conn.commit()
        return {"success": True, "saved_count": saved_count}

    finally:
        conn.close()


@app.post("/ai/plan")
async def generate_ai_plan(request: AIPlanRequest) -> Union[DailyPlan, WeeklyPlan]:
    """
    Gera plano diário ou semanal personalizado.
    """
    conn = get_db()
    try:
        user = get_or_create_user(conn, request.user_phone)
        user_id = user["id"]

        # Use provided snapshot or build fresh
        snapshot = request.user_data_snapshot

        # Build prompt for plan generation
        plan_type = request.plan_type
        preferences = request.preferences or {}

        system_prompt = f"""Você é um planejador de vida gamificado.
Crie um plano {plan_type} personalizado para o usuário com base nos dados fornecidos.

Regras:
- Para plano DIÁRIO: liste 3-5 missões (uma por área preferida ou que precisa de atenção)
- Para plano SEMANAL: distribua missões equilibradas por dia, considerando streaks
- Inclua metas de saúde se disponíveis (passos, sono, água)
- Adicione dicas motivacionais
- Dificuldades: easy (50pts), medium (100pts), hard (200pts)

Formato de resposta (JSON):
Para daily:
{{
  "date": "YYYY-MM-DD (hoje)",
  "missions": [{{"mission_id": 0, "title": "...", "area": "...", "reason": "...", "estimated_difficulty": "easy/medium/hard"}}],
  "goals": {{"steps": 10000, "sleep": 7, "water": 2000}},
  "tips": ["dica1", "dica2"]
}}
Para weekly:
{{
  "week_start": "YYYY-MM-DD (segunda)",
  "daily_plans": [{{...}}],
  "overall_focus": "string",
  "encouragement": "string"
}}

Retorne apenas JSON válido.
"""

        user_context = json.dumps(snapshot, indent=2, ensure_ascii=False)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Dados do usuário:\n{user_context}\n\nGere o plano {plan_type}."}
        ]

        if not OPENROUTER_API_KEY:
            # Fallback simple plan
            if plan_type == 'daily':
                return DailyPlan(
                    date=date.today().isoformat(),
                    missions=[
                        PlanMission(mission_id=0, title="Caminhada de 10 min", area="saude", reason="Saúde básica", estimated_difficulty="easy"),
                        PlanMission(mission_id=0, title="Ler 10 páginas", area="aprendizado", reason="Desenvolver conhecimento", estimated_difficulty="easy"),
                    ],
                    goals={"steps": 8000, "sleep": 7},
                    tips=["Mantenha a consistência!", "Beba água"]
                )
            else:
                return WeeklyPlan(
                    week_start=(date.today() - timedelta(days=date.today().weekday())).isoformat(),
                    daily_plans=[],
                    overall_focus="Saúde eprodutividade",
                    encouragement="Você consegue!"
                )

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://life-gamification.local",
                    "X-Title": "Life Gamification AI Coach"
                },
                json={
                    "model": "openrouter/stepfun/step-3.5-flash:free",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1200
                },
                timeout=45.0
            )

            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"OpenRouter error: {response.text}")

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            try:
                data = json.loads(content)
                if plan_type == 'daily':
                    return DailyPlan(**data)
                else:
                    return WeeklyPlan(**data)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=500, detail=f"Invalid plan JSON: {str(e)}")

    finally:
        conn.close()


@app.get("/ai/predict/{user_phone}")
async def predict_user_mood(user_phone: str) -> MoodPrediction:
    """
    Prediz humor/performance baseado em histórico recente.
    """
    conn = get_db()
    try:
        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        # Build snapshot to analyze
        snapshot = build_user_data_snapshot(conn, user_id, user_phone, user.get("name"))

        # Simple heuristic model (can be replaced by AI)
        engagement = snapshot["performance"]["engagement_score"] if snapshot.get("performance") else 0
        streak = snapshot["current_streak"]
        completed_today = snapshot["completed_missions_today"]
        avg_points = snapshot["performance"]["avg_daily_points_7d"] if snapshot.get("performance") else 0

        factors = []
        mood_score = 0.5  # baseline

        if engagement > 0.7:
            factors.append("Alto engajamento (mais de 70% dos dias ativos)")
            mood_score += 0.3
        elif engagement < 0.3:
            factors.append("Baixo engajamento (menos de 30% dos dias ativos)")
            mood_score -= 0.2

        if streak >= 7:
            factors.append(f"Streak forte de {streak} dias")
            mood_score += 0.2
        elif streak == 0:
            factors.append("Sem streak ativo")
            mood_score -= 0.2

        if completed_today > 0:
            factors.append(f"Já completou {completed_today} missões hoje")
            mood_score += 0.1
        else:
            factors.append("Ainda não completou missões hoje")
            mood_score -= 0.1

        if avg_points > 150:
            factors.append("Média de pontos diária alta")
            mood_score += 0.1
        elif avg_points < 50:
            factors.append("Média de pontos diária baixa")
            mood_score -= 0.1

        # Final mood classification
        if mood_score >= 0.8:
            predicted = "great"
            recommendation = "Excelente! Aproveite o momentum para missões mais desafiadoras."
        elif mood_score >= 0.6:
            predicted = "good"
            recommendation = "Você está no caminho certo. Mantenha a consistência!"
        elif mood_score >= 0.4:
            predicted = "neutral"
            recommendation = "Tudo okay. Que tal uma missão fácil para esquentar?"
        elif mood_score >= 0.2:
            predicted = "low"
            recommendation = "Parece que você precisa de um boost. Tente algo pequeno e recompensador."
        else:
            predicted = "stressed"
            recommendation = "Cuidado! Talvez seja hora de descansar. Missões leves são uma opção."

        confidence = min(0.9, 0.5 + abs(mood_score - 0.5) * 0.8)

        return MoodPrediction(
            predicted_mood=predicted,
            confidence=confidence,
            factors=factors,
            recommendation=recommendation
        )

    finally:
        conn.close()


@app.get("/ai/suggestions/{user_phone}")
async def get_proactive_suggestions(user_phone: str) -> List[ProactiveSuggestion]:
    """
    Retorna sugestões proativas para notificações push.
    """
    conn = get_db()
    try:
        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        # Get recent data
        snapshot = build_user_data_snapshot(conn, user_id, user_phone, user.get("name"))

        suggestions: List[ProactiveSuggestion] = []

        # 1. If no missions completed today, suggest a mission
        if snapshot["completed_missions_today"] == 0:
            # Get an easy mission suggestion
            cur = conn.cursor()
            cur.execute("""
                SELECT m.id, m.title FROM missions m
                JOIN areas a ON m.area_id = a.id
                WHERE m.difficulty = 'easy' OR m.difficulty IS NULL
                ORDER BY RANDOM() LIMIT 1
            """)
            mission = cur.fetchone()
            if mission:
                suggestions.append(ProactiveSuggestion(
                    type="mission_suggestion",
                    message=f"Ei! Você ainda não completou nenhuma missão hoje. Que tal '{mission['title']}'? É fácil e rápido! 🎯",
                    suggested_mission_id=mission["id"],
                    priority="high"
                ))

        # 2. If streak is high, encourage to keep it
        if snapshot["current_streak"] >= 3:
            area = snapshot.get("streak_area") or "uma área"
            suggestions.append(ProactiveSuggestion(
                type="encouragement",
                message=f"🔥 Você está em uma streak de {snapshot['current_streak']} dias em {area}. Não pare agora!",
                priority="medium"
            ))

        # 3. If engagement is low, warn/push
        if snapshot["performance"]["engagement_score"] < 0.4:
            suggestions.append(ProactiveSuggestion(
                type="warning",
                message="📊 Suaactivity está baixa esta semana. Vamos retomar? Talvez uma missão easy ajude!",
                priority="medium"
            ))

        # 4. If health goals are lagging
        if snapshot.get("health"):
            health = snapshot["health"]
            if health["steps_today"] < health["steps_goal"] * 0.5:
                suggestions.append(ProactiveSuggestion(
                    type="mission_suggestion",
                    message=f"🚶 Você está em {health['steps_today']}/{health['steps_goal']} passos hoje. Que tal uma caminhada rápida?",
                    priority="medium"
                ))

        return suggestions

    finally:
        conn.close()


@app.get("/ai/user-data/{user_phone}")
async def get_user_data_snapshot_endpoint(user_phone: str) -> UserDataSnapshot:
    """
    Endpoint para obter snapshot de dados do usuário para contexto da IA.
    Pode ser chamado pelo mobile para cache local.
    """
    conn = get_db()
    try:
        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]
        snapshot = build_user_data_snapshot(conn, user_id, user_phone, user.get("name"))
        return snapshot
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"ERROR in /ai/user-data: {e}\n{tb}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/cron/checkin")
async def cron_checkin(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Webhook para cron jobs - auto-checkin de hábitos
    Pode ser chamado por cron externo (systemd/timer)
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        # Busca todos os cron jobs habilitados
        cur.execute("""
            SELECT cj.*, a.name as area_name FROM cron_jobs cj
            JOIN areas a ON cj.area_id = a.id
            WHERE cj.enabled = 1
        """)
        cron_jobs = cur.fetchall()

        results = []
        for job in cron_jobs:
            # Executa o comando do cron (simulado - MVP não executa comandos reais)
            # Em produção, isso integra com os cron jobs existentes do sistema
            results.append({
                "job": job["name"],
                "area": job["area_name"],
                "schedule": job["schedule"],
                "status": "simulated"
            })

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "jobs_checked": len(results),
            "results": results
        }

    finally:
        conn.close()

@app.get("/api/missions")
async def list_missions(
    area: Optional[str] = None,
    mission_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Lista missões disponíveis (para frontend)"""
    conn = get_db()
    try:
        cur = conn.cursor()
        query = """
            SELECT m.*, a.name as area_name, a.icon, a.color
            FROM missions m
            JOIN areas a ON m.area_id = a.id
            WHERE 1=1
        """
        params: List[Any] = []

        if area:
            query += " AND a.name = ?"
            params.append(area)
        if mission_type:
            query += " AND m.mission_type = ?"
            params.append(mission_type)

        query += " ORDER BY m.points_base DESC"

        cur.execute(query, params)
        return [dict(row) for row in cur.fetchall()]

    finally:
        conn.close()

@app.get("/api/achievements")
async def list_achievements(user_phone: str) -> Dict[str, Any]:
    """Lista achievements desbloqueados e pendentes"""
    conn = get_db()
    try:
        cur = conn.cursor()
        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        # Desbloqueados
        cur.execute("""
            SELECT a.*, ua.unlocked_at FROM achievements a
            JOIN unlocked_achievements ua ON a.id = ua.achievement_id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at DESC
        """, (user_id,))
        unlocked = [dict(row) for row in cur.fetchall()]

        # Pendentes
        cur.execute("""
            SELECT a.* FROM achievements a
            LEFT JOIN unlocked_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE ua.id IS NULL
        """, (user_id,))
        pending = [dict(row) for row in cur.fetchall()]

        return {
            "unlocked": unlocked,
            "pending": pending,
            "total_unlocked": len(unlocked),
            "total_pending": len(pending)
        }

    finally:
        conn.close()

# ========== INTEGRATION HELPERS ==========

def import_financial_csv(csv_path: str) -> Tuple[int, List[str]]:
    """
    Importa planilha financeira CSV e gera missões de finanças
    Retorna: (quantidade_importada, logs)
    """
    import csv
    from pathlib import Path

    path = Path(csv_path).expanduser()
    if not path.exists():
        return 0, [f"Arquivo não encontrado: {path}"]

    conn = get_db()
    cur = conn.cursor()

    # Busca area de finanças
    cur.execute("SELECT id FROM areas WHERE name = 'financas'")
    area_row = cur.fetchone()
    if not area_row:
        return 0, ["Área 'financas' não encontrada no banco"]

    finance_area_id = area_row["id"]
    imported = 0
    logs = []

    try:
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Gera missão baseada em transação financeira
                # Exemplo: se for despesa > 500, missão de corte de gastos
                # Se for investimento, missão de growth
                amount = float(row.get('valor', row.get('amount', 0)))
                category = row.get('categoria', row.get('category', 'geral'))

                if amount < 0:  # Despesa
                    title = f"Controlar gastos: {category}"
                    description = f"Evite gastar mais de R$ {abs(amount):.2f} em {category} esta semana"
                else:  # Receita/Investimento
                    title = f"Investir: {category}"
                    description = f"Aloque R$ {amount:.2f} em {category}"

                # Verifica se já existe missão similar
                cur.execute("""
                    SELECT id FROM missions
                    WHERE title LIKE ? AND area_id = ? AND mission_type = 'weekly'
                """, (f"{title[:50]}%", finance_area_id))

                if not cur.fetchone():
                    cur.execute("""
                        INSERT INTO missions (title, description, area_id, mission_type, points_base, difficulty)
                        VALUES (?, ?, ?, 'weekly', ?, 'medium')
                    """, (title, description, finance_area_id, 150))
                    imported += 1
                    logs.append(f"Criada missão: {title}")

        conn.commit()
        return imported, logs

    except Exception as e:
        return 0, [f"Erro ao importar CSV: {str(e)}"]
    finally:
        conn.close()

def send_whatsapp_notification(phone: str, message: str) -> bool:
    """
    Envia notificação via wacli (WhatsApp)
    Retorna True se enviado com sucesso
    """
    try:
        # Usa CLI wacli se disponível
        import subprocess
        result = subprocess.run(
            ["wacli", "send", phone, message],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode == 0
    except Exception:
        return False

@app.post("/admin/import-finances")
async def admin_import_finances(csv_path: str) -> Dict[str, Any]:
    """
    Admin endpoint: importa planilha financeira e gera missões
    """
    imported, logs = import_financial_csv(csv_path)
    return {
        "imported": imported,
        "logs": logs,
        "csv_path": csv_path
    }

@app.post("/admin/trigger-achievement/{user_phone}/{achievement_code}")
async def admin_trigger_achievement(user_phone: str, achievement_code: str) -> Dict[str, Any]:
    """
    Admin endpoint: força desbloqueio de achievement (debug/testing)
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        cur.execute("SELECT id FROM achievements WHERE name = ?", (achievement_code,))
        ach = cur.fetchone()
        if not ach:
            raise HTTPException(status_code=404, detail="Achievement não encontrado")

        cur.execute("""
            INSERT OR IGNORE INTO unlocked_achievements (user_id, achievement_id)
            VALUES (?, ?)
        """, (user_id, ach["id"]))
        conn.commit()

        return {"success": True, "achievement": achievement_code, "user": user_phone}

    finally:
        conn.close()

# ========== GAMIFICATION ADVANCED ==========

@app.get("/ranking")
async def get_ranking(
    area: Optional[str] = None,
    limit: int = 100
) -> Dict[str, Any]:
    """
    Retorna ranking de usuários por pontos totais ou por área.

    Parâmetros:
    - area: nome da área (saude, foco, aprendizado, financas). Se vazio, ranking global.
    - limit: número máximo de usuários no ranking (padrão 100, máx 1000)

    Retorna:
    - ranking: lista de {user_phone (anonimizado), points, level, position}
    - area: área utilizada (ou 'global')
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        results = []

        if not area:
            # Ranking global por total_points
            cur.execute("""
                SELECT phone, total_points, level
                FROM users
                WHERE total_points > 0
                ORDER BY total_points DESC, level DESC
                LIMIT ?
            """, (limit,))
            rows = cur.fetchall()
            for idx, row in enumerate(rows, start=1):
                results.append({
                    "position": idx,
                    "user_phone": f"+***{row['phone'][-4:]}", # anonimizado
                    "points": row["total_points"],
                    "level": row["level"]
                })
        else:
            # Ranking por área específica
            cur.execute("SELECT id FROM areas WHERE name = ?", (area,))
            area_row = cur.fetchone()
            if not area_row:
                raise HTTPException(status_code=400, detail=f"Área inexistente: {area}")
            area_id = area_row["id"]

            cur.execute("""
                SELECT
                    u.phone,
                    COALESCE(SUM(hl.points_earned), 0) as area_points,
                    u.level
                FROM users u
                LEFT JOIN habit_logs hl ON u.id = hl.user_id
                LEFT JOIN missions m ON hl.mission_id = m.id AND m.area_id = ?
                GROUP BY u.id
                HAVING area_points > 0
                ORDER BY area_points DESC, u.level DESC
                LIMIT ?
            """, (area_id, limit))
            rows = cur.fetchall()
            for idx, row in enumerate(rows, start=1):
                results.append({
                    "position": idx,
                    "user_phone": f"+***{row['phone'][-4:]}",
                    "points": row["area_points"],
                    "level": row["level"]
                })

        return {
            "area": area or "global",
            "limit": limit,
            "ranking": results
        }

    finally:
        conn.close()

@app.get("/leaderboard")
async def get_leaderboard(
    type: str = "top10",  # top10, top100, weekly, monthly
    area: Optional[str] = None
) -> Dict[str, Any]:
    """
    Leaderboards variados:
    - top10 / top100: ranking dos melhores
    - weekly: melhores da semana atual
    - monthly: melhores do mês atual

    Parâmetros area aplicam-se a todos os tipos.
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        now = datetime.now()
        results = []

        # Determina período
        if type in ("weekly", "monthly"):
            if type == "weekly":
                # Início da semana atual (segunda)
                week_start = now - timedelta(days=now.weekday())
                start_date = week_start.date()
                date_clause = "hl.completion_date >= ?"
                date_params = (start_date,)
            else:  # monthly
                month_start = now.replace(day=1)
                start_date = month_start.date()
                date_clause = "hl.completion_date >= ?"
                date_params = (start_date,)
        else:
            # top10/top100 usa todos os dados históricos
            date_clause = "1=1"
            date_params = ()

        # Filtro de área
        if area:
            cur.execute("SELECT id FROM areas WHERE name = ?", (area,))
            area_row = cur.fetchone()
            if not area_row:
                raise HTTPException(status_code=400, detail=f"Área inexistente: {area}")
            area_id = area_row["id"]
            area_clause = "AND m.area_id = ?"
            area_params = (area_id,)
        else:
            area_clause = ""
            area_params = ()

        # Limite
        if type == "top100":
            limit = 100
        else:
            limit = 10

        # Query unificada
        query = f"""
            SELECT
                u.phone,
                COUNT(*) as mission_count,
                SUM(hl.points_earned) as total_points,
                MAX(hl.completion_date) as last_activity
            FROM habit_logs hl
            JOIN users u ON hl.user_id = u.id
            JOIN missions m ON hl.mission_id = m.id
            WHERE {date_clause} {area_clause}
            GROUP BY u.id
            ORDER BY total_points DESC
            LIMIT ?
        """
        params = date_params + area_params + (limit,)

        cur.execute(query, params)
        rows = cur.fetchall()

        for idx, row in enumerate(rows, start=1):
            results.append({
                "position": idx,
                "user_phone": f"+***{row['phone'][-4:]}",
                "missions_completed": row["mission_count"],
                "points": row["total_points"],
                "last_activity": row["last_activity"]
            })

        return {
            "type": type,
            "area": area or "all",
            "period": "current" if type in ("weekly", "monthly") else "all-time",
            "entries": results
        }

    finally:
        conn.close()

@app.get("/user/inventory/{user_phone}")
async def get_user_inventory(user_phone: str) -> Dict[str, Any]:
    """
    Retorna inventário do usuário (itens adquiridos).
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        cur.execute("""
            SELECT
                ui.id,
                ui.acquired_at,
                ui.used_at,
                ui.metadata_json,
                i.name,
                i.description,
                i.icon,
                i.type,
                i.rarity
            FROM user_inventory ui
            JOIN items i ON ui.item_id = i.id
            WHERE ui.user_id = ?
            ORDER BY ui.acquired_at DESC
        """, (user_id,))

        items = []
        for row in cur.fetchall():
            items.append({
                "inventory_id": row["id"],
                "item_id": row["id"],  # TODO: item_id separate
                "name": row["name"],
                "description": row["description"],
                "icon": row["icon"],
                "type": row["type"],
                "rarity": row["rarity"],
                "acquired_at": row["acquired_at"],
                "used_at": row["used_at"],
                "metadata": json.loads(row["metadata_json"] or "{}")
            })

        return {
            "user_phone": user_phone,
            "items": items,
            "count": len(items)
        }

    finally:
        conn.close()

@app.get("/special-missions/{user_phone}")
async def get_special_missions(user_phone: str) -> Dict[str, Any]:
    """
    Lista missões especiais disponíveis e progresso do usuário.
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        # Busca missões especiais ativas
        cur.execute("""
            SELECT sm.*, a.name as area_name, a.icon as area_icon
            FROM special_missions sm
            LEFT JOIN areas a ON sm.area_id = a.id
            WHERE sm.is_active = 1
              AND (sm.starts_at IS NULL OR sm.starts_at <= date('now'))
              AND (sm.expires_at IS NULL OR sm.expires_at >= date('now'))
        """)
        specials = cur.fetchall()

        result = []
        for sm in specials:
            # Busca progresso do usuário para esta missão
            cur.execute("""
                SELECT * FROM user_special_missions
                WHERE user_id = ? AND special_mission_id = ?
            """, (user_id, sm["id"]))
            progress = cur.fetchone()

            req = json.loads(sm["requirements_json"])
            is_completed = progress and progress["completed_at"] is not None
            is_claimed = progress and progress["claimed_at"] is not None

            result.append({
                "id": sm["id"],
                "title": sm["title"],
                "description": sm["description"],
                "area": sm["area_name"],
                "area_icon": sm["area_icon"],
                "requirements": req,
                "reward_points": sm["reward_points"],
                "reward_item_id": sm["reward_item_id"],
                "progress": progress["progress_json"] if progress else "{}",
                "completed": is_completed,
                "claimed": is_claimed,
                "available_to_claim": is_completed and not is_claimed
            })

        return {
            "user_phone": user_phone,
            "special_missions": result
        }

    finally:
        conn.close()

@app.post("/special-mission/complete")
async def complete_special_mission(
    user_phone: str,
    special_mission_id: int
) -> Dict[str, Any]:
    """
    Marca missão especial como completada (valida requisitos).
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        # Busca missão especial
        cur.execute("""
            SELECT sm.*, a.name as area_name
            FROM special_missions sm
            LEFT JOIN areas a ON sm.area_id = a.id
            WHERE sm.id = ? AND sm.is_active = 1
        """, (special_mission_id,))
        sm = cur.fetchone()
        if not sm:
            raise HTTPException(status_code=404, detail="Missão especial não encontrada")

        # Verifica se já completada
        cur.execute("""
            SELECT * FROM user_special_missions
            WHERE user_id = ? AND special_mission_id = ?
        """, (user_id, special_mission_id))
        existing = cur.fetchone()
        if existing and existing["completed_at"]:
            raise HTTPException(status_code=400, detail="Missão especial já concluída")

        # Valida requisitos
        req = json.loads(sm["requirements_json"])
        validation_errors = []

        # Exemplo de validações (pode expandir)
        if "min_level" in req:
            if user["level"] < req["min_level"]:
                validation_errors.append(f"Nível mínimo: {req['min_level']}")

        if "total_points" in req:
            if user["total_points"] < req["total_points"]:
                validation_errors.append(f"Pontuação mínima: {req['total_points']}")

        if "achievements_count" in req:
            cur.execute("""
                SELECT COUNT(*) as cnt FROM unlocked_achievements WHERE user_id = ?
            """, (user_id,))
            ach_count = cur.fetchone()["cnt"]
            if ach_count < req["achievements_count"]:
                validation_errors.append(f"Achievements necessários: {req['achievements_count']}")

        if "min_streak_all_areas" in req:
            cur.execute("""
                SELECT COUNT(*) as cnt FROM user_streaks
                WHERE user_id = ? AND current_streak >= ?
            """, (user_id, req["min_streak_all_areas"]))
            streak_areas = cur.fetchone()["cnt"]
            if streak_areas < 4:
                validation_errors.append(f"Streak de {req['min_streak_all_areas']} dias em todas as 4 áreas")

        if "min_missions" in req and sm["area_id"]:
            cur.execute("""
                SELECT COUNT(*) as cnt FROM habit_logs hl
                JOIN missions m ON hl.mission_id = m.id
                WHERE hl.user_id = ? AND m.area_id = ?
            """, (user_id, sm["area_id"]))
            area_missions = cur.fetchone()["cnt"]
            if area_missions < req["min_missions"]:
                validation_errors.append(f"Missões na área: {req['min_missions']}")

        if validation_errors:
            raise HTTPException(status_code=400, detail=validation_errors)

        # Marca como completada
        if existing:
            cur.execute("""
                UPDATE user_special_missions
                SET completed_at = CURRENT_TIMESTAMP,
                    progress_json = ?
                WHERE id = ?
            """, (json.dumps({"completed": True}), existing["id"]))
        else:
            cur.execute("""
                INSERT INTO user_special_missions (user_id, special_mission_id, completed_at, progress_json)
                VALUES (?, ?, CURRENT_TIMESTAMP, ?)
            """, (user_id, special_mission_id, json.dumps({"completed": True})))

        # Adiciona pontos de recompensa
        if sm["reward_points"] > 0:
            cur.execute("UPDATE users SET total_points = total_points + ? WHERE id = ?", (sm["reward_points"], user_id))

        # Adiciona item ao inventário se houver
        if sm["reward_item_id"]:
            cur.execute("""
                INSERT OR IGNORE INTO user_inventory (user_id, item_id)
                VALUES (?, ?)
            """, (user_id, sm["reward_item_id"]))

        conn.commit()

        # Notificação (async)
        #TODO: send_notification(user_phone, f"Missão especial '{sm['title']}' completada!")

        return {
            "success": True,
            "mission_title": sm["title"],
            "points_awarded": sm["reward_points"],
            "item_awarded": sm["reward_item_id"]
        }

    finally:
        conn.close()

@app.get("/store/achievements/{user_phone}")
async def get_store_achievements(
    user_phone: str,
    store_type: str = "apple"  # 'apple' ou 'google'
) -> Dict[str, Any]:
    """
    Retorna achievements desbloqueados prontos para sincronizar com Game Center / Play Games.
    Para cada achievement, retorna o identificador externo da store.
    """
    if store_type not in ("apple", "google"):
        raise HTTPException(status_code=400, detail="store_type deve ser 'apple' ou 'google'")

    conn = get_db()
    try:
        cur = conn.cursor()

        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        # Busca achievements desbloqueados que têm NFT/metadata para store
        cur.execute("""
            SELECT
                ua.unlocked_at,
                a.name,
                a.description,
                a.icon,
                a.nft_contract,
                a.token_id
            FROM unlocked_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at DESC
        """, (user_id,))

        achievements = []
        for row in cur.fetchall():
            # Gera ID externo baseado em store_type
            # Em produção, cada achievement teria um store_achievement_id fixo
            external_id = f"ach_{row['token_id'] or row['id']}"
            if store_type == "google":
                external_id = f"achievement_{row['id']}"
            # Para Apple, usa o nome normalizado
            elif store_type == "apple":
                external_id = f"com.lifegamification.achievement.{row['name'].lower().replace(' ', '_')}"

            achievements.append({
                "id": row["id"],
                "name": row["name"],
                "description": row["description"],
                "icon": row["icon"],
                "unlocked_at": row["unlocked_at"],
                "store_achievement_id": external_id,
                "nft_contract": row["nft_contract"],
                "token_id": row["token_id"]
            })

        return {
            "user_phone": user_phone,
            "store_type": store_type,
            "achievements": achievements
        }

    finally:
        conn.close()

@app.post("/store/sync")
async def sync_store_achievements(
    user_phone: str,
    store_type: str,
    achievement_ids: List[int]
) -> Dict[str, Any]:
    """
    Registra que achievements foram sincronizados com a store.
    Útil para audit trail e evitar duplicatas.
    """
    if store_type not in ("apple", "google"):
        raise HTTPException(status_code=400, detail="store_type inválido")

    conn = get_db()
    try:
        cur = conn.cursor()

        user = get_or_create_user(conn, user_phone)
        user_id = user["id"]

        synced = 0
        for ach_id in achievement_ids:
            # Verifica se achievement pertence ao usuário
            cur.execute("""
                SELECT 1 FROM unlocked_achievements
                WHERE user_id = ? AND achievement_id = ?
            """, (user_id, ach_id))
            if not cur.fetchone():
                continue  # pula achievement não desbloqueado

            # Insere ou atualiza sync
            cur.execute("""
                INSERT OR REPLACE INTO store_achievements_sync
                (user_id, store_type, store_achievement_id, last_synced_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            """, (user_id, store_type, str(ach_id)))
            synced += 1

        conn.commit()

        return {
            "success": True,
            "synced_count": synced,
            "user_phone": user_phone,
            "store_type": store_type
        }

    finally:
        conn.close()

def check_and_award_streak_rewards(conn: sqlite3.Connection, user_id: int, area_id: int, current_streak: int):
    """
    Verifica se o usuário alcançou uma recompensa de streak e entrega.
    Chamado após update_streaks.
    """
    cur = conn.cursor()

    # Busca recompensas disponíveis para este streak e área (ou geral)
    cur.execute("""
        SELECT sr.*, i.name as item_name, i.type as item_type
        FROM streak_rewards sr
        LEFT JOIN items i ON sr.item_id = i.id
        WHERE sr.days_required = ?
          AND (sr.area_id = ? OR sr.area_id IS NULL)
    """, (current_streak, area_id))

    rewards = cur.fetchall()

    for reward in rewards:
        # Verifica se já foi reclamada para este usuário/área/recompensa
        cur.execute("""
            SELECT 1 FROM streak_reward_claims
            WHERE user_id = ? AND streak_reward_id = ? AND area_id = ?
        """, (user_id, reward["id"], area_id))
        if cur.fetchone():
            continue  # já reclamada

        # Entrega recompensa
        # 1. Pontos bônus
        if reward["points_bonus"] > 0:
            cur.execute("UPDATE users SET total_points = total_points + ? WHERE id = ?", (reward["points_bonus"], user_id))

        # 2. Item do inventário
        if reward["item_id"]:
            cur.execute("""
                INSERT OR IGNORE INTO user_inventory (user_id, item_id)
                VALUES (?, ?)
            """, (user_id, reward["item_id"]))

        # 3. Registra claim
        cur.execute("""
            INSERT INTO streak_reward_claims (user_id, streak_reward_id, area_id)
            VALUES (?, ?, ?)
        """, (user_id, reward["id"], area_id))

        # Notificação (async)
        # TODO: send_notification

    # Commitment happens outside this function (caller)

# Modificar update_streaks para chamar check_and_award_streak_rewards
# Vou wrappear a lógica no mission_complete

# ========== HEALTH ==========

@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
