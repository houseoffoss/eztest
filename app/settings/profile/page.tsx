'use client';

import { useState, useEffect } from 'react';
// removed unused next-auth imports
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/design/GlassPanel';

interface Profile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar?: string;
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: '',
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data.data);
        setFormData({
          name: data.data.name || '',
          bio: data.data.bio || '',
          phone: data.data.phone || '',
          location: data.data.location || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.data);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-8">
            <div className="space-y-4">
              <div className="h-8 bg-primary/10 rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <GlassPanel contentClassName="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-md border border-red-500/40 bg-red-500/10">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-md border border-green-500/40 bg-green-500/10">
                <p className="text-green-300">{success}</p>
              </div>
            )}

            {profile && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 rounded-[10px] bg-secondary/40 text-muted-foreground cursor-not-allowed border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. <Link href="/settings/account" className="text-primary hover:underline">Contact support</Link> for assistance.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder="Tell us about yourself"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Your phone number"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="City, Country"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-border/40">
                  <Button
                    type="submit"
                    disabled={saving}
                    variant="glass-primary"
                    className="w-full rounded-[10px]"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}

            {/* Account Settings Link */}
            <div className="mt-8 pt-8 border-t border-border/40">
              <div className="rounded-lg p-4 border border-primary/30 bg-primary/5">
                <h3 className="font-medium text-foreground mb-2">Account & Security</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Change your password, manage account deletion, or other security settings.
                </p>
                <Link
                  href="/settings/account"
                  className="text-primary hover:text-accent font-medium transition-colors"
                >
                  Go to Account Settings →
                </Link>
              </div>
            </div>
        </GlassPanel>
      </div>
    </div>
  );
}
