'use client';

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
import { Clock } from 'lucide-react';
import { TestCase, TestCaseFormData } from '../types';

interface TestCaseDetailsCardProps {
  testCase: TestCase;
  isEditing: boolean;
  formData: TestCaseFormData;
  testSuites?: any[];
  onFormChange: (data: TestCaseFormData) => void;
}

export function TestCaseDetailsCard({
  testCase,
  isEditing,
  formData,
  testSuites = [],
  onFormChange,
}: TestCaseDetailsCardProps) {
  return (
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
                  onFormChange({ ...formData, description: e.target.value })
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
                    onFormChange({ ...formData, priority: value })
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
                    onFormChange({ ...formData, status: value })
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
              <Label>Test Suite</Label>
              <Select
                value={formData.suiteId || 'null'}
                onValueChange={(value: string) =>
                  onFormChange({ ...formData, suiteId: value === 'null' ? null : value })
                }
              >
                <SelectTrigger variant="glass">
                  <SelectValue placeholder="Select a test suite" />
                </SelectTrigger>
                <SelectContent variant="glass">
                  <SelectItem value="null">None</SelectItem>
                  {testSuites.map((suite) => (
                    <SelectItem key={suite.id} value={suite.id}>
                      {suite.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estimated Time (minutes)</Label>
              <Input
                variant="glass"
                type="number"
                value={formData.estimatedTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  onFormChange({ ...formData, estimatedTime: e.target.value })
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
                  onFormChange({ ...formData, preconditions: e.target.value })
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
                  onFormChange({ ...formData, postconditions: e.target.value })
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
  );
}
