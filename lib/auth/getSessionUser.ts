import { auth } from "../auth";
import { prisma } from "../prisma";

/**
 * Fetches the current session user with their role and permissions (RBAC).
 * Returns the user with their role object containing all permissions.
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

  return user;
}
