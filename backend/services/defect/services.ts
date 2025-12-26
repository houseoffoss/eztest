import { prisma } from '@/lib/prisma';
import { CustomRequest } from '@/backend/utils/interceptor';
import { s3Client, getS3Bucket } from '@/lib/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface CreateDefectInput {
  projectId: string;
  testRunId?: string | null;
  title: string;
  description?: string | null;
  severity: string;
  priority: string;
  status?: string;
  assignedToId?: string | null;
  createdById: string;
  environment?: string | null;
  dueDate?: string | null;
  progressPercentage?: number | null;
  testCaseIds?: string[];
}

interface UpdateDefectInput {
  title?: string;
  description?: string | null;
  severity?: string;
  priority?: string;
  status?: string;
  assignedToId?: string | null;
  environment?: string | null;
  testRunId?: string | null;
  dueDate?: string | null;
  progressPercentage?: number | null;
}

interface DefectFilters {
  severity?: string[];
  priority?: string[];
  status?: string[];
  assignedToId?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class DefectService {
  /**
   * Generate next defect ID for a project (e.g., DEF-1, DEF-2, DEF-3...)
   */
  private async generateDefectId(projectId: string): Promise<string> {
    const count = await prisma.defect.count({
      where: { projectId },
    });
    
    let defectNumber = count + 1;
    let defectId = `DEF-${defectNumber}`;
    
    let exists = await prisma.defect.findFirst({
      where: {
        projectId,
        defectId,
      },
    });
    
    while (exists) {
      defectNumber++;
      defectId = `DEF-${defectNumber}`;
      exists = await prisma.defect.findFirst({
        where: {
          projectId,
          defectId,
        },
      });
    }
    
    return defectId;
  }

  /**
   * Get all defects for a project with optional filters
   */
  async getProjectDefects(
    projectId: string,
    filters?: DefectFilters
  ) {
    const where: Record<string, unknown> = {
      projectId,
    };

    if (filters?.severity && filters.severity.length > 0) {
      where.severity = { in: filters.severity };
    }

    if (filters?.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters?.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters?.assignedToId && filters.assignedToId.length > 0) {
      if (filters.assignedToId.includes('unassigned')) {
        where.OR = [
          { assignedToId: { in: filters.assignedToId.filter(id => id !== 'unassigned') } },
          { assignedToId: null }
        ];
      } else {
        where.assignedToId = { in: filters.assignedToId };
      }
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { defectId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.dateFrom) {
      where.createdAt = {
        ...(typeof where.createdAt === 'object' ? where.createdAt : {}),
        gte: new Date(filters.dateFrom),
      };
    }

    if (filters?.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      where.createdAt = {
        ...(typeof where.createdAt === 'object' ? where.createdAt : {}),
        lte: toDate,
      };
    }

    const defects = await prisma.defect.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCases: {
          include: {
            testCase: {
              select: {
                id: true,
                tcId: true,
                title: true,
              },
            },
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return defects;
  }

  /**
   * Create a new defect
   */
  async createDefect(data: CreateDefectInput) {
    const defectId = await this.generateDefectId(data.projectId);

    const defect = await prisma.defect.create({
      data: {
        defectId,
        projectId: data.projectId,
        testRunId: data.testRunId,
        title: data.title,
        description: data.description,
        severity: data.severity,
        priority: data.priority,
        status: data.status || 'NEW',
        assignedToId: data.assignedToId,
        createdById: data.createdById,
        environment: data.environment,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        progressPercentage: data.progressPercentage,
        // Create DefectTestCase links if testCaseIds provided
        testCases: data.testCaseIds && data.testCaseIds.length > 0 ? {
          create: data.testCaseIds.map(testCaseId => ({
            testCaseId,
          })),
        } : undefined,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCases: {
          include: {
            testCase: {
              select: {
                id: true,
                tcId: true,
                title: true,
              },
            },
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return defect;
  }

  /**
   * Get defect by ID
   */
  async getDefectById(defectId: string) {
    const defect = await prisma.defect.findUnique({
      where: { id: defectId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        testCases: {
          include: {
            testCase: {
              select: {
                id: true,
                tcId: true,
                title: true,
              },
            },
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!defect) {
      return null;
    }

    // console.log('🔍 Backend - Raw testCases from DB:', defect.testCases);
    // console.log('🔍 Backend - testCases count:', defect.testCases.length);

    // Get failure count for each linked test case
    const testCasesWithFailureCount = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defect.testCases.map(async (tc: any) => {
        const failureCount = await prisma.testResult.count({
          where: {
            testCaseId: tc.testCase.id,
            status: 'FAILED',
          },
        });

        return {
          ...tc,
          failureCount,
        };
      })
    );

    return {
      ...defect,
      testCases: testCasesWithFailureCount,
    };
  }

  /**
   * Update defect
   */
  async updateDefect(defectId: string, data: UpdateDefectInput) {
    const defect = await prisma.defect.update({
      where: { id: defectId },
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity,
        priority: data.priority,
        status: data.status,
        assignedToId: data.assignedToId,
        environment: data.environment,
        testRunId: data.testRunId,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
        progressPercentage: data.progressPercentage,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCases: {
          include: {
            testCase: {
              select: {
                id: true,
                tcId: true,
                title: true,
              },
            },
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return defect;
  }

  /**
   * Delete defect
   */
  async deleteDefect(defectId: string) {
    // Fetch all attachments before deletion to clean up files
    const [defectAttachments, commentAttachments] = await Promise.all([
      prisma.defectAttachment.findMany({
        where: { defectId: defectId },
      }),
      prisma.commentAttachment.findMany({
        where: {
          comment: {
            defectId: defectId,
          },
        },
      }),
    ]);

    // Delete defect (comments, attachments, and comment attachments will cascade)
    await prisma.defect.delete({
      where: { id: defectId },
    });

    // Combine all attachments for cleanup
    const allAttachments = [
      ...defectAttachments.map(a => a.path),
      ...commentAttachments.map(a => a.path),
    ];

    // Delete files from S3 (fire and forget)
    if (allAttachments.length > 0) {
      Promise.all([
        import('@/lib/s3-client'),
        import('@aws-sdk/client-s3')
      ]).then(([{ s3Client, getS3Bucket }, { DeleteObjectCommand }]) => {
        const bucket = getS3Bucket();
        Promise.all(
          allAttachments.map(path =>
            s3Client.send(
              new DeleteObjectCommand({
                Bucket: bucket,
                Key: path,
              })
            ).catch((error: Error) => {
              console.error(`Failed to delete S3 file ${path}:`, error);
            })
          )
        );
      });
    }
  }

  /**
   * Assign defect to a user and send notification email
   * This is used when assigning via UI to automatically send email
   */
  async assignDefectWithEmail(
    defectId: string,
    assigneeId: string | null,
    assignedByUserId: string,
    appUrl: string = 'http://localhost:3000'
  ) {
    // Update the defect assignment
    const defect = await this.updateDefect(defectId, { assignedToId: assigneeId });

    // Send email if assignee is provided
    if (assigneeId) {
      try {
        // Dynamically import emailService to avoid circular dependency
        const { emailService } = await import('@/backend/services/email/services');
        
        // Send email asynchronously (don't wait for it)
        emailService.sendDefectAssignmentEmail({
          defectId,
          assigneeId,
          assignedByUserId,
          appUrl,
        }).catch(error => {
          console.error('Failed to send defect assignment email:', error);
          // Don't throw - assignment succeeded even if email failed
        });
      } catch (error) {
        console.error('Error in assignDefectWithEmail:', error);
        // Don't throw - assignment succeeded even if email service unavailable
      }
    }

    return defect;
  }

  /**
   * Get defect statistics for a project
   */
  async getDefectStatistics(projectId: string) {
    const [total, bySeverity, byStatus, byPriority] = await Promise.all([
      prisma.defect.count({ where: { projectId } }),
      prisma.defect.groupBy({
        by: ['severity'],
        where: { projectId },
        _count: true,
      }),
      prisma.defect.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
      }),
      prisma.defect.groupBy({
        by: ['priority'],
        where: { projectId },
        _count: true,
      }),
    ]);

    return {
      total,
      bySeverity,
      byStatus,
      byPriority,
    };
  }

  /**
   * Get all comments for a defect
   */
  async getDefectComments(defectId: string) {
    const comments = await prisma.defectComment.findMany({
      where: { defectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  }

  /**
   * Add a comment to a defect
   */
  async addDefectComment(defectId: string, userId: string, content: string) {
    const comment = await prisma.defectComment.create({
      data: {
        defectId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return comment;
  }

  /**
   * Add a comment to a defect and send notification emails to other involved users
   * This is used when adding comments via UI to automatically send emails
   */
  async addDefectCommentWithEmail(
    defectId: string,
    userId: string,
    content: string,
    appUrl: string = 'http://localhost:3000'
  ) {
    // First add the comment
    const comment = await this.addDefectComment(defectId, userId, content);

    // Then send notification emails asynchronously (don't block the comment creation)
    const { emailService } = await import('@/backend/services/email/services');
    emailService
      .sendDefectCommentEmail({
        defectId,
        commentContent: content,
        commentAuthorId: userId,
        appUrl,
      })
      .catch((error) => {
        console.error('Failed to send defect comment notification emails:', error);
      });

    return comment;
  }

  /**
   * Associate S3 attachments with a defect
   */
  async associateAttachments(
    defectId: string, 
    attachments: Array<{ id: string; fieldName?: string }>
  ) {
    // Get user from session
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const userId = session.user.id;

    // Verify defect exists
    const defect = await prisma.defect.findUnique({
      where: { id: defectId },
    });

    if (!defect) {
      throw new Error('Defect not found');
    }

    // Link existing attachments by updating their defectId
    const linkedAttachments = await Promise.all(
      attachments.map(async (att) => {
        try {
          // First, get the attachment from the Attachment table
          const attachment = await prisma.attachment.findUnique({
            where: { id: att.id },
          });
          
          if (!attachment) {
            throw new Error(`Attachment ${att.id} not found`);
          }
          
          // Create a DefectAttachment record
          return await prisma.defectAttachment.create({
            data: {
              filename: attachment.filename,
              originalName: attachment.originalName,
              mimeType: attachment.mimeType,
              size: attachment.size,
              path: attachment.path,
              fieldName: att.fieldName || 'description',
              defectId: defectId,
              uploadedById: userId,
            },
          });
        } catch (err) {
          console.error('Failed to create attachment:', err);
          throw err;
        }
      })
    );

    return linkedAttachments;
  }

  /**
   * Get all attachments for a defect
   */
  async getDefectAttachments(defectId: string) {
    // Verify defect exists
    const defect = await prisma.defect.findUnique({
      where: { id: defectId },
    });

    if (!defect) {
      throw new Error('Defect not found');
    }

    const attachments = await prisma.defectAttachment.findMany({
      where: { defectId },
      orderBy: { uploadedAt: 'desc' },
    });

    return attachments;
  }

  /**
   * Delete an attachment from a defect
   */
  async deleteAttachment(defectId: string, attachmentId: string) {
    // Verify defect exists
    const defect = await prisma.defect.findUnique({
      where: { id: defectId },
    });

    if (!defect) {
      throw new Error('Defect not found');
    }

    // Verify attachment exists and belongs to this defect
    const attachment = await prisma.defectAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.defectId !== defectId) {
      throw new Error('Attachment not found');
    }

    // Delete attachment from database
    const deleted = await prisma.defectAttachment.delete({
      where: { id: attachmentId },
    });

    // Delete file from S3 (fire and forget to avoid blocking)
    if (attachment.path) {
      Promise.all([
        import('@/lib/s3-client'),
        import('@aws-sdk/client-s3')
      ]).then(([{ s3Client, getS3Bucket }, { DeleteObjectCommand }]) => {
        const bucket = getS3Bucket();
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: attachment.path,
          })
        ).catch((error: Error) => {
          console.error(`Failed to delete S3 file ${attachment.path}:`, error);
        });
      });
    }

    return deleted;
  }

  async getDefectAttachmentDownloadUrl(attachmentId: string) {
    // Fetch defect attachment from database
    const attachment = await prisma.defectAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        defect: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new Error('Defect attachment not found');
    }

    const bucket = getS3Bucket();

    console.log('[DefectAttachment] Generating URL for:', {
      id: attachment.id,
      path: attachment.path,
      bucket: bucket,
      mimeType: attachment.mimeType,
    });

    // Determine if file should be previewed or downloaded
    const isPreviewable =
      attachment.mimeType.startsWith('image/') ||
      attachment.mimeType === 'application/pdf';

    // Generate presigned URL for secure access (valid for 1 hour)
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: attachment.path,
      ResponseContentDisposition: isPreviewable
        ? 'inline'
        : `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
      ResponseContentType: attachment.mimeType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      url: signedUrl,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
    };
  }

  async deleteDefectAttachment(attachmentId: string, step: string | null) {
    // Fetch attachment from database
    const attachment = await prisma.defectAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error('Defect attachment not found');
    }

    if (step === 'prepare') {
      // Step 1: Generate presigned DELETE URL for S3
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new DeleteObjectCommand({
        Bucket: getS3Bucket(),
        Key: attachment.path,
      });

      const deleteUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return { deleteUrl };
    } else if (step === 'confirm') {
      // Step 2: Remove from database after S3 deletion
      await prisma.defectAttachment.delete({
        where: { id: attachmentId },
      });

      return { success: true };
    } else {
      throw new Error('Invalid step parameter. Use step=prepare or step=confirm');
    }
  }
}

export const defectService = new DefectService();
