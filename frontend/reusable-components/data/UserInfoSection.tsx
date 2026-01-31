'use client';


export interface UserInfo {
  name: string;
  email?: string;
  avatar?: string;
}

export interface UserInfoSectionProps {
  label: string;
  user: UserInfo;
  avatarGradient?: string;
  className?: string;
}

/**
 * Reusable component for displaying user information with avatar
 * 
 * @example
 * ```tsx
 * <UserInfoSection
 *   label="Created By"
 *   user={{
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *   }}
 * />
 * ```
 */
export function UserInfoSection({
  label,
  user,
  avatarGradient = 'from-blue-500 to-purple-500',
  className = '',
}: UserInfoSectionProps) {
  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-white/60 mb-1">{label}</h4>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-sm font-semibold text-white`}>
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-white/90 text-sm">{user.name}</p>
          {user.email && (
            <p className="text-white/60 text-xs">{user.email}</p>
          )}
        </div>
      </div>
    </div>
  );
}

