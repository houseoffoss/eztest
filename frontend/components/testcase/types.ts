export interface TestSuite {
  id: string;
  name: string;
  parentId: string | null;
  children?: TestSuite[];
  _count?: {
    testCases?: number;
  };
}

export interface TestCase {
  id: string;
  tcId: string;
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  estimatedTime?: number;
  suiteId?: string;
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
  _count: {
    steps: number;
    results: number;
    requirements: number;
  };
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  expectedResult: string;
  priority: string;
  status: string;
  estimatedTime: string;
  preconditions: string;
  postconditions: string;
  suiteId: string | null;
}
