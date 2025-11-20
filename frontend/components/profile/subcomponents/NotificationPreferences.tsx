import { Switch } from '@/elements/switch';
import { GlassPanel } from '@/components/design/GlassPanel';

interface NotificationSettingsProps {
  settings: {
    emailNotifications: boolean;
    testRunUpdates: boolean;
    weeklyDigest: boolean;
    projectInvites: boolean;
  };
  onSettingChange: (key: string, value: boolean) => void;
}

export function NotificationPreferences({
  settings,
  onSettingChange,
}: NotificationSettingsProps) {
  return (
    <GlassPanel heading="Notification Preferences" contentClassName="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex-1">
            <div className="text-white font-medium">Email Notifications</div>
            <div className="text-white/60 text-sm">Receive important updates via email</div>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) =>
              onSettingChange('emailNotifications', checked)
            }
            variant="glass"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex-1">
            <div className="text-white font-medium">Test Run Updates</div>
            <div className="text-white/60 text-sm">Get notified when test runs complete</div>
          </div>
          <Switch
            checked={settings.testRunUpdates}
            onCheckedChange={(checked) =>
              onSettingChange('testRunUpdates', checked)
            }
            variant="glass"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex-1">
            <div className="text-white font-medium">Weekly Digest</div>
            <div className="text-white/60 text-sm">Receive a summary of your testing activity</div>
          </div>
          <Switch
            checked={settings.weeklyDigest}
            onCheckedChange={(checked) =>
              onSettingChange('weeklyDigest', checked)
            }
            variant="glass"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex-1">
            <div className="text-white font-medium">Project Invites</div>
            <div className="text-white/60 text-sm">Be notified of new project invitations</div>
          </div>
          <Switch
            checked={settings.projectInvites}
            onCheckedChange={(checked) =>
              onSettingChange('projectInvites', checked)
            }
            variant="glass"
          />
        </div>
      </div>
    </GlassPanel>
  );
}
