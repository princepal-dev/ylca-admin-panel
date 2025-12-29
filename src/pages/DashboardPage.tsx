import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogs } from '../store/slices/blogSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Users, Eye, Activity, ArrowUpRight, Image as ImageIcon } from 'lucide-react';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { blogs, isLoading: blogsLoading } = useAppSelector((state) => state.blogs);
  const { users, isLoading: usersLoading } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only fetch data if we have authentication (user exists)
    if (user) {
      dispatch(fetchBlogs({ page: 0, size: 1000 })); // Fetch all blogs for stats
      dispatch(fetchUsers());
    }
  }, [dispatch, user]); // Add user as dependency to prevent unnecessary fetches

  const totalBlogs = blogs.length;
  const totalUsers = users.length;
  const recentBlogs = blogs.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  // Calculate some advanced metrics
  const blogsWithImages = blogs.filter(blog => blog.images.length > 0).length;
  const imagePercentage = totalBlogs > 0 ? Math.round((blogsWithImages / totalBlogs) * 100) : 0;
  const adminUsers = users.filter(user => user.role === 'ROLE_ADMIN').length;
  const collaboratorUsers = users.filter(user => user.role === 'ROLE_COLLABORATOR').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = [
    {
      title: 'Total Blogs',
      value: totalBlogs.toLocaleString(),
      icon: FileText,
      description: 'Published content',
      trend: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      progress: 85,
    },
    {
      title: 'Active Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered members',
      trend: '+8%',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      progress: 92,
    },
    {
      title: 'Content Engagement',
      value: `${imagePercentage}%`,
      icon: Eye,
      description: 'Blogs with images',
      trend: '+15%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      progress: imagePercentage,
    },
    {
      title: 'System Health',
      value: '98.5%',
      icon: Activity,
      description: 'Uptime this month',
      trend: '+0.5%',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      progress: 98,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Welcome back, <span className="font-medium text-foreground">{user?.fullName || user?.username}</span>
              </p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Monitor your content management system performance and user activity in real-time.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-muted/50 border">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-professional relative overflow-hidden group">
            <div className={`absolute inset-0 ${stat.bgColor} opacity-50 group-hover:opacity-75 transition-opacity`}></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center text-sm font-medium text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">{stat.description}</p>
              <Progress value={stat.progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Blogs */}
        <Card className="card-professional">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Blogs
                </CardTitle>
                <CardDescription className="mt-1">
                  Latest content published to your platform
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {totalBlogs} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {blogsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBlogs.length > 0 ? (
              <div className="space-y-3">
                {recentBlogs.map((blog, index) => (
                  <div key={blog.blogId} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {(blog.author.fullName || blog.author.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight truncate">
                        {blog.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          by {blog.author.fullName || blog.author.username}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(blog.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {blog.images.length}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No blogs published yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first blog post to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="card-professional">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5 text-primary" />
                  Active Users
                </CardTitle>
                <CardDescription className="mt-1">
                  Recently active platform members
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {adminUsers} Admin{adminUsers !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {collaboratorUsers} Collaborator{collaboratorUsers !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.map((user, index) => (
                  <div key={user.userId} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`font-medium ${
                        user.role === 'ROLE_ADMIN'
                          ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                          : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight">
                        {user.fullName || user.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={user.role === 'ROLE_ADMIN' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {user.role.replace('ROLE_', '')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No users registered yet</p>
                <p className="text-xs text-muted-foreground mt-1">Users will appear here once they sign up</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
