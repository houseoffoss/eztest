import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DropdownOptionsManagement from '@/frontend/components/admin/dropdown-options/DropdownOptionsManagement';

export const metadata: Metadata = {
  title: 'Dropdown Options Management',
  description: 'Manage dropdown options for various entities',
};

export default async function DropdownOptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Check if user has permission to manage dropdown options (ADMIN or PROJECT_MANAGER)
  // This corresponds to the 'dropdowns:manage' permission
  const allowedRoles = ['ADMIN', 'PROJECT_MANAGER'];
  if (!allowedRoles.includes(session.user.roleName)) {
    redirect('/projects');
  }

  return <DropdownOptionsManagement />;
}
