/**
 * @file AIコーチ画面。現在の日課・マイルストーン・目標の状況を要約して Gemini へ送り、
 * 週次アドバイスを Markdown で受け取って表示する。APIキー未設定時は設定画面へ誘導する。
 */
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { marked } from 'marked';
import { StorageService } from '../../services/storage.service';
import { GeminiService } from '../../services/gemini.service';
import { buildCoachPrompt } from '../../utils/prompt.util';

@Component({
  selector: 'app-coach',
  imports: [RouterLink],
  templateUrl: './coach.html',
  styleUrl: './coach.scss',
})
export class Coach {
  private store = inject(StorageService);
  private gemini = inject(GeminiService);

  protected readonly hasApiKey = computed(() => !!this.store.getSettings().apiKey);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly adviceHtml = signal('');

  async generate(): Promise<void> {
    const settings = this.store.getSettings();
    if (!settings.apiKey) return;

    this.loading.set(true);
    this.error.set('');
    this.adviceHtml.set('');

    try {
      const stats = this.store.getRoutineStats();
      const nextMilestones = [...this.store.milestones()]
        .filter(m => m.status !== 'achieved')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 4);
      const goals = this.store
        .goals()
        .filter(g => g.status !== 'done')
        .slice(0, 8);

      const prompt = buildCoachPrompt({ stats, nextMilestones, goals });
      const text = await this.gemini.generate(settings.apiKey, settings.model, prompt);
      this.adviceHtml.set(await marked.parse(text));
    } catch (e) {
      this.error.set('生成に失敗しました。APIキーやネットワークを確認してください。');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }
}
