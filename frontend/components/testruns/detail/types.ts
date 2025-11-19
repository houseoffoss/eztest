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

export interface TestCase {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  priority: string;
  status: string;
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

export interface ResultFormData {
  status: string;
  comment: string;
}

export interface TestRunStats {
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  pending: number;
  total: number;
}
