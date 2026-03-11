import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedRow {
  [key: string]: string | number | null;
}

export interface ParseResult {
  data: ParsedRow[];
  errors: string[];
}

/** _2, _3 等の重複サフィックスを除去（Excel等で全列に _2 が付く場合に対応） */
function stripDuplicateSuffix(s: string): string {
  return s.replace(/_[0-9]+$/, '').trim();
}

/**
 * パース済みデータのキーから _2, _3 を除去して正規化
 * 同一ベース名が複数ある場合は先に出現したものを採用
 */
function normalizeRowKeys(data: ParsedRow[]): ParsedRow[] {
  return data.map((row) => {
    const normalizedRow: ParsedRow = {};
    for (const key of Object.keys(row)) {
      const baseKey = stripDuplicateSuffix(key);
      if (baseKey && !(baseKey in normalizedRow)) {
        normalizedRow[baseKey] = row[key];
      }
    }
    return normalizedRow;
  });
}

/** 必須列「テストケース名」がヘッダーに含まれるか判定（_2 サフィックス対応） */
function hasRequiredTitleColumn(headers: string[]): boolean {
  const normalize = (s: string) => s.replace(/^\uFEFF/, '').trim();
  return headers.some((h) => {
    const n = normalize(h);
    const base = stripDuplicateSuffix(n);
    return (
      base === 'テストケース名' ||
      base.toLowerCase() === 'title' ||
      base.toLowerCase() === 'test case title' ||
      base.toLowerCase() === 'testcase title'
    );
  });
}

/** 指定区切りでパースして結果を返す */
function parseWithDelimiter(
  content: string,
  delimiter: string,
  headerCount: Map<string, number>
): Papa.ParseResult<ParsedRow> {
  return Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    transformHeader: (header: string) => {
      const trimmed = header.replace(/^\uFEFF/, '').trim();
      const key = trimmed.toLowerCase();
      const count = (headerCount.get(key) ?? 0) + 1;
      headerCount.set(key, count);
      return count === 1 ? trimmed : `${trimmed}_${count}`;
    },
    transform: (value: string) => value.trim(),
  });
}

/**
 * Parse CSV file from buffer or string.
 * Duplicate headers are made unique by appending _2, _3, ... so the first column's value is preserved.
 *
 * 対応形式:
 * - カンマ／タブ／セミコロン区切りを自動検出（Excel のロケール設定に依存する保存形式に対応）
 * - 1行目が正式ヘッダー（テストケース名、モジュール・機能、...）→ そのままパース
 * - 1行目が Column1,Column2,... のときは2行目をヘッダーとして使用（テンプレートCSV対応）
 */
export function parseCSV(content: string): ParseResult {
  const errors: string[] = [];
  const headerCount = new Map<string, number>();

  try {
    // BOM を除去（Excel 等で保存した CSV で必須列が認識されない問題を防ぐ）
    content = content.replace(/^\uFEFF/, '');
    // 先頭の空行を除去（一部エクスポートで先頭に空行が付く場合に対応）
    content = content.replace(/^\s*[\r\n]+/, '');

    // 1行目が Column1,Column2,... の場合は2行目をヘッダーとして使う（テンプレートCSV対応）
    const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
    const firstLine = lines[0]?.replace(/^\uFEFF/, '').trim() ?? '';
    if (lines.length >= 2 && /^Column\d+/.test(firstLine)) {
      content = lines.slice(1).join('\n');
    }

    // 区切り文字の自動検出: カンマ → タブ → セミコロンの順で試行し、
    // 必須列「テストケース名」が含まれる区切りを採用（Excel のロケール依存に対応）
    const delimiters = [',', '\t', ';'] as const;
    let result: Papa.ParseResult<ParsedRow> | null = null;

    for (const delim of delimiters) {
      const trialCount = new Map<string, number>();
      const trial = parseWithDelimiter(content, delim, trialCount);
      const headers = trial.meta?.fields ?? (trial.data?.[0] ? Object.keys(trial.data[0]) : []);
      if (hasRequiredTitleColumn(headers)) {
        result = trial;
        break;
      }
    }

    // どの区切りでも必須列が見つからない場合はカンマ区切りでパース（従来動作）
    if (!result) {
      result = parseWithDelimiter(content, ',', headerCount);
    }

    if (result.errors && result.errors.length > 0) {
      result.errors.forEach((error) => {
        errors.push(`Row ${error.row}: ${error.message}`);
      });
    }

    const parsedData = result.data as ParsedRow[];
    return {
      data: normalizeRowKeys(parsedData),
      errors,
    };
  } catch (error) {
    return {
      data: [],
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse Excel file from buffer
 */
export function parseExcel(buffer: Buffer): ParseResult {
  const errors: string[] = [];
  
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        data: [],
        errors: ['Excel file has no sheets'],
      };
    }

    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Convert dates to strings
      defval: null, // Use null for empty cells
    }) as ParsedRow[];

    // Trim all string values and headers
    const cleanedData = data.map((row) => {
      const cleanedRow: ParsedRow = {};
      Object.keys(row).forEach((key) => {
        const cleanKey = key.trim();
        const value = row[key];
        cleanedRow[cleanKey] = typeof value === 'string' ? value.trim() : value;
      });
      return cleanedRow;
    });

    return {
      data: normalizeRowKeys(cleanedData),
      errors,
    };
  } catch (error) {
    return {
      data: [],
      errors: [`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Parse file based on extension
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    return parseCSV(text);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const buffer = Buffer.from(await file.arrayBuffer());
    return parseExcel(buffer);
  } else {
    return {
      data: [],
      errors: ['Unsupported file format. Please upload CSV or Excel files.'],
    };
  }
}

/**
 * Validate required fields are present
 */
export function validateRequiredFields(
  data: ParsedRow[],
  requiredFields: string[]
): string[] {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('File is empty or has no data rows');
    return errors;
  }

  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);
  
  // Create a case-insensitive map of available fields
  const availableFieldsLower = new Map(
    availableFields.map((field) => [field.toLowerCase(), field])
  );
  
  const missingFields = requiredFields.filter(
    (field) => !availableFieldsLower.has(field.toLowerCase())
  );

  if (missingFields.length > 0) {
    errors.push(
      `Missing required columns: ${missingFields.join(', ')}`
    );
  }

  return errors;
}
