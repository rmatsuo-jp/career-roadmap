/**
 * @file 資格・成果目標（To-Be のうち定量管理する項目）の型定義。
 * 進捗を 0-100% で持ち、ステータスで未着手／学習中／達成を区別する。
 */

export type GoalType =
  | 'exam' // 情報系試験（AP / PM など）
  | 'language-cert' // 語学検定（NC / HSK / TOPIK / 独検）
  | 'income' // 年収目標
  | 'career'; // キャリア目標

export type GoalStatus = 'not-started' | 'in-progress' | 'done';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  targetDate?: string; // ISO 日付（任意）
  status: GoalStatus;
  progress: number; // 0-100
  note?: string;
}
