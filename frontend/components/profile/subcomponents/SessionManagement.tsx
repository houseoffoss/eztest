import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { GlassPanel } from '@/components/design/GlassPanel';

export function SessionManagement() {
  return (
    <GlassPanel heading="Session Management" contentClassName="space-y-4">
      <div className="space-y-3">
        <div className="p-3 rounded-lg border border-white/10 bg-white/5">
          <div className="text-white font-medium mb-2">Active Sessions: 2</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/70">This Browser</span>
              <Badge variant="glass-success" className="rounded-full text-xs">Current</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Safari on iPhone</span>
              <Badge variant="glass" className="rounded-full text-xs cursor-pointer hover:bg-white/15">Remove</Badge>
            </div>
          </div>
        </div>
        <Button variant="glass-destructive" className="w-full rounded-lg">Sign Out All Sessions</Button>
      </div>
    </GlassPanel>
  );
}
