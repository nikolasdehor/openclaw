// Chat & AI Coach Types

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

export interface UserDataSnapshot {
  // User basic info
  phone: string;
  name?: string;
  level: number;
  points: number;

  // Missions
  active_missions: ActiveMission[];
  completed_missions_today: number;
  missions_completed_this_week: number;

  // Streaks
  current_streak: number;
  longest_streak: number;
  streak_area?: string;

  // Health data (if connected)
  health?: {
    steps_today: number;
    steps_goal: number;
    sleep_last_night?: number;
    sleep_goal?: number;
    heart_rate_avg?: number;
  };

  // Performance metrics
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
  progress: string; // JSON string with progress details
  due_date: string;
  points_award: number;
}

export interface DailyPlan {
  date: string; // ISO date
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
  reason: string; // AI explanation why this mission was chosen
  estimated_difficulty: 'easy' | 'medium' | 'hard';
}

export interface WeeklyPlan {
  week_start: string; // ISO date (Monday)
  daily_plans: DailyPlan[];
  overall_focus: string;
  encouragement: string;
}

export interface MoodPrediction {
  predicted_mood: 'great' | 'good' | 'neutral' | 'low' | 'stressed';
  confidence: number; // 0-1
  factors: string[];
  recommendation: string;
}

export interface ChatCommand {
  name: string;
  patterns: string[]; // regex or keywords
  handler: (context: CommandContext) => Promise<ChatResponse>;
}

export interface CommandContext {
  userData: UserDataSnapshot | null;
  chatHistory: ChatMessage[];
  userMessage: string;
}

export interface ChatResponse {
  content: string;
  metadata?: {
    command?: string;
    plan?: DailyPlan | WeeklyPlan;
    prediction?: MoodPrediction;
    suggested_mission?: ActiveMission;
  };
}

// Backend API extensions for AI Coach
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

export interface HealthData {
  steps_today: number;
  steps_goal: number;
  sleep_last_night?: number;
  sleep_goal?: number;
  heart_rate_avg?: number;
  water_intake?: number;
  water_goal?: number;
}
