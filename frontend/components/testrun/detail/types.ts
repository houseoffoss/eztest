export interface TestResult {
  id: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'RETEST';
  testCaseId: string;
  testCase: TestCase;
  comment?: string;
  executedAt?: string;
  executedBy?: {
    name: string;
    email: string;
  };
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TestCase {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  priority: Priority | string;
  status: string;
  suiteId?: string | null;
}

export interface TestRun {
  id: string;
  name: string;
  description?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  environment?: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  results: TestResult[];
  testCases?: TestCase[];
  _count?: {
    results: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ResultFormData extends Record<string, string> {
  status: string;
  comment: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  testCases: TestCase[];
  _count?: {
    testCases: number;
  };
}

export interface TestRunStats {
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  pending: number;
  total: number;
}
