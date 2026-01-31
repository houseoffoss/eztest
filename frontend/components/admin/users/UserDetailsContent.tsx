'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { formatDateTime } from '@/lib/date-utils';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { Mail, Calendar, Briefcase, LogOut } from 'lucide-react';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

interface UserRole {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    createdProjects: number;
  };
}

interface UserDetailsContentProps {
  userId: string;
}

export default function UserDetailsContent({ userId }: UserDetailsContentProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (response.ok && data.data) {
        setUser(data.data);
      } else {
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return <Loader fullScreen text="Loading user details..." />;
  }

  if (!user) {
    return null;
  }
  const handleSignOut = () => {
    // Clear all persisted form data before signing out
    clearAllPersistedForms();
    // Clear project context from session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lastProjectId');
      // Clear any other project-related session data
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('defects-filters-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    // Let the form submit naturally to /api/auth/signout
  };

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
            <form action="/api/auth/signout" method="POST" onSubmit={handleSignOut}>
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
        <DetailCard 
          title="Profile" 
          description="User account overview"
          className="mb-8"
          contentClassName="p-0"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
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
        </DetailCard>

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
              {user.phone && (
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">Phone</label>
                  <p className="text-white font-medium mt-1">{user.phone}</p>
                </div>
              )}
              {user.location && (
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">Location</label>
                  <p className="text-white font-medium mt-1">{user.location}</p>
                </div>
              )}
              {user.bio && (
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">Bio</label>
                  <p className="text-white font-medium mt-1">{user.bio}</p>
                </div>
              )}
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
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Last Updated</label>
                <p className="text-white font-medium mt-1">{formatDateTime(user.updatedAt)}</p>
              </div>
            </div>
          </DetailCard>
        </div>

        {/* Footer */}
        <DetailCard title="About" className="mt-12" contentClassName="p-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} EZTest Admin</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hidden sm:inline">User Details</span>
              <span className="text-primary">v0.1.0</span>
            </div>
          </div>
        </DetailCard>
      </div>
    </>
  );
}
