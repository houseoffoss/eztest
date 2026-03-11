export type TestLayer = 'SMOKE' | 'CORE' | 'EXTENDED' | 'UNKNOWN';
export type Platform = 'IOS' | 'ANDROID' | 'WEB';
export type TestType = 'NORMAL' | 'ABNORMAL' | 'NON_FUNCTIONAL' | 'REGRESSION' | 'DATA_INTEGRITY' | 'STATE_TRANSITION' | 'OPERATIONAL' | 'FAILURE';

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

  suiteId?: string;
  moduleId?: string;

  rtcId?: string;
  flowId?: string;

  layer?: TestLayer;
  testType?: TestType;

  evidence?: string;
  notes?: string;

  platform?: 'Web' | 'Web(SP)' | 'iOS Native' | 'Android Native' | null;
  device?: 'iPhone' | 'Android' | 'PC' | null;
  domain?: string | null;
  functionName?: string | null;
  executionType?: '手動' | '自動' | null;
  automationStatus?: '自動化済' | '自動化対象' | '自動化対象外' | '検討中' | null;

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
  order?: number;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: TestSuite[];
  _count?: {
    testCases: number;
  };
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  order?: number;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    testCases: number;
  };
}
