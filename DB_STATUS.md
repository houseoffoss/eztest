# データベース状態確認

## スキーマ概要

### データベースプロバイダー
- **プロバイダー**: PostgreSQL
- **接続**: `DATABASE_URL`環境変数から読み込み

### 主要なモデル

#### TestCase（テストケース）
最新のスキーマには以下の拡張フィールドが含まれています：

**基本フィールド:**
- `id`, `tcId`, `projectId`, `moduleId`, `suiteId`
- `title`, `description`, `expectedResult`
- `priority`, `status`, `estimatedTime`
- `preconditions`, `postconditions`, `testData`

**拡張フィールド（新規追加）:**
- `assertionId` (String?) - Assertion-ID
- `rtcId` (String?) - RTC-ID
- `flowId` (String?) - Flow-ID
- `layer` (TestLayer?) - Layer (SMOKE, CORE, EXTENDED, UNKNOWN)
- `targetType` (TargetType?) - 対象 (API, SCREEN, FUNCTIONAL, etc.)
- `operation` (String?) - 操作手順
- `expected` (String?) - 期待値
- `evidence` (String?) - 根拠コード
- `notes` (String?) - 備考
- `isAutomated` (Boolean) - 自動化 (デフォルト: false)
- `platforms` (Platform[]) - 環境 (IOS, ANDROID, WEB) - 配列で複数指定可能

### 列挙型（Enums）

#### TestLayer
- `SMOKE`
- `CORE`
- `EXTENDED`
- `UNKNOWN` (デフォルト値として使用)

#### TargetType
- `FUNCTIONAL`
- `NON_FUNCTIONAL`
- `PERFORMANCE`
- `SECURITY`
- `USABILITY`
- `COMPATIBILITY`
- `API` (新規追加)
- `SCREEN` (新規追加)

#### Platform
- `IOS`
- `ANDROID`
- `WEB`

## マイグレーション履歴

最新のマイグレーションまで適用済み：
- `20260120011606_rename_api_token_to_api_key` (最新)

**全マイグレーション数**: 26件

### 主要なマイグレーション
1. `20251117113445_initial_schema` - 初期スキーマ
2. `20251226124536_add_dropdown_options` - ドロップダウンオプション管理
3. `20251226140109_convert_enums_to_strings` - 列挙型を文字列に変換
4. `20251230071009_add_test_data_to_test_case` - テストデータフィールド追加
5. `20251231062459_add_pending_defect_ids_to_test_case` - 保留中の不具合ID追加
6. `20260119135407_add_project_to_api_tokens` - APIトークンにプロジェクト追加
7. `20260120011606_rename_api_token_to_api_key` - APIトークンをAPIキーにリネーム

## DB状態確認方法

### 1. Prisma Studio（GUIツール）
以下のコマンドでPrisma Studioを起動して、ブラウザでデータベースを確認できます：

```bash
npx prisma studio
```

起動後、ブラウザで `http://localhost:5555` にアクセスします。

### 2. マイグレーション状態確認
```bash
npx prisma migrate status
```

### 3. Prisma Client生成状態確認
```bash
npx prisma generate
```

### 4. データベース接続確認
`.env`ファイルの`DATABASE_URL`を確認してください。

## 注意事項

### 未適用のマイグレーションがある場合
スキーマファイル（`prisma/schema.prisma`）を変更した後は、以下のコマンドでマイグレーションを適用してください：

```bash
npx prisma migrate dev
```

### 本番環境の場合
```bash
npx prisma migrate deploy
```

## 現在のスキーマの特徴

1. **拡張テストケースフィールド**: Assertion-ID、RTC-ID、Flow-ID、Layer、対象、操作手順、期待値、根拠、備考、自動化、環境（プラットフォーム）が追加されています。

2. **Layerのデフォルト値**: 未知の値や未指定の場合は`UNKNOWN`が設定されます（null運用を避ける）。

3. **Platformsの重複排除**: プラットフォームは配列で複数指定可能で、重複は自動的に排除されます。区切り文字として`/`、`,`、`、`、空白が使用できます。

4. **TargetTypeの拡張**: `API`と`SCREEN`が追加され、APIエンドポイントや画面テストを区別できます。
