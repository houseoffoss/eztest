import { projectService } from '@/backend/services/project/services';
import { emailService } from '@/backend/services/email/services';
import { CustomRequest } from '@/backend/utils/interceptor';
import { BadRequestException, ConflictException, NotFoundException, InternalServerException, ValidationException } from '@/backend/utils/exceptions';
import { ProjectMessages, ProjectMemberMessages } from '@/backend/constants/static_messages';
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema } from '@/backend/validators';

export class ProjectController {
  /**
   * GET /api/projects - List all projects
   * Scope-based filtering applied via request.scopeInfo
   */
  async listProjects(request: CustomRequest) {
    const projects = await projectService.getAllProjects(
      request.userInfo.id,
      request.scopeInfo.scope_name
    );
    return { data: projects };
  }

  /**
   * POST /api/projects - Create new project
   * Permission already checked by route wrapper
   */
  async createProject(request: CustomRequest) {
    const body = await request.json();

    // Validation with Zod
    const validationResult = createProjectSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const { name, key, description } = validationResult.data;

    try {
      const project = await projectService.createProject({
        name,
        key,
        description,
        createdById: request.userInfo.id,
      });

      return { data: project, statusCode: 201 };
    } catch (error) {
      if (error instanceof Error && error.message === 'Project key already exists') {
        throw new ConflictException(ProjectMessages.ProjectKeyAlreadyExists);
      }
      throw new InternalServerException(ProjectMessages.FailedToCreateProject);
    }
  }

  /**
   * GET /api/projects/[id] - Get project details
   * Access already checked by route wrapper
   */
  async getProject(request: CustomRequest, projectId: string, includeStats: boolean = false) {
    const project = await projectService.getProjectById(
      projectId,
      request.userInfo.id,
      request.scopeInfo.scope_name,
      includeStats
    );

    if (!project) {
      throw new NotFoundException(ProjectMessages.ProjectNotFound);
    }

    return { data: project };
  }

  /**
   * PUT /api/projects/[id] - Update project info
   * Permission already checked by route wrapper
   */
  async updateProject(request: CustomRequest, projectId: string) {
    const body = await request.json();

    // Validation with Zod
    const validationResult = updateProjectSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const { name, description } = validationResult.data;

    try {
      const project = await projectService.updateProject(projectId, {
        name,
        description: description ?? undefined,
      });

      return { data: project };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(ProjectMessages.ProjectNotFound);
      }
      throw new InternalServerException(ProjectMessages.FailedToUpdateProject);
    }
  }

  /**
   * DELETE /api/projects/[id] - Delete project
   * Permission already checked by route wrapper
   */
  async deleteProject(request: CustomRequest, projectId: string) {
    try {
      await projectService.deleteProject(
        projectId,
        request.userInfo.id,
        request.scopeInfo.scope_name
      );

      return { message: ProjectMessages.ProjectDeletedSuccessfully };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(ProjectMessages.ProjectNotFound);
      }
      throw new InternalServerException(ProjectMessages.FailedToDeleteProject);
    }
  }

  /**
   * GET /api/projects/[id]/members - Get members of a project
   * Access already checked by route wrapper
   */
  async getProjectMembers(request: CustomRequest, projectId: string) {
    const members = await projectService.getProjectMembers(projectId);
    return { data: members };
  }

  /**
   * POST /api/projects/[id]/members - Add member to project
   * Permission already checked by route wrapper
   */
  async addProjectMember(request: CustomRequest, projectId: string) {
    const body = await request.json();

    // Validation with Zod
    const validationResult = addProjectMemberSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const { userId: newUserId, email } = validationResult.data;
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

    try {
      const member = await projectService.addProjectMember(projectId, {
        userId: newUserId,
        email,
      });

      // Send notification email to the newly added member (non-blocking, async)
      emailService
        .sendProjectMemberEmail({
          projectId,
          newMemberId: member.userId,
          addedByUserId: request.userInfo.id,
          appUrl,
        })
        .catch((error) => {
          console.error('Failed to send project member email:', error);
        });

      return { data: member, statusCode: 201 };
    } catch (error) {
      if (error instanceof Error && error.message === 'User is already a member of this project') {
        throw new ConflictException(ProjectMemberMessages.UserAlreadyMember);
      }

      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException(ProjectMemberMessages.UserNotFound);
      }

      if (error instanceof Error && error.message === 'User with this email not found') {
        throw new NotFoundException(ProjectMemberMessages.UserWithEmailNotFound);
      }

      throw new InternalServerException(ProjectMemberMessages.FailedToAddMember);
    }
  }

  /**
   * DELETE /api/projects/[id]/members/[memberId] - Remove member
   * Permission already checked by route wrapper
   */
  async removeProjectMember(request: CustomRequest, projectId: string, memberId: string) {
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

    try {
      const { removedUserId } = await projectService.removeProjectMember(projectId, memberId);

      // Send notification email to the removed member (non-blocking, async)
      emailService
        .sendRemoveProjectMemberEmail({
          projectId,
          memberId: removedUserId,
          removedByUserId: request.userInfo.id,
          appUrl,
        })
        .catch((error) => {
          console.error('Failed to send member removal email:', error);
        });

      return { message: ProjectMemberMessages.MemberRemovedSuccessfully };
    } catch (error) {
      if (error instanceof Error && error.message === 'Member not found in this project') {
        throw new NotFoundException(ProjectMemberMessages.MemberNotFound);
      }

      if (error instanceof Error && error.message === 'Cannot remove the last owner of the project') {
        throw new BadRequestException(ProjectMemberMessages.CannotRemoveLastOwner);
      }

      throw new InternalServerException(ProjectMemberMessages.FailedToRemoveMember);
    }
  }
}

export const projectController = new ProjectController();
