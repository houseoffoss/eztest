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

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function AccountSettingsPage() {
  useEffect(() => {
    document.title = 'アカウント設定 | EZTest';
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
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyExpiresInDays, setNewApiKeyExpiresInDays] = useState<number | undefined>(undefined);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Fetch user info and account status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, accountResponse] = await Promise.all([
          fetch('/api/users/profile'),
          fetch('/api/users/account'),
        ]);

        if (!userResponse.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        if (!accountResponse.ok) {
          throw new Error('アカウント状態の取得に失敗しました');
        }

        const userData = await userResponse.json();
        const accountData = await accountResponse.json();

        setUserInfo(userData.data);
        setAccountStatus(accountData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'アカウント設定の読み込み中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const response = await fetch('/api/apikeys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data || []);
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatingKey(true);

    try {
      let expiresAt: string | null = null;
      if (newApiKeyExpiresInDays && newApiKeyExpiresInDays > 0) {
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + newApiKeyExpiresInDays);
        expiresAt = expiresDate.toISOString();
      }

      const response = await fetch('/api/apikeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newApiKeyName,
          expiresAt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'APIキーの作成に失敗しました');
      }

      const data = await response.json();
      // /api/apikeys returns { key, apiKey }
      setNewKey(data.key);
      setNewApiKeyName('');
      setNewApiKeyExpiresInDays(undefined);
      setShowNewKeyDialog(false);
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'APIキー作成中にエラーが発生しました');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (apiKeyId: string) => {
    if (!confirm('このAPIキーを取り消してもよろしいですか？この操作は元に戻せません。')) {
      return;
    }

    try {
      const response = await fetch(`/api/apikeys/${apiKeyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'APIキーの取り消しに失敗しました');
      }

      setSuccess('APIキーが正常に取り消されました');
      await fetchApiKeys();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'APIキーの取り消し中にエラーが発生しました');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('APIキーをクリップボードにコピーしました');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('新しいパスワードは8文字以上である必要があります');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      setError('新しいパスワードは現在のパスワードと異なる必要があります');
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
        throw new Error(errorData.error || 'パスワードの変更に失敗しました');
      }

      setSuccess('パスワードが正常に変更されました');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setChangePasswordForm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワード変更中にエラーが発生しました');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setError('アカウント削除を確認するためにパスワードを入力してください');
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
        throw new Error(errorData.error || 'アカウントの削除に失敗しました');
      }

  await response.json(); // response consumed; no variable needed
      setSuccess('アカウント削除を開始しました。ログインページにリダイレクトします...');
      setPassword('');
      setShowDeleteDialog(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アカウント削除中にエラーが発生しました');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="アカウント設定を読み込み中..." />;
  }

  return (
    <div className="min-h-screen flex">
      <SettingsSidebar />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">アカウントとセキュリティ</h1>
          <p className="text-muted-foreground">パスワード、セキュリティ設定、アカウント削除を管理</p>
        </div>

        {/* User Info Display */}
        {userInfo && (
          <div className="mb-8 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">ログイン中のユーザー</p>
                <h2 className="text-2xl font-bold text-foreground">{userInfo.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{userInfo.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">ロール</p>
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
                APIキー
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                EZTestへのプログラマティックアクセス用のAPIキーを管理
              </p>
            </div>
            <ButtonPrimary
              onClick={() => {
                setShowNewKeyDialog(true);
                setNewKey(null);
                setShowKey(false);
              }}
              className="rounded-[10px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              APIキーを作成
            </ButtonPrimary>
          </div>

          {loadingKeys ? (
            <p className="text-muted-foreground text-sm">APIキーを読み込み中...</p>
          ) : apiKeys.length === 0 ? (
            <div className="rounded-lg p-4 border border-primary/30 bg-primary/5">
              <p className="text-muted-foreground text-sm">
                まだAPIキーが作成されていません。作成してください。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{apiKey.name}</h3>
                      {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                          期限切れ
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {apiKey.keyPrefix}...
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        作成日: {new Date(apiKey.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                      {apiKey.lastUsedAt && (
                        <span>
                          最終使用: {new Date(apiKey.lastUsedAt).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                      {apiKey.expiresAt && (
                        <span>
                          有効期限: {new Date(apiKey.expiresAt).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ButtonDestructive
                    onClick={() => handleRevokeApiKey(apiKey.id)}
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
                <h2 className="text-2xl font-bold text-foreground">パスワード</h2>
                <p className="text-muted-foreground text-sm mt-1">アカウントを安全に保つためにパスワードを変更</p>
              </div>
            </div>

            {changePasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    現在のパスワード
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
                    placeholder="現在のパスワードを入力"
                  />
                </div>

                {/* New Password */}
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    新しいパスワード
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
                    placeholder="新しいパスワードを入力（最小8文字）"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <Label className="block text-sm font-medium text-muted-foreground mb-2">
                    新しいパスワード（確認）
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
                    placeholder="新しいパスワードを再入力"
                  />
                </div>

                <div className="rounded-lg p-3 text-sm border border-primary/30 bg-primary/5">
                  <p className="font-medium mb-2 text-foreground">パスワードの要件:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>8文字以上</li>
                    <li>現在のパスワードと異なること</li>
                    <li>確認用パスワードと一致すること</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <ButtonPrimary
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 rounded-[10px]"
                  >
                    {changingPassword ? 'パスワードを変更中...' : 'パスワードを変更'}
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
                    キャンセル
                  </Button>
                </div>
              </form>
            ) : (
              <ButtonPrimary
                onClick={() => setChangePasswordForm(true)}
                className="rounded-[10px]"
              >
                パスワードを変更
              </ButtonPrimary>
            )}
        </GlassPanel>

        {/* Account Deletion Section */}
  <GlassPanel className="border-red-500/30" contentClassName="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">アカウントの削除</h2>
              <p className="text-muted-foreground text-sm">
                アカウントと関連するすべてのデータを完全に削除
              </p>
            </div>

            {accountStatus?.isMarkedForDeletion ? (
              <div className="rounded-lg p-4 mb-6 border border-yellow-500/40 bg-yellow-500/10">
                <h3 className="font-medium text-yellow-200 mb-2">アカウントは削除予定です</h3>
                <p className="text-yellow-200/90 text-sm mb-2">
                  アカウントは{' '}
                  <strong>
                    {new Date(accountStatus.permanentDeleteDate!).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </strong>
                  {' '}に完全に削除される予定です
                </p>
                <p className="text-yellow-200/90 text-sm">
                  それまでに{' '}
                  <button className="font-medium underline underline-offset-2">
                    サポートに連絡してアカウントを復元
                  </button>
                  できます
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg p-4 mb-6 border border-red-500/40 bg-red-500/10">
                  <h4 className="font-medium text-red-200 mb-2">⚠️ 重要な情報</h4>
                  <ul className="text-red-200/90 text-sm space-y-2 list-disc list-inside">
                    <li>アカウントは即座に削除予定としてマークされます</li>
                    <li>30日以内であればアカウントを復元できます</li>
                    <li>30日後、すべてのデータが完全に削除されます</li>
                    <li>30日経過後、この操作は元に戻せません</li>
                  </ul>
                </div>

                <ButtonDestructive
                  onClick={() => setShowDeleteDialog(true)}
                  className="rounded-[10px]"
                >
                  アカウントを削除
                </ButtonDestructive>
              </>
            )}
        </GlassPanel>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/settings/profile" className="text-primary hover:text-primary/90 font-medium">
            プロフィール設定に戻る
          </Link>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>アカウントを削除しますか？</DialogTitle>
            <DialogDescription>
              この操作により、アカウントが削除予定としてマークされます。完全削除まで30日以内であれば復元できます。
            </DialogDescription>
          </DialogHeader>

          {/* Password Confirmation */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                確認のためパスワードを入力してください
              </label>
              <input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password.trim()) {
                    handleDeleteAccount();
                  }
                }}
              />
            </div>

            <div className="rounded-lg p-3 text-sm border border-red-500/40 bg-red-500/10 text-red-200">
              アカウントは30日後に完全に削除されます。この期間中はログインできません。
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
                キャンセル
              </Button>
              <ButtonDestructive
                onClick={handleDeleteAccount}
                disabled={deleting || !password.trim()}
                className="rounded-[10px]"
              >
                {deleting ? '削除中...' : 'アカウントを削除'}
              </ButtonDestructive>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create API Token Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>APIキーを作成</DialogTitle>
            <DialogDescription>
              {newKey
                ? 'APIキーを今すぐコピーしてください。二度と表示されません！'
                : 'EZTestへのプログラマティックアクセス用の新しいAPIキーを作成'}
            </DialogDescription>
          </DialogHeader>

          {newKey ? (
            <div className="space-y-4">
              <div className="rounded-lg p-4 border border-yellow-500/40 bg-yellow-500/10">
                <p className="text-sm text-yellow-200 mb-2 font-medium">
                  ⚠️ 重要: APIキーを今すぐコピーしてください
                </p>
                <p className="text-xs text-yellow-200/90">
                  これが完全なAPIキーを表示できる唯一の機会です。必ず安全に保存してください。
                </p>
              </div>

              <div className="space-y-2">
                <Label>あなたのAPIキー</Label>
                <div className="flex gap-2">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={newKey}
                    readOnly
                    variant="glass"
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    variant="glass"
                    className="rounded-[10px] cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => copyToClipboard(newKey)}
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
                    setShowNewKeyDialog(false);
                    setNewKey(null);
                    setShowKey(false);
                  }}
                  className="flex-1 rounded-[10px]"
                >
                  完了
                </ButtonPrimary>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateApiKey} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  APIキー名
                </Label>
                <Input
                  variant="glass"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  required
                  placeholder="例: CI/CDパイプライン、ローカル開発"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  用途を識別できる説明的な名前を付けてください
                </p>
              </div>

              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  有効期限（オプション）
                </Label>
                <Input
                  type="number"
                  variant="glass"
                  value={newApiKeyExpiresInDays || ''}
                  onChange={(e) =>
                    setNewApiKeyExpiresInDays(
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                  placeholder="日数（空欄の場合は無期限）"
                  min={1}
                  max={3650}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  指定した日数後にキーが期限切れになります（最大3650日 / 10年）
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <ButtonPrimary
                  type="submit"
                  disabled={creatingKey || !newApiKeyName.trim()}
                  className="flex-1 rounded-[10px]"
                >
                  {creatingKey ? '作成中...' : 'APIキーを作成'}
                </ButtonPrimary>
                <Button
                  type="button"
                  onClick={() => {
                    setShowNewKeyDialog(false);
                    setNewApiKeyName('');
                    setNewApiKeyExpiresInDays(undefined);
                  }}
                  variant="glass"
                  className="flex-1 rounded-[10px] cursor-pointer"
                >
                  キャンセル
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
