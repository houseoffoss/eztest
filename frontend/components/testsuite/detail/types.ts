export interface TestCase {
  id: string;
  tcId: string;
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    results: number;
    steps: number;
    requirements: number;
  };
}

export interface ChildSuite {
  id: string;
  name: string;
  _count: {
    testCases: number;
  };
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  order: number;
  projectId: string;
  parentId?: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  parent?: {
    id: string;
    name: string;
  };
  children?: ChildSuite[];
  testCases: TestCase[];
  _count: {
    testCases: number;
    children: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TestSuiteFormData {
  name: string;
  description: string;
}
