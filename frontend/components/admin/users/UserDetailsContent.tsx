'use client';

import { ButtonDestructive } from '@/elements/button-destructive';
import { Badge } from '@/elements/badge';
import { DetailCard } from '@/components/design/DetailCard';
import { formatDateTime } from '@/lib/date-utils';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Mail, Calendar, Briefcase, LogOut } from 'lucide-react';

interface UserRole {
  id: string;
  name: string;
}

interface UserDetailsContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: UserRole;
    createdAt: Date;
    _count: {
      createdProjects: number;
    };
  };
}

export default function UserDetailsContent({ user }: UserDetailsContentProps) {
  const getRoleBadgeColor = (roleName: string) => {
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

  return (
    <>
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs 
              items={[
                { label: 'Admin', href: '/admin' },
                { label: 'Users', href: '/admin/users' },
                { label: user.name },
              ]}
            />
            <form action="/api/auth/signout" method="POST">
              <ButtonDestructive type="submit" size="default" className="px-5">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </ButtonDestructive>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Profile Header Card */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl ring-1 ring-white/5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-5xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
                  <Badge variant="outline" className={`border ${getRoleBadgeColor(user.role.name)} cursor-default`}>
                    <Briefcase className="w-3 h-3 mr-1" />
                    {user.role.name}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDateTime(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{user._count.createdProjects} projects created</span>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <DetailCard
            title="User Information"
            description="Basic user details"
            contentClassName="space-y-4"
            headerClassName=""
          >
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Name</label>
                <p className="text-white font-medium mt-1">{user.name}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Email</label>
                <p className="text-white font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Role</label>
                <p className="text-white font-medium mt-1">{user.role.name}</p>
              </div>
            </div>
          </DetailCard>

          {/* Statistics */}
          <DetailCard
            title="Statistics"
            description="User activity metrics"
            contentClassName="space-y-4"
            headerClassName=""
          >
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Projects Created</label>
                <p className="text-white font-medium mt-1 text-2xl">{user._count.createdProjects}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Member Since</label>
                <p className="text-white font-medium mt-1">{formatDateTime(user.createdAt)}</p>
              </div>
            </div>
          </DetailCard>
        </div>

        {/* Footer */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl ring-1 ring-white/5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} EZTest Admin</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hidden sm:inline">User Details</span>
              <span className="text-primary">v0.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
