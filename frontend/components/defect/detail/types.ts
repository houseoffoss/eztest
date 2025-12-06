export interface Defect {
  id: string;
  defectId: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_PROGRESS' | 'FIXED' | 'TESTED' | 'CLOSED';
  assignedToId: string | null;
  testRunId: string | null;
  environment: string | null;
  createdById: string;
  resolvedAt: Date | null;
  closedAt: Date | null;
  dueDate: Date | null;
  progressPercentage: number | null;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
    key: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  testCases: {
    id: string;
    testCase: {
      id: string;
      title: string;
      tcId: string;
    };
    failureCount: number;
  }[];
  testRun: {
    id: string;
    name: string;
  } | null;
  attachments: DefectAttachment[];
  comments: DefectComment[];
}

export interface DefectAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  uploadedBy: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: Date;
}

export interface DefectComment {
  id: string;
  content: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DefectFormData {
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: string;
  assignedToId: string | null;
  testRunId: string | null;
  environment: string;
  dueDate: string | null;
  progressPercentage: number | null;
}
