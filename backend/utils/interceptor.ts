import { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';

export interface ScopeInfo {
  access: boolean;
  scope_name: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId?: string;
  [key: string]: unknown;
}

export interface CustomRequest extends NextRequest {
  scopeInfo: ScopeInfo;
  userInfo: UserInfo;
}
