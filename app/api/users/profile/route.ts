import { userController } from "@/backend/controllers/user/controller";
import { hasPermission } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/apiKeyAuth";
import {
  CustomRequest,
  UserInfo,
  ScopeInfo,
} from "@/backend/utils/interceptor";

/**
 * GET /api/users/profile
 * Get current user's profile
 */
export const GET = hasPermission(
  async (request) => {
    return userController.getUserProfile(request);
  },
  "users",
  "read",
);

/**
 * PUT /api/users/profile
 * Update current user's profile
 * All authenticated users can update their own profile (no permission check needed)
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate without permission check
    const authenticatedUser = await authenticateRequest(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Attach user info to request
    const customRequest = request as CustomRequest;
    customRequest.userInfo = {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      role: authenticatedUser.role.name,
    } as UserInfo;

    customRequest.scopeInfo = {
      access: true,
      scope_name: authenticatedUser.role.name === "ADMIN" ? "all" : "project",
    } as ScopeInfo;

    const result = await userController.updateUserProfile(customRequest);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const error = err as {
      message?: string;
      statusCode?: number;
      data?: unknown;
    };
    console.error("Error:", err);

    if (error.statusCode === 422) {
      return NextResponse.json(
        { message: error.message, data: error.data },
        { status: error.statusCode },
      );
    } else if (error.statusCode) {
      return NextResponse.json(
        { message: error.message, data: error.data || null },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
