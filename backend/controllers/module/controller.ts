import { moduleService } from '@/backend/services/module/services';
import { CustomRequest } from '@/backend/utils/interceptor';
import { NotFoundException, InternalServerException, ValidationException } from '@/backend/utils/exceptions';
import { createModuleSchema, updateModuleSchema, reorderModulesSchema } from '@/backend/validators';
import { ModuleMessages } from '@/backend/constants/static_messages';

export class ModuleController {
  /**
   * Get all modules for a project
   * Access already checked by route wrapper
   */
  async getProjectModules(req: CustomRequest, projectId: string) {
    try {
      const modules = await moduleService.getProjectModules(projectId);
      return { data: modules };
    } catch {
      throw new InternalServerException(ModuleMessages.FailedToFetchModules);
    }
  }

  /**
   * Get module by ID
   * Access already checked by route wrapper
   */
  async getModuleById(req: CustomRequest, projectId: string, moduleId: string) {
    try {
      const mod = await moduleService.getModuleById(moduleId, projectId);
      return { data: mod };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(ModuleMessages.ModuleNotFound);
      }
      throw new InternalServerException(ModuleMessages.FailedToFetchModules);
    }
  }

  /**
   * Create a new module
   * Access already checked by route wrapper
   */
  async createModule(req: CustomRequest, projectId: string) {
    const body = await req.json();

    // Validation with Zod
    const validationResult = createModuleSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    try {
      const mod = await moduleService.createModule({
        projectId,
        name: validationResult.data.name,
        description: validationResult.data.description,
        order: validationResult.data.order,
      });

      return { data: mod, statusCode: 201 };
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new ValidationException(ModuleMessages.ModuleNameAlreadyExists, []);
      }
      throw new InternalServerException(ModuleMessages.FailedToCreateModule);
    }
  }

  /**
   * Update module
   * Access already checked by route wrapper
   */
  async updateModule(req: CustomRequest, projectId: string, moduleId: string) {
    const body = await req.json();

    // Validation with Zod
    const validationResult = updateModuleSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    try {
      const mod = await moduleService.updateModule(moduleId, projectId, validationResult.data);
      return { data: mod };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(ModuleMessages.ModuleNotFound);
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        throw new ValidationException(ModuleMessages.ModuleNameAlreadyExists, []);
      }
      throw new InternalServerException(ModuleMessages.FailedToUpdateModule);
    }
  }

  /**
   * Delete module
   * Access already checked by route wrapper
   */
  async deleteModule(req: CustomRequest, projectId: string, moduleId: string) {
    try {
      await moduleService.deleteModule(moduleId, projectId);
      return { message: ModuleMessages.ModuleDeletedSuccessfully };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(ModuleMessages.ModuleNotFound);
      }
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        throw new ValidationException(ModuleMessages.CannotDeleteModuleWithTestCases, []);
      }
      throw new InternalServerException(ModuleMessages.FailedToDeleteModule);
    }
  }

  /**
   * Reorder modules
   * Access already checked by route wrapper
   */
  async reorderModules(req: CustomRequest, projectId: string) {
    const body = await req.json();

    // Validation with Zod
    const validationResult = reorderModulesSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    try {
      const modules = await moduleService.reorderModules(projectId, validationResult.data.modules);
      return { data: modules };
    } catch {
      throw new InternalServerException(ModuleMessages.FailedToUpdateModule);
    }
  }
}

export const moduleController = new ModuleController();
