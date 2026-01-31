# Scripts ディレクトリ

このディレクトリには、EZTestの開発・運用に役立つスクリプトが含まれています。

## 利用可能なスクリプト

### テストケース投入スクリプト (`seed-testcases.ts`)

現在のデータベーススキーマに基づいてテストケースを投入するスクリプトです。

#### 使用方法

```bash
# npmスクリプト経由で実行（推奨）
npm run seed:testcases [projectKey] [count]

# 直接実行
tsx scripts/seed-testcases.ts [projectKey] [count]
```

#### パラメータ

- `projectKey` (オプション): プロジェクトキー（デフォルト: `DEMO`）
- `count` (オプション): 投入するテストケースの件数（デフォルト: `5`）

#### 実行例

```bash
# DEMOプロジェクトに5件のテストケースを投入（デフォルト）
npm run seed:testcases

# DEMOプロジェクトに10件のテストケースを投入
npm run seed:testcases DEMO 10

# 特定のプロジェクトに20件のテストケースを投入
npm run seed:testcases MYPROJECT 20
```

#### 機能

- ✅ 現在のDBスキーマに基づいたテストケース作成
- ✅ すべての基本フィールドのサポート
  - `tcId`, `title`, `description`, `expectedResult`
  - `priority`, `status`, `estimatedTime`
  - `preconditions`, `postconditions`, `testData`
- ✅ 拡張フィールドのサポート
  - `assertionId`, `rtcId`, `flowId`
  - `layer` (SMOKE, CORE, EXTENDED, UNKNOWN)
  - `targetType` (FUNCTIONAL, NON_FUNCTIONAL, PERFORMANCE, SECURITY, USABILITY, COMPATIBILITY, API, SCREEN)
  - `operation`, `expected`, `evidence`, `notes`
  - `isAutomated` (自動化フラグ)
  - `platforms` (IOS, ANDROID, WEB)
- ✅ テストステップの自動生成
- ✅ モジュールとの関連付け（存在する場合）
- ✅ テストスイートとの関連付け（存在する場合）

#### 作成されるテストケースの例

スクリプトは以下のようなサンプルテストケースを作成します：

1. **ユーザーログイン機能のテスト** - SMOKE層、機能テスト
2. **パスワードリセット機能のテスト** - CORE層、機能テスト
3. **ダッシュボード表示のテスト** - EXTENDED層、画面テスト、自動化対応
4. **API認証エンドポイントのテスト** - SMOKE層、APIテスト、自動化対応
5. **ロールベースアクセス制御の検証** - CORE層、セキュリティテスト

各テストケースには、適切なテストステップが含まれます。

#### 注意事項

- プロジェクトが存在しない場合はエラーになります
- モジュールやテストスイートが存在しない場合でも、テストケースは作成されます（関連付けなし）
- `tcId`は自動生成され、既存のものと重複しないようになっています

---

### テストケースタイトルエクスポートスクリプト (`export-testcase-titles.ts`)

テストケースのタイトルをエクスポートするスクリプトです。

#### 使用方法

```bash
npm run export:titles
```

---

## Docker環境での実行

Docker環境でスクリプトを実行する場合：

```bash
# 開発環境
docker-compose -f docker-compose.dev.yml exec app npm run seed:testcases DEMO 10

# 本番環境
docker-compose exec app npm run seed:testcases DEMO 10
```

---

## トラブルシューティング

### エラー: プロジェクトが見つかりません

- プロジェクトキーが正しいか確認してください
- プロジェクトが削除されていないか確認してください（`isDeleted: false`）

### エラー: 管理者ユーザーが見つかりません

- `.env`ファイルの`ADMIN_EMAIL`が正しく設定されているか確認してください
- デフォルトでは`admin@eztest.local`が使用されます

### テストケースが作成されない

- データベース接続が正常か確認してください
- ログを確認してエラーメッセージを確認してください
