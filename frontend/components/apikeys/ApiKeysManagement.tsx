'use client';

import { useState, useEffect } from 'react';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Alert, AlertDescription } from '@/frontend/reusable-elements/alerts/Alert';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { CreateApiKeyDialog } from './subcomponents/CreateApiKeyDialog';
import { DeleteApiKeyDialog } from './subcomponents/DeleteApiKeyDialog';
import { Key, Copy, Check, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { usePermissions } from '@/hooks/usePermissions';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  projectId: string | null;
  project?: {
    id: string;
    name: string;
    key: string;
  } | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  updatedAt: string;
}

interface ApiKeysManagementProps {
  className?: string;
}

export function ApiKeysManagement({ className }: ApiKeysManagementProps) {
  const { hasPermission: hasPermissionCheck } = usePermissions();
  // Only users with create/update permissions can create API keys
  const canCreateApiKey = 
    hasPermissionCheck('testcases:create') || 
    hasPermissionCheck('testcases:update') ||
    hasPermissionCheck('testruns:create') ||
    hasPermissionCheck('testruns:update') ||
    hasPermissionCheck('projects:update') ||
    hasPermissionCheck('projects:create');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdApiKey, setCreatedApiKey] = useState<{ key: string; apiKey: ApiKey } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<ApiKey | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/apikeys');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch API keys');
      }

      const data = await response.json();
      // Handle different response formats
      // The route might return { data: [...] } or the array directly
      const apiKeysArray = Array.isArray(data) ? data : (data?.data || []);
      // Filter out inactive/deleted API keys
      const activeKeys = apiKeysArray.filter((key: ApiKey) => key.isActive);
      setApiKeys(activeKeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyCreated = (newApiKey: { key: string; apiKey: ApiKey }) => {
    // Store the created key to show it until user clicks hide
    setCreatedApiKey(newApiKey);
    setSuccess(null); // Clear any previous success message
    
    // Refresh the list
    fetchApiKeys();
    setCreateDialogOpen(false);
  };

  const handleHideApiKey = () => {
    setCreatedApiKey(null);
    setSuccess('API key hidden. Remember to save it securely - it won\'t be shown again!');
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleApiKeyDeleted = (apiKeyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== apiKeyId));
    setDeleteDialogOpen(false);
    setApiKeyToDelete(null);
    setSuccess('API key deleted successfully');
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleDeleteClick = (apiKey: ApiKey) => {
    setApiKeyToDelete(apiKey);
    setDeleteDialogOpen(true);
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };


  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return <Loader text="Loading API keys..." />;
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Manage API keys for SDK authentication. Keys are shown only once when created.
          </p>
          {canCreateApiKey && (
            <ButtonPrimary onClick={() => setCreateDialogOpen(true)}>
              <Key className="w-4 h-4 mr-2" />
              Create API Key
            </ButtonPrimary>
          )}
        </div>

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

        {createdApiKey && (
          <Alert className="mb-6 border-yellow-500/40 bg-yellow-500/10">
            <AlertDescription className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-yellow-300 font-semibold mb-2">
                    ⚠️ Save Your API Key Now - It Won&apos;t Be Shown Again!
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="px-3 py-2 rounded bg-background/50 border border-yellow-500/30 font-mono text-sm text-yellow-200 flex-1">
                      {createdApiKey.key}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(createdApiKey.key, 'created-key')}
                      className="h-9 w-9 rounded-full border border-blue-400/30 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                      title="Copy full API key"
                    >
                      {copiedKeyId === 'created-key' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHideApiKey}
                    className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                  >
                    Hide Key
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No API Keys</h3>
            <p className="text-muted-foreground mb-6">
              {canCreateApiKey 
                ? 'Create your first API key to start using the EZTest SDK'
                : 'You do not have permission to create API keys. Contact an admin to get started.'}
            </p>
            {canCreateApiKey && (
              <ButtonPrimary onClick={() => setCreateDialogOpen(true)}>
                <Key className="w-4 h-4 mr-2" />
                Create API Key
              </ButtonPrimary>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="border border-primary/30 rounded-lg p-6 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{apiKey.name}</h3>
                      {!apiKey.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          Inactive
                        </span>
                      ) : isExpired(apiKey.expiresAt) ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-400 border border-green-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Key:</span>
                        <code className="px-2 py-1 rounded bg-background/50 border border-primary/20 font-mono text-xs">
                          {apiKey.keyPrefix}...
                        </code>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/30">
                          <AlertCircle className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400">
                            Full key shown only once when created
                          </span>
                        </div>
                      </div>
                      
                      {apiKey.project && (
                        <div>
                          <span className="font-medium">Project:</span> {apiKey.project.name}
                        </div>
                      )}
                      
                      <div className="flex gap-6">
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(apiKey.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span> {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Never'}
                        </div>
                        {apiKey.lastUsedAt && (
                          <div>
                            <span className="font-medium">Last Used:</span> {formatDate(apiKey.lastUsedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(apiKey)}
                    className="rounded-full border border-red-400/30 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    title="Delete API key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateApiKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onApiKeyCreated={handleApiKeyCreated}
      />

      {apiKeyToDelete && (
        <DeleteApiKeyDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          apiKey={apiKeyToDelete}
          onApiKeyDeleted={handleApiKeyDeleted}
        />
      )}
    </div>
  );
}

