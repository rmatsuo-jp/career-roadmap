/**
 * @file LocalStorage への永続化を担うサービス。
 * 日課タスク・日課ログ・マイルストーン・資格目標・設定を一元管理する。
 * 各コレクションを signal で公開し、コンポーネントは必ずこのサービス経由で読み書きする。
 * 初回起動（localStorage が空）時は seed.util の初期データを投入する。
 */
import { Injectable, computed, signal } from '@angular/core';
import { RoutineLog, RoutineTask } from '../models/routine.model';
import { Milestone } from '../models/milestone.model';
import { Goal } from '../models/goal.model';
import { seedGoals, seedMilestones, seedRoutineTasks } from '../utils/seed.util';

const TASKS_KEY = 'cr_routine_tasks';
const LOGS_KEY = 'cr_routine_logs';
const MILESTONES_KEY = 'cr_milestones';
const GOALS_KEY = 'cr_goals';
const SETTINGS_KEY = 'cr_settings';

// ── 設定型・デフォルト値 ──────────────────────────────────────────
export interface AppSettings {
  apiKey: string;
  model: string;
  theme: 'light' | 'dark';
}

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'gemini-3.5-flash',
  theme: 'dark',
};

// ── 日課統計（ダッシュボード表示用） ──────────────────────────────
export interface RoutineStats {
  currentStreak: number; // 連続達成日数（その日の対象タスクを全て完了した日が連続した数）
  todayDone: number; // 当日の完了タスク数
  todayTotal: number; // 当日の対象タスク数
  last7DaysRate: number; // 直近7日の達成率（0-100, 整数）
}

// 全データのエクスポート/インポート形式
export interface ExportBundle {
  version: 1;
  exportedAt: string;
  tasks: RoutineTask[];
  logs: RoutineLog[];
  milestones: Milestone[];
  goals: Goal[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  // ── Signal キャッシュ（読み取り専用で公開） ──────────────────────
  private _tasks = signal<RoutineTask[]>(this.load(TASKS_KEY, seedRoutineTasks));
  private _logs = signal<RoutineLog[]>(this.load(LOGS_KEY, () => []));
  private _milestones = signal<Milestone[]>(this.load(MILESTONES_KEY, seedMilestones));
  private _goals = signal<Goal[]>(this.load(GOALS_KEY, seedGoals));

  readonly tasks = this._tasks.asReadonly();
  readonly logs = this._logs.asReadonly();
  readonly milestones = this._milestones.asReadonly();
  readonly goals = this._goals.asReadonly();

  // アクティブな日課のみ（順序は seed の定義順）
  readonly activeTasks = computed(() => this._tasks().filter(t => t.active));

  constructor() {
    // 初回起動時はシードを永続化しておく（次回以降の整合性のため）
    this.ensurePersisted(TASKS_KEY, this._tasks());
    this.ensurePersisted(MILESTONES_KEY, this._milestones());
    this.ensurePersisted(GOALS_KEY, this._goals());
  }

  // ── 汎用ロード/保存 ───────────────────────────────────────────────
  private load<T>(key: string, fallback: () => T): T {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback();
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback();
    }
  }

  private ensurePersisted(key: string, value: unknown): void {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  private persist<T>(key: string, value: T, sig: { set(v: T): void }): void {
    localStorage.setItem(key, JSON.stringify(value));
    sig.set(value);
  }

  // ── 日課タスク CRUD ──────────────────────────────────────────────
  addTask(task: RoutineTask): void {
    this.persist(TASKS_KEY, [...this._tasks(), task], this._tasks);
  }

  updateTask(task: RoutineTask): void {
    this.persist(TASKS_KEY, this._tasks().map(t => (t.id === task.id ? task : t)), this._tasks);
  }

  deleteTask(id: string): void {
    this.persist(TASKS_KEY, this._tasks().filter(t => t.id !== id), this._tasks);
    // 関連ログも削除
    this.persist(LOGS_KEY, this._logs().filter(l => l.taskId !== id), this._logs);
  }

  // ── 日課ログ（チェックイン） ──────────────────────────────────────
  // 指定日のタスク完了状態をトグルし、最新状態（done）を返す。
  toggleLog(taskId: string, date: string): boolean {
    const existing = this._logs().find(l => l.taskId === taskId && l.date === date);
    if (existing) {
      const updated = this._logs().map(l =>
        l === existing ? { ...l, done: !l.done } : l
      );
      this.persist(LOGS_KEY, updated, this._logs);
      return !existing.done;
    }
    const log: RoutineLog = { id: crypto.randomUUID(), taskId, date, done: true };
    this.persist(LOGS_KEY, [...this._logs(), log], this._logs);
    return true;
  }

  isDone(taskId: string, date: string): boolean {
    return this._logs().some(l => l.taskId === taskId && l.date === date && l.done);
  }

  // 指定日に対象となるタスク（schedule と曜日で判定）
  tasksForDate(date: Date): RoutineTask[] {
    const day = date.getDay(); // 0=日, 6=土
    return this.activeTasks().filter(t => {
      switch (t.schedule) {
        case 'daily':
          return true;
        case 'weekend-holiday':
          return day === 0 || day === 6;
        case 'weekly-sun':
          return day === 0;
      }
    });
  }

  // ── 日課統計 ──────────────────────────────────────────────────────
  getRoutineStats(today = new Date()): RoutineStats {
    const todayKey = this.toDayKey(today);
    const todayTasks = this.tasksForDate(today);
    const todayDone = todayTasks.filter(t => this.isDone(t.id, todayKey)).length;

    // 直近7日の達成率（対象タスク数に対する完了割合）
    let total = 0;
    let done = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = this.toDayKey(d);
      const dayTasks = this.tasksForDate(d);
      total += dayTasks.length;
      done += dayTasks.filter(t => this.isDone(t.id, key)).length;
    }
    const last7DaysRate = total === 0 ? 0 : Math.round((done / total) * 100);

    return {
      currentStreak: this.getStreak(today),
      todayDone,
      todayTotal: todayTasks.length,
      last7DaysRate,
    };
  }

