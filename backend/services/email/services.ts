import { prisma } from '@/lib/prisma';
import {
  sendDefectCreationEmail as sendDefectCreationEmailUtil,
  sendDefectAssignmentEmail as sendDefectAssignmentEmailUtil,
  sendDefectUpdateEmail as sendDefectUpdateEmailUtil,
  sendTestRunReportEmail as sendTestRunReportEmailUtil,
  sendDefectCommentEmail as sendDefectCommentEmailUtil,
  sendProjectMemberEmail as sendProjectMemberEmailUtil,
  sendRemoveProjectMemberEmail as sendRemoveProjectMemberEmailUtil,
  sendUserInvitationEmail as sendUserInvitationEmailUtil,
  sendUserUpdateEmail as sendUserUpdateEmailUtil,
  sendUserDeleteEmail as sendUserDeleteEmailUtil,
  isEmailServiceAvailable as checkEmailServiceAvailable,
} from '@/lib/email-service';
import { NotFoundException } from '@/backend/utils/exceptions';

interface SendDefectCreationEmailInput {
  defectId: string;
  creatorId: string;
  appUrl: string;
}

interface SendDefectAssignmentEmailInput {
  defectId: string;
  assigneeId?: string;
  assignedByUserId: string;
  appUrl: string;
}

interface SendTestRunReportEmailInput {
  testRunId: string;
  recipientId?: string;
  startedByUserId: string;
  appUrl: string;
}

interface SendDefectCommentEmailInput {
  defectId: string;
  commentContent: string;
  commentAuthorId: string;
  appUrl: string;
}

interface SendDefectUpdateEmailInput {
  defectId: string;
  updatedByUserId: string;
  changes: {
    field: 'status' | 'priority';
    oldValue: string;
    newValue: string;
  }[];
  appUrl: string;
}

interface SendProjectMemberEmailInput {
  projectId: string;
  newMemberId: string;
  addedByUserId: string;
  appUrl: string;
}

interface SendRemoveProjectMemberEmailInput {
  projectId: string;
  memberId: string;
  removedByUserId: string;
  appUrl: string;
}

interface SendUserInvitationEmailInput {
  userId: string;
  tempPassword: string;
  invitedByUserId: string;
  appUrl: string;
}

interface SendUserUpdateEmailInput {
  userId: string;
  updatedByUserId: string;
  changes: string[];
  appUrl: string;
}

interface SendUserDeleteEmailInput {
  userId: string;
  deletedByUserId: string;
  appUrl: string;
}

export class EmailService {
  /**
   * Send defect creation notification email to the creator
   * Automatically called when a defect is created
   * Fetches all required data, then sends email
   */
  async sendDefectCreationEmail(input: SendDefectCreationEmailInput): Promise<boolean> {
    const { defectId, creatorId, appUrl } = input;

    console.log('[EMAIL] Attempting to send defect creation email');
    console.log('[EMAIL] Defect ID:', defectId);
    console.log('[EMAIL] Creator ID:', creatorId);
    console.log('[EMAIL] ENABLE_SMTP:', process.env.ENABLE_SMTP);

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    console.log('[EMAIL] Email service available:', isAvailable);
    
    if (!isAvailable) {
      console.warn('[EMAIL] Email service not available, skipping defect creation email');
      console.warn('[EMAIL] Check ENABLE_SMTP environment variable and SMTP configuration');
      return false;
    }

    try {
      // Fetch defect with all related data
      const defect = await prisma.defect.findUnique({
        where: { id: defectId },
        include: {
          project: true,
          assignedTo: true,
          createdBy: true,
        },
      });

      if (!defect) {
        throw new NotFoundException('Defect not found');
      }

      // Verify the creator matches
      if (defect.createdBy.id !== creatorId) {
        throw new NotFoundException('Creator mismatch');
      }

      // Get all admin users
      const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' },
      });

      if (!adminRole) {
        console.warn('[EMAIL] ADMIN role not found, sending only to creator');
      }

      // Fetch all admin users (excluding soft-deleted) - get full User objects
      const adminUsers = adminRole
        ? await prisma.user.findMany({
            where: {
              roleId: adminRole.id,
              deletedAt: null,
            },
          })
        : [];

