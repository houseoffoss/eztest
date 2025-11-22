'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
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
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';

interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

interface TestSuite {
  id: string;
  name: string;
  parentId: string | null;
  children?: TestSuite[];
}

interface Project {
  id: string;
  name: string;
  key: string;
}

export default function NewTestCasePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const suiteIdFromQuery = searchParams.get('suiteId');

  const [project, setProject] = useState<Project | null>(null);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    estimatedTime: '',
    preconditions: '',
    postconditions: '',
    suiteId: suiteIdFromQuery || '',
  });

  // Steps state
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [newStep, setNewStep] = useState({ action: '', expectedResult: '' });
  const [addingStep, setAddingStep] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchTestSuites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `New Test Case - ${project.name} | EZTest`;
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.data) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTestSuites = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/testsuites`);
      const data = await response.json();
      if (data.data) {
        setTestSuites(data.data);
      }
    } catch (error) {
      console.error('Error fetching test suites:', error);
    }
  };

  const handleAddStep = () => {
    if (!newStep.action || !newStep.expectedResult) {
      alert('Please fill in both action and expected result');
      return;
    }

    const maxStepNumber =
      steps.length > 0 ? Math.max(...steps.map((s) => s.stepNumber)) : 0;

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
    const filtered = steps.filter((s) => s.stepNumber !== stepNumber);
    // Renumber remaining steps
    const renumbered = filtered.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
    }));
    setSteps(renumbered);
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert('Test case title is required');
      return;
    }

    try {
      setLoading(true);

      const estimatedTime = formData.estimatedTime
        ? parseInt(formData.estimatedTime)
        : undefined;

      // Create test case
      const response = await fetch(`/api/projects/${projectId}/testcases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedTime,
          suiteId: formData.suiteId || null,
        }),
      });

      const data = await response.json();

      if (data.data) {
        const testCaseId = data.data.id;

        // Add steps if any
        if (steps.length > 0) {
          await fetch(`/api/testcases/${testCaseId}/steps`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ steps }),
          });
        }

        // Redirect to the test case detail page
        router.push(`/projects/${projectId}/testcases/${testCaseId}`);
      } else {
        alert(data.error || 'Failed to create test case');
      }
    } catch (error) {
      console.error('Error creating test case:', error);
      alert('Failed to create test case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        items={[
          { label: 'Overview', href: `/projects/${projectId}` },
          { label: 'Test Suites', href: `/projects/${projectId}/testsuites` },
          { label: 'Test Cases', href: `/projects/${projectId}/testcases` },
          { label: 'Test Runs', href: `/projects/${projectId}/testruns` },
          { label: 'Members', href: `/projects/${projectId}/members` },
          { label: 'Settings', href: `/projects/${projectId}/settings` },
        ]}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Projects', href: '/projects' },
              {
                label: project?.name || 'Loading...',
                href: `/projects/${projectId}`,
              },
              {
                label: 'Test Cases',
                href: `/projects/${projectId}/testcases`,
              },
              { label: 'New Test Case' },
            ]}
          />
        }
        actions={
          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="glass-destructive"
              size="sm"
              className="px-5"
            >
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
            onClick={() => router.push(`/projects/${projectId}/testcases`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Test Cases
          </Button>

          <div className="flex items-center gap-3 mb-2">
            {project && (
              <Badge
                variant="outline"
                className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5"
              >
                {project.key}
              </Badge>
            )}
            <h1 className="text-2xl font-bold text-white/90">Create New Test Case</h1>
          </div>
          {project && (
            <p className="text-white/60 text-sm">{project.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    variant="glass"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter test case title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    variant="glass"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Enter test case description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
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

                  <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">
                    Estimated Time (minutes)
                  </Label>
                  <Input
                    id="estimatedTime"
                    variant="glass"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setFormData({
                        ...formData,
                        estimatedTime: e.target.value,
                      })
                    }
                    placeholder="Enter estimated time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suiteId">Test Suite (Optional)</Label>
                  <Select
                    value={formData.suiteId || 'NONE'}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, suiteId: value === 'NONE' ? '' : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test suite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      {testSuites
                        .filter((s) => !s.parentId)
                        .map((suite) => (
                          <SelectItem key={suite.id} value={suite.id}>
                            {suite.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preconditions">Preconditions</Label>
                  <Textarea
                    id="preconditions"
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
                  <Label htmlFor="postconditions">Postconditions</Label>
                  <Textarea
                    id="postconditions"
                    variant="glass"
                    value={formData.postconditions}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setFormData({
                        ...formData,
                        postconditions: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Enter postconditions"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Test Steps Card */}
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Test Steps</CardTitle>
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => setAddingStep(true)}
                    disabled={addingStep}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.length === 0 && !addingStep ? (
                    <p className="text-white/60 text-center py-8">
                      No test steps defined yet
                    </p>
                  ) : (
                    steps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="border border-white/10 rounded-lg p-4 space-y-2 bg-white/5 backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-white/60" />
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-400">
                                {step.stepNumber}
                              </div>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div>
                                <h5 className="text-xs font-medium text-white/60 mb-1">
                                  Action
                                </h5>
                                <p className="text-white/90">{step.action}</p>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-white/60 mb-1">
                                  Expected Result
                                </h5>
                                <p className="text-white/90">
                                  {step.expectedResult}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => handleRemoveStep(step.stepNumber)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}

                  {addingStep && (
                    <div className="border border-blue-500/50 rounded-lg p-4 space-y-3 bg-blue-500/5">
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
                            setNewStep({
                              ...newStep,
                              expectedResult: e.target.value,
                            })
                          }
                          placeholder="Enter expected result"
                        />
                      </div>
                      <div className="flex gap-2">
                        <ButtonPrimary size="sm" onClick={handleAddStep}>
                          Add
                        </ButtonPrimary>
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
            {/* Actions Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ButtonPrimary
                  className="w-full"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Test Case'}
                </ButtonPrimary>
                <Button
                  variant="glass"
                  className="w-full"
                  onClick={() =>
                    router.push(`/projects/${projectId}/testcases`)
                  }
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70 space-y-2">
                <p>• Use a clear and descriptive title</p>
                <p>• Break down complex tests into multiple steps</p>
                <p>• Define preconditions and postconditions</p>
                <p>• Set appropriate priority based on criticality</p>
                <p>• Organize test cases using test suites</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
