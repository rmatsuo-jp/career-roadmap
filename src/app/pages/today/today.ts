/**
 * @file 日課トラッカー画面。当日の対象日課のチェックイン、連続達成日数(streak)、
 * 直近7日の達成グリッドを表示する。状態はすべて StorageService の signal を参照する。
 */
import { Component, computed, inject } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { RoutineCategory } from '../../models/routine.model';

interface DayCell {
  key: string;
  weekday: string;
  isToday: boolean;
  total: number;
  done: number;
  complete: boolean;
}

const CATEGORY_ICON: Record<RoutineCategory, string> = {
  language: '🗣️',
  fitness: '💪',
  experience: '✨',
  review: '📝',
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

@Component({
  selector: 'app-today',
  imports: [],
  templateUrl: './today.html',
  styleUrl: './today.scss',
})
export class Today {
  private store = inject(StorageService);

  protected readonly today = new Date();
  protected readonly todayKey = this.store.toDayKey(this.today);
  protected readonly todayLabel = `${this.today.getMonth() + 1}月${this.today.getDate()}日（${WEEKDAYS[this.today.getDay()]}）`;

  // 当日の対象タスク（activeTasks signal に依存 → リアクティブ）
  protected readonly tasks = computed(() => this.store.tasksForDate(this.today));
  protected readonly stats = computed(() => this.store.getRoutineStats(this.today));

  // 直近7日の達成グリッド（古い順）
  protected readonly week = computed<DayCell[]>(() => {
    const cells: DayCell[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(this.today);
      d.setDate(d.getDate() - i);
      const key = this.store.toDayKey(d);
      const dayTasks = this.store.tasksForDate(d);
      const done = dayTasks.filter(t => this.store.isDone(t.id, key)).length;
      cells.push({
        key,
        weekday: WEEKDAYS[d.getDay()],
        isToday: i === 0,
        total: dayTasks.length,
        done,
        complete: dayTasks.length > 0 && done === dayTasks.length,
      });
    }
    return cells;
  });

  protected icon(category: RoutineCategory): string {
    return CATEGORY_ICON[category];
  }

  protected isDone(taskId: string): boolean {
    return this.store.isDone(taskId, this.todayKey);
  }

  protected toggle(taskId: string): void {
    this.store.toggleLog(taskId, this.todayKey);
  }
}
