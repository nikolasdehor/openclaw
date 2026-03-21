// Stub para contornar erro de compilação - Sprint 1 focar em gamificação
export class AICoach {
  userPhone: string;
  constructor(userPhone: string) {
    this.userPhone = userPhone;
  }
  async loadHistory(): Promise<any[]> { return []; }
  async getInsight(): Promise<{ content: string }> { return { content: "Coach em manutenção" }; }
  async processMessage(message: string): Promise<{ content: string; metadata: any }> {
    return { content: "Em breve", metadata: {} };
  }
  async clearHistory(): Promise<{ success: boolean }> { return { success: true }; }
}
