'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  TestTube2,
  Folder,
  Plus,
} from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { PriorityBadge } from '@/components/design/PriorityBadge';

interface TestCase {
  id: string;
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    results: number;
    steps: number;
  };
}

interface TestSuite {
  id: string;
  name: string;
  description?: string;
  order: number;
  projectId: string;
  parentId?: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  parent?: {
    id: string;
    name: string;
  };
  children?: {
    id: string;
    name: string;
    _count: {
      testCases: number;
    };
  }[];
  testCases: TestCase[];
  _count: {
    testCases: number;
    children: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TestSuiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const suiteId = params.id as string;

  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchTestSuite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suiteId]);

  useEffect(() => {
    if (testSuite) {
      document.title = `${testSuite.name} | EZTest`;
    }
  }, [testSuite]);

  const fetchTestSuite = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testsuites/${suiteId}`);
      const data = await response.json();

      if (data.data) {
        setTestSuite(data.data);
        setFormData({
          name: data.data.name,
          description: data.data.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching test suite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/testsuites/${suiteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.data) {
        setIsEditing(false);
        fetchTestSuite();
      } else {
        alert(data.error || 'Failed to update test suite');
      }
    } catch (error) {
      console.error('Error updating test suite:', error);
      alert('Failed to update test suite');
    }
  };

  const handleDeleteTestSuite = async () => {
    try {
      const response = await fetch(`/api/testsuites/${suiteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/projects/${testSuite?.project.id}/testsuites`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete test suite');
      }
    } catch (error) {
      console.error('Error deleting test suite:', error);
      alert('Failed to delete test suite');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Loading test suite...</p>
        </div>
      </div>
    );
  }

  if (!testSuite) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Test suite not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Overview', href: `/projects/${testSuite.project.id}` },
          { label: 'Test Suites', href: `/projects/${testSuite.project.id}/testsuites` },
          { label: 'Test Cases', href: `/projects/${testSuite.project.id}/testcases` },
          { label: 'Members', href: `/projects/${testSuite.project.id}/members` },
          { label: 'Settings', href: `/projects/${testSuite.project.id}/settings` },
        ]}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/projects' },
              { label: testSuite.project.name, href: `/projects/${testSuite.project.id}` },
              { label: 'Test Suites', href: `/projects/${testSuite.project.id}/testsuites` },
              { label: testSuite.name },
            ]}
          />
        }
        actions={
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        }
      />

      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="glass"
            onClick={() => router.push(`/projects/${testSuite.project.id}/testsuites`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Test Suites
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                >
                  <Folder className="w-3 h-3 mr-1" />
                  Test Suite
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-white/90 mb-1">
                {isEditing ? (
                  <Input
                    variant="glass"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="text-3xl font-bold"
                  />
                ) : (
                  testSuite.name
                )}
              </h1>
              <p className="text-white/60">
                {testSuite.project.name} ({testSuite.project.key})
              </p>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="glass" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button variant="glass-primary" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="glass" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="glass-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      variant="glass"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Enter description"
                    />
                  </div>
                ) : (
                  <>
                    {testSuite.description ? (
                      <div>
                        <h4 className="text-sm font-medium text-white/60 mb-1">
                          Description
                        </h4>
                        <p className="text-white/90 whitespace-pre-wrap">
                          {testSuite.description}
                        </p>
                      </div>
                    ) : (
                      <p className="text-white/60 text-sm">No description provided</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Test Cases Card */}
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Test Cases ({testSuite._count.testCases})</CardTitle>
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() =>
                      router.push(`/projects/${testSuite.project.id}/testcases/new?suiteId=${suiteId}`)
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {testSuite.testCases && testSuite.testCases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Steps</TableHead>
                          <TableHead className="text-right">Runs</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testSuite.testCases.map((testCase) => (
                          <TableRow
                            key={testCase.id}
                            className="cursor-pointer hover:bg-white/5"
                            onClick={() => router.push(`/projects/${testSuite.project.id}/testcases/${testCase.id}`)}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-white/90">
                                  {testCase.title}
                                </p>
                                {testCase.description && (
                                  <p className="text-xs text-white/60 line-clamp-1 mt-1">
                                    {testCase.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <PriorityBadge priority={testCase.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'} />
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  testCase.status === 'ACTIVE'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : testCase.status === 'DRAFT'
                                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                }
                              >
                                {testCase.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-white/70">
                              {testCase._count.steps}
                            </TableCell>
                            <TableCell className="text-right text-white/70">
                              {testCase._count.results}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TestTube2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-white/60 mb-4">
                      No test cases in this suite yet
                    </p>
                    <Button
                      variant="glass-primary"
                      size="sm"
                      onClick={() =>
                        router.push(`/projects/${testSuite.project.id}/testcases/new?suiteId=${suiteId}`)
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Test Case
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Child Suites Card */}
            {testSuite.children && testSuite.children.length > 0 && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Child Suites ({testSuite._count.children})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {testSuite.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/projects/${testSuite.project.id}/testsuites/${child.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="w-5 h-5 text-primary" />
                          <span className="text-white/90 font-medium">{child.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <TestTube2 className="w-4 h-4" />
                          <span>{child._count.testCases}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testSuite.parent && (
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-1">
                      Parent Suite
                    </h4>
                    <Button
                      variant="glass"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => router.push(`/projects/${testSuite.project.id}/testsuites/${testSuite.parent?.id}`)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      {testSuite.parent.name}
                    </Button>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-1">
                    Statistics
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-white/90">
                      <span>Test Cases</span>
                    <span>{testSuite._count.testCases}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                      <span>Child Suites</span>
                      <span>{testSuite._count.children}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-1">
                    Created
                  </h4>
                  <p className="text-white/90 text-sm">
                    {new Date(testSuite.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-1">
                    Last Updated
                  </h4>
                  <p className="text-white/90 text-sm">
                    {new Date(testSuite.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="glass"
                  className="w-full justify-start"
                  onClick={() =>
                    router.push(`/projects/${testSuite.project.id}/testcases/new?suiteId=${suiteId}`)
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test Case
                </Button>
                <Button
                  variant="glass"
                  className="w-full justify-start"
                  onClick={() => router.push(`/projects/${testSuite.project.id}/testcases`)}
                >
                  <TestTube2 className="w-4 h-4 mr-2" />
                  View All Test Cases
                </Button>
                <Button
                  variant="glass"
                  className="w-full justify-start"
                  onClick={() => router.push(`/projects/${testSuite.project.id}/testsuites`)}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  View All Suites
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent variant="glass">
            <DialogHeader>
              <DialogTitle>Delete Test Suite</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{testSuite.name}&quot;? Test
                cases in this suite will not be deleted, but will become unorganized.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="glass"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="glass-destructive" onClick={handleDeleteTestSuite}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
