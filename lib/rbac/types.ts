// Types for RBAC
export interface RBACPrivilege {
  id: string;
  role_name: string;
  module_keyword: string;
  action_keyword: string;
  scope_keyword: string;
}

export interface RBACRole {
  id: string;
  keyword: string;
  name: string;
  privileges: RBACPrivilege[];
}

export interface RBACUser {
  id: string;
  email: string;
  name: string;
  role: RBACRole;
}
