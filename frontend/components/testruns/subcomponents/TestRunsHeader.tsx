import { Badge } from '@/elements/badge';

interface TestRunsHeaderProps {
  project: {
    key: string;
    name: string;
  } | null;
  onCreateClick?: () => void;
}

export function TestRunsHeader({ project }: TestRunsHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        {project && (
          <Badge
            variant="outline"
            className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5"
          >
            {project.key}
          </Badge>
        )}
        <h1 className="text-2xl font-bold text-white">Test Runs</h1>
      </div>
      {project && <p className="text-white/70 text-sm mb-2">{project.name}</p>}
    </div>
  );
}
