/**
 * @file ロードマップ年表画面。PDF のマイルストーンを時系列で表示する。
 * 各項目は self（自身で達成）/ external（他者によって達成）と残り日数を示し、
 * クリックで status を pending → in-progress → achieved → pending と循環させる。
 */
import { Component, computed, inject } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { Milestone, MilestoneCategory, MilestoneStatus } from '../../models/milestone.model';

interface TimelineItem extends Milestone {
  daysLeft: number;
  past: boolean;
}

const CATEGORY_ICON: Record<MilestoneCategory, string> = {
  language: '🗣️',
  certification: '📜',
  income: '💰',
  career: '💼',
  life: '🌱',
};

const NEXT_STATUS: Record<MilestoneStatus, MilestoneStatus> = {
  pending: 'in-progress',
  'in-progress': 'achieved',
  achieved: 'pending',
};

@Component({
  selector: 'app-roadmap',
  imports: [],
  templateUrl: './roadmap.html',
  styleUrl: './roadmap.scss',
})
export class Roadmap {
  private store = inject(StorageService);
  private readonly today = new Date();

  protected readonly progress = computed(() => this.store.getRoadmapProgress());

  protected readonly items = computed<TimelineItem[]>(() => {
    const now = this.today.getTime();
    return [...this.store.milestones()]
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map(m => {
        const due = new Date(m.dueDate).getTime();
        return {
          ...m,
          daysLeft: Math.ceil((due - now) / 86400000),
          past: due < now,
        };
      });
  });

  protected icon(category: MilestoneCategory): string {
    return CATEGORY_ICON[category];
  }

  protected statusLabel(status: MilestoneStatus): string {
    return status === 'achieved' ? '達成' : status === 'in-progress' ? '進行中' : '未着手';
  }

  // 残り日数を読みやすい単位に整形
  protected remaining(item: TimelineItem): string {
    if (item.status === 'achieved') return '達成済み';
    if (item.daysLeft < 0) return `${-item.daysLeft}日 経過`;
    if (item.daysLeft < 60) return `あと${item.daysLeft}日`;
    const months = Math.round(item.daysLeft / 30);
    if (months < 24) return `あと約${months}か月`;
    return `あと約${Math.round(item.daysLeft / 365)}年`;
  }

  protected cycleStatus(item: TimelineItem): void {
    this.store.updateMilestone({
      id: item.id,
      dueDate: item.dueDate,
      periodLabel: item.periodLabel,
      age: item.age,
      title: item.title,
      kind: item.kind,
      category: item.category,
      status: NEXT_STATUS[item.status],
    });
  }
}
