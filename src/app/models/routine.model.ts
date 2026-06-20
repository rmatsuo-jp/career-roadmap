/**
 * @file 日課（To-Do）関連の型定義。
 * RoutineTask は「毎日／毎土日祝／毎週日曜」のいずれかの頻度を持つ習慣。
 * RoutineLog はある日付における各タスクの実施記録（チェックイン）。
 */

// タスクの分類（PDF の To-Do に対応）
export type RoutineCategory = 'language' | 'fitness' | 'experience' | 'review';

// 実施頻度
export type RoutineSchedule =
  | 'daily' // 毎日
  | 'weekend-holiday' // 毎土日祝（簡易的に土日で判定）
  | 'weekly-sun'; // 毎週日曜

export interface RoutineTask {
  id: string;
  label: string;
  category: RoutineCategory;
  schedule: RoutineSchedule;
  targetMinutes?: number; // 目標時間（分）。任意。
  active: boolean; // 無効化したタスクは当日リストに出さない
}

export interface RoutineLog {
  id: string;
  taskId: string;
  date: string; // ローカル日付 YYYY-MM-DD
  done: boolean;
  note?: string;
}
