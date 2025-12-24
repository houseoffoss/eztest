import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import { GlassPanel } from '@/frontend/reusable-components/layout/GlassPanel';

interface ProfileInformationProps {
  profileData: {
    name: string;
    email: string;
    bio: string;
    phone: string;
    role: string;
  };
  isEditing: boolean;
  onEdit: (state: boolean) => void;
  onProfileChange: (field: string, value: string) => void;
}

export function ProfileInformation({
  profileData,
  isEditing,
  onEdit,
  onProfileChange,
}: ProfileInformationProps) {
  return (
    <GlassPanel
      heading="Profile Information"
      action={
        <Button
          size="sm"
          variant={isEditing ? 'glass' : 'glass-primary'}
          onClick={() => onEdit(!isEditing)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      }
      contentClassName="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/80">Full Name</Label>
          <Input
            id="name"
            variant="glass"
            value={profileData.name}
            onChange={(e) => onProfileChange('name', e.target.value)}
            disabled={!isEditing}
            className="disabled:opacity-60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">Email Address</Label>
          <Input
            id="email"
            variant="glass"
            type="email"
            value={profileData.email}
            onChange={(e) => onProfileChange('email', e.target.value)}
            disabled={!isEditing}
            className="disabled:opacity-60"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white/80">Phone Number</Label>
        <Input
          id="phone"
          variant="glass"
          type="tel"
          value={profileData.phone}
          onChange={(e) => onProfileChange('phone', e.target.value)}
          disabled={!isEditing}
          className="disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-white/80">Bio</Label>
        <Textarea
          id="bio"
          variant="glass"
          value={profileData.bio}
          onChange={(e) => onProfileChange('bio', e.target.value)}
          disabled={!isEditing}
          rows={3}
          className="disabled:opacity-60"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-white/80">Role</Label>
        <Input
          id="role"
          variant="glass"
          value={profileData.role}
          disabled
          className="disabled:opacity-60 cursor-not-allowed"
          title="Role cannot be changed. Contact an administrator to modify your role."
        />
        <p className="text-xs text-muted-foreground">Role cannot be changed. Contact an administrator to modify your role.</p>
      </div>
    </GlassPanel>
  );
}
