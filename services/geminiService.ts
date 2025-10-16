import { GoogleGenAI } from "@google/genai";
import { Result, User, Question, Answer } from '../types';
import { STRESS_CHECK_QUESTIONS } from '../constants';
import { api } from './mockApi';

const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API_KEY environment variable not set.");
    throw new Error("API_KEY environment variable not set.");
  }
  return key;
};

let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: getApiKey() });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

const getQuestionText = (id: number): string => {
    return STRESS_CHECK_QUESTIONS.find(q => q.id === id)?.text || '不明な質問';
}

export const geminiService = {
  generateUserFeedback: async (result: Omit<Result, 'id' | 'aiFeedback'>): Promise<string> => {
    if (!ai) return "AIサービスの初期化に失敗しました。";
    try {
        const settings = await api.getAiSettings();
        const systemInstruction = settings.customPrompt || settings.persona;

        const answerDetails = result.answers.map(answer => 
            `- ${getQuestionText(answer.questionId)}: ${answer.value}`
        ).join('\n');

        const prompt = `
以下のストレスチェック結果に対して、利用者が自己理解を深め、安心できるようなフィードバックを提供してください。
結果をポジティブに捉え直し、具体的なセルフケアのヒントを1つか2つ提案してください。

あなたのペルソナ: ${systemInstruction}

ストレスレベル: ${result.stressLevel}
合計スコア: ${result.score} / ${result.maxScore}

回答詳細:
${answerDetails}

フィードバックは、200字程度で簡潔にお願いします。
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
                topK: 32,
            }
        });

      return response.text;
    // FIX: Added curly braces to the catch block to correctly handle the error and prevent syntax errors.
    } catch (error) {
      console.error('Error generating user feedback:', error);
      return 'AIによるフィードバックの生成中にエラーが発生しました。しばらくしてからもう一度お試しください。';
    }
  },

  generateStaffReport: async (user: User, results: Result[]): Promise<string> => {
    if (!ai) return "AIサービスの初期化に失敗しました。";
    if (results.length === 0) {
      return "分析対象のデータがありません。";
    }

    try {
      const latestResult = results[results.length - 1];
      const scorePercent = latestResult.maxScore > 0 ? Math.round((latestResult.score / latestResult.maxScore) * 100) : 0;
      const history = results.map(r => 
        `日付: ${new Date(r.date).toLocaleDateString()}, ストレスレベル: ${r.stressLevel}, スコア: ${r.score}/${r.maxScore} (${Math.round((r.score / r.maxScore) * 100)}%)`
      ).join('\n');
      
      const answerDetails = latestResult.answers.map(answer => {
          const question = STRESS_CHECK_QUESTIONS.find(q => q.id === answer.questionId);
          if (!question) return '';
          return `- ${question.category}「${question.text}」: ${answer.value}`;
      }).join('\n');


      const prompt = `
あなたは経験豊富な産業カウンセラーです。就労支援施設の担当者向けに、以下のデータから利用者の状況を分析し、支援のヒントとなるレポートを作成してください。レポートは個人が特定されないよう、IDのみを使用してください。

**利用者情報:**
- 利用者ID: ${user.id}

**ストレスレベル履歴:**
${history}

**最新の回答内容 (日付: ${new Date(latestResult.date).toLocaleDateString()}, スコア: ${latestResult.score}/${latestResult.maxScore}, ${scorePercent}%):**
${answerDetails}

**レポート作成指示:**
厚生労働省の指針を参考に、以下の4つの観点について、専門的かつ構造化された分析と具体的なアドバイスを提供してください。担当者が次のアクションを考えやすくなるように、客観的な事実と専門的な洞察を組み合わせて記述してください。

1.  **仕事の負担:**
    仕事の量的・質的負担、裁量権、対人関係など、仕事に関連するストレス要因を分析してください。特に注意すべき項目を指摘してください。

2.  **心身の反応:**
    心理的なストレス反応（イライラ、不安、抑うつなど）と身体的な愁訴（疲労感、不眠、痛みなど）の両面から、現在の心身の状態を評価してください。

3.  **周囲のサポート:**
    職場の上司や同僚、そして家族や友人からのサポートがどの程度得られているかを評価してください。サポートリソースの活用状況について考察してください。

4.  **具体的なアドバイス:**
    上記1〜3の分析に基づき、担当者がこの利用者に対して行うべき具体的な支援や面談での質問事項などを提案してください。短期的な介入と中長期的な視点の両方からアドバイスをお願いします。
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.5,
        }
      });
      
      return response.text;

    } catch (error) {
      console.error('Error generating staff report:', error);
      return 'AIによるレポート生成中にエラーが発生しました。';
    }
  }
};