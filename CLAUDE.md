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
- `npm start` 開発サーバ / `npm test` テスト / `npm run build` 本番ビルド / `npm run deploy` GitHub Pages（手動）。
  - 通常のデプロイは main への push で GitHub Actions（`.github/workflows/deploy.yml`）が自動実行する。
    `npm run deploy` は手動デプロイ用として残してあるが、バージョンは上げない（CI 経由でのみ採番）。

## バージョン運用
- **Conventional Commits + semantic-release** で自動採番。`package.json` の `version` は手動編集しない。
- main への push をトリガに GitHub Actions が次バージョンを判定し、タグ・GitHub Release・`CHANGELOG.md` を生成。
  - `fix:` / `perf:` → PATCH、`feat:` → MINOR、`feat!:` / `BREAKING CHANGE:` → MAJOR。
    `docs:` `chore:` `refactor:` `style:` `test:` `ci:` は上昇なし。
- `src/version.ts`（`APP_VERSION` / `RELEASE_DATE`）は **リリース時のみ** semantic-release が
  `scripts/generate-version.mjs` を実行して更新する。`npm start` / `npm run build` では再生成されない。
- 設定（`.releaserc.json`）は3プロジェクト共通。

## テスト
- Vitest（jsdom）。ロジックは `StorageService` に集約しているため、
  streak・統計・進捗は `storage.service.spec.ts` で決定論的に検証する。
