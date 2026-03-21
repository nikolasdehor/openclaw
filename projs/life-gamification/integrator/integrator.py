# -*- coding: utf-8 -*-
"""
Integrator - Orchestrator com Swarm + StepFun
Usa StepFun Step 3.5 Flash via OpenRouter para gerar missões personalizadas
e analisar padrões comportamentais.
"""

from __future__ import annotations

import json
import os
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

class SwarmAgent(TypedDict):
    """Agente especializado do swarm"""
    role: str
    instructions: str
    model: Optional[str]

class OrchestrationResult(TypedDict):
    """Resultado da orquestração"""
    mission_suggestions: List[Dict[str, Any]]
    patterns_detected: List[str]
    coaching_advice: str
    confidence: float

class Integrator:
    """Orquestrador principal que coordena agentes e IA"""

    def __init__(self) -> None:
        self.swarm_agents: List[SwarmAgent] = self._load_swarm_agents()
        self.router_api_key = OPENROUTER_API_KEY

    def _load_swarm_agents(self) -> List[SwarmAgent]:
        """
        Carrega agentes do swarm da pasta local.
        Se não houver, usa defaults.
        """
        agents_path = Path(__file__).parent / "agents.json"
        if agents_path.exists():
            with open(agents_path, 'r', encoding='utf-8') as f:
                return json.load(f)

        # Default agents para MVP
        return [
            {
                "role": "health_coach",
                "instructions": "Você é um coach de saúde focado em hábitos diários. Sugira missões realistas de exercícios, sono e nutrição baseadas no histórico do usuário.",
                "model": "openrouter/stepfun/step-3.5-flash:free"
            },
            {
                "role": "focus_specialist",
                "instructions": "Você é um especialista em produtividade e foco. Analise padrões de trabalho e sugira missões para melhorar concentração e evitar procrastinação.",
                "model": "openrouter/stepfun/step-3.5-flash:free"
            },
            {
                "role": "learning_guide",
                "instructions": "Você é um guia de aprendizado contínuo. Crie missões de estudo, cursos e desenvolvimento de habilidades personalizadas.",
                "model": "openrouter/stepfun/step-3.5-flash:free"
            },
            {
                "role": "financial_advisor",
                "instructions": "Você é um consultor financeiro pessoal. Gere missões de илиgestão financeira, investimentos e hábitos de economia.",
                "model": "openrouter/stepfun/step-3.5-flash:free"
            },
            {
                "role": "pattern_detector",
                "instructions": "Analise o histórico comportamental do usuário e detecte padrões: dias da semana com baixo desempenho, áreas negligenciadas, correlações entre missões completadas e humor. Retorne uma lista de insights.",
                "model": "openrouter/stepfun/step-3.5-flash:free"
            }
        ]

    async def analyze_user_history(
        self,
        user_data: Dict[str, Any],
        days_back: int = 30
    ) -> Dict[str, Any]:
        """
        Analisa histórico do usuário usando Pattern Detector Agent
        """
        prompt = f"""Analise este histórico de {days_back} dias e identifique padrões:

Dados do usuário:
- Nível: {user_data.get('level')}
- Pontos totais: {user_data.get('total_points')}

Scores por área:
{json.dumps(user_data.get('area_scores', {}), indent=2)}

Streaks atuais:
{json.dumps(user_data.get('streaks', {}), indent=2)}

Missões recentes (últimas 10):
{json.dumps(user_data.get('recent_missions', []), indent=2)}

Achievements desbloqueados: {len(user_data.get('unlocked_achievements', []))}

Responda em JSON com:
{{
  "weakest_area": "string (área com menorpontuação ou abandonada)",
  "best_day_of_week": "string (com base em completions)",
  "worst_day_of_week": "string",
  "suggested_balance": "string (qual area priorizar)",
  "patterns": ["lista de strings com insights"],
  "confidence": float
}}"""

        result = await self._call_agent("pattern_detector", prompt)
        return result

    async def generate_personalized_missions(
        self,
        user_data: Dict[str, Any],
        patterns: Dict[str, Any],
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Gera missões personalizadas baseadas em padrões e perfil
        """
        missions = []

        # Separa agentes por área
        area_agents = {
            "saude": "health_coach",
            "foco": "focus_specialist",
            "aprendizado": "learning_guide",
            "financas": "financial_advisor"
        }

        # Determina áreas que precisam de atenção
        area_scores = user_data.get("area_scores", {})
        weakest_area = patterns.get("weakest_area", "")
        weakest_score = area_scores.get(weakest_area, 0)

        # Gera missões equilibradas
        areas_to_cover = set(["saude", "foco", "aprendizado", "financas"])

        # Se há área muito baixa, prioriza
        if weakest_score < 100 and weakest_area in areas_to_cover:
            areas_to_cover = {weakest_area}
            # Adiciona mais uma variedade
            for area in ["saude", "foco", "aprendizado", "financas"]:
                if area != weakest_area and len(areas_to_cover) < count:
                    areas_to_cover.add(area)

        for i, area in enumerate(list(areas_to_cover)[:count]):
            agent_role = area_agents.get(area)
            if not agent_role:
                continue

            prompt = f"""Gere UMA missão diária para a área de {area}.

Contexto do usuário:
- Streak atual em {area}: {user_data.get('streaks', {}).get(area, 0)} dias
- Pontuação total em {area}: {area_scores.get(area, 0)}
- Nível global: {user_data.get('level')}

Padrões detectados:
{json.dumps(patterns, indent=2)}

Requisitos da missão:
- Deve ser completável em 1 dia
- Clara e mensurável
- Pontuação adequada à dificuldade (fácil=50, médio=100, difícil=200)
- Não pode ser genérica (dê exemplo concreto)

Responda em JSON com:
{{
  "title": "string curto",
  "description": "string detalhada com ação específica",
  "area": "{area}",
  "difficulty": "easy/medium/hard",
  "points": number,
  "estimated_minutes": number,
  "reasoning": "porque esta missão é boa para o usuário agora"
}}"""

            try:
                result = await self._call_agent(agent_role, prompt)
                if isinstance(result, dict):
                    missions.append(result)
            except Exception as e:
                print(f"Erro gerando missão para {area}: {e}")
                continue

        return missions

    async def orchestrate(
        self,
        user_data: Dict[str, Any],
        mission_count: int = 3
    ) -> OrchestrationResult:
        """
        Orquestração completa: analisa + gera missões
        """
        # 1. Analisa padrões
        patterns = await self.analyze_user_history(user_data)

        # 2. Gera missões
        missions = await self.generate_personalized_missions(user_data, patterns, mission_count)

        # 3. Calcula confiança geral
        confidence = patterns.get("confidence", 0.5)

        # 4. Gera conselho de coaching
        coaching = self._generate_coaching_advice(user_data, patterns, missions)

        return {
            "mission_suggestions": missions,
            "patterns_detected": patterns.get("patterns", []),
            "coaching_advice": coaching,
            "confidence": confidence
        }

    def _generate_coaching_advice(
        self,
        user_data: Dict[str, Any],
        patterns: Dict[str, Any],
        missions: List[Dict[str, Any]]
    ) -> str:
        """Gera conselho motivacional baseado em tudo"""
        areas = user_data.get("area_scores", {})
        streaks = user_data.get("streaks", {})

        if not areas:
            return "Comece completando algumas missões para que eu possa entender seu padrão!"

        # Encontra maior streak
        best_streak_area = max(streaks.items(), key=lambda x: x[1], default=(None, 0))
        worst_score_area = min(areas.items(), key=lambda x: x[1], default=(None, 0))

        advice = f"""🎯 Seu contexto:

🔥 Maior streak: {best_streak_area[0]} com {best_streak_area[1]} dias
📉 Área que precisa de atenção: {worst_score_area[0] or 'Nenhuma'} (score: {worst_score_area[1]})

💡 Dicas para hoje:
- Mantenha a consistência em {best_streak_area[0] or 'todas'}!
- Foque em {worst_score_area[0] or 'equilíbrio'} esta semana
- As missões sugeridas foram adaptadas ao seu padrão

Lembre-se: pequenos passos diários criam grandes transformações! 🚀"""

        return advice

    async def _call_agent(
        self,
        agent_role: str,
        prompt: str
    ) -> Dict[str, Any]:
        """
        Chama um agente específico via StepFun
        """
        if not self.router_api_key:
            # Fallback responses para MVP offline
            fallbacks = {
                "pattern_detector": {
                    "weakest_area": "foco",
                    "patterns": ["Baixa atividade às quartas", "Finanças com score crescente"],
                    "confidence": 0.6
                },
                "health_coach": {
                    "title": "Caminhada de 15 min",
                    "description": "Caminhe ao ar livre durante 15 minutos no horário que preferir",
                    "area": "saude",
                    "difficulty": "easy",
                    "points": 50,
                    "estimated_minutes": 15,
                    "reasoning": "Movimento leve melhora saúde geral sem pressionar"
                },
                "focus_specialist": {
                    "title": "Pomodoro de 25 min",
                    "description": "Use a técnica Pomodoro: 25 min foco total + 5 min pausa. Repita 2x",
                    "area": "foco",
                    "difficulty": "medium",
                    "points": 100,
                    "estimated_minutes": 60,
                    "reasoning": "Melhora concentração em blocos gerenciáveis"
                },
                "learning_guide": {
                    "title": "Ler 20 páginas",
                    "description": "Escolha um livro de não-ficção e leia 20 páginas hoje",
                    "area": "aprendizado",
                    "difficulty": "easy",
                    "points": 50,
                    "estimated_minutes": 40,
                    "reasoning": "Reading build knowledge compound interest"
                },
                "financial_advisor": {
                    "title": "Revisar gastos da semana",
                    "description": "Abra sua planilha ou app e categorize todos os gastos dos últimos 7 dias",
                    "area": "financas",
                    "difficulty": "medium",
                    "points": 100,
                    "estimated_minutes": 30,
                    "reasoning": "Consciência financeira é primeiro passo para controle"
                }
            }
            return fallbacks.get(agent_role, {"result": "Agent fallback"})

        # Busca instruções do agente
        agent = next((a for a in self.swarm_agents if a["role"] == agent_role), None)
        if not agent:
            raise ValueError(f"Agente não encontrado: {agent_role}")

        messages = [
            {"role": "system", "content": agent["instructions"]},
            {"role": "user", "content": prompt}
        ]

        model = agent.get("model") or "openrouter/stepfun/step-3.5-flash:free"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.router_api_key}",
                    "HTTP-Referer": "https://life-gamification.local",
                    "X-Title": "Life Gamification Integrator"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.8,
                    "max_tokens": 1000
                },
                timeout=30.0
            )

            if response.status_code != 200:
                raise Exception(f"OpenRouter error: {response.text}")

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            # Extrai JSON da resposta
            try:
                # Remove markdown code blocks se houver
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()

                data = json.loads(content)
                return data
            except json.JSONDecodeError as e:
                raise Exception(f"Invalid agent response JSON: {str(e)}\nContent: {content[:200]}")

# ========== CLI ENTRYPOINT ==========

async def main() -> None:
    """CLI para testar integrator isoladamente"""
    import sys

    if len(sys.argv) < 2:
        print("Uso: python integrator.py <user_data_json_path>")
        sys.exit(1)

    user_data_path = Path(sys.argv[1])
    if not user_data_path.exists():
        print(f"Arquivo não encontrado: {user_data_path}")
        sys.exit(1)

    with open(user_data_path, 'r', encoding='utf-8') as f:
        user_data = json.load(f)

    integrator = Integrator()
    result = await integrator.orchestrate(user_data, mission_count=3)

    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
