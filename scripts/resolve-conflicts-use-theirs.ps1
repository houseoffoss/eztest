# すべてのコンフリクトを「最新」（取り込む側 = fork/main）で解消する
# プロジェクトルートで実行: .\scripts\resolve-conflicts-use-theirs.ps1

$conflicted = @(
  "app/components/pages/HomePage.tsx",
  "backend/controllers/migration/controller.ts",
  "backend/controllers/testcase/controller.ts",
  "backend/services/migration/export/services.ts",
  "backend/services/migration/import/services.ts",
  "backend/services/testcase/services.ts",
  "backend/validators/testcase.validator.ts",
  "frontend/components/admin/users/UserDetailsContent.tsx",
  "frontend/components/profile/UserProfileSettings.tsx",
  "frontend/components/project/ProjectMembers.tsx",
  "frontend/components/testcase/TestCaseList.tsx",
  "frontend/components/testcase/constants/testCaseFormConfig.ts",
  "frontend/components/testcase/detail/TestCaseDetail.tsx",
  "frontend/components/testcase/detail/subcomponents/DeleteTestCaseDialog.tsx",
  "frontend/components/testcase/detail/subcomponents/LinkDefectDialog.tsx",
  "frontend/components/testcase/detail/subcomponents/LinkedDefectsCard.tsx",
  "frontend/components/testcase/detail/subcomponents/TestCaseDetailsCard.tsx",
  "frontend/components/testcase/detail/subcomponents/TestCaseHeader.tsx",
  "frontend/components/testcase/detail/subcomponents/TestCaseHistoryCard.tsx",
  "frontend/components/testcase/detail/subcomponents/TestCaseInfoCard.tsx",
  "frontend/components/testcase/detail/subcomponents/TestStepsCard.tsx",
  "frontend/components/testcase/module/AddTestCaseDialog.tsx",
  "frontend/components/testcase/module/ModuleDetail.tsx",
  "frontend/components/testcase/subcomponents/CreateTestCaseDialog.tsx",
  "frontend/components/testcase/subcomponents/TestCaseCard.tsx",
  "frontend/components/testcase/subcomponents/TestCaseFilters.tsx",
  "frontend/components/testcase/types.ts",
  "frontend/components/testrun/TestRunsList.tsx",
  "package-lock.json",
  "prisma/schema.prisma",
  "prisma/seed-dropdown-options.ts"
)

foreach ($f in $conflicted) {
  if (Test-Path $f) {
    git checkout --theirs -- $f
    Write-Host "  theirs: $f"
  }
}
Write-Host "完了。続けて: git add .  then  git commit -m `"Merge fork/main (conflicts resolved with theirs)`""
