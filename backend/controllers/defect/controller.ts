import { defectService } from '@/backend/services/defect/services';
import { 
  createDefectSchema, 
  updateDefectSchema, 
  defectQuerySchema,
  bulkDeleteSchema,
  bulkUpdateStatusSchema,
  bulkAssignSchema
} from '@/backend/validators/defect';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException } from '@/backend/utils/exceptions';
import { DefectSeverity, DefectStatus, Priority } from '@prisma/client';

export class DefectController {
  /**
   * Get all defects for a project
   */
  async getProjectDefects(
    req: CustomRequest, 
    projectId: string,
    queryParams: {
      severity?: string;
      priority?: string;
      status?: string;
      assignedToId?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) {
    const validationResult = defectQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      throw new ValidationException(
        'Invalid query parameters',
        validationResult.error.issues
      );
    }

    const query = validationResult.data;

    const filters = {
      severity: query.severity?.split(',').filter(Boolean) as DefectSeverity[] | undefined,
      priority: query.priority?.split(',').filter(Boolean) as Priority[] | undefined,
      status: query.status?.split(',').filter(Boolean) as DefectStatus[] | undefined,
      assignedToId: query.assignedToId?.split(',').filter(Boolean),
      search: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };

    const defects = await defectService.getProjectDefects(projectId, filters);

    return {
      data: defects,
    };
  }

  /**
   * Create a new defect
   */
  async createDefect(req: CustomRequest, projectId: string, body: unknown) {
    const validationResult = createDefectSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    const defect = await defectService.createDefect({
      ...validatedData,
      projectId,
      createdById: req.userInfo.id,
    });

    return {
      data: defect,
      statusCode: 201,
    };
  }

  /**
   * Get defect by ID
   */
  async getDefectById(req: CustomRequest, defectId: string) {
    const defect = await defectService.getDefectById(defectId);

    return {
      data: defect,
    };
  }

  /**
   * Update defect
   */
  async updateDefect(req: CustomRequest, defectId: string, body: unknown) {
    const validationResult = updateDefectSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    const defect = await defectService.updateDefect(defectId, validatedData);

    return {
      data: defect,
    };
  }

  /**
   * Delete defect
   */
  async deleteDefect(req: CustomRequest, defectId: string) {
    await defectService.deleteDefect(defectId);

    return {
      data: { message: 'Defect deleted successfully' },
    };
  }

  /**
   * Get defect statistics
   */
  async getDefectStatistics(req: CustomRequest, projectId: string) {
    const statistics = await defectService.getDefectStatistics(projectId);

    return {
      data: statistics,
    };
  }

  /**
   * Bulk delete defects
   */
  async bulkDeleteDefects(req: CustomRequest, body: unknown) {
    const validationResult = bulkDeleteSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;
    
    await Promise.all(
      validatedData.defectIds.map(id => defectService.deleteDefect(id))
    );

    return {
      data: { message: `${validatedData.defectIds.length} defect(s) deleted successfully` },
    };
  }

  /**
   * Bulk update defect status
   */
  async bulkUpdateStatus(req: CustomRequest, body: unknown) {
    const validationResult = bulkUpdateStatusSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;
    
    await Promise.all(
      validatedData.defectIds.map(id => 
        defectService.updateDefect(id, { status: validatedData.status })
      )
    );

    return {
      data: { message: `${validatedData.defectIds.length} defect(s) updated successfully` },
    };
  }

  /**
   * Bulk assign defects
   */
  async bulkAssignDefects(req: CustomRequest, body: unknown) {
    const validationResult = bulkAssignSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;
    
    await Promise.all(
      validatedData.defectIds.map(id => 
        defectService.updateDefect(id, { assignedToId: validatedData.assignedToId })
      )
    );

    return {
      data: { message: `${validatedData.defectIds.length} defect(s) assigned successfully` },
    };
  }
}

export const defectController = new DefectController();
