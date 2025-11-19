export interface TestStep {
  id?: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  suite?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  steps: TestStep[];
  _count: {
    results: number;
    comments: number;
    attachments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  priority: string;
  status: string;
  estimatedTime: string;
  preconditions: string;
  postconditions: string;
  suiteId: string | null;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
}
