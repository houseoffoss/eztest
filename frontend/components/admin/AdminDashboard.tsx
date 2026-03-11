'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { ItemCard } from '@/frontend/reusable-components/cards/ItemCard';
import { Users, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const navbarActions = useMemo(() => [
    {
      type: 'signout' as const,
      showConfirmation: true,
    },
  ], []);

  return (
    <div className="flex-1">
      {/* Navbar */}
      <Navbar
        brandLabel={null}
        items={[]}
        actions={navbarActions}
      />

      {/* Content */}
      <div className="px-8 pt-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <PageHeaderWithBadge
            title="管理ダッシュボード"
            description="アプリケーションのユーザーとアクセス制御を管理"
            className="mb-6"
          />

          <ResponsiveGrid columns={{ default: 1, md: 2, lg: 3 }} gap="md">
            {/* User Management */}
            <ItemCard
              title="ユーザー管理"
              description="アプリケーションのユーザーを追加・編集・管理"
              badges={
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              }
              content={
                <p className="text-sm text-white/60">
                  ユーザーアカウントを管理し、アプリケーションレベルのロールを割り当て
                </p>
              }
              borderColor="primary"
              onClick={() => router.push('/admin/users')}
              className="hover:shadow-xl hover:shadow-primary/10 transition-all"
            />

            {/* Dropdown Options Management */}
            <ItemCard
              title="ドロップダウンオプション"
              description="各種エンティティのドロップダウンオプションを管理"
              badges={
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
              }
              content={
                <p className="text-sm text-white/60">
                  優先度、ステータスなどのドロップダウンオプションを設定
                </p>
              }
              borderColor="primary"
              onClick={() => router.push('/admin/dropdown-options')}
              className="hover:shadow-xl hover:shadow-primary/10 transition-all"
            />
          </ResponsiveGrid>
        </div>
      </div>
    </div>
  );
}
