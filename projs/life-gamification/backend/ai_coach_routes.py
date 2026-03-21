# AI Coach Endpoints - Adicionar ao main.py antes de @app.post("/cron/checkin") (linha 899)

# ========== AI COACH HELPERS ==========

def build_user_data_snapshot(conn: sqlite3.Connection, user_id: int, phone: str, name: Optional[str] = None) -> UserDataSnapshot:
    """Constrói snapshot completo de dados do usuário para IA"""
    cur = conn.cursor()

    # User basic info
    cur.execute("SELECT level, total_points FROM users WHERE id = ?", (user_id,))
    user_row = cur.fetchone()
    level = user_row["level"] if user_row else 1
    points = user_row["total_points"] if user_row else 0

    # Active missions (missoes do user que ainda não completaram ou estão pendentes)
    cur.execute("""
        SELECT DISTINCT m.id, m.title, m.description, a.name as area, m.progress, m.due_date, m.points_award
        FROM user_missions um
        JOIN missions m ON um.mission_id = m.id
        JOIN areas a ON m.area_id = a.id
        WHERE um.user_id = ? AND um.completed = 0
    """, (user_id,))
    active_missions_rows = cur.fetchall()
    active_missions = [
        ActiveMission(
            id=row["id"],
            title=row["title"],
            description=row["description"] or "",
            area=row["area"],
            progress=row["progress"] or "{}",
            due_date=row["due_date"],
            points_award=row["points_award"]
        ).dict()
        for row in active_missions_rows
    ]

    # Missions completed today
    today = date.today().isoformat()
    cur.execute("""
        SELECT COUNT(*) as count FROM habit_logs
        WHERE user_id = ? AND completion_date = ?
    """, (user_id, today))
    completed_today = cur.fetchone()["count"]

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
        # Table might not exist
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

    # Completion rate: missions assigned vs completed
    # Approximate: compare logs from last 7 days to available missions?
    # For simplicity, use active days / 7
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

    # Engagement score: (days with activity in last 7) / 7
    engagement_score = completion_rate_7d

    performance = PerformanceMetrics(
        avg_daily_points_7d=avg_points_7d,
        completion_rate_7d=completion_rate_7d,
        favorite_area=favorite_area,
        engagement_score=engagement_score
    ).dict()

    return UserDataSnapshot(
        phone=phone,
        name=name,
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
    finally:
        conn.close()
