'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Card, CardContent, CardHeader } from '@/frontend/reusable-elements/cards/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/frontend/reusable-elements/dialogs/Dialog';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/reusable-elements/selects/Select';
import { ActionMenu } from '@/frontend/reusable-components/menus/ActionMenu';
import {
  AlertCircle,
  Clock,
  Filter,
  Plus,
  Trash2,
} from 'lucide-react';
import { useFormPersistence } from '@/hooks/useFormPersistence';

interface TestCase {
  id: string;
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  estimatedTime?: number;
  suite?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count: {
    steps: number;
    results: number;
    requirements: number;
  };
  createdAt: string;
}

interface ProjectTestCasesProps {
  projectId: string;
}

export default function ProjectTestCases({ projectId }: ProjectTestCasesProps) {
  const router = useRouter();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [filteredTestCases, setFilteredTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData, clearFormData] = useFormPersistence(
    `create-testcase-${projectId}`,
    {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'DRAFT',
      estimatedTime: '',
      preconditions: '',
      postconditions: '',
    },
    {
      expiryMs: 60 * 60 * 1000, // 1 hour
    }
  );

  useEffect(() => {
    fetchTestCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCases, searchQuery, priorityFilter, statusFilter]);

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/testcases`);
      const data = await response.json();
      if (data.data) {
        setTestCases(data.data);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...testCases];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tc) =>
          tc.title.toLowerCase().includes(query) ||
          tc.description?.toLowerCase().includes(query)
      );
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((tc) => tc.priority === priorityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((tc) => tc.status === statusFilter);
    }

    setFilteredTestCases(filtered);
  };

  const handleCreateTestCase = async () => {
    try {
      const estimatedTime = formData.estimatedTime
        ? parseInt(formData.estimatedTime)
        : undefined;

      const response = await fetch(`/api/projects/${projectId}/testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedTime,
        }),
      });

      const data = await response.json();

      if (data.data) {
        setCreateDialogOpen(false);
        // Clear persisted form data after successful creation
        clearFormData();
        fetchTestCases();
      } else {
        alert(data.error || 'Failed to create test case');
      }
    } catch (error) {
      console.error('Error creating test case:', error);
      alert('Failed to create test case');
    }
  };

  const handleDeleteTestCase = async () => {
    if (!selectedTestCase) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/testcases/${selectedTestCase.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSelectedTestCase(null);
        fetchTestCases();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete test case');
      }
    } catch (error) {
      console.error('Error deleting test case:', error);
      alert('Failed to delete test case');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'DRAFT':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DEPRECATED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <>
      {/* Header with Create Button */}
      <div className="flex justify-end mb-6">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <ButtonPrimary>
              <Plus className="w-4 h-4 mr-2" />
              New Test Case
            </ButtonPrimary>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Create Test Case</DialogTitle>
              <DialogDescription>
                Add a new test case to this project
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter test case title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter test case description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedTime">テスト実行時間（秒）</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setFormData({ ...formData, estimatedTime: e.target.value })
                  }
                  placeholder="Enter estimated time"
                />
              </div>

              <div>
                <Label htmlFor="preconditions">Preconditions</Label>
                <Textarea
                  id="preconditions"
                  value={formData.preconditions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setFormData({ ...formData, preconditions: e.target.value })
                  }
                  placeholder="Enter preconditions"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="postconditions">Postconditions</Label>
                <Textarea
                  id="postconditions"
                  value={formData.postconditions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setFormData({ ...formData, postconditions: e.target.value })
                  }
                  placeholder="Enter postconditions"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <ButtonPrimary onClick={handleCreateTestCase}>Create</ButtonPrimary>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="glass mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search test cases..."
              />
            </div>

            <div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases List */}
      {loading ? (
        <Loader fullScreen={false} text="Loading test cases..." />
      ) : filteredTestCases.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No test cases found
            </h3>
            <p className="text-gray-400 mb-4">
              {testCases.length === 0
                ? 'Get started by creating your first test case'
                : 'Try adjusting your filters'}
            </p>
            {testCases.length === 0 && (
              <ButtonPrimary onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Test Case
              </ButtonPrimary>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTestCases.map((testCase) => (
            <Card
              key={testCase.id}
              className="glass cursor-pointer hover:border-blue-500/50 transition-colors"
              onClick={() => router.push(`/testcases/${testCase.id}`)}
            >
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                      {testCase.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={getPriorityColor(testCase.priority)}
                      >
                        {testCase.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getStatusColor(testCase.status)}
                      >
                        {testCase.status}
                      </Badge>
                    </div>
                  </div>
                  <ActionMenu
                    items={[
                      {
                        label: 'Delete',
                        icon: Trash2,
                        onClick: () => {
                          setSelectedTestCase(testCase);
                          setDeleteDialogOpen(true);
                        },
                        variant: 'destructive',
                      },
                    ]}
                    align="end"
                    iconSize="w-4 h-4"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="py-3 px-4">
                {testCase.description && (
                  <p className="text-sm text-gray-400 mb-3 break-words line-clamp-2">
                    {testCase.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {testCase.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{testCase.estimatedTime}m</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span>{testCase._count.steps} steps</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{testCase._count.results} runs</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                      {testCase.createdBy.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-400 truncate">
                      {testCase.createdBy.name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Test Case</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedTestCase?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTestCase}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
