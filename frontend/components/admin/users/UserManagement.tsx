'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
import { ButtonPrimary } from '@/elements/button-primary';
import { Input } from '@/elements/input';
import { TopBar, UserCard } from '@/components/design';
import { Loader } from '@/elements/loader';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/design/FloatingAlert';
import { 
  Users, 
  UserPlus, 
  Search,
  Shield,
  Eye
} from 'lucide-react';
import { User, Role, UserFormData, EditUserFormData } from './types';
import { AddUserDialog } from './subcomponents/AddUserDialog';
import { EditUserDialog } from './subcomponents/EditUserDialog';
import { DeleteUserDialog } from './subcomponents/DeleteUserDialog';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.data) {
        setUsers(data.data);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to Load Users',
        message: 'Could not load users list.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      if (data.data) {
        setRoles(data.data);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to Load Roles',
        message: 'Could not load available roles.',
      });
    }
  };

  const handleAddUser = async (formData: UserFormData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    fetchUsers();
    setAlert({
      type: 'success',
      title: 'User Added',
      message: `User "${data.data.name}" has been added successfully.`,
    });
  };

  const handleUpdateUser = async (formData: EditUserFormData) => {
    if (!selectedUser) return;

    const response = await fetch(`/api/users/${selectedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const userName = data.data?.name || selectedUser.name || 'User';
    
    fetchUsers();
    setAlert({
      type: 'success',
      title: 'User Updated',
      message: `User "${userName}" has been updated successfully.`,
    });
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const userName = selectedUser.name;
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
        setAlert({
          type: 'success',
          title: 'User Deleted',
          message: `User "${userName}" has been deleted successfully.`,
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Failed to Delete User',
        message: 'Could not delete the user.',
      });
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PROJECT_MANAGER':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'TESTER':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'VIEWER':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
      case 'PROJECT_MANAGER':
        return <Shield className="w-3 h-3" />;
      case 'VIEWER':
        return <Eye className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Top Bar */}
      <TopBar
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users' },
        ]}
        actions={
          <ButtonPrimary
            onClick={() => setAddDialogOpen(true)}
            className="gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </ButtonPrimary>
        }
      />

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 py-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
            <p className="text-white/70 text-sm">Manage application users and assign roles</p>
          </div>
          <div className="w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-[#0f172a] border-[#334155]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {loading ? (
          <Loader fullScreen={false} text="Loading users..." />
        ) : (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/60">No users found</p>
                  <p className="text-white/40 text-sm mt-1">
                    {searchQuery ? 'Try a different search term' : 'Add your first user to get started'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={() => {
                        setSelectedUser(user);
                        setEditDialogOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedUser(user);
                        setDeleteDialogOpen(true);
                      }}
                      viewHref={`/admin/users/${user.id}`}
                      showProjects={true}
                      getRoleBadgeColor={getRoleBadgeColor}
                      getRoleIcon={getRoleIcon}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <AddUserDialog
        open={addDialogOpen}
        roles={roles}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddUser}
      />

      <EditUserDialog
        open={editDialogOpen}
        user={selectedUser}
        roles={roles}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleUpdateUser}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        userName={selectedUser?.name || ''}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteUser}
      />

      {/* Alerts */}
      {alert && (
        <FloatingAlert
          alert={alert}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
}
