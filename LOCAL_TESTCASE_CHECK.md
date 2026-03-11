# ローカルでTest Caseを確認する手順

## 1. データベースの状態確認

### Prisma Studioで確認（GUI）
```bash
npx prisma studio
```
- ブラウザで `http://localhost:5555` が自動的に開きます
- `TestCase` テーブルをクリックして、すべてのテストケースを確認できます

### マイグレーション状態確認
```bash
npx prisma migrate status
```

## 2. Prismaクライアントの生成

データベーススキーマが最新であることを確認：
```bash
npx prisma generate
```

## 3. アプリケーションの起動

### 開発モードで起動（推奨）
```bash
npm run dev
```
- `http://localhost:3000` でアクセス
- ホットリロード有効で、コード変更が自動反映されます

### 本番モードで起動
```bash
# 1. ビルド
npm run build

# 2. 起動
npm start
```
- `http://localhost:3000` でアクセス

## 4. ブラウザでTest Caseを確認

### アクセス方法

1. **プロジェクト一覧**: `http://localhost:3000/projects`
2. **プロジェクトを選択**: 任意のプロジェクトをクリック
3. **Test Casesタブ**: プロジェクト詳細ページの「Test Cases」タブをクリック
4. **Test Case詳細**: 個別のテストケースをクリックして詳細を確認

### 確認できる項目

- **基本情報**
  - Title（タイトル）
  - Description（説明）
  - Priority（優先度）
  - Status（ステータス）
  - Module（モジュール）

- **拡張フィールド**
  - Assertion-ID
  - RTC-ID
  - Flow-ID
  - Layer（SMOKE, CORE, EXTENDED, UNKNOWN）
  - 対象（API/画面）
  - 操作手順
  - 期待値
  - 根拠コード
  - 備考
  - 自動化（true/false）
  - 環境（iOS / Android / Web）

- **その他**
  - Test Steps（テストステップ）
  - Preconditions（前提条件）
  - Postconditions（後処理条件）
  - Test Data（テストデータ）
  - Attachments（添付ファイル）

## 5. トラブルシューティング

### ポート3000が使用中の場合

```bash
# WSL環境でポート3000を使用しているプロセスを停止
kill -9 $(lsof -ti:3000) 2>/dev/null

# または、別のポートで起動
PORT=3001 npm run dev
```

### データベース接続エラーの場合

```bash
# .envファイルのDATABASE_URLを確認
cat .env

# Prisma Studioで接続確認
npx prisma studio
```

### ビルドエラーの場合

```bash
# Prismaクライアントを再生成
npx prisma generate

# 再度ビルド
npm run build
```

## 6. クイックスタート

```bash
# 1. Prismaクライアント生成
npx prisma generate

# 2. 開発サーバー起動
npm run dev

# 3. ブラウザで http://localhost:3000 にアクセス
```

## 7. データベースにテストケースがない場合

### テストケースを作成する方法

1. **UIから作成**
   - プロジェクト詳細ページ → Test Casesタブ → "Create Test Case"ボタン

2. **インポート機能を使用**
   - プロジェクト詳細ページ → Test Casesタブ → "Import"ボタン
   - CSV/Excelファイルから一括インポート

3. **API経由で作成**
   - `POST /api/projects/{projectId}/testcases` エンドポイントを使用

## 8. 確認用コマンド一覧

```bash
# データベース確認（GUI）
npx prisma studio

# マイグレーション状態確認
npx prisma migrate status

# Prismaクライアント生成
npx prisma generate

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```
