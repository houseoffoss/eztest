/**
 * Backend Constants
 * 
 * This file exports all constant values used throughout the backend.
 * Import specific constants as needed in your controllers and services.
 */

// Re-export all static messages
export * from './static_messages';

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Project Role Constants
export const PROJECT_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  TESTER: 'TESTER',
  VIEWER: 'VIEWER',
} as const;

// Test Case Priority Constants
export const TEST_PRIORITIES = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

// Test Case Status Constants
export const TEST_STATUS = {
  ACTIVE: 'ACTIVE',
  DEPRECATED: 'DEPRECATED',
  DRAFT: 'DRAFT',
} as const;

// Authorization Scopes
export const AUTHORIZATION_SCOPES = {
  ALL: 'all',
  PROJECT: 'project',
  OWN: 'own',
} as const;

// Module Codes
export const MODULE_CODES = {
  PROJECTS: 'prn',
  TEST_CASES: 'tc',
  TEST_RUNS: 'tr',
  USERS: 'usr',
} as const;

// Action Codes
export const ACTION_CODES = {
  READ: 'r',
  WRITE: 'w',
  UPDATE: 'u',
  DELETE: 'd',
} as const;
