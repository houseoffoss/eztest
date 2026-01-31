'use client';

import * as React from 'react';
import Link from 'next/link';
import { Avatar } from '@/frontend/reusable-elements/avatars/Avatar';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { Mail, Calendar, Briefcase, Edit, Trash2, Eye } from 'lucide-react';
import { formatDateTime } from '@/lib/date-utils';

export interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: {
      name: string;
    };
    createdAt: string;
    _count?: {
      createdProjects?: number;
    };
  };
  onEdit?: () => void;
  onDelete?: () => void;
  viewHref?: string;
  showProjects?: boolean;
  getRoleBadgeColor?: (roleName: string) => string;
  getRoleIcon?: (roleName: string) => React.ReactNode;
}

/**
 * Reusable UserCard component for displaying user information in a consistent card format
 * Used in: UserManagement, ProjectMembers, and similar pages
 * 
 * @example
 * ```tsx
 * <UserCard
 *   user={user}
 *   onEdit={() => handleEdit(user)}
 *   onDelete={() => handleDelete(user)}
 *   viewHref={`/admin/users/${user.id}`}
 *   showProjects={true}
 * />
 * ```
 */
export function UserCard({
  user,
  onEdit,
  onDelete,
  viewHref,
  showProjects = true,
  getRoleBadgeColor,
  getRoleIcon,
}: UserCardProps) {
  const defaultBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PROJECT_MANAGER':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'TESTER':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'VIEWER':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  const badgeColor = getRoleBadgeColor ? getRoleBadgeColor(user.role.name) : defaultBadgeColor(user.role.name);
  const roleIcon = getRoleIcon ? getRoleIcon(user.role.name) : null;

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <Avatar className="w-12 h-12">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
              {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
            </div>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-medium">{user.name}</h3>
            <Badge
              variant="outline"
              className={`gap-1 ${badgeColor}`}
            >
              {roleIcon}
              {user.role.name}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </div>
            {showProjects && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {user._count?.createdProjects || 0} projects
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {formatDateTime(user.createdAt)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {viewHref && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full border border-primary/30 text-primary hover:text-primary/80 hover:bg-primary/10"
            title="View details"
          >
            <Link href={viewHref}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="rounded-full border border-blue-400/30 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="rounded-full border border-red-400/30 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default UserCard;

