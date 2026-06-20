/**
 * @file ルートコンポーネント。ヘッダーナビゲーションと RouterOutlet を持つアプリシェル。
 * 起動時に StorageService から theme 設定を読み取り、document ルートの data-theme 属性へ反映する。
 */
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // ナビゲーション項目（path / ラベル / アイコン絵文字）
  protected readonly navItems = [
    { path: '/today', label: '日課', icon: '✅' },
    { path: '/roadmap', label: 'ロードマップ', icon: '🗺️' },
    { path: '/goals', label: '資格・目標', icon: '🎯' },
    { path: '/coach', label: 'AIコーチ', icon: '🤖' },
    { path: '/settings', label: '設定', icon: '⚙️' },
  ];

  constructor() {
    const theme = inject(StorageService).getSettings().theme;
    document.documentElement.dataset['theme'] = theme;
  }
}
