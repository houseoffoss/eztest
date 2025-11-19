export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  order: number;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: TestSuite[];
  _count: {
    testCases: number;
  };
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
}

export interface TestSuiteFormData {
  name: string;
  description: string;
  parentId: string | null;
}
