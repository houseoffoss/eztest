import { NextRequest } from 'next/server';

export interface ScopeInfo {
  access: boolean;
  scope_name: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string; // Role name: "ADMIN", "PROJECT_MANAGER", "TESTER", "VIEWER"
  orgId?: string;
  [key: string]: unknown;
}

export interface CustomRequest extends NextRequest {
  scopeInfo: ScopeInfo;
  userInfo: UserInfo;
}
