/**
 * @file 資格・成果トラッカー画面。資格／年収などの目標を type ごとにまとめて表示し、
 * status（未着手/学習中/達成）と進捗(0-100%)を編集・保存できる。新規追加・削除も可能。
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { Goal, GoalStatus, GoalType } from '../../models/goal.model';

interface GoalGroup {
  type: GoalType;
  label: string;
  icon: string;
  goals: Goal[];
}

const TYPE_META: Record<GoalType, { label: string; icon: string }> = {
  exam: { label: 'IT試験', icon: '🖥️' },
  'language-cert': { label: '語学検定', icon: '🗣️' },
  income: { label: '年収', icon: '💰' },
  career: { label: 'キャリア', icon: '💼' },
};

@Component({
  selector: 'app-goals',
  imports: [FormsModule],
  templateUrl: './goals.html',
  styleUrl: './goals.scss',
})
export class Goals {
  private store = inject(StorageService);

  protected readonly groups = computed<GoalGroup[]>(() => {
    const types: GoalType[] = ['exam', 'language-cert', 'income', 'career'];
    return types
      .map(type => ({
        type,
        label: TYPE_META[type].label,
        icon: TYPE_META[type].icon,
        goals: this.store.goals().filter(g => g.type === type),
      }))
      .filter(g => g.goals.length > 0);
  });

  // 新規追加フォームの表示状態
  protected readonly showAdd = signal(false);
  protected newTitle = '';
  protected newType: GoalType = 'exam';
  protected newDate = '';

  protected statusLabel(status: GoalStatus): string {
    return status === 'done' ? '達成' : status === 'in-progress' ? '学習中' : '未着手';
  }

  protected setStatus(goal: Goal, status: GoalStatus): void {
    // 達成にしたら進捗100%、未着手に戻したら0%へ寄せる
    const progress = status === 'done' ? 100 : status === 'not-started' ? 0 : goal.progress;
    this.store.updateGoal({ ...goal, status, progress });
  }

  protected setProgress(goal: Goal, value: number): void {
    const progress = Math.max(0, Math.min(100, value));
    // 進捗に応じて status を自動補正
    const status: GoalStatus = progress >= 100 ? 'done' : progress > 0 ? 'in-progress' : 'not-started';
    this.store.updateGoal({ ...goal, progress, status });
  }

  protected updateNote(goal: Goal, note: string): void {
    this.store.updateGoal({ ...goal, note });
  }

  protected remove(goal: Goal): void {
    if (confirm(`「${goal.title}」を削除しますか？`)) {
      this.store.deleteGoal(goal.id);
    }
  }

  protected addGoal(): void {
    const title = this.newTitle.trim();
    if (!title) return;
    this.store.addGoal({
      id: crypto.randomUUID(),
      title,
      type: this.newType,
      targetDate: this.newDate || undefined,
      status: 'not-started',
      progress: 0,
    });
    this.newTitle = '';
    this.newDate = '';
    this.showAdd.set(false);
  }
}
