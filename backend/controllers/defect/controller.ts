import { defectService } from '@/backend/services/defect/services';
import { EmailService } from '@/backend/services/email/services';
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
import { DefectMessages } from '@/backend/constants/static_messages';

const emailService = new EmailService();

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
    console.log('📝 Defect creation payload:', JSON.stringify(body, null, 2));
    const validationResult = createDefectSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation errors:');
      validationResult.error.issues.forEach((issue) => {
        console.log(`   - Field: ${issue.path.join('.')}`);
        console.log(`     Error: ${issue.message}`);
        console.log(`     Code: ${issue.code}`);
      });
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

    const defect = await defectService.createDefect({
      ...validatedData,
      projectId,
      createdById: req.userInfo.id,
    });

    // If defect is assigned to someone, send notification email
    if (validatedData.assignedToId) {
      emailService
        .sendDefectAssignmentEmail({
          defectId: defect.id,
          assigneeId: validatedData.assignedToId,
          assignedByUserId: req.userInfo.id,
          appUrl,
        })
        .catch((error) => {
          console.error('Failed to send defect assignment email:', error);
        });
    }

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
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

    // Get the current defect to compare changes
    const currentDefect = await defectService.getDefectById(defectId);
    if (!currentDefect) {
      throw new ValidationException('Defect not found');
    }

    // Track changes for email notification
    const changes: Array<{ field: 'status' | 'priority'; oldValue: string; newValue: string }> = [];

    if (validatedData.status && validatedData.status !== currentDefect.status) {
      changes.push({
        field: 'status',
        oldValue: currentDefect.status,
        newValue: validatedData.status,
      });
    }

    if (validatedData.priority && validatedData.priority !== currentDefect.priority) {
      changes.push({
        field: 'priority',
        oldValue: currentDefect.priority,
        newValue: validatedData.priority,
      });
    }

    // Update the defect with all provided fields
    const defect = await defectService.updateDefect(defectId, validatedData);

    // If assignedToId is being changed, send assignment notification email
    if (validatedData.assignedToId !== undefined && validatedData.assignedToId !== currentDefect.assignedToId) {
      const assigneeId = validatedData.assignedToId;
      if (assigneeId) {
        emailService.sendDefectAssignmentEmail({
          defectId,
          assigneeId,
          assignedByUserId: req.userInfo.id,
          appUrl,
        }).catch(error => {
          console.error('Failed to send defect assignment email:', error);
        });
      }
    }

    // Send email notification if status or priority changed
    if (changes.length > 0) {
      emailService.sendDefectUpdateEmail({
        defectId,
        updatedByUserId: req.userInfo.id,
        changes,
        appUrl,
      }).catch(error => {
        console.error('Failed to send defect update email:', error);
      });
    }

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
      data: { message: DefectMessages.DefectDeletedSuccessfully },
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
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
    
    // Get all defects to check their current status
    const defects = await Promise.all(
      validatedData.defectIds.map(id => 
        defectService.getDefectById(id)
      )
    );

    // Update all defects
    await Promise.all(
      validatedData.defectIds.map(id => 
        defectService.updateDefect(id, { status: validatedData.status })
      )
    );

    // Send email notifications for status changes
    defects.forEach(defect => {
      if (defect && defect.status !== validatedData.status) {
        emailService.sendDefectUpdateEmail({
          defectId: defect.id,
          updatedByUserId: req.userInfo.id,
          changes: [{
            field: 'status',
            oldValue: defect.status,
            newValue: validatedData.status,
          }],
          appUrl,
        }).catch(error => {
          console.error(`Failed to send defect update email for ${defect.id}:`, error);
        });
      }
    });

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
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
    
    // Assign all defects and send emails if assignee is provided
    await Promise.all(
      validatedData.defectIds.map(id => 
        validatedData.assignedToId
          ? defectService.assignDefectWithEmail(id, validatedData.assignedToId, req.userInfo.id, appUrl)
          : defectService.updateDefect(id, { assignedToId: null })
      )
    );

    return {
      data: { message: `${validatedData.defectIds.length} defect(s) assigned successfully` },
    };
  }

  /**
   * Get all comments for a defect
   */
  async getDefectComments(req: CustomRequest, defectId: string) {
    // Verify defect exists
    const defect = await defectService.getDefectById(defectId);
    if (!defect) {
      throw new ValidationException('Defect not found');
    }

    const comments = await defectService.getDefectComments(defectId);
    return { data: comments };
  }

  /**
   * Add a comment to a defect
   */
  async addDefectComment(req: CustomRequest, defectId: string, body: unknown) {
    // Verify defect exists
    const defect = await defectService.getDefectById(defectId);
    if (!defect) {
      throw new ValidationException('Defect not found');
    }

    // Validate comment content
    if (!body || typeof body !== 'object' || !('content' in body)) {
      throw new ValidationException('Comment content is required');
    }

    const { content } = body as { content: string };
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new ValidationException('Comment content cannot be empty');
    }

    const userId = req.userInfo?.id;
    if (!userId) {
      throw new ValidationException('User not authenticated');
    }

    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

    // Add comment and send notification emails
    const comment = await defectService.addDefectCommentWithEmail(
      defectId,
      userId,
      content.trim(),
      appUrl
    );

    return { data: comment };
  }
}

export const defectController = new DefectController();
