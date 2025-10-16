export enum Role {
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string; // 4-digit alphanumeric for USER, login ID for others
  name: string;
  role: Role;
  password?: string; // Only used for login, not stored in state
  assignedStaffId?: string; // For USER role
}

export interface Question {
  id: number;
  text: string;
  category: string;
  inverted: boolean;
}

export interface Questionnaire {
    id: string;
    name: string;
    description: string;
    questionIds: number[];
    isActive: boolean;
    isDefault?: boolean;
}

export type Answer = {
  questionId: number;
  value: number; // 1-4 scale
};

export enum StressLevel {
    LOW = '低',
    MEDIUM = '中',
    HIGH = '高',
}

export interface Result {
    id: string;
    userId: string;
    date: string; // ISO string
    answers: Answer[];
    score: number;
    maxScore: number;
    stressLevel: StressLevel;
    aiFeedback: string;
}

export interface AISettings {
    persona: string;
    customPrompt: string;
    logoUrl?: string; // Base64 encoded image string
}