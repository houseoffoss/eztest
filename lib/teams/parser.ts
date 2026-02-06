/**
 * Message Parser
 * Parses human-readable test case and defect formats from Teams messages
 * 
 * Testcase Format:
 * TC: Login fails with special characters
 * Preconditions:
 * - User must exist
 * Steps:
 * 1. Enter password with special chars
 * Expected Result:
 * - Should succeed
 * Priority: High
 * 
 * Defect Format:
 * BUG: Export button not working
 * Steps to Reproduce:
 * 1. Click Export
 * Actual Result:
 * - Nothing happens
 * Expected Result:
 * - File should download
 * Severity: High
 */

export interface ParsedTestCase {
  title?: string;
  description?: string;
  preconditions?: string[];
  steps?: string[];
  expectedResult?: string[];
  priority?: string;
  status?: string;
  type?: string;
  tags?: string[];
}

export interface ParsedDefect {
  title?: string;
  description?: string;
  environment?: string;
  stepsToReproduce?: string[];
  actualResult?: string[];
  expectedResult?: string[];
  severity?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  linkedTCs?: string[];
  linkedTestCaseId?: string;
}

/**
 * Parse test case from message text
 * Handles both structured format and simple text messages
 */
export function parseTestCase(text: string): ParsedTestCase {
  const result: ParsedTestCase = {};

  // Clean up the text (remove extra whitespace)
  const cleanText = text.trim();

  // Extract title (after "TC:" prefix or "Title:" prefix)
  const titleMatch = cleanText.match(/^(?:TC|Title):\s*(.+?)(?:\n|$)/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  } else {
    // If no prefix, use first line as title (for simple format)
    const firstLine = cleanText.split('\n')[0].trim();
    if (firstLine && !firstLine.match(/^(Steps|Priority|Type|Description|Preconditions|Expected Result):/i)) {
      // For simple format, use first line as title
      // If it's a single line message, use the whole thing as title
      if (cleanText.split('\n').length === 1) {
        result.title = cleanText;
      } else {
        result.title = firstLine;
      }
    }
  }

  // Extract description
  const descMatch = text.match(/Description:\s*([\s\S]*?)(?=Steps:|Priority:|Type:|Tags:|Preconditions:|Expected Result:|$)/i);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }

  // Extract preconditions
  const preMatch = text.match(/Preconditions:\s*([\s\S]*?)(?=Steps:|Priority:|Type:|Tags:|$)/i);
  if (preMatch) {
    result.preconditions = preMatch[1]
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }

  // Extract steps
  const stepsMatch = text.match(/Steps:\s*([\s\S]*?)(?=Expected Result:|Priority:|Type:|Tags:|Preconditions:|$)/i);
  if (stepsMatch) {
    result.steps = stepsMatch[1]
      .split("\n")
      .filter((line) => /^\d+\./.test(line.trim()))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  // Extract expected result
  const expectedMatch = text.match(/Expected Result:\s*([\s\S]*?)(?=Priority:|Type:|Tags:|$)/i);
  if (expectedMatch) {
    result.expectedResult = expectedMatch[1]
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim())
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }

  // Extract priority
  const priorityMatch = text.match(/Priority:\s*(\w+)/i);
  if (priorityMatch) {
    result.priority = priorityMatch[1].toUpperCase();
  }

  // Extract type
  const typeMatch = text.match(/Type:\s*(\w+)/i);
  if (typeMatch) {
    result.type = typeMatch[1];
  }

  // Extract tags
  const tagsMatch = text.match(/Tags:\s*(.+?)(?:\n|$)/i);
  if (tagsMatch) {
    result.tags = tagsMatch[1]
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return result;
}

/**
 * Parse defect from message text
 */