      // Collect all recipients: admins + creator (avoid duplicates)
      const recipientIds = new Set<string>();
      const recipients: typeof adminUsers = [];

      // Add creator first
      recipientIds.add(defect.createdBy.id);
      recipients.push(defect.createdBy);

      // Add all admins (excluding creator if they're an admin)
      adminUsers.forEach((admin) => {
        if (!recipientIds.has(admin.id)) {
          recipientIds.add(admin.id);
          recipients.push(admin);
        }
      });

      console.log('[EMAIL] Sending email to', recipients.length, 'recipient(s):');
      recipients.forEach((r) => console.log('[EMAIL]   -', r.email));

      // Send email via utility function
      const emailSent = await sendDefectCreationEmailUtil({
        creator: defect.createdBy,
        recipients,
        defectId: defect.id,
        defectKey: defect.defectId,
        defectTitle: defect.title,
        defectDescription: defect.description || undefined,
        status: defect.status,
        severity: defect.severity,
        priority: defect.priority,
        projectId: defect.project.id,
        projectName: defect.project.name,
        assignedTo: defect.assignedTo || undefined,
        appUrl,
      });

      if (emailSent) {
        console.log('[EMAIL] ✓ Defect creation email sent successfully to', defect.createdBy.email);
      } else {
        console.error('[EMAIL] ✗ Failed to send defect creation email to', defect.createdBy.email);
      }

