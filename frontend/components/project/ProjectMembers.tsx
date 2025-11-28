'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/date-utils';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonDestructive } from '@/elements/button-destructive';
import { Loader } from '@/elements/loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/elements/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/elements/select';
import { Badge } from '@/elements/badge';
import { Plus, Trash2, Mail, Shield, Eye, Users } from 'lucide-react';

interface ProjectMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  };
}

interface ProjectMembersProps {
  projectId: string;
}

export default function ProjectMembers({ projectId }: ProjectMembersProps) {
  const router = useRouter();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'TESTER',
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      }
    } catch {
      setError('Failed to load project members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMembers([...members, data.data]);
        setAddDialogOpen(false);
        setFormData({ email: '', role: 'TESTER' });
      } else {
        setError(data.error || 'Failed to add member');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    setMemberToDelete({ id: memberId, name: memberName });
    setDeleteDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMembers(members.filter(m => m.id !== memberToDelete.id));
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove member');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

    const getRoleBadgeVariant = (role: string) => {
      switch (role) {
        case 'ADMIN':
          return 'secondary';
        default:
          return 'outline';
      }
    };    const getRoleIcon = (role: string) => {
      switch (role) {
        case 'ADMIN':
          return <Shield className="w-3 h-3" />;
        case 'VIEWER':
          return <Eye className="w-3 h-3" />;
        default:
          return <Users className="w-3 h-3" />;
      }
    };  if (loading) {
    return <Loader fullScreen text="Loading members..." />;
  }

  return (
    <>
      {/* Add Member Button */}
      <div className="flex items-center justify-end mb-6">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <ButtonPrimary size="default">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </ButtonPrimary>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Project Member</DialogTitle>
              <DialogDescription>
                Add a team member to this project
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Project Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: string) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                    <SelectItem value="TESTER">Tester (Default)</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="glass" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <ButtonPrimary type="submit" disabled={adding}>
                  {adding ? 'Adding...' : 'Add Member'}
                </ButtonPrimary>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members List */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-white">Team Members ({members.length})</CardTitle>
          <CardDescription className="text-white/70">
            People who have access to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No members yet</h3>
              <p className="text-white/60 mb-6">
                Add team members to collaborate on this project
              </p>
              <ButtonPrimary onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Member
              </ButtonPrimary>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{member.user.name}</h4>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1 border-primary/40 bg-primary/10 text-primary">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-accent/40 bg-accent/10 text-accent">
                          {member.user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Mail className="w-3 h-3" />
                        {member.user.email}
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        Joined {formatDateTime(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="glass"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id, member.user.name)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Member Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToDelete?.name} from this project?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-red-300">
              <p className="font-semibold mb-2">This action will:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Remove this member&apos;s access to the project</li>
                <li>Revoke their permissions immediately</li>
                <li>This can be reversed by re-adding the member</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setMemberToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <ButtonDestructive
                type="button"
                onClick={confirmRemoveMember}
                disabled={deleting}
              >
                {deleting ? 'Removing...' : 'Remove Member'}
              </ButtonDestructive>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
