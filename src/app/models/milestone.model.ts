/**
 * @file マイルストーン（When / To-Be）の型定義。
 * PDF のロードマップ年表（3か月後〜50年後）の各到達点を表す。
 * kind: self=自身で達成できる目標 / external=他者によって達成される目標。
 */

export type MilestoneKind = 'self' | 'external';

export type MilestoneCategory =
  | 'language' // 語学・コミュニケーション
  | 'certification' // 資格試験
  | 'income' // 年収
  | 'career' // キャリア・働き方
  | 'life'; // 私生活・社会貢献

export type MilestoneStatus = 'pending' | 'in-progress' | 'achieved';

export interface Milestone {
  id: string;
  dueDate: string; // ISO 日付（YYYY-MM-DD）
  periodLabel: string; // 例: "3か月後", "10年後"
  age: number; // 到達時の年齢
  title: string;
  kind: MilestoneKind;
  category: MilestoneCategory;
  status: MilestoneStatus;
}
