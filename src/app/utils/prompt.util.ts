/**
 * @file AIコーチへ送るプロンプトを組み立てるユーティリティ。
 * 現在の日課達成状況・直近の未達成マイルストーン・資格目標の進捗を要約し、
 * 励ましと今週の具体的アクション提案を日本語 Markdown で返すよう指示する。
 */
import { RoutineStats } from '../services/storage.service';
import { Milestone } from '../models/milestone.model';
import { Goal } from '../models/goal.model';

export interface CoachContext {
  stats: RoutineStats;
  nextMilestones: Milestone[]; // 直近の未達成マイルストーン（数件）
  goals: Goal[]; // 学習中／未着手の主要目標
}

export function buildCoachPrompt(ctx: CoachContext): string {
  const { stats, nextMilestones, goals } = ctx;

  const milestoneLines = nextMilestones
    .map(m => `- ${m.dueDate}（${m.periodLabel}・${m.age}歳）: ${m.title}`)
    .join('\n');

  const goalLines = goals
    .map(g => `- ${g.title}（${statusLabel(g.status)} / 進捗${g.progress}%${g.targetDate ? ` / 目標 ${g.targetDate}` : ''}）`)
    .join('\n');

  return `あなたはキャリア達成を支援する優秀なライフコーチです。
以下はユーザーの長期キャリアロードマップと現在の状況です。これを踏まえ、
ユーザーが目標へ着実に近づけるよう、温かく具体的なアドバイスを日本語の Markdown で返してください。

# 現在の日課の状況
- 連続達成日数: ${stats.currentStreak}日
- 今日の日課: ${stats.todayDone}/${stats.todayTotal} 完了
- 直近7日の達成率: ${stats.last7DaysRate}%

# 直近の未達成マイルストーン
${milestoneLines || '（なし）'}

# 資格・成果目標の進捗
${goalLines || '（なし）'}

# 出力フォーマット（厳守）
## 今週のひとこと
（現状を踏まえた1〜2文の励まし）

## 今週の3つのアクション
1. （具体的で実行可能なアクション）
2. （同上）
3. （同上）

## 注意したいこと
（つまずきやすい点や優先順位のアドバイスを1〜2文で）

※ 説教くさくならず、前向きで簡潔に。専門用語は避けてください。`;
}

function statusLabel(status: Goal['status']): string {
  switch (status) {
    case 'not-started':
      return '未着手';
    case 'in-progress':
      return '学習中';
    case 'done':
      return '達成';
  }
}
