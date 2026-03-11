# 変更をコミットしてプッシュする
# 使い方: プロジェクトルートで .\scripts\commit-and-push.ps1
# 注: プッシュで SSH エラーが出る場合は、WSL や Git Bash など SSH が通る環境で
#     git push origin feature/testcase-domain-function-fields を実行してください。
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot + "\.."
Push-Location $root

try {
    $branch = git rev-parse --abbrev-ref HEAD
    if (-not $branch) { throw "Could not get current branch" }

    git add -A
    $status = git status --short
    if (-not $status) {
        Write-Host "コミットする変更がありません。" -ForegroundColor Yellow
        Pop-Location
        exit 0
    }

    $msg = @"
feat(import): テストケースインポートの改善

- ステータス ACTIVE_iOS を ACTIVE に正規化してインポート可能に
- Test Suites 列の取得を強化（Test Suites / Test Suite ヘッダ対応）
- インポート応答がHTMLの場合のエラーメッセージを改善
- 既存同一タイトルをスキップせず更新するオプションを追加（既存を更新）
"@
    git commit -m $msg
    Write-Host "コミットしました。" -ForegroundColor Green
    git push origin $branch
    Write-Host "プッシュしました: origin/$branch" -ForegroundColor Green
    Write-Host ""
    Write-Host "PRを作成するには GitHub で:" -ForegroundColor Cyan
    Write-Host "  https://github.com/yabrochika/eztest/compare/$branch" -ForegroundColor White
    Write-Host "  またはリポジトリの「Compare & pull request」をクリック" -ForegroundColor Gray
} catch {
    Write-Host "エラー: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
