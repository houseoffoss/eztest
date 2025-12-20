export interface TestStep {
  id?: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
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
  project: {
    id: string;
    name: string;
    key: string;
  };
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
  steps: TestStep[];
  defects: {
    id: string;
    Defect: {
      id: string;
      defectId: string;
      title: string;
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      status: string;
    };
  }[];
  _count: {
    steps: number;
    results: number;
    requirements: number;
    defects: number;
    comments?: number;
    attachments?: number;
  };
  createdAt: string;
  updatedAt: string;
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

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
}
