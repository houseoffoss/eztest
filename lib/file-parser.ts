import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedRow {
  [key: string]: string | number | null;
}

export interface ParseResult {
  data: ParsedRow[];
  errors: string[];
}

/**
 * Parse CSV file from buffer or string
 */
export function parseCSV(content: string): ParseResult {
  const errors: string[] = [];
  
  try {
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
    });

    if (result.errors && result.errors.length > 0) {
      result.errors.forEach((error) => {
        errors.push(`Row ${error.row}: ${error.message}`);
      });
    }

    return {
      data: result.data as ParsedRow[],
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
      data: cleanedData,
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
