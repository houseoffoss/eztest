import { z } from 'zod';

/**
 * Update User Schema (Admin)
 */
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters').trim().optional(),
  email: z.string().email('Invalid email format').optional(),
  roleId: z.string().min(1, 'Role ID is required').optional(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});
