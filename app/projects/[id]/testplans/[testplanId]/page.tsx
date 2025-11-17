'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
import { Checkbox } from '@/elements/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/elements/table';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Plus,
  Play,
  FileText,
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
  _count: {
    steps: number;
  };
}

interface TestPlan {
  id: string;
  name: string;
  description?: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  testCases: TestCase[];
  _count: {
    testCases: number;
    testRuns: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TestPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testPlanId = params.testplanId as string;

  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addCasesDialogOpen, setAddCasesDialogOpen] = useState(false);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchTestPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testPlanId]);

  useEffect(() => {
    if (testPlan) {
      document.title = `${testPlan.name} | EZTest`;
    }
  }, [testPlan]);

  const fetchTestPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testplans/${testPlanId}`);
      const data = await response.json();

      if (data.data) {
        setTestPlan(data.data);
        setFormData({
          name: data.data.name,
          description: data.data.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching test plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTestCases = async () => {
    if (!testPlan) return;

    try {
      const response = await fetch(`/api/projects/${testPlan.project.id}/testcases`);
      const data = await response.json();

      if (data.data) {
        // Filter out test cases already in the plan
        const existingIds = new Set(testPlan.testCases.map(tc => tc.id));
        const available = data.data.filter((tc: TestCase) => !existingIds.has(tc.id));
        setAvailableTestCases(available);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/testplans/${testPlanId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.data) {
        setIsEditing(false);
        fetchTestPlan();
      } else {
        alert(data.error || 'Failed to update test plan');
      }
    } catch (error) {
      console.error('Error updating test plan:', error);
      alert('Failed to update test plan');
    }
  };

  const handleDeleteTestPlan = async () => {
    try {
      const response = await fetch(`/api/testplans/${testPlanId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/projects/${testPlan?.project.id}/testplans`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete test plan');
      }
    } catch (error) {
      console.error('Error deleting test plan:', error);
      alert('Failed to delete test plan');
    }
  };

  const handleAddTestCases = async () => {
    if (selectedCaseIds.length === 0) {
      alert('Please select at least one test case');
      return;
    }

    try {
      const response = await fetch(`/api/testplans/${testPlanId}/testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCaseIds: selectedCaseIds }),
      });

      const data = await response.json();

      if (data.data) {
        setAddCasesDialogOpen(false);
        setSelectedCaseIds([]);
        fetchTestPlan();
      } else {
        alert(data.error || 'Failed to add test cases');
      }
    } catch (error) {
      console.error('Error adding test cases:', error);
      alert('Failed to add test cases');
    }
  };

  const handleRemoveTestCase = async (testCaseId: string) => {
    try {
      const response = await fetch(`/api/testplans/${testPlanId}/testcases`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCaseIds: [testCaseId] }),
      });

      const data = await response.json();

      if (data.data) {
        fetchTestPlan();
      } else {
        alert(data.error || 'Failed to remove test case');
      }
    } catch (error) {
      console.error('Error removing test case:', error);
      alert('Failed to remove test case');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white/70">Loading test plan...</p>
        </div>
      </div>
    );
  }

  if (!testPlan) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white/70">Test plan not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar
        items={[
          { label: 'Overview', href: `/projects/${testPlan.project.id}` },
          { label: 'Test Suites', href: `/projects/${testPlan.project.id}/testsuites` },
          { label: 'Test Cases', href: `/projects/${testPlan.project.id}/testcases` },
          { label: 'Test Plans', href: `/projects/${testPlan.project.id}/testplans` },
          { label: 'Test Runs', href: `/projects/${testPlan.project.id}/testruns` },
          { label: 'Members', href: `/projects/${testPlan.project.id}/members` },
          { label: 'Settings', href: `/projects/${testPlan.project.id}/settings` },
        ]}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/projects' },
              { label: testPlan.project.name, href: `/projects/${testPlan.project.id}` },
              { label: 'Test Plans', href: `/projects/${testPlan.project.id}/testplans` },
              { label: testPlan.name },
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

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="glass"
            onClick={() => router.push(`/projects/${testPlan.project.id}/testplans`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Test Plans
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Test Plan
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-white/90 mb-1">
                {isEditing ? (
                  <Input
                    variant="glass"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="text-3xl font-bold"
                  />
                ) : (
                  testPlan.name
                )}
              </h1>
              <p className="text-white/60">
                {testPlan.project.name} ({testPlan.project.key})
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Enter description"
                    />
                  </div>
                ) : (
                  <>
                    {testPlan.description ? (
                      <div>
                        <h4 className="text-sm font-medium text-white/60 mb-1">
                          Description
                        </h4>
                        <p className="text-white/90 whitespace-pre-wrap">
                          {testPlan.description}
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
                  <CardTitle>Test Cases ({testPlan._count.testCases})</CardTitle>
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => {
                      fetchAvailableTestCases();
                      setAddCasesDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Cases
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {testPlan.testCases && testPlan.testCases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Steps</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testPlan.testCases.map((testCase) => (
                          <TableRow key={testCase.id}>
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
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTestCase(testCase.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/60 mb-4">
                      No test cases in this plan yet
                    </p>
                    <Button
                      variant="glass-primary"
                      size="sm"
                      onClick={() => {
                        fetchAvailableTestCases();
                        setAddCasesDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Test Cases
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-1">
                    Created By
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white">
                      {testPlan.createdBy.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white/90 text-sm">{testPlan.createdBy.name}</p>
                      <p className="text-white/60 text-xs">{testPlan.createdBy.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-1">
                    Statistics
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-white/90">
                      <span>Test Cases</span>
                      <span>{testPlan._count.testCases}</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Test Runs</span>
                      <span>{testPlan._count.testRuns}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-1">
                    Created
                  </h4>
                  <p className="text-white/90 text-sm">
                    {new Date(testPlan.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-1">
                    Last Updated
                  </h4>
                  <p className="text-white/90 text-sm">
                    {new Date(testPlan.updatedAt).toLocaleDateString()}
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
                  onClick={() => {
                    fetchAvailableTestCases();
                    setAddCasesDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test Cases
                </Button>
                <Button
                  variant="glass"
                  className="w-full justify-start"
                  onClick={() => router.push(`/projects/${testPlan.project.id}/testruns`)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Create Test Run
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Test Cases Dialog */}
        <Dialog open={addCasesDialogOpen} onOpenChange={setAddCasesDialogOpen}>
          <DialogContent variant="glass" className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Test Cases</DialogTitle>
              <DialogDescription>
                Select test cases to add to this test plan
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[400px] overflow-y-auto">
              {availableTestCases.length === 0 ? (
                <p className="text-white/60 text-center py-8">
                  No available test cases to add
                </p>
              ) : (
                <div className="space-y-2">
                  {availableTestCases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Checkbox
                        id={testCase.id}
                        checked={selectedCaseIds.includes(testCase.id)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedCaseIds([...selectedCaseIds, testCase.id]);
                          } else {
                            setSelectedCaseIds(selectedCaseIds.filter(id => id !== testCase.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={testCase.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
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
                          <div className="flex items-center gap-2 ml-4">
                            <PriorityBadge priority={testCase.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'} />
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="glass"
                onClick={() => {
                  setAddCasesDialogOpen(false);
                  setSelectedCaseIds([]);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="glass-primary"
                onClick={handleAddTestCases}
                disabled={selectedCaseIds.length === 0}
              >
                Add {selectedCaseIds.length > 0 && `(${selectedCaseIds.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent variant="glass">
          <DialogHeader>
            <DialogTitle className="text-white/90">Delete Test Plan</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete &quot;{testPlan.name}&quot;?
                Test cases will remain but will no longer be linked to this plan.
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
              <Button variant="glass-destructive" onClick={handleDeleteTestPlan}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
