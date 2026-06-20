/**
 * @file StorageService の streak / 統計 / 進捗ロジックのユニットテスト。
 * localStorage を毎回クリアし、決定論的な日課（毎日タスク1件）で検証する。
 */
import { StorageService } from './storage.service';
import { RoutineTask } from '../models/routine.model';

const DAILY_TASK: RoutineTask = {
  id: 't-daily',
  label: 'テスト日課',
  category: 'language',
  schedule: 'daily',
  active: true,
};

// 毎日タスク1件だけを持つ状態の StorageService を作る
function freshStoreWithSingleDaily(): StorageService {
  localStorage.clear();
  const store = new StorageService();
  for (const t of [...store.tasks()]) store.deleteTask(t.id);
  store.addTask({ ...DAILY_TASK });
  return store;
}

function dayKey(store: StorageService, iso: string): string {
  return store.toDayKey(new Date(iso));
}

describe('StorageService', () => {
  beforeEach(() => localStorage.clear());

  it('初回起動時はシードが投入される', () => {
    const store = new StorageService();
    expect(store.tasks().length).toBeGreaterThan(0);
    expect(store.milestones().length).toBe(20);
    expect(store.goals().length).toBe(10);
  });

  it('toggleLog は完了状態をトグルする', () => {
    const store = freshStoreWithSingleDaily();
    const key = dayKey(store, '2026-06-20');
    expect(store.isDone('t-daily', key)).toBe(false);
    expect(store.toggleLog('t-daily', key)).toBe(true);
    expect(store.isDone('t-daily', key)).toBe(true);
    expect(store.toggleLog('t-daily', key)).toBe(false);
    expect(store.isDone('t-daily', key)).toBe(false);
  });

  it('当日を完了すると streak は 1', () => {
    const store = freshStoreWithSingleDaily();
    const today = new Date('2026-06-20T12:00:00');
    store.toggleLog('t-daily', store.toDayKey(today));
    expect(store.getStreak(today)).toBe(1);
  });

  it('連続した日を完了すると streak が伸びる', () => {
    const store = freshStoreWithSingleDaily();
    const today = new Date('2026-06-20T12:00:00');
    store.toggleLog('t-daily', dayKey(store, '2026-06-20'));
    store.toggleLog('t-daily', dayKey(store, '2026-06-19'));
    store.toggleLog('t-daily', dayKey(store, '2026-06-18'));
    expect(store.getStreak(today)).toBe(3);
  });

  it('今日が未完了でも昨日まで完了なら streak は継続する', () => {
    const store = freshStoreWithSingleDaily();
    const today = new Date('2026-06-20T12:00:00');
    store.toggleLog('t-daily', dayKey(store, '2026-06-19'));
    expect(store.getStreak(today)).toBe(1);
  });

  it('途切れた日があると streak はそこで止まる', () => {
    const store = freshStoreWithSingleDaily();
    const today = new Date('2026-06-20T12:00:00');
    store.toggleLog('t-daily', dayKey(store, '2026-06-20'));
    // 06-19 は未完了
    store.toggleLog('t-daily', dayKey(store, '2026-06-18'));
    expect(store.getStreak(today)).toBe(1);
  });

  it('getRoutineStats は当日と直近7日を集計する', () => {
    const store = freshStoreWithSingleDaily();
    const today = new Date('2026-06-20T12:00:00');
    store.toggleLog('t-daily', store.toDayKey(today));
    const stats = store.getRoutineStats(today);
    expect(stats.todayTotal).toBe(1);
    expect(stats.todayDone).toBe(1);
    // 直近7日: 対象7日 / 完了1日 → 14%
    expect(stats.last7DaysRate).toBe(14);
  });

  it('getRoadmapProgress は achieved の割合を返す', () => {
    const store = new StorageService();
    expect(store.getRoadmapProgress()).toBe(0);
    const first = store.milestones()[0];
    store.updateMilestone({ ...first, status: 'achieved' });
    // 20件中1件 → 5%
    expect(store.getRoadmapProgress()).toBe(5);
  });

  it('exportAll / importAll でデータを往復できる', () => {
    const store = freshStoreWithSingleDaily();
    store.toggleLog('t-daily', dayKey(store, '2026-06-20'));
    const json = store.exportAll();

    localStorage.clear();
    const restored = new StorageService();
    restored.importAll(json);
    expect(restored.tasks().some(t => t.id === 't-daily')).toBe(true);
    expect(restored.isDone('t-daily', dayKey(restored, '2026-06-20'))).toBe(true);
  });

  it('resetToSeed はタスク/目標を初期状態へ戻す', () => {
    const store = freshStoreWithSingleDaily();
    expect(store.tasks().length).toBe(1);
    store.resetToSeed();
    expect(store.tasks().length).toBe(4);
    expect(store.goals().length).toBe(10);
  });
});
