'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/elements/button';
import { GlassPanel } from '@/components/design/GlassPanel';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/elements/dialog';
import { Loader } from '@/elements/loader';
import { SettingsSidebar } from '@/components/layout/SettingsSidebar';

interface AccountStatus {
  isMarkedForDeletion: boolean;
  markedAt: string | null;
  permanentDeleteDate: string | null;
}

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export default function AccountSettingsPage() {
  useEffect(() => {
    document.title = 'Account Settings | EZTest';
  }, []);

  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch user info and account status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, accountResponse] = await Promise.all([
          fetch('/api/users/profile'),
          fetch('/api/users/account'),
        ]);

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user info');
        }
        if (!accountResponse.ok) {
          throw new Error('Failed to fetch account status');
        }

        const userData = await userResponse.json();
        const accountData = await accountResponse.json();

        setUserInfo(userData.data);
        setAccountStatus(accountData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading account settings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      setError('New password must be different from current password');
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setChangePasswordForm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setError('Please enter your password to confirm account deletion');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/users/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

  await response.json(); // response consumed; no variable needed
      setSuccess('Account deletion initiated. Redirecting to login...');
      setPassword('');
      setShowDeleteDialog(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting account');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading account settings..." />;
  }

  return (
    <div className="min-h-screen flex">
      <SettingsSidebar />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Account & Security</h1>
          <p className="text-muted-foreground">Manage password, security settings, and account deletion</p>
        </div>

        {/* User Info Display */}
        {userInfo && (
          <div className="mb-8 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Logged in as</p>
                <h2 className="text-2xl font-bold text-foreground">{userInfo.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{userInfo.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <p className="text-lg font-semibold text-primary">{userInfo.role}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-md border border-red-500/40 bg-red-500/10">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-md border border-green-500/40 bg-green-500/10">
            <p className="text-green-300">{success}</p>
          </div>
        )}

        {/* Change Password Section */}
        <GlassPanel className="mb-6" contentClassName="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Password</h2>
                <p className="text-muted-foreground text-sm mt-1">Change your password to keep your account secure</p>
              </div>
            </div>

            {changePasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter your current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="rounded-lg p-3 text-sm border border-primary/30 bg-primary/5">
                  <p className="font-medium mb-2 text-foreground">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>At least 8 characters long</li>
                    <li>Must be different from current password</li>
                    <li>Must match in both new password fields</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={changingPassword}
                    variant="glass-primary"
                    className="flex-1 rounded-[10px]"
                  >
                    {changingPassword ? 'Changing Password...' : 'Change Password'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setChangePasswordForm(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    variant="glass"
                    className="flex-1 rounded-[10px]"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => setChangePasswordForm(true)}
                variant="glass-primary"
                className="rounded-[10px]"
              >
                Change Password
              </Button>
            )}
        </GlassPanel>

        {/* Account Deletion Section */}
  <GlassPanel className="border-red-500/30" contentClassName="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Delete Account</h2>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and all associated data
              </p>
            </div>

            {accountStatus?.isMarkedForDeletion ? (
              <div className="rounded-lg p-4 mb-6 border border-yellow-500/40 bg-yellow-500/10">
                <h3 className="font-medium text-yellow-200 mb-2">Account Marked for Deletion</h3>
                <p className="text-yellow-200/90 text-sm mb-2">
                  Your account is scheduled for permanent deletion on{' '}
                  <strong>
                    {new Date(accountStatus.permanentDeleteDate!).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </strong>
                </p>
                <p className="text-yellow-200/90 text-sm">
                  You have until then to{' '}
                  <button className="font-medium underline underline-offset-2">
                    contact support to restore your account
                  </button>
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg p-4 mb-6 border border-red-500/40 bg-red-500/10">
                  <h4 className="font-medium text-red-200 mb-2">⚠️ Important Information</h4>
                  <ul className="text-red-200/90 text-sm space-y-2 list-disc list-inside">
                    <li>Your account will be marked for deletion immediately</li>
                    <li>You will have 30 days to restore your account</li>
                    <li>After 30 days, all your data will be permanently deleted</li>
                    <li>This action cannot be undone after the 30-day period expires</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="glass-destructive"
                  className="rounded-[10px]"
                >
                  Delete My Account
                </Button>
              </>
            )}
        </GlassPanel>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/settings/profile" className="text-primary hover:text-primary/90 font-medium">
            Back to Profile Settings
          </Link>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Account?</DialogTitle>
            <DialogDescription>
              This action will mark your account for deletion. You&apos;ll have 30 days to restore it before permanent deletion.
            </DialogDescription>
          </DialogHeader>

          {/* Password Confirmation */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password.trim()) {
                    handleDeleteAccount();
                  }
                }}
              />
            </div>

            <div className="rounded-lg p-3 text-sm border border-red-500/40 bg-red-500/10 text-red-200">
              Your account will be permanently deleted in 30 days. You won&apos;t be able to log in during this period.
            </div>
          </div>

          <DialogFooter className="justify-end pt-4">
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setPassword('');
                  setError(null);
                }}
                variant="glass"
                className="rounded-[10px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting || !password.trim()}
                variant="glass-destructive"
                className="rounded-[10px]"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
