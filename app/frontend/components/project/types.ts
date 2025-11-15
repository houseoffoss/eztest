export interface ProjectMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  members: ProjectMember[];
  _count?: {
    testCases: number;
    testRuns: number;
    testSuites: number;
  };
}

export interface ProjectDetail extends Project {
  _count: {
    testCases: number;
    testRuns: number;
    testSuites: number;
    requirements: number;
  };
}
