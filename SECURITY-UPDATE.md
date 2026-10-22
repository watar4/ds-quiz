# 2026-10-22 セキュリティ更新

2026-10-23追補: Tailwindを公式移行ツールで4.3.3へ更新し、アプリ本体の全依存監査は0件になりました。CSSテーマとユーティリティ名を移行し、ビルドとホーム/出題設定画面の表示・遷移を確認しました。ブラウザー要件はTailwind 4のSafari 16.4+/Chrome 111+/Firefox 128+です。以下にあるTailwind 3の残存警告は解消済みです。

Vite 7.3.7、React plugin 5.2.0、React Router DOM 7.18.4へ更新し、互換範囲内の推移依存も更新しました。既存のHashRouter/Routes/Link等のAPIは維持し、TypeScriptと本番ビルドを確認しています。全画面のブラウザ操作や外部AI APIへの接続試験は実施していません。

CIはNode.js 24.22.1、公式Actionsの完全SHA参照、deployジョブ限定の書き込み/OIDC権限、checkout資格情報の非永続化へ変更。ビルド前に本番依存のHigh以上を監査します。

npm本番依存の監査は0件。全依存にはTailwind 3由来の7パッケージ（High 5 / Moderate 2）の警告が残ります。bracesの現行3.xに修正版がなく、Tailwind 4は別途CSS互換性を検証してから移行する必要があります。APIキーのlocalStorage保存方式は今回変更していません。
