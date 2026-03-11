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
  testData?: string;
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

export type TestLayer = 'SMOKE' | 'CORE' | 'EXTENDED' | 'UNKNOWN';
export type TestType = 'NORMAL' | 'ABNORMAL' | 'NON_FUNCTIONAL' | 'REGRESSION' | 'DATA_INTEGRITY' | 'STATE_TRANSITION' | 'OPERATIONAL' | 'FAILURE';

export interface TestCaseFormData {
  title: string;
  description: string;
  expectedResult: string;
  testData: string;
  priority: string;
  status: string;
  estimatedTime: string;
  preconditions: string;
  postconditions: string;
  suiteId: string | null;
  moduleId: string | null;
  // Enhanced test case fields
  rtcId?: string;
  flowId?: string;
  layer?: TestLayer | string;
  testType?: TestType | string;
  evidence?: string;
  notes?: string;
  platform?: 'Web' | 'Web(SP)' | 'iOS Native' | 'Android Native' | null;
  device?: 'iPhone' | 'Android' | 'PC' | null;
  domain?: string | null;
  functionName?: string | null;
  executionType?: '手動' | '自動' | null;
  automationStatus?: '自動化済' | '自動化対象' | '自動化対象外' | '検討中' | null;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
}
