import { z } from 'zod';
import { DefectSeverity, DefectStatus, Priority } from '@prisma/client';

export const createDefectSchema = z.object({
  testRunId: z.string().optional().nullable(),
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().optional().nullable(),
  severity: z.nativeEnum(DefectSeverity),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(DefectStatus).optional(),
  assignedToId: z.string().optional().nullable(),
  environment: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  progressPercentage: z.number().int().min(0).max(100).optional().nullable(),
  testCaseIds: z.array(z.string()).optional(),
});

export const updateDefectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long').optional(),
  description: z.string().optional().nullable(),
  severity: z.nativeEnum(DefectSeverity).optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(DefectStatus).optional(),
  assignedToId: z.string().optional().nullable(),
  environment: z.string().optional().nullable(),
  testRunId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  progressPercentage: z.number().int().min(0).max(100).optional().nullable(),
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