  // 連続達成日数: 今日（未達なら昨日）を起点に「その日の対象タスクを全完了」した日を遡って数える。
  // 対象タスクが 0 件の日（=やることが無い日）は streak を途切れさせず単純にスキップする。
  getStreak(today = new Date()): number {
    const cursor = new Date(today);
    // 今日がまだ全完了でなければ昨日を起点にする（今日の未達で streak を 0 にしない）
    if (!this.isDayComplete(cursor)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    let streak = 0;
    // 過去 365 日まで遡る（無限ループ防止）
    for (let i = 0; i < 365; i++) {
      const tasks = this.tasksForDate(cursor);
      if (tasks.length === 0) {
        // 対象タスクのない日はスキップ（streak 継続）
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      if (this.isDayComplete(cursor)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // その日の対象タスクを全て完了しているか（対象 0 件なら false）
  private isDayComplete(date: Date): boolean {
    const tasks = this.tasksForDate(date);
    if (tasks.length === 0) return false;
    const key = this.toDayKey(date);
    return tasks.every(t => this.isDone(t.id, key));
  }

  // ── マイルストーン ────────────────────────────────────────────────
  updateMilestone(ms: Milestone): void {
    this.persist(MILESTONES_KEY, this._milestones().map(m => (m.id === ms.id ? ms : m)), this._milestones);
  }

  // 年表進捗: achieved の割合（0-100）
  getRoadmapProgress(): number {
    const all = this._milestones();
    if (all.length === 0) return 0;
    const achieved = all.filter(m => m.status === 'achieved').length;
    return Math.round((achieved / all.length) * 100);
  }

  // 次の未達成マイルストーン（dueDate 昇順で最初の pending/in-progress）
  getNextMilestone(today = new Date()): Milestone | undefined {
    return [...this._milestones()]
      .filter(m => m.status !== 'achieved')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .find(m => new Date(m.dueDate).getTime() >= today.getTime() - 86400000)
      ?? [...this._milestones()].filter(m => m.status !== 'achieved').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  }

  // ── 資格・成果目標 ────────────────────────────────────────────────
  updateGoal(goal: Goal): void {
    this.persist(GOALS_KEY, this._goals().map(g => (g.id === goal.id ? goal : g)), this._goals);
  }

  addGoal(goal: Goal): void {
    this.persist(GOALS_KEY, [...this._goals(), goal], this._goals);
  }

  deleteGoal(id: string): void {
    this.persist(GOALS_KEY, this._goals().filter(g => g.id !== id), this._goals);
  }

  // ── 設定管理 ──────────────────────────────────────────────────────
  getSettings(): AppSettings {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.dataset['theme'] = settings.theme;
  }

  // ── エクスポート / インポート / リセット ─────────────────────────
  exportAll(): string {
    const bundle: ExportBundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: this._tasks(),
      logs: this._logs(),
      milestones: this._milestones(),
      goals: this._goals(),
    };
    return JSON.stringify(bundle, null, 2);
  }

  importAll(json: string): void {
    const bundle = JSON.parse(json) as ExportBundle;
    if (bundle.tasks) this.persist(TASKS_KEY, bundle.tasks, this._tasks);
    if (bundle.logs) this.persist(LOGS_KEY, bundle.logs, this._logs);
    if (bundle.milestones) this.persist(MILESTONES_KEY, bundle.milestones, this._milestones);
    if (bundle.goals) this.persist(GOALS_KEY, bundle.goals, this._goals);
  }

  // PDF 由来のシードへ戻す（ログは保持）。
  resetToSeed(): void {
    this.persist(TASKS_KEY, seedRoutineTasks(), this._tasks);
    this.persist(MILESTONES_KEY, seedMilestones(), this._milestones);
    this.persist(GOALS_KEY, seedGoals(), this._goals);
  }

  // ── 日付をローカル時刻の YYYY-MM-DD キーに正規化 ──────────────────
  toDayKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