      return emailSent;
    } catch (error) {
      console.error('[EMAIL] ✗ Error sending defect creation email:', error);
      if (error instanceof Error) {
        console.error('[EMAIL] Error message:', error.message);
        console.error('[EMAIL] Error stack:', error.stack);
      }
      return false;
    }
  }

  /**
   * Send defect assignment notification email
   * Automatically called when a defect is assigned to someone
   * Fetches all required data, then sends email
   */
  async sendDefectAssignmentEmail(input: SendDefectAssignmentEmailInput): Promise<boolean> {
    const { defectId, assigneeId, assignedByUserId, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping defect assignment email');
      return false;
    }

    try {
      // Fetch defect
      const defect = await prisma.defect.findUnique({
        where: { id: defectId },
        include: {
          project: true,
          assignedTo: true,
        },
      });

      if (!defect) {
        throw new NotFoundException('Defect not found');
      }

      // Get assignee
      let assignee = defect.assignedTo;
      if (!assignee && assigneeId) {
        assignee = await prisma.user.findUnique({
          where: { id: assigneeId },
        });
      }

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      // Get the user who performed the assignment
      const assignedBy = await prisma.user.findUnique({
        where: { id: assignedByUserId },
      });

      if (!assignedBy) {
        throw new NotFoundException('User not found');
      }

      // Send email via utility function
      const emailSent = await sendDefectAssignmentEmailUtil({
        assignee,
        defectId: defect.id,
        defectKey: defect.defectId,
        defectTitle: defect.title,
        defectDescription: defect.description || undefined,
        status: defect.status,
        severity: defect.severity,
        priority: defect.priority,
        projectId: defect.project.id,
        projectName: defect.project.name,
        assignedBy,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending defect assignment email:', error);
      return false;
    }
  }

  /**
   * Send defect update notification email (status/priority change)
   * Automatically called when defect status or priority is updated
   * Fetches all required data, then sends email to assignee and creator
   */
  async sendDefectUpdateEmail(input: SendDefectUpdateEmailInput): Promise<boolean> {
    const { defectId, updatedByUserId, changes, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping defect update email');
      return false;
    }

    try {
      // Fetch defect with all related data
      const defect = await prisma.defect.findUnique({
        where: { id: defectId },
        include: {
          project: true,
          assignedTo: true,
          createdBy: true,
        },
      });

      if (!defect) {
        throw new NotFoundException('Defect not found');
      }

      // Get the user who performed the update
      const updatedBy = await prisma.user.findUnique({
        where: { id: updatedByUserId },
      });

      if (!updatedBy) {
        throw new NotFoundException('User not found');
      }

      // Send email via utility function
      const emailSent = await sendDefectUpdateEmailUtil({
        defectId: defect.id,
        defectTitle: defect.title,
        defectKey: defect.defectId,
        projectName: defect.project.name,
        updatedBy,
        changes,
        assignedTo: defect.assignedTo || undefined,
        createdBy: defect.createdBy,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending defect update email:', error);
      return false;
    }
  }

  /**
   * Send test run report email
   * Called when user explicitly requests to send report
   * Fetches test run data, calculates statistics, then sends email
   */
  async sendTestRunReportEmail(input: SendTestRunReportEmailInput): Promise<boolean> {
    const { testRunId, recipientId, startedByUserId, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping test run report email');
      return false;
    }

    try {
      // Fetch test run
      const testRun = await prisma.testRun.findUnique({
        where: { id: testRunId },
        include: {
          project: true,
          assignedTo: true,
          results: true,
        },
      });

      if (!testRun) {
        throw new NotFoundException('Test run not found');
      }

      // Get recipient - prioritize recipientId parameter over testRun.assignedTo
      let recipient = null;
      if (recipientId) {
        recipient = await prisma.user.findUnique({
          where: { id: recipientId },
        });
      } else if (testRun.assignedTo) {
        recipient = testRun.assignedTo;
      }

      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }

      // Get the user who started the test run
      const startedBy = await prisma.user.findUnique({
        where: { id: startedByUserId },
      });

      if (!startedBy) {
        throw new NotFoundException('User not found');
      }

      // Calculate statistics
      const stats = {
        total: testRun.results.length,
        passed: testRun.results.filter(r => r.status === 'PASSED').length,
        failed: testRun.results.filter(r => r.status === 'FAILED').length,
        blocked: testRun.results.filter(r => r.status === 'BLOCKED').length,
        skipped: testRun.results.filter(r => r.status === 'SKIPPED').length,
      };

      // Send email via utility function
      const emailSent = await sendTestRunReportEmailUtil({
        recipient,
        testRunId: testRun.id,
        testRunName: testRun.name,
        testRunDescription: testRun.description || undefined,
        environment: testRun.environment || undefined,
        projectName: testRun.project.name,
        stats,
        startedBy,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending test run report email:', error);
      return false;
    }
  }

  /**
   * Check if email service is configured and available
   */
  async isEmailServiceAvailable(): Promise<boolean> {
    return await checkEmailServiceAvailable();
  }

  /**
   * Send defect comment notification emails
   * Called when a comment is added to a defect
   * Notifies all involved users (assignee, creator, other commenters) except the comment author
   */
  async sendDefectCommentEmail(input: SendDefectCommentEmailInput): Promise<boolean> {
    const { defectId, commentContent, commentAuthorId, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping defect comment email');
      return false;
    }

    try {
      // Fetch defect with related data
      const defect = await prisma.defect.findUnique({
        where: { id: defectId },
        include: {
          project: true,
          assignedTo: true,
          createdBy: true,
          comments: {
            include: { user: true },
          },
        },
      });

      if (!defect) {
        throw new NotFoundException('Defect not found');
      }

      // Get comment author
      const commentAuthor = await prisma.user.findUnique({
        where: { id: commentAuthorId },
      });

      if (!commentAuthor) {
        throw new NotFoundException('Comment author not found');
      }

      // Collect all users to notify (remove duplicates and exclude comment author)
      const usersToNotifySet = new Set<string>();

      // Add defect creator
      if (defect.createdBy?.id && defect.createdBy.id !== commentAuthorId) {
        usersToNotifySet.add(defect.createdBy.id);
      }

      // Add defect assignee
      if (defect.assignedTo?.id && defect.assignedTo.id !== commentAuthorId) {
        usersToNotifySet.add(defect.assignedTo.id);
      }

      // Add all users who commented (except current author)
      defect.comments.forEach((comment) => {
        if (comment.user.id !== commentAuthorId) {
          usersToNotifySet.add(comment.user.id);
        }
      });

      // If no one to notify, return early
      if (usersToNotifySet.size === 0) {
        console.log('No users to notify for defect comment');
        return true;
      }

      // Fetch all users to notify
      const usersToNotify = await prisma.user.findMany({
        where: {
          id: { in: Array.from(usersToNotifySet) },
        },
      });

      // Send email via utility function
      const emailSent = await sendDefectCommentEmailUtil({
        defectId: defect.id,
        defectTitle: defect.title,
        defectKey: defect.defectId,
        commentAuthor,
        commentContent,
        projectName: defect.project.name,
        recipients: usersToNotify,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending defect comment email:', error);
      return false;
    }
  }

  /**
   * Send project member added notification email
   * Called when a user is added to a project
   */
  async sendProjectMemberEmail(input: SendProjectMemberEmailInput): Promise<boolean> {
    const { projectId, newMemberId, addedByUserId, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping project member email');
      return false;
    }

    try {
      // Fetch project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Get new member
      const newMember = await prisma.user.findUnique({
        where: { id: newMemberId },
      });

      if (!newMember) {
        throw new NotFoundException('Member not found');
      }

      // Get the user who added the member
      const addedByUser = await prisma.user.findUnique({
        where: { id: addedByUserId },
      });

      if (!addedByUser) {
        throw new NotFoundException('User not found');
      }

      // Send email via utility function
      const emailSent = await sendProjectMemberEmailUtil({
        newMember,
        projectName: project.name,
        addedByUser,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending project member email:', error);
      return false;
    }
  }

  /**
   * Send project member removal notification
   * Called when a member is removed from a project
   */
  async sendRemoveProjectMemberEmail(input: SendRemoveProjectMemberEmailInput): Promise<boolean> {
    const { projectId, memberId, removedByUserId, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping member removal email');
      return false;
    }

    try {
      // Fetch project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Get removed member
      const removedMember = await prisma.user.findUnique({
        where: { id: memberId },
      });

      if (!removedMember) {
        throw new NotFoundException('Member not found');
      }

      // Get the user who removed the member
      const removedByUser = await prisma.user.findUnique({
        where: { id: removedByUserId },
      });

      if (!removedByUser) {
        throw new NotFoundException('User not found');
      }

      // Send email via utility function
      const emailSent = await sendRemoveProjectMemberEmailUtil({
        removedMember,
        projectName: project.name,
        removedByUser,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending member removal email:', error);
      return false;
    }
  }

  /**
   * Send user invitation email
   * Called when admin creates a new user
   */
  async sendUserInvitationEmail(input: SendUserInvitationEmailInput): Promise<boolean> {
    const { userId, tempPassword, invitedByUserId, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping user invitation email');
      return false;
    }

    try {
      // Get invited user
      const invitedUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!invitedUser) {
        throw new NotFoundException('User not found');
      }

      // Get the user who invited/created the user
      const invitedByUser = await prisma.user.findUnique({
        where: { id: invitedByUserId },
      });

      if (!invitedByUser) {
        throw new NotFoundException('Inviting user not found');
      }

      // Send email via utility function
      const emailSent = await sendUserInvitationEmailUtil({
        invitedUser,
        invitedByUser,
        tempPassword,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending user invitation email:', error);
      return false;
    }
  }

  /**
   * Send user update notification email
   * Called when admin updates a user's account
   */
  async sendUserUpdateEmail(input: SendUserUpdateEmailInput): Promise<boolean> {
    const { userId, updatedByUserId, changes, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping user update email');
      return false;
    }

    try {
      // Get updated user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get the user who updated the account
      const updatedByUser = await prisma.user.findUnique({
        where: { id: updatedByUserId },
      });

      if (!updatedByUser) {
        throw new NotFoundException('Updating user not found');
      }

      // Send email via utility function
      const emailSent = await sendUserUpdateEmailUtil({
        user,
        updatedByUser,
        changes,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending user update email:', error);
      return false;
    }
  }

  /**
   * Send user delete notification email
   * Called when admin deletes/deactivates a user's account
   */
  async sendUserDeleteEmail(input: SendUserDeleteEmailInput): Promise<boolean> {
    const { userId, deletedByUserId, appUrl } = input;

    // Check if email service is available
    const isAvailable = await checkEmailServiceAvailable();
    if (!isAvailable) {
      console.warn('Email service not available, skipping user delete email');
      return false;
    }

    try {
      // Get deleted user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get the user who deleted the account
      const deletedByUser = await prisma.user.findUnique({
        where: { id: deletedByUserId },
      });

      if (!deletedByUser) {
        throw new NotFoundException('Deleting user not found');
      }

      // Send email via utility function
      const emailSent = await sendUserDeleteEmailUtil({
        user,
        deletedByUser,
        appUrl,
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending user delete email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
