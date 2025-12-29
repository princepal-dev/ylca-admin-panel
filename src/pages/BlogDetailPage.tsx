import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogById, deleteBlogImage } from '../store/slices/blogSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Calendar, User, Image as ImageIcon, Download } from 'lucide-react';
import { toast } from 'sonner';

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBlog, isLoading, error } = useAppSelector((state) => state.blogs);
  const { user } = useAppSelector((state) => state.auth);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(parseInt(id)));
    }
  }, [dispatch, id]);

  const handleDeleteImage = async () => {
    if (deleteImageId) {
      try {
        await dispatch(deleteBlogImage(deleteImageId)).unwrap();
        toast.success('Image deleted successfully');
        setDeleteImageId(null);
        // Refresh blog data
        if (id) {
          dispatch(fetchBlogById(parseInt(id)));
        }
      } catch (error) {
        toast.error('Failed to delete image');
      }
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

  const downloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !currentBlog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/blogs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive">
                {error || 'Blog not found'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/blogs')}
              >
                Return to Blogs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = user?.role === 'ROLE_ADMIN' ||
    (user?.role === 'ROLE_COLLABORATOR' && currentBlog.author.userId === user.userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/blogs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{currentBlog.title}</h1>
            <p className="text-muted-foreground">
              Blog details and management
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link to={`/blogs/${currentBlog.blogId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Blog
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Blog Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Content</CardTitle>
              <CardDescription>
                The full content of the blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none dark:prose-invert rich-text-editor"
                dangerouslySetInnerHTML={{ __html: currentBlog.description }}
              />
            </CardContent>
          </Card>

          {/* Images */}
          {currentBlog.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Images ({currentBlog.images.length})
                </CardTitle>
                <CardDescription>
                  Images associated with this blog post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentBlog.images
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((image) => (
                    <div key={image.imageId} className="space-y-2">
                      <div className="relative group">
                        <img
                          src={image.fileUrl}
                          alt={image.fileName}
                          className="w-full h-48 object-cover rounded-md border"
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => downloadImage(image.fileUrl, image.fileName)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => setDeleteImageId(image.imageId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this image? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteImage}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>File: {image.fileName}</p>
                        <p>Size: {(image.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                        <p>Order: {image.displayOrder}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Author</p>
                  <p className="text-sm text-muted-foreground">
                    {currentBlog.author.fullName || currentBlog.author.username}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(currentBlog.createdAt)}
                  </p>
                </div>
              </div>

              {currentBlog.updatedAt !== currentBlog.createdAt && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(currentBlog.updatedAt)}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Images</p>
                  <Badge variant="secondary">{currentBlog.images.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={`/blogs/${currentBlog.blogId}/edit`}>
                  <Button className="w-full" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Blog
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteImage}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogDetailPage;
