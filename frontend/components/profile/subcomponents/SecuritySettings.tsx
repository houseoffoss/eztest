import { useState } from 'react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Separator } from '@/frontend/reusable-elements/separators/Separator';
import { GlassPanel } from '@/frontend/reusable-components/layout/GlassPanel';
import { Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/frontend/reusable-elements/switches/Switch';

interface SecuritySettingsProps {
  settings: {
    twoFactor: boolean;
    sessionTimeout: number;
  };
  onSettingChange: (key: string, value: boolean | number) => void;
}

export function SecuritySettings({
  settings,
  onSettingChange,
}: SecuritySettingsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <GlassPanel heading="Security & Privacy" contentClassName="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex-1">
            <div className="text-white font-medium">Two-Factor Authentication</div>
            <div className="text-white/60 text-sm">Add an extra layer of security</div>
          </div>
          <Switch
            checked={settings.twoFactor}
            onCheckedChange={(checked) =>
              onSettingChange('twoFactor', checked)
            }
            variant="glass"
          />
        </div>

        <Separator className="opacity-20" />

        <div className="space-y-2">
          <Label className="text-white/80">Change Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              variant="glass"
              placeholder="New password"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Confirm Password</Label>
          <Input
            type={showPassword ? 'text' : 'password'}
            variant="glass"
            placeholder="Confirm password"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <ButtonPrimary className="rounded-lg">Update Password</ButtonPrimary>
          <Button variant="glass" className="rounded-lg cursor-pointer">Cancel</Button>
        </div>
      </div>
    </GlassPanel>
  );
}
