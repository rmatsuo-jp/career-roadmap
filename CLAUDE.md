# CLAUDE.md

このリポジトリで作業する際の指針。

## 概要
PDF「キャリアパスとゴール v8」を元にした、キャリア達成支援アプリ。
日課トラッカー・ロードマップ年表・資格目標トラッカー・AIコーチの4機能を持つ。

## 規約
- **Angular 22 / standalone components / signals / `inject()`**。NgModule は使わない。
- ファイル命名は `.component` 等のサフィックス無し（`feature.ts/html/scss`）。
- 各ファイル冒頭に日本語の `@file` JSDoc コメントを付ける。
- ルートは `app.routes.ts` で `loadComponent`（遅延ロード）。
- **状態は必ず `StorageService` 経由**。コンポーネントから直接 `localStorage` を触らない。
- UI 文言・コメントは日本語。

## アーキテクチャ
- `services/storage.service.ts` — localStorage 永続化の単一ソース。
  全コレクション（tasks / logs / milestones / goals）を signal で公開し、
  streak・各種統計・export/import・seed 再投入を提供する。
- `services/gemini.service.ts` — Gemini への薄いラッパ（`generate()` のみ）。
- `utils/seed.util.ts` — PDF 由来の初期データ。**ロードマップ内容の変更はここを編集**。
- `utils/prompt.util.ts` — AIコーチ用プロンプト生成。
- `models/` — `routine` / `milestone` / `goal` の型定義。
- `pages/` — `today` / `roadmap` / `goals` / `coach` / `settings`。

## コマンド
- `npm start` 開発サーバ / `npm test` テスト / `npm run build` 本番ビルド / `npm run deploy` GitHub Pages。

## テスト
- Vitest（jsdom）。ロジックは `StorageService` に集約しているため、
  streak・統計・進捗は `storage.service.spec.ts` で決定論的に検証する。
