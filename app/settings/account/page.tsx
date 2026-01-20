'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Alert, AlertDescription } from '@/frontend/reusable-elements/alerts/Alert';
import { GlassPanel } from '@/frontend/reusable-components/layout/GlassPanel';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/frontend/reusable-elements/dialogs/Dialog';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { SettingsSidebar } from '@/app/components/layout/SettingsSidebar';
import { Key, Copy, Trash2, Eye, EyeOff, Plus } from 'lucide-react';

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

interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
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
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [showNewTokenDialog, setShowNewTokenDialog] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenExpiresInDays, setNewTokenExpiresInDays] = useState<number | undefined>(undefined);
  const [creatingToken, setCreatingToken] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

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
    fetchApiTokens();
  }, []);

  const fetchApiTokens = async () => {
    setLoadingTokens(true);
    try {
      const response = await fetch('/api/users/api-tokens');
      if (response.ok) {
        const data = await response.json();
        setApiTokens(data || []);
      }
    } catch (err) {
      console.error('Error fetching API tokens:', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatingToken(true);

    try {
      const response = await fetch('/api/users/api-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTokenName,
          expiresInDays: newTokenExpiresInDays || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API token');
      }

      const data = await response.json();
      setNewToken(data.token);
      setNewTokenName('');
      setNewTokenExpiresInDays(undefined);
      setShowNewTokenDialog(false);
      await fetchApiTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating API token');
    } finally {
      setCreatingToken(false);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this API token? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/api-tokens/${tokenId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke API token');
      }

      setSuccess('API token revoked successfully');
      await fetchApiTokens();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error revoking API token');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Token copied to clipboard');
    setTimeout(() => setSuccess(null), 2000);
  };

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
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500/40 bg-green-500/10">
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {/* API Tokens Section */}
        <GlassPanel className="mb-6" contentClassName="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Key className="w-6 h-6" />
                API Tokens
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Manage API tokens for programmatic access to EZTest
              </p>
            </div>
            <ButtonPrimary
              onClick={() => {
                setShowNewTokenDialog(true);
                setNewToken(null);
                setShowToken(false);
              }}
              className="rounded-[10px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Token
            </ButtonPrimary>
          </div>

          {loadingTokens ? (
            <p className="text-muted-foreground text-sm">Loading tokens...</p>
          ) : apiTokens.length === 0 ? (
            <div className="rounded-lg p-4 border border-primary/30 bg-primary/5">
              <p className="text-muted-foreground text-sm">
                No API tokens created yet. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiTokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{token.name}</h3>
                      {token.expiresAt && new Date(token.expiresAt) < new Date() && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {token.tokenPrefix}...
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        Created: {new Date(token.createdAt).toLocaleDateString()}
                      </span>
                      {token.lastUsedAt && (
                        <span>
                          Last used: {new Date(token.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                      {token.expiresAt && (
                        <span>
                          Expires: {new Date(token.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <ButtonDestructive
                    onClick={() => handleRevokeToken(token.id)}
                    className="rounded-[10px]"
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4" />
                  </ButtonDestructive>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

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
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    Current Password
                  </Label>
                  <Input
                    type="password"
                    variant="glass"
                    value={passwordData.currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter your current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    New Password
                  </Label>
                  <Input
                    type="password"
                    variant="glass"
                    value={passwordData.newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    variant="glass"
                    value={passwordData.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
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
                  <ButtonPrimary
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 rounded-[10px]"
                  >
                    {changingPassword ? 'Changing Password...' : 'Change Password'}
                  </ButtonPrimary>
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
                    className="flex-1 rounded-[10px] cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <ButtonPrimary
                onClick={() => setChangePasswordForm(true)}
                className="rounded-[10px]"
              >
                Change Password
              </ButtonPrimary>
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

                <ButtonDestructive
                  onClick={() => setShowDeleteDialog(true)}
                  className="rounded-[10px]"
                >
                  Delete My Account
                </ButtonDestructive>
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
                className="rounded-[10px] cursor-pointer"
              >
                Cancel
              </Button>
              <ButtonDestructive
                onClick={handleDeleteAccount}
                disabled={deleting || !password.trim()}
                className="rounded-[10px]"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </ButtonDestructive>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create API Token Dialog */}
      <Dialog open={showNewTokenDialog} onOpenChange={setShowNewTokenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Token</DialogTitle>
            <DialogDescription>
              {newToken
                ? 'Copy your token now. You won\'t be able to see it again!'
                : 'Create a new API token for programmatic access to EZTest'}
            </DialogDescription>
          </DialogHeader>

          {newToken ? (
            <div className="space-y-4">
              <div className="rounded-lg p-4 border border-yellow-500/40 bg-yellow-500/10">
                <p className="text-sm text-yellow-200 mb-2 font-medium">
                  ⚠️ Important: Copy this token now
                </p>
                <p className="text-xs text-yellow-200/90">
                  This is the only time you'll be able to see the full token. Make sure to store it securely.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Your API Token</Label>
                <div className="flex gap-2">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    value={newToken}
                    readOnly
                    variant="glass"
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    variant="glass"
                    className="rounded-[10px] cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => copyToClipboard(newToken)}
                    variant="glass"
                    className="rounded-[10px] cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <ButtonPrimary
                  onClick={() => {
                    setShowNewTokenDialog(false);
                    setNewToken(null);
                    setShowToken(false);
                  }}
                  className="flex-1 rounded-[10px]"
                >
                  Done
                </ButtonPrimary>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateToken} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  Token Name
                </Label>
                <Input
                  variant="glass"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  required
                  placeholder="e.g., CI/CD Pipeline, Local Development"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Give your token a descriptive name to identify its purpose
                </p>
              </div>

              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  Expiration (Optional)
                </Label>
                <Input
                  type="number"
                  variant="glass"
                  value={newTokenExpiresInDays || ''}
                  onChange={(e) =>
                    setNewTokenExpiresInDays(
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                  placeholder="Days (leave empty for no expiration)"
                  min={1}
                  max={3650}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Token will expire after this many days (max 3650 days / 10 years)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <ButtonPrimary
                  type="submit"
                  disabled={creatingToken || !newTokenName.trim()}
                  className="flex-1 rounded-[10px]"
                >
                  {creatingToken ? 'Creating...' : 'Create Token'}
                </ButtonPrimary>
                <Button
                  type="button"
                  onClick={() => {
                    setShowNewTokenDialog(false);
                    setNewTokenName('');
                    setNewTokenExpiresInDays(undefined);
                  }}
                  variant="glass"
                  className="flex-1 rounded-[10px] cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
