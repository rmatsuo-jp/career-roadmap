/**
 * @file PDF「キャリアパスとゴール v8」から抽出した初期データ。
 * 初回起動時（localStorage が空）に StorageService が投入する。
 * 設定画面の「シード再投入」からも再利用される。
 */
import { RoutineTask } from '../models/routine.model';
import { Milestone } from '../models/milestone.model';
import { Goal } from '../models/goal.model';

// ── 日課（To-Do） ──────────────────────────────────────────────
export function seedRoutineTasks(): RoutineTask[] {
  return [
    { id: 'rt-lang', label: '外国語学習（30分）', category: 'language', schedule: 'daily', targetMinutes: 30, active: true },
    { id: 'rt-gym', label: 'ジムでの運動（15分）', category: 'fitness', schedule: 'daily', targetMinutes: 15, active: true },
    { id: 'rt-new', label: '新しい体験をする', category: 'experience', schedule: 'weekend-holiday', active: true },
    { id: 'rt-review', label: '週次の振り返り・計画修正', category: 'review', schedule: 'weekly-sun', active: true },
  ];
}

// ── マイルストーン年表（When / To-Be） ───────────────────────────
export function seedMilestones(): Milestone[] {
  return [
    { id: 'ms-2026-nc', dueDate: '2026-03-31', periodLabel: '3か月後', age: 27, title: 'NCテストでレベル8達成', kind: 'self', category: 'certification', status: 'pending' },
    { id: 'ms-2026-eng', dueDate: '2026-12-31', periodLabel: '1年後', age: 28, title: '英語圏で流暢にコミュニケーションできる（日常・ビジネス）', kind: 'external', category: 'language', status: 'pending' },
    { id: 'ms-2027-ap', dueDate: '2027-12-31', periodLabel: '2年後', age: 29, title: '応用情報技術者試験（AP）合格', kind: 'self', category: 'certification', status: 'pending' },
    { id: 'ms-2028-pm', dueDate: '2028-12-31', periodLabel: '3年後', age: 30, title: 'プロジェクトマネージャ試験（PM）合格', kind: 'self', category: 'certification', status: 'pending' },
    { id: 'ms-2028-income', dueDate: '2028-12-31', periodLabel: '3年後', age: 30, title: '年収700万円を達成している', kind: 'external', category: 'income', status: 'pending' },
    { id: 'ms-2028-work-en', dueDate: '2028-12-31', periodLabel: '3年後', age: 30, title: '英語を用いて仕事をする機会がある', kind: 'external', category: 'career', status: 'pending' },
    { id: 'ms-2029-hsk', dueDate: '2029-12-31', periodLabel: '4年後', age: 31, title: 'HSK3級合格', kind: 'self', category: 'certification', status: 'pending' },
    { id: 'ms-2029-career', dueDate: '2029-12-31', periodLabel: '4年後', age: 31, title: 'より上位のIT企業に転職できるスキルがある', kind: 'external', category: 'career', status: 'pending' },
    { id: 'ms-2030-topik', dueDate: '2030-12-31', periodLabel: '5年後', age: 32, title: 'TOPIK3級合格', kind: 'self', category: 'certification', status: 'pending' },
    { id: 'ms-2030-income', dueDate: '2030-12-31', periodLabel: '5年後', age: 32, title: '年収1000万円以上を達成している', kind: 'external', category: 'income', status: 'pending' },
    { id: 'ms-2031-deu', dueDate: '2031-12-31', periodLabel: '6年後', age: 33, title: '独検3級合格', kind: 'self', category: 'certification', status: 'pending' },
    { id: 'ms-2031-lead', dueDate: '2031-12-31', periodLabel: '6年後', age: 33, title: '職場をストレスなく主導できる', kind: 'external', category: 'career', status: 'pending' },
    { id: 'ms-2032-jp', dueDate: '2032-12-31', periodLabel: '7年後', age: 34, title: '日本ではどの職場でも通用する力をつけている', kind: 'external', category: 'career', status: 'pending' },
    { id: 'ms-2033-1200', dueDate: '2033-12-31', periodLabel: '8年後', age: 35, title: '英語圏にて働き、年収1200万円を達成している（ITコンサル / PM）', kind: 'external', category: 'income', status: 'pending' },
    { id: 'ms-2034-en-any', dueDate: '2034-12-31', periodLabel: '9年後', age: 36, title: '英語圏のどの職場でも通用する力をつけている', kind: 'external', category: 'career', status: 'pending' },
    { id: 'ms-2035-sv', dueDate: '2035-12-31', periodLabel: '10年後', age: 37, title: 'シリコンバレーで働いている', kind: 'external', category: 'career', status: 'pending' },
    { id: 'ms-2045-2000', dueDate: '2045-12-31', periodLabel: '20年後', age: 47, title: '年収2000万円を達成している', kind: 'external', category: 'income', status: 'pending' },
    { id: 'ms-2055-fire', dueDate: '2055-12-31', periodLabel: '30年後', age: 57, title: '私生活を重視できる仕事を行っている or FIRE', kind: 'external', category: 'life', status: 'pending' },
    { id: 'ms-2065-social', dueDate: '2065-12-31', periodLabel: '40年後', age: 67, title: '人の役に立つ活動を主導し、世界5か国にコネクションがある', kind: 'external', category: 'life', status: 'pending' },
    { id: 'ms-2075-langs', dueDate: '2075-12-31', periodLabel: '50年後', age: 77, title: '日本語・英語・中国語・韓国語・ドイツ語をビジネスレベルで話せる', kind: 'external', category: 'language', status: 'pending' },
  ];
}

// ── 資格・成果目標（定量トラッキング） ───────────────────────────
export function seedGoals(): Goal[] {
  return [
    { id: 'g-nc', title: 'NCテスト レベル8', type: 'language-cert', targetDate: '2026-03-31', status: 'not-started', progress: 0 },
    { id: 'g-ap', title: '応用情報技術者試験（AP）合格', type: 'exam', targetDate: '2027-12-31', status: 'not-started', progress: 0 },
    { id: 'g-pm', title: 'プロジェクトマネージャ試験（PM）合格', type: 'exam', targetDate: '2028-12-31', status: 'not-started', progress: 0 },
    { id: 'g-hsk', title: 'HSK3級合格', type: 'language-cert', targetDate: '2029-12-31', status: 'not-started', progress: 0 },
    { id: 'g-topik', title: 'TOPIK3級合格', type: 'language-cert', targetDate: '2030-12-31', status: 'not-started', progress: 0 },
    { id: 'g-deu', title: '独検3級合格', type: 'language-cert', targetDate: '2031-12-31', status: 'not-started', progress: 0 },
    { id: 'g-inc-700', title: '年収700万円', type: 'income', targetDate: '2028-12-31', status: 'not-started', progress: 0 },
    { id: 'g-inc-1000', title: '年収1000万円', type: 'income', targetDate: '2030-12-31', status: 'not-started', progress: 0 },
    { id: 'g-inc-1200', title: '年収1200万円', type: 'income', targetDate: '2033-12-31', status: 'not-started', progress: 0 },
    { id: 'g-inc-2000', title: '年収2000万円', type: 'income', targetDate: '2045-12-31', status: 'not-started', progress: 0 },
  ];
}
