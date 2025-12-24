import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { GlassPanel } from '@/frontend/reusable-components/layout/GlassPanel';
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/reusable-elements/avatars/Avatar';
import { Shield, Bell, Lock, Upload } from 'lucide-react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';

interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
}

export function ProfileCard({ name, email, role }: ProfileCardProps) {
  return (
    <>
      {/* Profile Card */}
      <GlassPanel heading="Profile" contentClassName="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://i.pravatar.cc/100?img=1" alt={name} />
              <AvatarFallback className="text-lg">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 p-2 bg-primary/80 rounded-full hover:bg-primary transition-colors">
              <Upload className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">{name}</div>
            <div className="text-white/60 text-sm">{email}</div>
            <Badge variant="glass" className="mt-2 rounded-full">
              {role}
            </Badge>
          </div>
        </div>
      </GlassPanel>

      {/* Quick Actions */}
      <GlassPanel heading="Quick Actions" contentClassName="space-y-2">
        <Button variant="glass" className="w-full justify-start rounded-lg">
          <Shield className="w-4 h-4 mr-2" />
          Security
        </Button>
        <Button variant="glass" className="w-full justify-start rounded-lg">
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </Button>
        <Button variant="glass" className="w-full justify-start rounded-lg">
          <Lock className="w-4 h-4 mr-2" />
          Privacy
        </Button>
      </GlassPanel>

      {/* Account Status */}
      <GlassPanel heading="Account Status" contentClassName="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Status</span>
            <Badge variant="glass-success" className="rounded-full">Active</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Member Since</span>
            <span className="text-white/90">Jan 15, 2024</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Last Active</span>
            <span className="text-white/90">2 hours ago</span>
          </div>
        </div>
      </GlassPanel>
    </>
  );
}
