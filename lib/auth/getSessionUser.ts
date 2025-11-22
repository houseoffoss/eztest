import { auth } from "../auth";
import { prisma } from "../prisma";

/**
 * Fetches the current session user with their role and permissions (RBAC).
 * Returns the user with their role object containing all permissions.
 * Returns null if user is deleted or role is invalid.
 */
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  // Fetch user with their role and permissions
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  // Check if user exists and is not deleted
  if (!user || user.deletedAt) {
    return null;
  }

  return user;
}
