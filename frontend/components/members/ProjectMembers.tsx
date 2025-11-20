'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/elements/button';
import { Card, CardContent } from '@/elements/card';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Project, ProjectMember, AddMemberFormData } from './types';
import { MembersHeader } from './subcomponents/MembersHeader';
import { MembersCard } from './subcomponents/MembersCard';
import { AddMemberDialog } from './subcomponents/AddMemberDialog';
import { RemoveMemberDialog } from './subcomponents/RemoveMemberDialog';

interface ProjectMembersProps {
  projectId: string;
}

export default function ProjectMembers({ projectId }: ProjectMembersProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<AddMemberFormData>({
    email: '',
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // Check if user is admin or project manager
  const isAdminOrManager = session?.user?.roleName === 'ADMIN' || session?.user?.roleName === 'PROJECT_MANAGER';

  useEffect(() => {
    fetchProjectAndMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Team Members - ${project.name} | EZTest`;
    }
  }, [project]);

  const fetchProjectAndMembers = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/members`),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData.data);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.data || []);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMembers([...members, data.data]);
        setAddDialogOpen(false);
        setFormData({ email: '' });
      } else {
        setError(data.error || 'Failed to add member');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    setMemberToDelete({ id: memberId, name: memberName });
    setDeleteDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${memberToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setMembers(members.filter((m) => m.id !== memberToDelete.id));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-white/70">Loading members...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-8">
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-white/70">Project not found</p>
              <Button
                onClick={() => router.push('/projects')}
                variant="glass-primary"
                className="mt-4"
              >
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: 'Projects', href: '/projects' },
                { label: project.name, href: `/projects/${projectId}` },
                { label: 'Members' },
              ]}
            />
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      <MembersHeader
        project={project}
        isAdminOrManager={isAdminOrManager}
        onAddMember={() => setAddDialogOpen(true)}
      />

      <MembersCard
        members={members}
        isAdminOrManager={isAdminOrManager}
        onAddMember={() => setAddDialogOpen(true)}
        onRemoveMember={handleRemoveMember}
      />

      <AddMemberDialog
        open={addDialogOpen}
        formData={formData}
        adding={adding}
        error={error}
        onOpenChange={setAddDialogOpen}
        onFormChange={setFormData}
        onSubmit={handleAddMember}
      />

      <RemoveMemberDialog
        open={deleteDialogOpen}
        memberName={memberToDelete?.name || null}
        deleting={deleting}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmRemoveMember}
      />
    </>
  );
}
