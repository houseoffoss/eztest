'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/date-utils';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/reusable-elements/cards/Card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/frontend/reusable-elements/dialogs/Dialog';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import { Save, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectSettingsProps {
  projectId: string;
}

export default function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const router = useRouter();
  const { hasPermission: hasPermissionCheck } = usePermissions();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const canDeleteProject = hasPermissionCheck('projects:delete');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
        setFormData({
          name: data.data.name,
          description: data.data.description || '',
        });
      } else {
        setError('Не удалось загрузить проект');
      }
    } catch {
      setError('Произошла ошибка при загрузке проекта');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProject(data.data);
        setSuccessMessage('Проект успешно обновлен');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Не удалось обновить проект');
      }
    } catch {
      setError('Произошла ошибка. Пожалуйста, попробуйте снова.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/projects?deleted=true');
      } else {
        const data = await response.json();
        setError(data.error || 'Не удалось удалить проект');
        setDeleteDialogOpen(false);
      }
    } catch {
      setError('Произошла ошибка. Пожалуйста, попробуйте снова.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Загрузка настроек проекта..." />;
  }

  if (!project) {
    return (
      <Card variant="glass">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-white/70">Проект не найден</p>
          <ButtonPrimary onClick={() => router.push('/projects')} className="mt-4">
            Назад к проектам
          </ButtonPrimary>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-white">Общая информация</CardTitle>
          <CardDescription className="text-white/70">
            Обновите название и описание проекта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название проекта *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={3}
                maxLength={255}
                placeholder="Платформа электронной коммерции"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Ключ проекта</Label>
              <Input
                id="key"
                value={project.key}
                disabled
                className="bg-white/5 border-white/10 text-white/50 cursor-not-allowed backdrop-blur-none"
              />
              <p className="text-xs text-muted-foreground">
                Ключ проекта нельзя изменить после создания
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Краткое описание проекта..."
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 p-3 rounded-md">
                {successMessage}
              </div>
            )}

            <div className="flex gap-3">
              <ButtonPrimary type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </ButtonPrimary>
              <Button
                type="button"
                variant="glass"
                onClick={() => {
                  setFormData({
                    name: project.name,
                    description: project.description || '',
                  });
                  setError('');
                  setSuccessMessage('');
                }}
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Project Information */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-white">Информация о проекте</CardTitle>
          <CardDescription className="text-white/70">
            Сведения о проекте только для чтения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60 text-xs">Создан</Label>
              <p className="text-sm font-medium text-white">
                {formatDateTime(project.createdAt)}
              </p>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Последнее обновление</Label>
              <p className="text-sm font-medium text-white">
                {formatDateTime(project.updatedAt)}
              </p>
            </div>
            <div>
              <Label className="text-white/60 text-xs">ID проекта</Label>
              <p className="text-sm font-mono text-white/80">{project.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="glass" className="border-red-400/30">
        <CardHeader>
          <CardTitle className="text-red-400">Опасная зона</CardTitle>
          <CardDescription className="text-red-300/70">
            Необратимые и разрушительные действия
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-400/20 rounded-lg bg-red-400/5">
            <div>
              <h4 className="font-semibold text-red-300 mb-1">Удалить этот проект</h4>
              <p className="text-sm text-red-300/70">
                После удаления проекта восстановить его будет невозможно. Все данные будут удалены навсегда.
              </p>
            </div>
            {canDeleteProject && (
              <ButtonDestructive
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
                className="ml-4"
                buttonName={`Project Settings - Delete Project Button (${project?.name})`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить проект
              </ButtonDestructive>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление проекта</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить &quot;{project?.name}&quot;? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-red-300">
              <p className="font-semibold mb-2">Будет удалено навсегда:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Все тест-кейсы</li>
                <li>Все тест-раны</li>
                <li>Все тест-сьюты</li>
                <li>Все требования</li>
                <li>Все данные проекта</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                data-analytics-button={`Project Settings - Delete Dialog - Cancel (${project?.name})`}
              >
                Отмена
              </Button>
              <ButtonDestructive
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                buttonName={`Project Settings - Delete Dialog - Delete Project (${project?.name})`}
              >
                {deleting ? 'Удаление...' : 'Удалить проект'}
              </ButtonDestructive>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
