'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, Plus } from 'lucide-react';

interface EmptyProjectsStateProps {
  onCreateProject: () => void;
}

export const EmptyProjectsState = ({ onCreateProject }: EmptyProjectsStateProps) => {
  return (
    <Card variant="glass" className="border-dashed border-2 border-white/20">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Folder className="w-16 h-16 text-white/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">No projects yet</h3>
        <p className="text-white/60 mb-6 text-center max-w-sm">
          Get started by creating your first project to organize test cases and track testing progress.
        </p>
        <Button onClick={onCreateProject} variant="glass-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Project
        </Button>
      </CardContent>
    </Card>
  );
};
