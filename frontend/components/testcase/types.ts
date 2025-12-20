export interface TestSuite {
  id: string;
  name: string;
  parentId: string | null;
  children?: TestSuite[];
  _count?: {
    testCases?: number;
  };
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  order?: number;
  projectId: string;
  _count?: {
    testCases?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCase {
  id: string;
  tcId: string;
  title: string;
  description?: string;
  expectedResult?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  suiteId?: string;
  suite?: {
    id: string;
    name: string;
  };
  moduleId?: string;
  module?: {
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
    defects: number;
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
  moduleId: string | null;
}
