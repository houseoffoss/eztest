# データベース状態確認方法

## 方法1: Prisma Studio（GUI - 推奨）

### WSLターミナルで実行
```bash
npx prisma studio
```

### アクセス
- ブラウザで `http://localhost:5555` にアクセス
- すべてのテーブルとデータを視覚的に確認できます

### 確認できる内容
- **TestCaseテーブル**: すべてのテストケースと拡張フィールド
- **Projectテーブル**: プロジェクト一覧
- **Moduleテーブル**: モジュール一覧
- **TestSuiteテーブル**: テストスイート一覧
- **TestStepテーブル**: テストステップ一覧
- その他のすべてのテーブル

### トラブルシューティング

**ポート5555が使用中の場合:**
```bash
# プロセスを停止
kill -9 $(lsof -ti:5555) 2>/dev/null

# 再度起動
npx prisma studio
```

**別のポートで起動:**
```bash
npx prisma studio --port 5556
```
その後、`http://localhost:5556` にアクセス

## 方法2: マイグレーション状態確認

```bash
npx prisma migrate status
```

- 適用済み/未適用のマイグレーションを確認
- データベースとスキーマの同期状態を確認

## 方法3: スキーマの検証

```bash
npx prisma validate
```

- `prisma/schema.prisma` の構文を検証
- データベース接続を確認

## 方法4: データベース接続確認

```bash
# .envファイルのDATABASE_URLを確認
cat .env

# Prismaクライアント生成（接続テスト）
npx prisma generate
```

## 方法5: SQLクエリで直接確認（PostgreSQLの場合）

```bash
# PostgreSQLに接続（.envのDATABASE_URLを使用）
psql $DATABASE_URL

# または、接続情報を指定
psql -h localhost -U your_username -d your_database

# テストケース数を確認
SELECT COUNT(*) FROM "TestCase";

# テストケース一覧を確認
SELECT id, "tcId", title, "projectId" FROM "TestCase" LIMIT 10;

# 拡張フィールドを確認
SELECT id, title, "assertionId", "rtcId", "flowId", layer, "targetType", platforms FROM "TestCase" LIMIT 10;
```

## 方法6: スクリプトでデータをエクスポート

```bash
# テストケースタイトルをエクスポート
npm run export:titles
```

## よくある問題と解決方法

### Prisma Studioが起動しない

1. **Prismaクライアントを生成:**
   ```bash
   npx prisma generate
   ```

2. **データベース接続を確認:**
   ```bash
   cat .env | grep DATABASE_URL
   ```

3. **ポートが使用中か確認:**
   ```bash
   lsof -i:5555
   ```

### データベース接続エラー

1. **.envファイルを確認:**
   ```bash
   cat .env
   ```

2. **データベースが起動しているか確認:**
   ```bash
   # PostgreSQLの場合
   pg_isready
   ```

3. **接続情報を再確認:**
   - DATABASE_URLの形式: `postgresql://user:password@host:port/database`

### マイグレーションが適用されていない

```bash
# マイグレーションを適用
npx prisma migrate dev

# Prismaクライアントを再生成
npx prisma generate
```

## 推奨手順

1. **まず、マイグレーション状態を確認:**
   ```bash
   npx prisma migrate status
   ```

2. **Prisma Studioを起動:**
   ```bash
   npx prisma studio
   ```

3. **ブラウザで `http://localhost:5555` にアクセス**

4. **TestCaseテーブルをクリックしてデータを確認**