export function parseDefect(text: string): ParsedDefect {
  const result: ParsedDefect = {};

  // Extract title (after "BUG:" or "Title:" prefix)
  const titleMatch = text.match(/^(?:BUG|Title):\s*(.+?)(?:\n|$)/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  } else {
    // If no prefix, use first line as title
    const firstLine = text.split('\n')[0].trim();
    if (firstLine && !firstLine.match(/^(Steps|Severity|Priority|Description|Actual Result|Expected Result):/i)) {
      result.title = firstLine;
    }
  }

  // Extract description (combine steps, actual, expected if no explicit description)
  const descMatch = text.match(/Description:\s*([\s\S]*?)(?=Steps to Reproduce:|Actual Result:|Expected Result:|Severity:|Priority:|$)/i);
  if (descMatch) {
    result.description = descMatch[1].trim();
  } else {
    // Build description from other fields if no explicit description
    const parts: string[] = [];
    if (result.stepsToReproduce && result.stepsToReproduce.length > 0) {
      parts.push('Steps: ' + result.stepsToReproduce.join('; '));
    }
    if (result.actualResult && result.actualResult.length > 0) {
      parts.push('Actual: ' + result.actualResult.join('; '));
    }
    if (result.expectedResult && result.expectedResult.length > 0) {
      parts.push('Expected: ' + result.expectedResult.join('; '));
    }
    if (parts.length > 0) {
      result.description = parts.join('\n');
    }
  }

  // Extract environment
  const envMatch = text.match(/Environment:\s*([\s\S]*?)(?=Steps to Reproduce:|Actual Result:|$)/i);
  if (envMatch) {
    result.environment = envMatch[1]
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .join(", ");
  }

  // Extract steps to reproduce
  const stepsMatch = text.match(/Steps to Reproduce:\s*([\s\S]*?)(?=Actual Result:|Expected Result:|Severity:|Priority:|$)/i);
  if (stepsMatch) {
    result.stepsToReproduce = stepsMatch[1]
      .split("\n")
      .filter((line) => /^\d+\./.test(line.trim()))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  // Extract actual result
  const actualMatch = text.match(/Actual Result:\s*([\s\S]*?)(?=Expected Result:|Severity:|Priority:|Linked TC:|Tags:|$)/i);
  if (actualMatch) {
    result.actualResult = actualMatch[1]
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim())
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }

  // Extract expected result
  const expectedMatch = text.match(/Expected Result:\s*([\s\S]*?)(?=Severity:|Priority:|Linked TC:|Tags:|$)/i);
  if (expectedMatch) {
    result.expectedResult = expectedMatch[1]
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim())
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
  }

  // Extract severity
  const severityMatch = text.match(/Severity:\s*(\w+)/i);
  if (severityMatch) {
    result.severity = severityMatch[1].toUpperCase();
  }

  // Extract priority
  const priorityMatch = text.match(/Priority:\s*(\w+)/i);
  if (priorityMatch) {
    result.priority = priorityMatch[1].toUpperCase();
  }

  // Extract linked test cases
  const linkedMatch = text.match(/Linked TC:\s*(.+?)(?:\n|$)/i);
  if (linkedMatch) {
    result.linkedTCs = linkedMatch[1]
      .split(",")
      .map((tc) => tc.trim().toUpperCase())
      .filter((tc) => /^TC-\d+$/.test(tc));
    // Store first linked TC ID for defect creation (will need to resolve to actual test case ID)
    if (result.linkedTCs.length > 0) {
      result.linkedTestCaseId = result.linkedTCs[0]; // Store as TC-XXX format, will resolve later
    }
  }

  // Extract status
  const statusMatch = text.match(/Status:\s*(\w+)/i);
  if (statusMatch) {
    result.status = statusMatch[1].toUpperCase();
  }

  // Extract tags
  const tagsMatch = text.match(/Tags:\s*(.+?)(?:\n|$)/i);
  if (tagsMatch) {
    result.tags = tagsMatch[1]
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return result;
}

/**
 * Validate parsed test case has minimum required fields
 */
export function validateTestCase(parsed: ParsedTestCase): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!parsed.title || parsed.title.trim() === "") {
    errors.push("Title is required (TC: ...)");
  }

  if (!parsed.steps || parsed.steps.length === 0) {
    errors.push("At least one step is required");
  }

  if (!parsed.expectedResult || parsed.expectedResult.length === 0) {
    errors.push("Expected result is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate parsed defect has minimum required fields
 */
export function validateDefect(parsed: ParsedDefect): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!parsed.title || parsed.title.trim() === "") {
    errors.push("Title is required (BUG: ...)");
  }

  if (!parsed.stepsToReproduce || parsed.stepsToReproduce.length === 0) {
    errors.push("Steps to reproduce are required");
  }

  if (!parsed.actualResult || parsed.actualResult.length === 0) {
    errors.push("Actual result is required");
  }

  if (!parsed.expectedResult || parsed.expectedResult.length === 0) {
    errors.push("Expected result is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

