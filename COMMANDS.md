# EZ Test - よく使うコマンド一覧

## データベース確認コマンド

### Prisma Studio（GUIでDB確認）
```bash
npx prisma studio
```
- ブラウザで `http://localhost:5555` が自動的に開きます
- すべてのテーブルとデータを視覚的に確認できます

### マイグレーション状態確認
```bash
npx prisma migrate status
```
- 適用済み/未適用のマイグレーションを確認

### Prismaクライアント生成
```bash
npx prisma generate
```
- スキーマ変更後に実行（ビルド前にも必要）

### マイグレーション適用（開発環境）
```bash
npx prisma migrate dev
```
- スキーマ変更をデータベースに適用
- マイグレーションファイルを自動生成

### マイグレーション適用（本番環境）
```bash
npx prisma migrate deploy
```
- 本番環境でマイグレーションを適用（マイグレーションファイルは生成しない）

### データベースリセット（開発環境のみ）
```bash
npx prisma migrate reset
```
- ⚠️ **注意**: すべてのデータが削除されます
- 開発環境でのみ使用してください

### スキーマの検証
```bash
npx prisma validate
```
- `prisma/schema.prisma` の構文を検証

## ビルドコマンド

### 本番用ビルド
```bash
npm run build
```
- Next.jsアプリケーションを本番用にビルド
- ビルド成果物は `.next` フォルダに生成されます

### ビルド前の準備（推奨）
```bash
# 1. Prismaクライアント生成
npx prisma generate

# 2. ビルド実行
npm run build
```

## 実行（Run）コマンド

### 開発モードで起動
```bash
npm run dev
```
- 開発サーバーを起動（ホットリロード有効）
- `http://localhost:3000` でアクセス
- Turbopackを使用して高速ビルド

### 本番モードで起動
```bash
# 1. ビルド（初回のみ、またはコード変更後）
npm run build

# 2. 本番サーバー起動
npm start
```
- ビルド済みのアプリケーションを本番モードで起動
- `http://localhost:3000` でアクセス

## その他の便利なコマンド

### リント（コードチェック）
```bash
npm run lint
```
- ESLintでコードの静的解析を実行

### データベースシード（初期データ投入）
```bash
npm run db:seed
```
- 初期データをデータベースに投入

### 依存関係のインストール
```bash
npm install
```
- `package.json` に記載された依存関係をインストール

## よくある作業フロー

### 初回セットアップ
```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定（.envファイルを作成）
# DATABASE_URL=postgresql://...

# 3. データベースマイグレーション
npx prisma migrate dev

# 4. Prismaクライアント生成
npx prisma generate

# 5. 開発サーバー起動
npm run dev
```

### スキーマ変更後の作業フロー
```bash
# 1. schema.prismaを編集

# 2. マイグレーション作成・適用
npx prisma migrate dev --name your_migration_name

# 3. Prismaクライアント再生成
npx prisma generate

# 4. ビルド（必要に応じて）
npm run build
```

### 本番デプロイ前の確認
```bash
# 1. Prismaクライアント生成
npx prisma generate

# 2. ビルド
npm run build

# 3. ビルドが成功することを確認

# 4. 本番モードで起動して動作確認
npm start
```

## トラブルシューティング

### ビルドエラーが発生した場合
```bash
# 1. Prismaクライアントを再生成
npx prisma generate

# 2. node_modulesを削除して再インストール
rm -rf node_modules
npm install

# 3. 再度ビルド
npm run build
```

### データベース接続エラーの場合
```bash
# .envファイルのDATABASE_URLを確認
cat .env

# Prisma Studioで接続確認
npx prisma studio
```
