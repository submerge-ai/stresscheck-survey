
import { Question } from './types';

export const STRESS_CHECK_QUESTIONS: Question[] = [
  // A: 仕事のストレス要因
  { id: 1, text: '非常にたくさんの仕事をしなければならない', category: '量', inverted: false },
  { id: 2, text: '時間内に仕事が処理しきれない', category: '量', inverted: false },
  { id: 3, text: '一生懸命働かなければならない', category: '量', inverted: false },
  { id: 4, text: 'かなり注意を集中する必要がある', category: '質', inverted: false },
  { id: 5, text: '高度の知識や技術が必要なむずかしい仕事だ', category: '質', inverted: false },
  { id: 6, text: '勤務時間中はいつも仕事のことを考えていなければならない', category: '質', inverted: false },
  { id: 7, text: 'からだを大変よく使う仕事だ', category: '身体', inverted: false },
  { id: 8, text: '自分のペースで仕事ができる', category: '裁量', inverted: true },
  { id: 9, text: '自分で仕事の順番・やり方を決めることができる', category: '裁量', inverted: true },
  { id: 10, text: '職場の仕事の方針に自分の意見を反映できる', category: '裁量', inverted: true },
  { id: 11, text: '自分の技能や知識を仕事で使うことが少ない', category: '技能', inverted: false },
  { id: 12, text: '私の部署内で意見のくい違いがある', category: '対人', inverted: false },
  { id: 13, text: '私の部署と他の部署とはうまが合わない', category: '対人', inverted: false },
  { id: 14, text: '私の職場の雰囲気は友好的ではない', category: '対人', inverted: false },
  { id: 15, text: '私の職場の作業環境（騒音、照明、温度、換気など）はよくない', category: '環境', inverted: false },
  { id: 16, text: '仕事の内容は自分にあっている', category: '適合', inverted: true },
  { id: 17, text: '働きがいのある仕事だ', category: 'やりがい', inverted: true },

  // B: 心身のストレス反応
  { id: 18, text: '活気がわいてくる', category: '心理', inverted: true },
  { id: 19, text: '元気がいっぱいだ', category: '心理', inverted: true },
  { id: 20, text: '生き生きする', category: '心理', inverted: true },
  { id: 21, text: '怒りを感じる', category: '心理', inverted: false },
  { id: 22, text: '内心腹立たしい', category: '心理', inverted: false },
  { id: 23, text: 'イライラしている', category: '心理', inverted: false },
  { id: 24, text: 'ひどく疲れた', category: '心理', inverted: false },
  { id: 25, text: 'へとへとだ', category: '心理', inverted: false },
  { id: 26, text: 'だるい', category: '心理', inverted: false },
  { id: 27, text: '気がはりつめている', category: '心理', inverted: false },
  { id: 28, text: '不安だ', category: '心理', inverted: false },
  { id: 29, text: '落着かない', category: '心理', inverted: false },
  { id: 30, text: 'ゆううつだ', category: '心理', inverted: false },
  { id: 31, text: '何をするのも面倒だ', category: '心理', inverted: false },
  { id: 32, text: '物事に集中できない', category: '心理', inverted: false },
  { id: 33, text: '気分が晴れない', category: '心理', inverted: false },
  { id: 34, text: '仕事が手につかない', category: '心理', inverted: false },
  { id: 35, text: '悲しいと感じる', category: '心理', inverted: false },
  { id: 36, text: 'めまいがする', category: '身体', inverted: false },
  { id: 37, text: '体のふしぶしが痛む', category: '身体', inverted: false },
  { id: 38, text: '頭が重かったり頭痛がする', category: '身体', inverted: false },
  { id: 39, text: '首筋や肩がこる', category: '身体', inverted: false },
  { id: 40, text: '腰が痛い', category: '身体', inverted: false },
  { id: 41, text: '目が疲れる', category: '身体', inverted: false },
  { id: 42, text: '動悸や息切れがする', category: '身体', inverted: false },
  { id: 43, text: '胃腸の具合が悪い', category: '身体', inverted: false },
  { id: 44, text: '食欲がない', category: '身体', inverted: false },
  { id: 45, text: '便秘や下痢をする', category: '身体', inverted: false },
  { id: 46, text: 'よく眠れない', category: '身体', inverted: false },

  // C: 周囲のサポート
  { id: 47, text: '上司にどのくらい気軽に話ができますか', category: '上司', inverted: true },
  { id: 48, text: '上司は、あなたが困った時にどのくらい頼りになりますか', category: '上司', inverted: true },
  { id: 49, text: '上司は、あなたの個人的な問題をどのくらい聞いてくれますか', category: '上司', inverted: true },
  { id: 50, text: '職場の同僚にどのくらい気軽に話ができますか', category: '同僚', inverted: true },
  { id: 51, text: '職場の同僚は、あなたが困った時にどのくらい頼りになりますか', category: '同僚', inverted: true },
  { id: 52, text: '職場の同僚は、あなたの個人的な問題をどのくらい聞いてくれますか', category: '同僚', inverted: true },
  { id: 53, text: '配偶者、家族、友人にどのくらい気軽に話ができますか', category: '家族', inverted: true },
  { id: 54, text: '配偶者、家族、友人は、あなたが困った時にどのくらい頼りになりますか', category: '家族', inverted: true },
  { id: 55, text: '配偶者、家族、友人は、あなたの個人的な問題をどのくらい聞いてくれますか', category: '家族', inverted: true },

  // D: 満足度
  { id: 56, text: '仕事に満足だ', category: '満足度', inverted: true },
  { id: 57, text: '家庭生活に満足だ', category: '満足度', inverted: true },
];

export const AI_PERSONA_OPTIONS = {
    'corporate': {
        persona: '企業向け',
        prompt: `あなたは、企業の健康経営をサポートする経験豊富な産業カウンセラーです。利用者のストレスチェック結果に基づき、客観的かつ建設的なフィードバックを提供してください。専門用語を避け、具体的で実行可能なアクションを提案することを心がけてください。常にプロフェッショナルで、共感的かつ丁寧な口調を維持してください。`,
    },
    'support': {
        persona: '就労支援向け',
        prompt: `あなたは、就労支援施設で働く、優しく思いやりのある支援員です。利用者が安心して自己理解を深められるよう、温かく、励ますような言葉でフィードバックを作成してください。「頑張りすぎなくていい」「あなたのペースで大丈夫」といったメッセージを伝え、利用者に寄り添う姿勢を大切にしてください。ポジティブな側面に光を当て、自己肯定感を高めるような言葉を選んでください。`,
    }
};

export const DEFAULT_AI_SETTINGS_KEY = 'corporate';
