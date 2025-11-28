'use client';

import { Badge } from '@/elements/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/elements/card';
import { formatDateTime } from '@/lib/date-utils';

interface ProjectMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface ProjectOverviewCardProps {
  project: {
    key: string;
    description: string | null;
    createdBy: {
      name: string;
    };
    createdAt: string;
    updatedAt: string;
    members: Array<ProjectMember>;
  };
}

export const ProjectOverviewCard = ({ project }: ProjectOverviewCardProps) => {
  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-white">Project Overview</CardTitle>
        <CardDescription className="text-white/70">
          Summary and key information about this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2 text-white">Description</h3>
          <p className="text-white/70">
            {project.description || 'No description provided'}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-white">Project Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60">Project Key</span>
              <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary">
                {project.key}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60">Created By</span>
              <span className="font-medium text-white">{project.createdBy.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60">Created On</span>
              <span className="font-medium text-white">
                {formatDateTime(project.createdAt)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60">Last Updated</span>
              <span className="font-medium text-white">
                {formatDateTime(project.updatedAt)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/60">Team Size</span>
              <span className="font-medium text-white">{project.members.length} members</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
