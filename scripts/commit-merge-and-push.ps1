# 解消済みマージをコミットし、push 手順を表示する
# プロジェクトルートで実行: .\scripts\commit-merge-and-push.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot + "\.."
Push-Location $root

try {
    if (-not (Test-Path ".git\MERGE_HEAD")) {
        Write-Host "マージ中ではありません。このスクリプトは不要です。" -ForegroundColor Yellow
        exit 0
    }

    Write-Host "変更をステージングしています..." -ForegroundColor Cyan
    git add -A
    $status = git status --short
    if (-not $status) {
        Write-Host "ステージする変更がありません。既にコミット済みの可能性があります。" -ForegroundColor Yellow
        Pop-Location
        exit 0
    }

    Write-Host "マージコミットを作成しています..." -ForegroundColor Cyan
    git commit -m "Merge fork/main (conflicts resolved with latest)"
    Write-Host "マージコミットが完了しました。" -ForegroundColor Green
    Write-Host ""
    Write-Host "次に、リモートへ push してください（SSH が通るターミナルで）:" -ForegroundColor Yellow
    Write-Host "  git push origin feature/testcase-domain-function-fields" -ForegroundColor White
    Write-Host ""
    Write-Host "push が成功すると、GitHub の「This branch has conflicts」は解消されます。" -ForegroundColor Gray
}
catch {
    Write-Host "エラー: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
