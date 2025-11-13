'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Users, TestTube2, Play, FileText, Folder, BarChart3 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }>;
  _count: {
    testCases: number;
    testRuns: number;
    testSuites: number;
    requirements: number;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}?stats=true`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading project...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground">Project not found</p>
              <Button onClick={() => router.push('/projects')} className="mt-4">
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="font-mono">
                  {project.key}
                </Badge>
                <h1 className="text-3xl font-bold text-[#033977]">{project.name}</h1>
              </div>
              {project.description && (
                <p className="text-muted-foreground mb-3">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>
                  Created by <span className="font-semibold">{project.createdBy.name}</span>
                </div>
                <div>•</div>
                <div>
                  Last updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}/members`)}
              >
                <Users className="w-4 h-4 mr-2" />
                Members
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}/settings`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TestTube2 className="w-4 h-4" />
                Test Cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#033977]">
                {project._count.testCases}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Test Runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#033977]">
                {project._count.testRuns}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Test Suites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#033977]">
                {project._count.testSuites}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#033977]">
                {project._count.requirements}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Team Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>
                  Summary and key information about this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {project.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {project._count.testCases}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Test Cases</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {project._count.testRuns}
                      </div>
                      <div className="text-sm text-muted-foreground">Test Runs Executed</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {project._count.testSuites}
                      </div>
                      <div className="text-sm text-muted-foreground">Test Suites</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {project._count.requirements}
                      </div>
                      <div className="text-sm text-muted-foreground">Requirements</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Project Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Project Key</span>
                      <Badge variant="outline" className="font-mono">{project.key}</Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Created By</span>
                      <span className="font-medium">{project.createdBy.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Created On</span>
                      <span className="font-medium">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Team Size</span>
                      <span className="font-medium">{project.members.length} members</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members ({project.members.length})</CardTitle>
                <CardDescription>
                  People who have access to this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#033977] text-white flex items-center justify-center text-lg font-semibold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{member.user.name}</h4>
                            <Badge variant="outline">{member.role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => router.push(`/projects/${projectId}/members`)}
                    variant="outline"
                  >
                    Manage Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
