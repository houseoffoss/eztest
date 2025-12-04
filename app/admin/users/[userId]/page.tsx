'use client';

import { useParams } from 'next/navigation';
import UserDetailsContent from '../../../../frontend/components/admin/users/UserDetailsContent';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const userId = params.userId as string;

  return <UserDetailsContent userId={userId} />;
}
