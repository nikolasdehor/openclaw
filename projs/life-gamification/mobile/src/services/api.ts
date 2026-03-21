// API Configuration
export const BACKEND_URL = 'http://76.13.164.69:8000';

// Types for advanced gamification

export interface RankingEntry {
  position: number;
  user_phone: string; // anonymized
  points: number;
  level: number;
}

export interface RankingResponse {
  area: string; // 'global' or area name
  limit: number;
  ranking: RankingEntry[];
}

export interface LeaderboardEntry {
  position: number;
  user_phone: string;
  missions_completed: number;
  points: number;
  last_activity: string;
}

export interface LeaderboardResponse {
  type: string; // top10, top100, weekly, monthly
  area: string;
  period: string;
  entries: LeaderboardEntry[];
}

export interface InventoryItem {
  inventory_id: number;
  item_id: number;
  name: string;
  description: string;
  icon: string;
  type: 'badge' | 'perk' | 'cosmetic' | 'boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  acquired_at: string;
  used_at: string | null;
  metadata: Record<string, any>;
}

export interface UserInventoryResponse {
  user_phone: string;
  items: InventoryItem[];
  count: number;
}

export interface UserStats {
  level: number;
  total_points: number;
  area_scores: Record<string, number>;
  streaks: Record<string, number>;
  unlocked_achievements: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    points_reward: number;
    unlocked_at: string;
  }>;
}

// Regular Missions (from dashboard)
export interface Mission {
  id: number;
  title: string;
  description?: string;
  area: 'saude' | 'foco' | 'aprendizado' | 'financas'; // backend area names
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  due_date?: string; // ISO date
  created_at?: string;
}

export interface DashboardResponse {
  user: UserStats;
  recent_missions: Mission[];
  available_missions: Mission[];
  next_achievements: any[];
}

export interface SpecialMissionRequirement {
  [key: string]: any;
}

export interface SpecialMission {
  id: number;
  title: string;
  description: string;
  area: string | null;
  area_icon: string | null;
  requirements: SpecialMissionRequirement;
  reward_points: number;
  reward_item_id: number | null;
  progress: string; // JSON string
  completed: boolean;
  claimed: boolean;
  available_to_claim: boolean;
}

export interface SpecialMissionsResponse {
  user_phone: string;
  special_missions: SpecialMission[];
}

export interface StoreAchievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
  store_achievement_id: string;
  nft_contract: string | null;
  token_id: number | null;
}

export interface StoreAchievementsResponse {
  user_phone: string;
  store_type: 'apple' | 'google';
  achievements: StoreAchievement[];
}

export interface SyncStoreResponse {
  success: boolean;
  synced_count: number;
  user_phone: string;
  store_type: string;
}

// Achievements API
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  area_id: number | null;
  condition_type: string;
  condition_value: number;
  points_reward: number;
  nft_contract: string | null;
  token_id: number | null;
  unlocked_at?: string; // presente apenas se desbloqueada
}

export interface AchievementsResponse {
  user_phone: string;
  unlocked: Achievement[];
  pending: Achievement[];
  total_unlocked: number;
  total_pending: number;
}

/**
 * Lista todas as achievements (desbloqueadas e pendentes)
 */
export async function listAchievements(user_phone: string): Promise<AchievementsResponse> {
  return apiFetch<AchievementsResponse>(`/api/achievements?user_phone=${encodeURIComponent(user_phone)}`);
}

// API Client wrapper
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// Existing endpoints remain unchanged below...

// Rankings & Leaderboards
export async function getRanking(params: {
  area?: string;
  limit?: number;
}): Promise<RankingResponse> {
  const query = new URLSearchParams();
  if (params.area) query.append('area', params.area);
  if (params.limit) query.append('limit', params.limit.toString());
  return apiFetch<RankingResponse>(`/ranking?${query.toString()}`);
}

export async function getLeaderboard(params: {
  type?: 'top10' | 'top100' | 'weekly' | 'monthly';
  area?: string;
}): Promise<LeaderboardResponse> {
  const query = new URLSearchParams();
  if (params.type) query.append('type', params.type);
  if (params.area) query.append('area', params.area);
  return apiFetch<LeaderboardResponse>(`/leaderboard?${query.toString()}`);
}

// Inventory
export async function getUserInventory(user_phone: string): Promise<UserInventoryResponse> {
  return apiFetch<UserInventoryResponse>(`/user/inventory/${encodeURIComponent(user_phone)}`);
}

// Dashboard
export async function getDashboard(user_phone: string): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>(`/dashboard?user_phone=${encodeURIComponent(user_phone)}`);
}

// Special Missions
export async function getSpecialMissions(user_phone: string): Promise<SpecialMissionsResponse> {
  return apiFetch<SpecialMissionsResponse>(`/special-missions/${encodeURIComponent(user_phone)}`);
}

