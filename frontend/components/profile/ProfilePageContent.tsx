'use client';

import { useState } from 'react';
import { DetailCard } from '@/components/design';
import { TopBar } from '@/components/design';
import {
  ProfileInformation,
  NotificationPreferences,
  SecuritySettings,
  SessionManagement,
} from './subcomponents';

export default function ProfilePageContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Test automation enthusiast | QA Engineer',
    phone: '+1 (555) 123-4567',
    role: 'Admin',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    testRunUpdates: true,
    weeklyDigest: true,
    projectInvites: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: 30,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value,
    });
  };

  const handleSecurityChange = (key: string, value: boolean | number) => {
    setSecuritySettings({
      ...securitySettings,
      [key]: value,
    });
  };

  return (
    <>
      {/* Top Bar */}
      <TopBar
        breadcrumbs={[
          { label: 'Account Settings' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="space-y-6">
          <ProfileInformation
            profileData={profileData}
            isEditing={isEditing}
            onEdit={setIsEditing}
            onProfileChange={handleProfileChange}
          />

          <NotificationPreferences
            settings={notificationSettings}
            onSettingChange={handleNotificationChange}
          />

          <SecuritySettings
            settings={securitySettings}
            onSettingChange={handleSecurityChange}
          />

          <SessionManagement />
        </div>

        {/* Footer */}
        <DetailCard title="About" className="mt-12" contentClassName="p-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} EZTest Account Settings</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Glass theme active</span>
              <span className="text-primary">v0.1.0</span>
            </div>
          </div>
        </DetailCard>
      </div>
    </>
  );
}
