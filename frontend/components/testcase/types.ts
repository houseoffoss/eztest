export type TestLayer = 'SMOKE' | 'CORE' | 'EXTENDED' | 'UNKNOWN';
export type TargetType = 'API' | 'SCREEN' | 'FUNCTIONAL' | 'NON_FUNCTIONAL' | 'PERFORMANCE' | 'SECURITY' | 'USABILITY' | 'COMPATIBILITY';
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

  assertionId?: string;
  rtcId?: string;
  flowId?: string;

  layer?: TestLayer;
  targetType?: TargetType;
  testType?: TestType;

  evidence?: string;
  notes?: string;

  isAutomated?: boolean;
  platforms?: Platform[];

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

  assertionId?: string;
  rtcId?: string;
  flowId?: string;

  layer?: TestLayer | string;
  targetType?: TargetType | string;
  testType?: TestType | string;

  evidence?: string;
  notes?: string;

  isAutomated?: boolean;
  platforms?: Platform[];
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
