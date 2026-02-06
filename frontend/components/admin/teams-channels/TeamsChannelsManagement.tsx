'use client';

import { useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { HeaderWithFilters } from '@/frontend/reusable-components/layout/HeaderWithFilters';
import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { DataTable, type ColumnDef } from '@/frontend/reusable-components/tables/DataTable';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { EmptyStateCard } from '@/frontend/reusable-components/cards/EmptyStateCard';
import { BaseDialog, type BaseDialogField } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { ConfirmDeleteDialog } from '@/frontend/reusable-components/dialogs/ConfirmDeleteDialog';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { MessageSquare, Plus, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';

interface ChannelConfig {
  id: string;
  channelId: string;
  teamId: string;
  projectId: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  key: string;
}

export default function TeamsChannelsManagement() {
  const [configs, setConfigs] = useState<ChannelConfig[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ChannelConfig | null>(null);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    fetchConfigs();
    fetchProjects();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/teams-channels');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setConfigs(data);
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Failed to Load Channels',
        message: err instanceof Error ? err.message : 'Could not load channel configurations.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      if (data.data) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleAdd = async (formData: Record<string, string>) => {
    const response = await fetch('/api/admin/teams-channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: formData.teamId,
        channelId: formData.channelId,
        projectId: formData.projectId,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    fetchConfigs();
    setAlert({
      type: 'success',
      title: 'Channel Added',
      message: 'Teams channel has been configured successfully.',
    });
  };

  const handleUpdate = async (formData: Record<string, string>) => {
    if (!selectedConfig) return;

    const response = await fetch(`/api/admin/teams-channels/${selectedConfig.channelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: formData.projectId,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    fetchConfigs();
    setAlert({
      type: 'success',
      title: 'Channel Updated',
      message: 'Channel configuration has been updated successfully.',
    });
  };

  const handleDelete = async () => {
    if (!selectedConfig) return;

    try {
      const response = await fetch(`/api/admin/teams-channels/${selectedConfig.channelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedConfig(null);
        fetchConfigs();
        setAlert({
          type: 'success',
          title: 'Channel Removed',
          message: 'Teams channel has been disconnected from EZTest.',
        });
      }
    } catch {
      setAlert({
        type: 'error',
        title: 'Failed to Delete Channel',
        message: 'Could not remove the channel configuration.',
      });
    }
  };

  const filteredConfigs = configs.filter((config) => {
    const matchesSearch =
      config.channelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.teamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.project.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const columns: ColumnDef<ChannelConfig>[] = [
    {
      key: 'channelId',
      label: 'Channel ID',
      render: (value) => (
        <span className="font-mono text-sm">{String(value)}</span>
      ),
    },
    {
      key: 'teamId',
      label: 'Team ID',
      render: (value) => (
        <span className="font-mono text-sm text-white/60">{String(value)}</span>
      ),
    },
    {
      key: 'project',
      label: 'Project',
      render: (value, row) => (
        <a
          href={`/projects/${row.projectId}`}
          className="text-primary hover:underline flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {row.project.name}
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      key: 'createdAt',
      label: 'Configured',
      render: (value) => (
        <span className="text-white/60">
          {new Date(String(value)).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedConfig(row);
              setEditDialogOpen(true);
            }}
            className="h-8 px-3"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedConfig(row);
              setDeleteDialogOpen(true);
            }}
            className="h-8 px-3 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      ),
    },
  ];

  const addDialogFields: BaseDialogField[] = [
    {
      name: 'teamId',
      label: 'Team ID',
      placeholder: '19:xyz123abc@thread.skype',
      type: 'text',
      required: true,
    },
    {
      name: 'channelId',
      label: 'Channel ID',
      placeholder: '19:abcxyz@thread.skype',
      type: 'text',
      required: true,
    },
    {
      name: 'projectId',
      label: 'EZTest Project',
      type: 'select',
      required: true,
      options: projects.map((project) => ({
        value: project.id,
        label: `${project.name} (${project.key})`,
      })),
    },
  ];

  const editDialogFields: BaseDialogField[] = [
    {
      name: 'teamId',
      label: 'Team ID',
      type: 'text',
      readOnly: true,
      defaultValue: selectedConfig?.teamId || '',
    },
    {
      name: 'channelId',
      label: 'Channel ID',
      type: 'text',
      readOnly: true,
      defaultValue: selectedConfig?.channelId || '',
    },
    {
      name: 'projectId',
      label: 'EZTest Project',
      type: 'select',
      required: true,
      defaultValue: selectedConfig?.projectId || '',
      options: projects.map((project) => ({
        value: project.id,
        label: `${project.name} (${project.key})`,
      })),
    },
  ];

  const navbarActions = useMemo(() => {
    return [
      {
        type: 'action' as const,
        label: 'Add Channel',
        icon: Plus,
        onClick: () => setAddDialogOpen(true),
        variant: 'primary' as const,
        buttonName: 'Teams Channels - Add Channel',
      },
      {
        type: 'signout' as const,
        showConfirmation: true,
      },
    ];
  }, []);

  return (
    <>
      {/* Navbar */}
      <Navbar
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Admin', href: '/admin' },
              { label: 'Teams Channels', href: '/admin/teams-channels' },
            ]}
          />
        }
        actions={navbarActions}
      />

      {/* Page Header and Filters */}
      <div className="px-8 pt-8">
        <HeaderWithFilters
          header={
            <PageHeaderWithBadge
              title="Teams Channel Configuration"
              description="Manage which Teams channels are connected to EZTest projects"
            />
          }
          filters={
            <div className="w-full">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search channels..."
              />
            </div>
          }
        />
      </div>

      {/* Channels Table */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <Loader fullScreen={false} text="Loading channels..." />
          ) : (
            <DetailCard
              title={`Channel Configurations (${filteredConfigs.length})`}
              description="Teams channels mapped to EZTest projects"
            >
              {filteredConfigs.length === 0 ? (
                <EmptyStateCard
                  icon={MessageSquare}
                  title={searchQuery ? 'No channels found' : 'No channels configured yet'}
                  description={
                    searchQuery
                      ? 'Try a different search term'
                      : 'Add your first Teams channel to get started'
                  }
                />
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredConfigs}
                  emptyMessage="No channels found"
                />
              )}
            </DetailCard>
          )}
        </div>
      </div>

      {/* Add Dialog */}
      <BaseDialog
        title="Add Channel Configuration"
        description="Connect a Teams channel to an EZTest project"
        fields={addDialogFields}
        submitLabel="Create"
        triggerOpen={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAdd}
        onSuccess={() => setAddDialogOpen(false)}
        submitButtonName="Teams Channels - Add Channel"
      />

      {/* Edit Dialog */}
      {selectedConfig && (
        <BaseDialog
          title="Edit Channel Configuration"
          description="Update the Teams channel to project mapping"
          fields={editDialogFields}
          submitLabel="Update"
          triggerOpen={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdate}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedConfig(null);
          }}
          submitButtonName="Teams Channels - Edit Channel"
        />
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        title="Remove Channel Configuration"
        description={`Are you sure you want to disconnect the Teams channel "${selectedConfig?.channelId}" from EZTest? This action cannot be undone.`}
        itemName={selectedConfig?.channelId || ''}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />

      {/* Alerts */}
      {alert && (
        <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
      )}
    </>
  );
}
