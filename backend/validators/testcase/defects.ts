import { z } from 'zod';

// Schema for linking defects to test case
export const linkDefectsSchema = z.object({
  defectIds: z.array(z.string()).min(1, 'At least one defect ID is required'),
});
