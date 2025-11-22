'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { Badge } from '@/elements/badge';
import { Avatar } from '@/elements/avatar';
import { Input } from '@/elements/input';
import { TopBar } from '@/components/design';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar, 
  Briefcase, 
  Edit, 
  Trash2, 
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

    fetchUsers();
    setAlert({
      type: 'success',
      title: 'User Updated',
      message: `User "${data.data.name}" has been updated successfully.`,
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
            className="gap-2"
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
          <div className="text-center py-12">
            <p className="text-white/70">Loading users...</p>
          </div>
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
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                              {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                            </div>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium">{user.name}</h3>
                            <Badge
                              variant="outline"
                              className={`gap-1 ${getRoleBadgeColor(user.role.name)}`}
                            >
                              {getRoleIcon(user.role.name)}
                              {user.role.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {user._count?.createdProjects || 0} projects
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          variant="glass"
                          size="icon"
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                          title="View user details"
                        >
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="glass"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="glass"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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
