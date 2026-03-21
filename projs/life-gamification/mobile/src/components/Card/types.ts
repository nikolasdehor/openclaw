export type AreaType = 'bolsa' | 'mente' | 'vitalidade' | 'proposito';

export interface MissionCardProps {
  title: string;
  area: AreaType;
  areaName: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  onComplete: () => void;
  dueDate?: Date;
  disabled?: boolean;
}
