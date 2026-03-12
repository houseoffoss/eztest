'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Defect, DefectWatcher } from '../types';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/reusable-elements/selects/Select';

interface DefectWatchersCardProps {
  defect: Defect;
  projectId: string;
  defectId: string;
  onRefresh: () => void;
}

interface ProjectMemberUser {
  id: string;
  name: string;
  email: string;
}

export function DefectWatchersCard({
  defect,
  projectId,
  defectId,
  onRefresh,
}: DefectWatchersCardProps) {
  const { data: session } = useSession();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('defects:update');

  const watchers: DefectWatcher[] = defect.watchers ?? [];
  const watcherIds = new Set(watchers.map((w) => w.user.id));

  const [members, setMembers] = useState<ProjectMemberUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setMembers(
          data.data.map((m: { user: ProjectMemberUser }) => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
          }))
        );
      }
    } catch {
      console.error('Failed to fetch project members');
    } finally {
      setLoadingMembers(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (canUpdate) {
      fetchMembers();
    }
  }, [canUpdate, fetchMembers]);

  const addableMembers = members.filter(
    (m) => !watcherIds.has(m.id) && m.id !== session?.user?.id
  );

  const handleAddWatcher = async (userId: string) => {
    if (!userId) return;
    setAddingUserId(userId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/defects/${defectId}/watchers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to add watcher');
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveWatcher = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/defects/${defectId}/watchers/${userId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to remove watcher');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <DetailCard title="Watchers" contentClassName="space-y-3">
      <p className="text-sm text-white/60">
        Watchers receive email notifications for comments and status changes on this defect.
      </p>

      {watchers.length > 0 && (
        <ul className="space-y-2">
          {watchers.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm font-semibold text-white overflow-hidden">
                  {w.user.avatar ? (
                    <img
                      src={w.user.avatar}
                      alt={w.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    w.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">
                    {w.user.name}
                  </p>
                  <p className="text-xs text-white/50 truncate">{w.user.email}</p>
                </div>
              </div>
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => handleRemoveWatcher(w.user.id)}
                  disabled={removingUserId !== null}
                  className="p-1.5 rounded-md text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors disabled:opacity-50"
                  aria-label={`Remove ${w.user.name} from watchers`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {watchers.length === 0 && (
        <p className="text-sm text-white/50 italic">No watchers yet.</p>
      )}

      {canUpdate && addableMembers.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <label className="text-sm font-medium text-white/70">
            Add watcher
          </label>
          <Select
            key={watchers.length}
            onValueChange={(value) => {
              if (value) handleAddWatcher(value);
            }}
            disabled={addingUserId !== null || loadingMembers}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select a project member..." />
            </SelectTrigger>
            <SelectContent>
              {addableMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {addingUserId && (
            <p className="text-xs text-white/50">Adding watcher...</p>
          )}
        </div>
      )}

      {canUpdate && addableMembers.length === 0 && watchers.length > 0 && (
        <p className="text-xs text-white/50 pt-1">
          All project members are already watchers.
        </p>
      )}
    </DetailCard>
  );
}
