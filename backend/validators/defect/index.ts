import { z } from 'zod';
import { DefectSeverity, DefectStatus, DefectType, Priority } from '@prisma/client';

export const createDefectSchema = z.object({
  testCaseId: z.string().optional(),
  testRunId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().optional(),
  defectType: z.nativeEnum(DefectType).default('BUG'),
  stepsToReproduce: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  severity: z.nativeEnum(DefectSeverity),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(DefectStatus).optional(),
  assignedToId: z.string().optional(),
  environment: z.string().optional(),
});

export const updateDefectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
  description: z.string().optional().nullable(),
  defectType: z.nativeEnum(DefectType).optional(),
  stepsToReproduce: z.string().optional().nullable(),
  expectedResult: z.string().optional().nullable(),
  actualResult: z.string().optional().nullable(),
  severity: z.nativeEnum(DefectSeverity).optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(DefectStatus).optional(),
  assignedToId: z.string().optional().nullable(),
  environment: z.string().optional().nullable(),
  testCaseId: z.string().optional().nullable(),
  testRunId: z.string().optional().nullable(),
});

export const defectQuerySchema = z.object({
  severity: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  assignedToId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const bulkDeleteSchema = z.object({
  defectIds: z.array(z.string()).min(1, 'At least one defect ID is required'),
});

export const bulkUpdateStatusSchema = z.object({
  defectIds: z.array(z.string()).min(1, 'At least one defect ID is required'),
  status: z.nativeEnum(DefectStatus),
});

export const bulkAssignSchema = z.object({
  defectIds: z.array(z.string()).min(1, 'At least one defect ID is required'),
  assignedToId: z.string().nullable(),
});
