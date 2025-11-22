'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/elements/card';
import { Badge } from '@/elements/badge';
import { TopBar } from '@/components/design/TopBar';
import { Mail, MapPin, Phone, Calendar, Briefcase, User } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  role: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const data = await response.json();
        setUser(data.data);
        document.title = `${data.data.name} - Profile | EZTest`;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628]">
        <TopBar breadcrumbs={[{ label: 'Profile' }]} />
        <div className="max-w-4xl mx-auto px-8 pt-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0a1628]">
        <TopBar breadcrumbs={[{ label: 'Profile' }]} />
        <div className="max-w-4xl mx-auto px-8 pt-8">
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-white/70 mb-4">{error || 'User not found'}</p>
              <ButtonPrimary onClick={() => router.back()}>
                Go Back
              </ButtonPrimary>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <TopBar
        breadcrumbs={[
          { label: 'Users' },
          { label: user.name },
        ]}
      />

      <div className="max-w-4xl mx-auto px-8 pt-8 pb-8">
        {/* Profile Header Card */}
        <Card variant="glass" className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-5xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {user.role.name}
                  </Badge>
                </div>

                <div className="space-y-2 text-white/70">
                  {user.email && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Mail className="w-4 h-4 text-primary" />
                      <a href={`mailto:${user.email}`} className="hover:text-white transition-colors">
                        {user.email}
                      </a>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${user.phone}`} className="hover:text-white transition-colors">
                        {user.phone}
                      </a>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 justify-center md:justify-start text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        {user.bio && (
          <Card variant="glass" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Profile Information */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription className="text-white/70">
              Basic account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/60 mb-1">Full Name</div>
                <div className="text-lg font-medium text-white">{user.name}</div>
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Email Address</div>
                <div className="text-lg font-medium text-white">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Role</div>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                  {user.role.name}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Member Since</div>
                <div className="text-lg font-medium text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              {user.phone && (
                <div>
                  <div className="text-sm text-white/60 mb-1">Phone</div>
                  <div className="text-lg font-medium text-white">{user.phone}</div>
                </div>
              )}
              {user.location && (
                <div>
                  <div className="text-sm text-white/60 mb-1">Location</div>
                  <div className="text-lg font-medium text-white">{user.location}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button onClick={() => router.back()} variant="glass">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
