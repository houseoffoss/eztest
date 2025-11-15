import { auth } from "../auth";
import { prisma } from "../prisma";

/**
 * Fetches the current session user with their role and privileges (RBAC).
 */
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  // Fetch user and join the Role model by matching User.role (enum) to Role.keyword
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return null;

  // Fetch the role and privileges
  const roleObj = await prisma.role.findUnique({
    where: { keyword: user.role },
    include: { privileges: true },
  });

  return {
    ...user,
    roleEnum: user.role, // UserRole enum value
    roleObj, // Full role object with privileges
  };
}
