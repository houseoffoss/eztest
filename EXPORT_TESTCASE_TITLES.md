# テストケースタイトルをGoogle Sheetにエクスポート

## 実行方法

WSLターミナルで以下のコマンドを実行してください：

```bash
npm run export:titles
```

## 出力形式

タブ区切り（TSV）形式で出力されます。出力された内容をコピーして、Google Sheetに直接貼り付けることができます。

## 出力される列

1. Project - プロジェクト名
2. Project Key - プロジェクトキー
3. TC ID - テストケースID
4. Title - テストケースタイトル
5. Module - モジュール名
6. Priority - 優先度
7. Status - ステータス
8. Assertion-ID - Assertion-ID
9. RTC-ID - RTC-ID
10. Flow-ID - Flow-ID
11. Layer - レイヤー
12. 対象（API/画面） - 対象タイプ
13. 操作手順 - 操作手順
14. 期待値 - 期待値
15. 根拠コード - 根拠
16. 備考 - 備考
17. 自動化 - 自動化フラグ
18. 環境（iOS / Android / Web） - プラットフォーム
19. Created At - 作成日時
20. Updated At - 更新日時

## Google Sheetへの貼り付け方法

1. コマンドを実行して出力を取得
2. 出力されたテキストをすべてコピー（Ctrl+A → Ctrl+C）
3. Google Sheetを開く
4. セルA1を選択
5. 貼り付け（Ctrl+V）

タブ区切り形式なので、自動的に列に分割されます。

## ファイルに保存する場合

出力をファイルに保存したい場合：

```bash
npm run export:titles > testcase_titles.tsv
```

その後、Google Sheetで「ファイル」→「インポート」→「アップロード」からTSVファイルをインポートできます。
