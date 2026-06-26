# Career Roadmap 🧭

「キャリアパスとゴール」の達成を支援する個人向け Angular アプリ。
紙のロードマップ（`マイルーティン.pdf`）を、**毎日の実行**と**長期目標への進捗**が追える形にしたもの。

## 主な機能

| 画面 | 内容 |
| --- | --- |
| **日課**（`/today`） | 毎日の習慣（語学・運動・新体験・振り返り）のチェックイン。連続達成日数(🔥streak)・直近7日の達成率を表示。 |
| **ロードマップ**（`/roadmap`） | 2026→2075 のマイルストーンを縦タイムラインで可視化。残り日数・「自分で達成/結果として達成」の区別・達成状況の更新。 |
| **資格・目標**（`/goals`） | NC / AP / PM / HSK / TOPIK / 独検・年収目標などの進捗(0-100%)とステータス管理。追加・削除も可能。 |
| **AIコーチ**（`/coach`） | 現状を要約して Gemini に送り、今週の具体的アクションを提案（任意・APIキー要）。 |
| **設定**（`/settings`） | テーマ切替、Gemini APIキー/モデル、データのエクスポート/インポート、初期内容（PDF）への再投入。 |

## 技術スタック

- **Angular 22**（standalone components / signals / lazy routes）
- 状態は **`StorageService` + localStorage** に一元化（サーバー不要・端末内完結）
- **PWA**（Service Worker、オフライン対応）
- **Gemini API**（`@google/generative-ai`）によるAIコーチ
- テスト: **Vitest**

## 開発

```bash
npm install
npm start          # http://localhost:4200
npm test           # ユニットテスト
npm run build      # 本番ビルド（PWA）
npm run deploy     # GitHub Pages へデプロイ
```

## データについて

すべてのデータ（日課・履歴・目標・APIキー）は**この端末のブラウザ**にのみ保存されます。
別端末への移行や履歴のバックアップは、設定画面の **エクスポート/インポート** を利用してください。

初期データは PDF「キャリアパスとゴール v8」から生成しています（`src/app/utils/seed.util.ts`）。
内容を編集後に元へ戻したいときは、設定画面の「初期内容に戻す」から再投入できます（チェックイン履歴は保持）。

## ライセンス・免責

本アプリは **MIT License** のもとで無償提供されます。利用にあたっては、以下の規約類をご確認ください。

- [免責事項（DISCLAIMER）](docs/DISCLAIMER.md)
- [利用規約（TERMS）](docs/TERMS.md)
- [プライバシーポリシー（PRIVACY）](docs/PRIVACY.md)
- [ライセンス（LICENSE）](docs/LICENSE.md)

本アプリは現状有姿で提供され、利用に起因する損害について、法令上許容される範囲で開発者は責任を負いません。
