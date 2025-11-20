import ProfilePageContent from '../../frontend/components/profile/ProfilePageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your account settings and preferences',
};

const ProfilePage = () => {
  return <ProfilePageContent />;
};

export default ProfilePage;
