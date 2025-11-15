import { prisma } from '@/lib/prisma';
import { BadRequestException } from '../utils/exceptions';
import { ScopeInfo } from '../utils/interceptor';

export async function checkScopeAccess(
  roleName: string,
  module_name: string,
  action: string
): Promise<ScopeInfo> {
  try {
    // Convert role name to lowercase to match authorization table keywords
    const roleKeyword = roleName.toLowerCase();
    
    const accessScoreNeeded = await prisma.action.findFirst({
      where: {
        keyword: action
      },
      select: {
        score: true
      }
    });

    if (!accessScoreNeeded?.score) {
      return { access: false, scope_name: '' };
    }

    const userScore = await prisma.rolePrivilege.findFirst({
      where: {
        role_name: roleKeyword,
        module_keyword: module_name
      },
      select: {
        scope_keyword: true,
        scope: {
          select: {
            score: true
          }
        },
        action: {
          select: {
            score: true
          }
        }
      }
    });

    if (!userScore?.action.score) {
      return { access: false, scope_name: '' };
    }

    // User's action score must be >= required action score
    // Higher score = more permissions (r:1, w:2, u:3, d:4)
    if (userScore.action.score >= accessScoreNeeded.score) {
      return {
        access: true,
        scope_name: userScore.scope_keyword
      };
    } else {
      return {
        access: false,
        scope_name: ''
      };
    }
  } catch (err: unknown) {
    const error = err as Error;
    throw new BadRequestException(error.message);
  }
}
