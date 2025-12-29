import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateProfile, getCurrentUser } from '../store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user, error, isLoading } = useAppSelector((state) => state.auth);

  // Debug: Log user data
  console.log('ProfilePage - User data:', user);
  console.log('ProfilePage - Is loading:', isLoading);
  console.log('ProfilePage - Full auth state:', { user, isLoading, error });

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'ROLE_ADMIN' ? 'default' : 'secondary';
  };

  if (!user || !user.username) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Loading profile...</p>
          <p className="text-sm text-muted-foreground">Please wait while we load your profile data.</p>
          <p className="text-xs text-muted-foreground mt-2">If this persists, try logging out and back in.</p>
          <details className="mt-4">
            <summary className="text-xs cursor-pointer">Debug Info</summary>
            <pre className="text-xs mt-2 p-2 bg-muted rounded text-left">
              User: {JSON.stringify(user, null, 2)}
              Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
              Loading: {isLoading}
              Auth Initialized: {sessionStorage.getItem('authInitialized')}
            </pre>
            <button
              onClick={() => {
                console.log('Manual retry triggered');
                sessionStorage.removeItem('authInitialized');
                dispatch(getCurrentUser());
              }}
              className="mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry Load User Data
            </button>
          </details>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.username || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Username cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(user?.role || 'ROLE_USER')}>
                      {(user?.role || 'ROLE_USER').replace('ROLE_', '')}
                    </Badge>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Contact an administrator to change your role
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-2xl font-bold">
                    {(user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">
                  {user?.fullName || user?.username || 'User'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  @{user?.username || 'user'}
                </p>
                <Badge variant={getRoleBadgeVariant(user?.role || 'ROLE_USER')} className="mt-2">
                  {(user?.role || 'ROLE_USER').replace('ROLE_', '')}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.username || 'user'}@ylca.com</span>
                </div>

                {user?.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('ProfilePage error:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading profile</p>
          <p className="text-sm text-muted-foreground">There was an error loading your profile data.</p>
          <p className="text-xs text-muted-foreground mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
};

export default ProfilePage;
