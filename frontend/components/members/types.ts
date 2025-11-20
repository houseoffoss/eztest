export interface ProjectMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface Project {
  id: string;
  name: string;
  key: string;
}

export interface AddMemberFormData {
  email: string;
}
