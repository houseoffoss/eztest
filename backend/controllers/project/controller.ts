import { NextResponse } from 'next/server';
import { projectService } from '@/backend/services/project/services';
import { ProjectRole } from '@prisma/client';
import { CustomRequest } from '@/backend/utils/interceptor';

export class ProjectController {
  /**
   * GET /api/projects - List all projects
   * Scope-based filtering applied via request.scopeInfo
   */
  async listProjects(request: CustomRequest) {
    try {
      const projects = await projectService.getAllProjects(
        request.userInfo.id,
        request.scopeInfo.scope_name
      );
      return NextResponse.json({ data: projects });
    } catch (error) {
      console.error('List projects error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/projects - Create new project
   * Permission already checked by route wrapper
   */
  async createProject(request: CustomRequest) {
    try {
      const body = await request.json();
      const { name, key, description } = body;

      // Validation
      if (!name || !key) {
        return NextResponse.json(
          { error: 'Name and key are required' },
          { status: 400 }
        );
      }

      if (name.length < 3 || name.length > 255) {
        return NextResponse.json(
          { error: 'Name must be between 3 and 255 characters' },
          { status: 400 }
        );
      }

      if (key.length < 2 || key.length > 10) {
        return NextResponse.json(
          { error: 'Key must be between 2 and 10 characters' },
          { status: 400 }
        );
      }

      // Key should only contain uppercase letters and numbers
      if (!/^[A-Z0-9]+$/.test(key.toUpperCase())) {
        return NextResponse.json(
          { error: 'Key can only contain letters and numbers' },
          { status: 400 }
        );
      }

      const project = await projectService.createProject({
        name,
        key,
        description,
        createdById: request.userInfo.id,
      });

      return NextResponse.json({ data: project }, { status: 201 });
    } catch (error) {
      console.error('Create project error:', error);

      if (error instanceof Error && error.message === 'Project key already exists') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/projects/[id] - Get project details
   * Access already checked by route wrapper
   */
  async getProject(request: CustomRequest, projectId: string, includeStats: boolean = false) {
    try {
      const project = await projectService.getProjectById(
        projectId,
        request.userInfo.id,
        request.scopeInfo.scope_name,
        includeStats
      );

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: project });
    } catch (error) {
      console.error('Get project error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      );
    }
  }

  /**
   * PUT /api/projects/[id] - Update project info
   * Permission already checked by route wrapper
   */
  async updateProject(request: CustomRequest, projectId: string) {
    try {
      const body = await request.json();
      const { name, description } = body;

      // Validation
      if (name && (name.length < 3 || name.length > 255)) {
        return NextResponse.json(
          { error: 'Name must be between 3 and 255 characters' },
          { status: 400 }
        );
      }

      const project = await projectService.updateProject(projectId, {
        name,
        description,
      });

      return NextResponse.json({ data: project });
    } catch (error) {
      console.error('Update project error:', error);

      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
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

      return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Delete project error:', error);

      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/projects/[id]/members - Get members of a project
   * Access already checked by route wrapper
   */
  async getProjectMembers(request: CustomRequest, projectId: string) {
    try {
      const members = await projectService.getProjectMembers(projectId);

      return NextResponse.json({ data: members });
    } catch (error) {
      console.error('Get project members error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project members' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/projects/[id]/members - Add member to project
   * Permission already checked by route wrapper
   */
  async addProjectMember(request: CustomRequest, projectId: string) {
    try {
      const body = await request.json();
      const { userId: newUserId, email, role } = body;

      // Validation - require either email or userId
      if (!email && !newUserId) {
        return NextResponse.json(
          { error: 'Either email or userId is required' },
          { status: 400 }
        );
      }

      // Validate role if provided, otherwise it will default to TESTER
      if (role) {
        const validRoles: ProjectRole[] = ['OWNER', 'ADMIN', 'TESTER', 'VIEWER'];
        if (!validRoles.includes(role)) {
          return NextResponse.json(
            { error: 'Invalid role. Must be one of: OWNER, ADMIN, TESTER, VIEWER' },
            { status: 400 }
          );
        }
      }

      const member = await projectService.addProjectMember(projectId, {
        userId: newUserId,
        email,
        role,
      });

      return NextResponse.json({ data: member }, { status: 201 });
    } catch (error) {
      console.error('Add project member error:', error);

      if (error instanceof Error && error.message === 'User is already a member of this project') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      if (error instanceof Error && (
        error.message === 'User not found' || 
        error.message === 'User with this email not found'
      )) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to add member to project' },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/projects/[id]/members/[memberId] - Remove member
   * Permission already checked by route wrapper
   */
  async removeProjectMember(request: CustomRequest, projectId: string, memberId: string) {
    try {
      await projectService.removeProjectMember(projectId, memberId);

      return NextResponse.json({ message: 'Member removed successfully' });
    } catch (error) {
      console.error('Remove project member error:', error);

      if (error instanceof Error && error.message === 'Member not found in this project') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      if (error instanceof Error && error.message === 'Cannot remove the last owner of the project') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to remove member from project' },
        { status: 500 }
      );
    }
  }
}

export const projectController = new ProjectController();
