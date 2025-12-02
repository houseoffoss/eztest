import { roleService } from '@/backend/services/role/services';
import { CustomRequest } from '@/backend/utils/interceptor';
import { NotFoundException, InternalServerException } from '@/backend/utils/exceptions';
import { AuthorizationMessages } from '@/backend/constants/static_messages';

export class RoleController {
  /**
   * Get all roles
   * Access already checked by route wrapper
   */
  async getAllRoles() {
    try {
      const roles = await roleService.getAllRoles();
      return { data: roles };
    } catch {
      throw new InternalServerException(AuthorizationMessages.FailedToFetchRoles);
    }
  }

  /**
   * Get role by ID
   * Access already checked by route wrapper
   */
  async getRoleById(req: CustomRequest, roleId: string) {
    try {
      const role = await roleService.getRoleById(roleId);
      return { data: role };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(AuthorizationMessages.RoleNotFound);
      }
      throw new InternalServerException(AuthorizationMessages.RoleNotFound);
    }
  }

  /**
   * Get role by name
   * Access already checked by route wrapper
   */
  async getRoleByName(req: CustomRequest, roleName: string) {
    try {
      const role = await roleService.getRoleByName(roleName);
      return { data: role };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(AuthorizationMessages.RoleNotFound);
      }
      throw new InternalServerException(AuthorizationMessages.RoleNotFound);
    }
  }
}

export const roleController = new RoleController();
