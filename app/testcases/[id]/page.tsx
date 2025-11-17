'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import {
  ArrowLeft,
  Clock,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  GripVertical,
} from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';

interface TestStep {
  id?: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

interface TestCase {
  id: string;
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  project: {
    id: string;
    name: string;
    key: string;
  };
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
  steps: TestStep[];
  _count: {
    results: number;
    comments: number;
    attachments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TestCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testCaseId = params.id as string;

  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    estimatedTime: '',
    preconditions: '',
    postconditions: '',
  });

  // Steps state
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [newStep, setNewStep] = useState({ action: '', expectedResult: '' });
  const [addingStep, setAddingStep] = useState(false);

  useEffect(() => {
    fetchTestCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCaseId]);

  useEffect(() => {
    if (testCase) {
      document.title = `${testCase.title} | EZTest`;
    }
  }, [testCase]);

  const fetchTestCase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/testcases/${testCaseId}`);
      const data = await response.json();
      
      if (data.data) {
        setTestCase(data.data);
        setFormData({
          title: data.data.title,
          description: data.data.description || '',
          priority: data.data.priority,
          status: data.data.status,
          estimatedTime: data.data.estimatedTime?.toString() || '',
          preconditions: data.data.preconditions || '',
          postconditions: data.data.postconditions || '',
        });
        setSteps(data.data.steps || []);
      }
    } catch (error) {
      console.error('Error fetching test case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const estimatedTime = formData.estimatedTime
        ? parseInt(formData.estimatedTime)
        : undefined;

      // Update test case details
      const response = await fetch(`/api/testcases/${testCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedTime,
        }),
      });

      const data = await response.json();

      if (data.data) {
        // Update steps
        await updateSteps();
        setIsEditing(false);
        fetchTestCase();
      } else {
        alert(data.error || 'Failed to update test case');
      }
    } catch (error) {
      console.error('Error updating test case:', error);
      alert('Failed to update test case');
    }
  };

  const updateSteps = async () => {
    try {
      const response = await fetch(`/api/testcases/${testCaseId}/steps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      });

      const data = await response.json();
      if (!data.data) {
        console.error('Failed to update steps:', data.error);
      }
    } catch (error) {
      console.error('Error updating steps:', error);
    }
  };

  const handleAddStep = () => {
    if (!newStep.action || !newStep.expectedResult) {
      alert('Please fill in both action and expected result');
      return;
    }

    const maxStepNumber = steps.length > 0
      ? Math.max(...steps.map(s => s.stepNumber))
      : 0;

    setSteps([
      ...steps,
      {
        stepNumber: maxStepNumber + 1,
        action: newStep.action,
        expectedResult: newStep.expectedResult,
      },
    ]);

    setNewStep({ action: '', expectedResult: '' });
    setAddingStep(false);
  };

  const handleRemoveStep = (stepNumber: number) => {
    const filtered = steps.filter(s => s.stepNumber !== stepNumber);
    // Renumber remaining steps
    const renumbered = filtered.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
    }));
    setSteps(renumbered);
  };

  const handleDeleteTestCase = async () => {
    try {
      const response = await fetch(`/api/testcases/${testCaseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/projects/${testCase?.project.id}/testcases`);
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

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Loading test case...</p>
        </div>
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-gray-400">Test case not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Overview', href: `/projects/${testCase.project.id}` },
          { label: 'Test Cases', href: `/projects/${testCase.project.id}/testcases` },
          { label: 'Members', href: `/projects/${testCase.project.id}/members` },
          { label: 'Settings', href: `/projects/${testCase.project.id}/settings` },
        ]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Projects', href: '/projects' },
              { label: testCase.project.name, href: `/projects/${testCase.project.id}` },
              { label: 'Test Cases', href: `/projects/${testCase.project.id}/testcases` },
              { label: testCase.title }
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
          onClick={() => router.push(`/projects/${testCase.project.id}/testcases`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Test Cases
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
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
            <h1 className="text-3xl font-bold text-white mb-1">
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="text-3xl font-bold"
                />
              ) : (
                testCase.title
              )}
            </h1>
            <p className="text-white/60">
              {testCase.project.name} ({testCase.project.key})
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
                <>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger variant="glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent variant="glass">
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger variant="glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent variant="glass">
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Time (minutes)</Label>
                    <Input
                      variant="glass"
                      type="number"
                      value={formData.estimatedTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setFormData({ ...formData, estimatedTime: e.target.value })
                      }
                      placeholder="Enter estimated time"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preconditions</Label>
                    <Textarea
                      variant="glass"
                      value={formData.preconditions}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setFormData({ ...formData, preconditions: e.target.value })
                      }
                      rows={2}
                      placeholder="Enter preconditions"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Postconditions</Label>
                    <Textarea
                      variant="glass"
                      value={formData.postconditions}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setFormData({ ...formData, postconditions: e.target.value })
                      }
                      rows={2}
                      placeholder="Enter postconditions"
                    />
                  </div>
                </>
              ) : (
                <>
                  {testCase.description && (
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-1">
                        Description
                      </h4>
                      <p className="text-white/90">{testCase.description}</p>
                    </div>
                  )}

                  {testCase.estimatedTime && (
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-1">
                        Estimated Time
                      </h4>
                      <div className="flex items-center gap-2 text-white/90">
                        <Clock className="w-4 h-4" />
                        <span>{testCase.estimatedTime} minutes</span>
                      </div>
                    </div>
                  )}

                  {testCase.preconditions && (
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-1">
                        Preconditions
                      </h4>
                      <p className="text-white/90 whitespace-pre-wrap">
                        {testCase.preconditions}
                      </p>
                    </div>
                  )}

                  {testCase.postconditions && (
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-1">
                        Postconditions
                      </h4>
                      <p className="text-white/90 whitespace-pre-wrap">
                        {testCase.postconditions}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Test Steps Card */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Steps</CardTitle>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => setAddingStep(true)}
                    disabled={addingStep}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {steps.length === 0 ? (
                  <p className="text-white/60 text-center py-8">
                    No test steps defined yet
                  </p>
                ) : (
                  steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="border border-white/10 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            {isEditing && (
                              <GripVertical className="w-4 h-4 text-white/60" />
                            )}
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-500">
                              {step.stepNumber}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div>
                              <h5 className="text-xs font-medium text-white/60 mb-1">
                                Action
                              </h5>
                              {isEditing ? (
                                <Input
                                  value={step.action}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                    const updated = steps.map(s =>
                                      s.stepNumber === step.stepNumber
                                        ? { ...s, action: e.target.value }
                                        : s
                                    );
                                    setSteps(updated);
                                  }}
                                  placeholder="Enter action"
                                />
                              ) : (
                                <p className="text-white/90">{step.action}</p>
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-white/60 mb-1">
                                Expected Result
                              </h5>
                              {isEditing ? (
                                <Input
                                  value={step.expectedResult}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                    const updated = steps.map(s =>
                                      s.stepNumber === step.stepNumber
                                        ? { ...s, expectedResult: e.target.value }
                                        : s
                                    );
                                    setSteps(updated);
                                  }}
                                  placeholder="Enter expected result"
                                />
                              ) : (
                                <p className="text-white/90">{step.expectedResult}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStep(step.stepNumber)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {addingStep && (
                  <div className="border border-blue-500/50 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Action</Label>
                      <Input
                        variant="glass"
                        value={newStep.action}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                          setNewStep({ ...newStep, action: e.target.value })
                        }
                        placeholder="Enter action"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Result</Label>
                      <Input
                        variant="glass"
                        value={newStep.expectedResult}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                          setNewStep({ ...newStep, expectedResult: e.target.value })
                        }
                        placeholder="Enter expected result"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="glass-primary" onClick={handleAddStep}>
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={() => {
                          setAddingStep(false);
                          setNewStep({ action: '', expectedResult: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
                    {testCase.createdBy.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white/90 text-sm">{testCase.createdBy.name}</p>
                    <p className="text-white/60 text-xs">{testCase.createdBy.email}</p>
                  </div>
                </div>
              </div>

              {testCase.suite && (
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-1">
                    Test Suite
                  </h4>
                  <Badge variant="outline">{testCase.suite.name}</Badge>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-white/60 mb-1">
                  Statistics
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-white/90">
                    <span>Test Runs</span>
                    <span>{testCase._count.results}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Comments</span>
                    <span>{testCase._count.comments}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Attachments</span>
                    <span>{testCase._count.attachments}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white/60 mb-1">
                  Created
                </h4>
                <p className="text-white/90 text-sm">
                  {new Date(testCase.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white/60 mb-1">
                  Last Updated
                </h4>
                <p className="text-white/90 text-sm">
                  {new Date(testCase.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent variant="glass">
          <DialogHeader>
            <DialogTitle>Delete Test Case</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{testCase.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="glass"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="glass-destructive" onClick={handleDeleteTestCase}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
