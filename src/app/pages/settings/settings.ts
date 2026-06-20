/**
 * @file 設定画面。テーマ切替、Gemini APIキー/モデル設定、データの
 * エクスポート/インポート、PDF 由来シードへの再投入を行う。
 */
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppSettings, StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private store = inject(StorageService);

  protected settings: AppSettings = this.store.getSettings();
  protected readonly message = signal('');

  protected save(): void {
    this.store.saveSettings(this.settings);
    this.flash('設定を保存しました。');
  }

  protected toggleTheme(): void {
    this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
    this.store.saveSettings(this.settings);
  }

  // ── データのエクスポート（JSON ダウンロード） ──
  protected exportData(): void {
    const blob = new Blob([this.store.exportAll()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-roadmap-${this.store.toDayKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── データのインポート（JSON ファイル読込） ──
  protected async importData(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      this.store.importAll(text);
      this.flash('データを読み込みました。');
    } catch {
      this.flash('読み込みに失敗しました。ファイル形式を確認してください。');
    } finally {
      input.value = '';
    }
  }

  // ── シード再投入（ログは保持） ──
  protected resetSeed(): void {
    if (confirm('日課・ロードマップ・目標を初期内容（PDF）に戻します。よろしいですか？\n※チェックイン履歴は保持されます。')) {
      this.store.resetToSeed();
      this.flash('初期内容に戻しました。');
    }
  }

  private flash(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(''), 2500);
  }
}
