'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, UserPlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/frontend/reusable-elements/dialogs/Dialog';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';

interface CreateAddMemberDialogProps {
  projectId: string;
  existingMemberUserIds: string[];
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMembersAdded: (members: unknown[]) => void;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export function CreateAddMemberDialog({
  projectId,
  existingMemberUserIds,
  triggerOpen,
  onOpenChange,
  onMembersAdded,
}: CreateAddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
    }
  }, [triggerOpen]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch('/api/users');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Не удалось загрузить пользователей');
        }

        const allUsers = (data.data || []) as UserOption[];
        setUsers(allUsers);
      } catch (error) {
        setAlert({
          type: 'error',
          title: 'Ошибка загрузки',
          message: error instanceof Error ? error.message : 'Не удалось загрузить пользователей',
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [open]);

  const availableUsers = useMemo(() => {
    return users.filter((user) => !existingMemberUserIds.includes(user.id));
  }, [users, existingMemberUserIds]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return availableUsers;
    }

    return availableUsers.filter((user) => {
      return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    });
  }, [availableUsers, searchTerm]);

  const selectedUsers = useMemo(() => {
    const selectedMap = new Set(selectedUserIds);
    return availableUsers.filter((user) => selectedMap.has(user.id));
  }, [availableUsers, selectedUserIds]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (!newOpen) {
      setSelectedUserIds([]);
      setSearchTerm('');
    }

    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((current) => {
      if (current.includes(userId)) {
        return current.filter((id) => id !== userId);
      }

      return [...current, userId];
    });
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      setAlert({
        type: 'error',
        title: 'Выберите участников',
        message: 'Нужно выбрать хотя бы одного пользователя.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUserIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Не удалось добавить участников');
      }

      const addedMembers = Array.isArray(data.data) ? data.data : [data.data].filter(Boolean);
      onMembersAdded(addedMembers);
      handleOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить участников</DialogTitle>
            <DialogDescription>
              Выберите одного или нескольких пользователей, которым нужно выдать доступ к проекту.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="members-search">Поиск пользователей</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="members-search"
                  placeholder="Введите имя или email"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Выбрано: {selectedUsers.length}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge key={user.id} variant="glass" className="gap-1 pr-1">
                      {user.name}
                      <button
                        type="button"
                        onClick={() => toggleUserSelection(user.id)}
                        className="rounded-full p-0.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        aria-label={`Убрать ${user.name}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-white/10">
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Загрузка пользователей...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Нет пользователей для добавления
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {filteredUsers.map((user) => {
                      const checked = selectedUserIds.includes(user.id);

                      return (
                        <label
                          key={user.id}
                          className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleSubmit().catch((error) => {
                  setAlert({
                    type: 'error',
                    title: 'Не удалось добавить участников',
                    message: error instanceof Error ? error.message : 'Произошла ошибка при добавлении участников',
                  });
                });
              }}
              disabled={submitting || selectedUserIds.length === 0}
              className="min-w-44"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Добавление...
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Выдать доступ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {alert && (
        <FloatingAlert
          alert={alert}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
}

export type { CreateAddMemberDialogProps };

