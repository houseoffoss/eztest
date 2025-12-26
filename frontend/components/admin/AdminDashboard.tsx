'use client';

import { useRouter } from 'next/navigation';
import { TopBar } from '@/frontend/reusable-components/layout/TopBar';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { ItemCard } from '@/frontend/reusable-components/cards/ItemCard';
import { Users, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="flex-1">
      {/* Top Bar */}
      <TopBar
        breadcrumbs={[
          { label: 'Admin' },
        ]}
      />

      {/* Content */}
      <div className="px-8 pt-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <PageHeaderWithBadge
            title="Admin Dashboard"
            description="Manage application users and access control"
            className="mb-6"
          />

          <ResponsiveGrid columns={{ default: 1, md: 2, lg: 3 }} gap="md">
            {/* User Management */}
            <ItemCard
              title="User Management"
              description="Add, edit, and manage application users"
              badges={
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              }
              content={
                <p className="text-sm text-white/60">
                  Manage user accounts and assign application-level roles
                </p>
              }
              borderColor="accent"
              onClick={() => router.push('/admin/users')}
              className="hover:shadow-xl hover:shadow-primary/10 transition-all"
            />

            {/* Dropdown Options Management */}
            <ItemCard
              title="Dropdown Options"
              description="Manage dropdown options for various entities"
              badges={
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
              }
              content={
                <p className="text-sm text-white/60">
                  Configure dropdown options for priorities, statuses, and more
                </p>
              }
              borderColor="accent"
              onClick={() => router.push('/admin/dropdown-options')}
              className="hover:shadow-xl hover:shadow-primary/10 transition-all"
            />
          </ResponsiveGrid>
        </div>
      </div>
    </div>
  );
}
