# マイグレーション: TestCase 拡張カラムの追加

## エラー

```
The column `TestCase.platform` does not exist in the current database.
```

このエラーが出る場合、データベースに `platform` 等の列が存在しません。

## 解決方法

プロジェクトルートで以下を実行してください：

```bash
npx prisma migrate deploy
```

または

```bash
npm run db:migrate
```

Docker / WSL 環境の場合は、アプリケーションが接続する同じデータベースに対して実行してください。

## マイグレーション内容

- `platform`
- `device`
- `domain`
- `functionName`
- `executionType`
- `automationStatus`

上記カラムを `ADD COLUMN IF NOT EXISTS` で追加します。既に存在する場合はスキップされます。
