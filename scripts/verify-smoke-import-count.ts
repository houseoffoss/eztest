/**
 * Smoke_iOS / Smoke_Android テストケースが CSV から各44件インポート可能であることを検証するスクリプト
 *
 * Usage: npx tsx scripts/verify-smoke-import-count.ts [path/to/test-cases-import-template.csv]
 * 引数省略時: 同梱テンプレートパスまたは DOCUMENTS/falcon9/qa/CSV/test-cases-import-template.csv を参照
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseCSV } from '../lib/file-parser';

const EXPECTED_SMOKE_IOS = 44;
const EXPECTED_SMOKE_ANDROID = 44;

function getSuiteColumnKey(row: Record<string, string | number | null>): string | null {
  const candidates = ['Test Suites', 'Test Suites_2', 'testsuite', 'test suites', 'Column25', 'Column26'];
  for (const key of Object.keys(row)) {
    if (candidates.includes(key)) return key;
    const v = String(row[key] ?? '').trim();
    if (v === 'Smoke_iOS' || v === 'Smoke_Android') return key;
  }
  return null;
}

function getSuiteName(row: Record<string, string | number | null>, suiteColumnKey: string): string | null {
  const v = row[suiteColumnKey];
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

function main() {
  const csvPath =
    process.argv[2] ||
    path.resolve(process.cwd(), 'test-cases-import-template.csv') ||
    path.join(process.env.USERPROFILE || process.env.HOME || '', 'Documents', 'falcon9', 'qa', 'CSV', 'test-cases-import-template.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    console.error('Usage: npx tsx scripts/verify-smoke-import-count.ts <path-to-csv>');
    process.exit(1);
  }

  let content = fs.readFileSync(csvPath, 'utf-8');
  // 1行目が Column1,Column2,... の場合は2行目をヘッダーとして使う
  const lines = content.split(/\r?\n/);
  if (lines.length > 0 && /^Column\d+/.test(lines[0].trim())) {
    content = lines.slice(1).join('\n');
  }

  const { data, errors } = parseCSV(content);
  if (errors.length > 0) {
    console.error('Parse errors:', errors);
    process.exit(1);
  }
  if (data.length === 0) {
    console.error('No data rows in CSV');
    process.exit(1);
  }

  const firstRow = data[0] as Record<string, string | number | null>;
  const suiteColumnKey = getSuiteColumnKey(firstRow);
  if (!suiteColumnKey) {
    console.error('Could not detect Test Suites column. Available keys:', Object.keys(firstRow).slice(0, 30).join(', '));
    process.exit(1);
  }

  let smokeIos = 0;
  let smokeAndroid = 0;
  for (const row of data) {
    const suite = getSuiteName(row as Record<string, string | number | null>, suiteColumnKey);
    if (suite === 'Smoke_iOS') smokeIos++;
    else if (suite === 'Smoke_Android') smokeAndroid++;
  }

  console.log('--- Smoke import count verification ---');
  console.log('CSV path:', csvPath);
  console.log('Total data rows:', data.length);
  console.log('Test Suites column key:', suiteColumnKey);
  console.log('Smoke_iOS count:', smokeIos, smokeIos === EXPECTED_SMOKE_IOS ? 'OK' : `expected ${EXPECTED_SMOKE_IOS}`);
  console.log('Smoke_Android count:', smokeAndroid, smokeAndroid === EXPECTED_SMOKE_ANDROID ? 'OK' : `expected ${EXPECTED_SMOKE_ANDROID}`);

  const ok = smokeIos === EXPECTED_SMOKE_IOS && smokeAndroid === EXPECTED_SMOKE_ANDROID;
  if (ok) {
    console.log('\nResult: Smoke_iOS と Smoke_Android が各44件ずつインポート可能なCSVであることを確認しました。');
    process.exit(0);
  } else {
    console.error('\nResult: 件数が期待値と一致しません。');
    process.exit(1);
  }
}

main();
