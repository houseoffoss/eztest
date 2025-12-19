'use client';

import { useState, useEffect } from 'react';
import { ButtonPrimary } from '@/elements/button-primary';
import { Input } from '@/elements/input';
import { Textarea } from '@/elements/textarea';
import { Label } from '@/elements/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
import { TopBar } from '@/components/design';
import { DetailCard } from '@/components/design/DetailCard';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/design/FloatingAlert';
import { Lock, Mail, Phone, MapPin, User, Save, Key } from 'lucide-react';
import { Loader } from '@/elements/loader';

export default function UserProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setFormData({
        name: data.data.name || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        location: data.data.location || '',
        bio: data.data.bio || '',
      });
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Failed to Load Profile',
        message: err instanceof Error ? err.message : 'Error loading profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setAlert({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
      });
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Failed to Update Profile',
        message: err instanceof Error ? err.message : 'Error updating profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New passwords do not match.',
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/users/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to change password');
      }

      setAlert({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been changed successfully.',
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Failed to Change Password',
        message: err instanceof Error ? err.message : 'Error changing password',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading profile..." />;
  }

  return (
    <>
      {/* Top Bar */}
      <TopBar
        breadcrumbs={[{ label: 'Account Settings' }]}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-white/70">Manage your account information and security</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                      variant="glass"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      variant="glass"
                      className="disabled:opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-white/60">Email cannot be changed. Contact support for assistance.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      variant="glass"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleProfileChange}
                      variant="glass"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleProfileChange}
                    variant="glass"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <ButtonPrimary
                    type="submit"
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </ButtonPrimary>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password & Security */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    variant="glass"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      variant="glass"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      variant="glass"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <ButtonPrimary
                    type="submit"
                    disabled={saving}
                    className="gap-2"
                  >
                    <Key className="w-4 h-4" />
                    {saving ? 'Updating...' : 'Change Password'}
                  </ButtonPrimary>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <DetailCard title="About" className="mt-12" contentClassName="p-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Belsterns Technologies</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="text-primary">v0.1.0</span>
            </div>
          </div>
        </DetailCard>
      </div>

      {/* Alerts */}
      {alert && <FloatingAlert alert={alert} onClose={() => setAlert(null)} />}
    </>
  );
}
