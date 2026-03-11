
# Prisma Studioで表示されるデータベースとテーブル一覧

## データベース名

**eztest**

（.envファイルの`DATABASE_URL`から取得: `postgresql://eztest:eztest_password@localhost:5433/eztest`）

## テーブル一覧（Prisma Studioで表示される順序）

Prisma Studio (`http://localhost:5555`) で表示されるすべてのテーブル名：

### 1. User Management（ユーザー管理）
- **User** - ユーザー情報
- **PasswordResetToken** - パスワードリセットトークン
- **ApiKey** - APIキー
- **OtpVerification** - OTP認証

### 2. RBAC（ロールベースアクセス制御）
- **Role** - ロール
- **Permission** - 権限
- **RolePermission** - ロールと権限の関連

### 3. Project Management（プロジェクト管理）
- **Project** - プロジェクト
- **ProjectMember** - プロジェクトメンバー

### 4. Test Management（テスト管理）
- **Module** - モジュール
- **TestSuite** - テストスイート
- **TestCase** - テストケース（拡張フィールド含む）
- **TestCaseSuite** - テストケースとテストスイートの関連
- **TestStep** - テストステップ
- **TestRun** - テスト実行
- **TestRunSuite** - テスト実行とテストスイートの関連
- **TestResult** - テスト結果

### 5. Requirements Management（要件管理）
- **Requirement** - 要件

### 6. Supporting Models（サポートモデル）
- **Comment** - コメント
- **Attachment** - 添付ファイル

### 7. Dropdown Options Management（ドロップダウンオプション管理）
- **DropdownOption** - ドロップダウンオプション

### 8. Defect Management（不具合管理）
- **Defect** - 不具合
- **DefectAttachment** - 不具合の添付ファイル
- **DefectComment** - 不具合のコメント
- **CommentAttachment** - コメントの添付ファイル
- **TestCaseDefect** - テストケースと不具合の関連

## 列挙型（Enums）

データベースには以下の列挙型が定義されています：

- **TestLayer**: SMOKE, CORE, EXTENDED, UNKNOWN
- **TargetType**: FUNCTIONAL, NON_FUNCTIONAL, PERFORMANCE, SECURITY, USABILITY, COMPATIBILITY, API, SCREEN
- **Platform**: IOS, ANDROID, WEB

## TestCaseテーブルの主要フィールド

### 基本フィールド
- id, tcId, projectId, moduleId, suiteId
- title, description, expectedResult
- priority, status, estimatedTime
- preconditions, postconditions, testData

### 拡張フィールド（新規追加）
- assertionId (Assertion-ID)
- rtcId (RTC-ID)
- flowId (Flow-ID)
- layer (Layer: SMOKE, CORE, EXTENDED, UNKNOWN)
- targetType (対象: API, SCREEN, FUNCTIONAL, etc.)
- operation (操作手順)
- expected (期待値)
- evidence (根拠コード)
- notes (備考)
- isAutomated (自動化: true/false)
- platforms (環境: IOS, ANDROID, WEB の配列)

## 合計テーブル数

**全26テーブル**

## Prisma Studioでの確認方法

1. `http://localhost:5555` にアクセス
2. 左側のメニューからテーブルを選択
3. 各テーブルのデータを確認・編集可能
