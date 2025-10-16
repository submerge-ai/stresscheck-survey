import { User, Role, Question, Result, Questionnaire, AISettings, StressLevel, Answer } from '../types';
import { STRESS_CHECK_QUESTIONS, AI_PERSONA_OPTIONS, DEFAULT_AI_SETTINGS_KEY } from '../constants';

const generateUserId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


const initializeData = () => {
    if (localStorage.getItem('initialized')) return;

    const users: User[] = [
        { id: 'admin', name: '管理者', role: Role.ADMIN, password: 'password' },
        { id: 'staff', name: '支援員A', role: Role.STAFF, password: 'password' },
    ];
    
    // Create 2 sample users with generated IDs
    const user1 = { id: generateUserId(), name: '利用者A', role: Role.USER, password: 'password' };
    const user2 = { id: generateUserId(), name: '利用者B', role: Role.USER, password: 'password' };
    users.push(user1, user2);


    const questionnaires: Questionnaire[] = [
        {
            id: 'q1',
            name: '標準57項目',
            description: '厚生労働省の「職業性ストレス簡易調査票」に基づきます。',
            questionIds: STRESS_CHECK_QUESTIONS.map(q => q.id),
            isActive: true,
            isDefault: true,
        },
        {
            id: 'q2',
            name: '簡易23項目版',
            description: 'ストレス反応を中心に測定する短縮版です。',
            questionIds: STRESS_CHECK_QUESTIONS.slice(17, 40).map(q => q.id),
            isActive: false,
            isDefault: true,
        }
    ];

    const aiSettings: AISettings = {
        persona: AI_PERSONA_OPTIONS[DEFAULT_AI_SETTINGS_KEY].prompt,
        customPrompt: '',
        logoUrl: '',
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('questionnaires', JSON.stringify(questionnaires));
    localStorage.setItem('results', JSON.stringify([]));
    localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
    localStorage.setItem('questions', JSON.stringify(STRESS_CHECK_QUESTIONS));
    localStorage.setItem('initialized', 'true');
};

const getUsers = (): User[] => JSON.parse(localStorage.getItem('users') || '[]');
const getQuestionnaires = (): Questionnaire[] => JSON.parse(localStorage.getItem('questionnaires') || '[]');
const getResults = (): Result[] => JSON.parse(localStorage.getItem('results') || '[]');
const getAiSettings = (): AISettings => JSON.parse(localStorage.getItem('aiSettings') || '{}');
const getQuestions = (): Question[] => JSON.parse(localStorage.getItem('questions') || '[]');

const saveUsers = (users: User[]) => localStorage.setItem('users', JSON.stringify(users));
const saveQuestionnaires = (questionnaires: Questionnaire[]) => localStorage.setItem('questionnaires', JSON.stringify(questionnaires));
const saveResults = (results: Result[]) => localStorage.setItem('results', JSON.stringify(results));
const saveAiSettings = (settings: AISettings) => localStorage.setItem('aiSettings', JSON.stringify(settings));

export const api = {
    initializeData,

    login: async (loginId: string, pass: string): Promise<User | null> => {
        const users = getUsers();
        // For users created via UI, ID is generated. For staff/admin, it could be their name or a specific login ID.
        // The original code uses `id` for login, which is correct.
        const user = users.find(u => u.id === loginId && u.password === pass);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    },

    getUsers: async (): Promise<User[]> => {
        return getUsers().map(({ password, ...user }) => user);
    },
    
    createUser: async (userData: Omit<User, 'id'> & { password?: string }): Promise<User> => {
        const users = getUsers();
        const newUser: User = {
            ...userData,
            id: userData.role === Role.USER ? generateUserId() : userData.name, // Simplified ID for staff/admin
        };
        saveUsers([...users, newUser]);
        const { password, ...userToReturn } = newUser;
        return userToReturn;
    },
    
    deleteUser: async (userId: string): Promise<boolean> => {
        let users = getUsers();
        const initialLength = users.length;
        users = users.filter(u => u.id !== userId);
        if (users.length < initialLength) {
            saveUsers(users);
            return true;
        }
        return false;
    },

    getActiveQuestionnaire: async (): Promise<{ questionnaire: Questionnaire, questions: Question[] } | null> => {
        const questionnaire = getQuestionnaires().find(q => q.isActive);
        if (!questionnaire) return null;
        
        const allQuestions = getQuestions();
        const questions = allQuestions.filter(q => questionnaire.questionIds.includes(q.id));
        return { questionnaire, questions };
    },

    getQuestionnaires: async (): Promise<Questionnaire[]> => getQuestionnaires(),
    
    createQuestionnaire: async(data: Omit<Questionnaire, 'id'|'isActive'>): Promise<Questionnaire> => {
        const questionnaires = getQuestionnaires();
        const newQuestionnaire: Questionnaire = {
            ...data,
            id: `q_${Date.now()}`,
            isActive: false,
        };
        saveQuestionnaires([...questionnaires, newQuestionnaire]);
        return newQuestionnaire;
    },

    deleteQuestionnaire: async(id: string): Promise<boolean> => {
        let questionnaires = getQuestionnaires();
        const q = questionnaires.find(q => q.id === id);
        if (q?.isDefault || q?.isActive) return false; // Cannot delete default or active
        
        const initialLength = questionnaires.length;
        questionnaires = questionnaires.filter(q => q.id !== id);
        if (questionnaires.length < initialLength) {
            saveQuestionnaires(questionnaires);
            return true;
        }
        return false;
    },
    
    updateQuestionnaire: async (updatedQ: Questionnaire): Promise<Questionnaire> => {
        const questionnaires = getQuestionnaires();
        const index = questionnaires.findIndex(q => q.id === updatedQ.id);
        if (index > -1) {
            questionnaires[index] = updatedQ;
            if (updatedQ.isActive) {
                questionnaires.forEach(q => { if (q.id !== updatedQ.id) q.isActive = false; });
            }
            saveQuestionnaires(questionnaires);
        }
        return updatedQ;
    },

    saveResult: async (resultData: Omit<Result, 'id'>): Promise<Result> => {
        const results = getResults();
        const newResult: Result = {
            ...resultData,
            id: `res_${Date.now()}`
        };
        saveResults([...results, newResult]);
        return newResult;
    },

    getResultsForUser: async (userId: string): Promise<Result[]> => {
        return getResults().filter(r => r.userId === userId).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },

    getAiSettings: async (): Promise<AISettings> => getAiSettings(),

    saveAiSettings: async (settings: AISettings): Promise<AISettings> => {
        saveAiSettings(settings);
        return settings;
    },

    calculateStressScore: (answers: Answer[]): { score: number, stressLevel: StressLevel, maxScore: number } => {
        const allQuestions = getQuestions();
        let score = 0;
        let questionsInCalculationCount = 0;
        
        // B: 心身のストレス反応 (IDs 18-46)
        const stressReactionQuestionIds = Array.from({ length: 29 }, (_, i) => i + 18);
        
        answers.forEach(answer => {
            if (!stressReactionQuestionIds.includes(answer.questionId)) return;
            const question = allQuestions.find(q => q.id === answer.questionId);
            if(question) {
                score += question.inverted ? (5 - answer.value) : answer.value;
                questionsInCalculationCount++;
            }
        });

        const maxScore = questionsInCalculationCount * 4;

        let stressLevel: StressLevel;
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        
        if (percentage >= 66) { // High stress threshold (based on 77/116)
            stressLevel = StressLevel.HIGH;
        } else if (percentage >= 52) { // Medium stress (based on 60/116)
            stressLevel = StressLevel.MEDIUM;
        } else {
            stressLevel = StressLevel.LOW;
        }

        return { score, stressLevel, maxScore };
    }
};

// Ensure data exists on first load.
// Note: In a real app, this might be handled differently.
if (typeof window !== 'undefined') {
    api.initializeData();
}