export async function completeSpecialMission(params: {
  user_phone: string;
  special_mission_id: number;
}): Promise<{ success: boolean; mission_title: string; points_awarded: number; item_awarded: number | null }> {
  return apiFetch(`/special-mission/complete`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Store Integration
export async function getStoreAchievements(user_phone: string, store_type: 'apple' | 'google'): Promise<StoreAchievementsResponse> {
  return apiFetch<StoreAchievementsResponse>(`/store/achievements/${encodeURIComponent(user_phone)}?store_type=${store_type}`);
}

export async function syncStoreAchievements(params: {
  user_phone: string;
  store_type: 'apple' | 'google';
  achievement_ids: number[];
}): Promise<SyncStoreResponse> {
  return apiFetch<SyncStoreResponse>(`/store/sync`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ============================================
// AI COACH API ENDPOINTS (StepFun Integration)
// ============================================

export interface AIChatRequest {
  user_phone: string;
  message: string;
  history: ChatMessage[];
  user_data_snapshot?: UserDataSnapshot;
}

export interface AIChatResponse {
  response: string;
  metadata?: {
    command?: string;
    plan?: DailyPlan | WeeklyPlan;
    prediction?: MoodPrediction;
    suggested_mission_id?: number;
  };
}

export interface SaveChatHistoryRequest {
  user_phone: string;
  messages: ChatMessage[];
}

export interface AIPlanRequest {
  user_phone: string;
  user_data_snapshot: UserDataSnapshot;
  plan_type: 'daily' | 'weekly';
  preferences?: {
    difficulty_preference?: 'easy' | 'medium' | 'hard';
    focus_areas?: string[];
  };
}

export interface UserDataSnapshot {
  phone: string;
  name?: string;
  level: number;
  points: number;
  active_missions: ActiveMission[];
  completed_missions_today: number;
  missions_completed_this_week: number;
  current_streak: number;
  longest_streak: number;
  streak_area?: string;
  health?: {
    steps_today: number;
    steps_goal: number;
    sleep_last_night?: number;
    sleep_goal?: number;
    heart_rate_avg?: number;
  };
  performance?: {
    avg_daily_points_7d: number;
    completion_rate_7d: number;
    favorite_area: string;
    engagement_score: number;
  };
}

export interface ActiveMission {
  id: number;
  title: string;
  description: string;
  area: string;
  progress: string;
  due_date: string;
  points_award: number;
}

export interface DailyPlan {
  date: string;
  missions: PlanMission[];
  goals: {
    steps?: number;
    sleep?: number;
    water?: number;
  };
  tips: string[];
}

export interface PlanMission {
  mission_id: number;
  title: string;
  area: string;
  reason: string;
  estimated_difficulty: 'easy' | 'medium' | 'hard';
}

export interface WeeklyPlan {
  week_start: string;
  daily_plans: DailyPlan[];
  overall_focus: string;
  encouragement: string;
}

export interface MoodPrediction {
  predicted_mood: 'great' | 'good' | 'neutral' | 'low' | 'stressed';
  confidence: number;
  factors: string[];
  recommendation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    command?: string;
    plan?: DailyPlan | WeeklyPlan;
    prediction?: MoodPrediction;
    userData?: UserDataSnapshot;
  };
}

/**
 * Send a chat message to the AI Coach and get a response.
 * The backend will use StepFun API and include user data context.
 */
export async function chatWithAI(params: AIChatRequest): Promise<AIChatResponse> {
  return apiFetch<AIChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Save chat history for a user (batch save).
 */
export async function saveChatHistory(params: SaveChatHistoryRequest): Promise<{ success: boolean; saved_count: number }> {
  return apiFetch<{ success: boolean; saved_count: number }>('/ai/chat/history', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Generate a personalized plan (daily or weekly) based on user data.
 */
export async function generatePlan(params: AIPlanRequest): Promise<DailyPlan | WeeklyPlan> {
  return apiFetch<DailyPlan | WeeklyPlan>('/ai/plan', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Predict user mood/performance based on historical data.
 */
export async function predictMood(user_phone: string): Promise<MoodPrediction> {
  return apiFetch<MoodPrediction>(`/ai/predict/${encodeURIComponent(user_phone)}`);
}

/**
 * Get proactive notification suggestions (called periodically by the app or push service).
 */
export interface ProactiveSuggestion {
  type: 'mission_suggestion' | 'encouragement' | 'warning';
  message: string;
  suggested_mission_id?: number;
  priority: 'low' | 'medium' | 'high';
}

export async function getProactiveSuggestions(user_phone: string): Promise<ProactiveSuggestion[]> {
  return apiFetch<ProactiveSuggestion[]>(`/ai/suggestions/${encodeURIComponent(user_phone)}`);
}

/**
 * Fetch user data snapshot for AI context.
 * Combines missions, streaks, health data, and performance metrics.
 */
export async function getUserDataSnapshot(user_phone: string): Promise<UserDataSnapshot> {
  return apiFetch<UserDataSnapshot>(`/ai/user-data/${encodeURIComponent(user_phone)}`);
}
