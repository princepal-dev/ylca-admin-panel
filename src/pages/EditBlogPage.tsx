import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchBlogById, updateBlog, uploadBlogImages, deleteBlogImage } from '../store/slices/blogSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Upload, X, ArrowLeft, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

const EditBlogPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBlog, isLoading, error } = useAppSelector((state) => state.blogs);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogById(parseInt(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentBlog) {
      setTitle(currentBlog.title);
      setDescription(currentBlog.description);
    }
  }, [currentBlog]);

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImageCount = (currentBlog?.images.length || 0) + newImages.length;
    if (currentImageCount + files.length > 10) {
      toast.error('Maximum 10 images allowed total');
      return;
    }

    const updatedImages = [...newImages, ...files];
    setNewImages(updatedImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(newImagePreviews[index]);

    setNewImages(updatedImages);
    setNewImagePreviews(updatedPreviews);
  };

  const handleDeleteExistingImage = async () => {
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

  const downloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !currentBlog) return;

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (description.length < 150) {
      toast.error('Description must be at least 150 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update blog content
      await dispatch(updateBlog({
        blogId: parseInt(id),
        blogData: {
          title: title.trim(),
          description: description.trim(),
        },
      })).unwrap();

      // Upload new images if any
      if (newImages.length > 0) {
        await dispatch(uploadBlogImages({
          blogId: parseInt(id),
          files: newImages,
        })).unwrap();
      }

      toast.success('Blog updated successfully!');
      navigate(`/blogs/${id}`);
    } catch (error) {
      toast.error('Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []); // Empty dependency array - only run cleanup on unmount

  if (isLoading && !currentBlog) {
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const titleCharCount = title.length;
  // Function to strip HTML tags and count text content
  const getTextContent = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const descriptionCharCount = getTextContent(description).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/blogs/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Blog</h1>
          <p className="text-muted-foreground">
            Update blog content and manage images
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
            <CardDescription>
              Update the basic information for your blog post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-sm text-muted-foreground">
                {titleCharCount}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Write your blog content here..."
              />
              <p className="text-sm text-muted-foreground">
                {descriptionCharCount}/150 minimum characters required
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Existing Images */}
        {currentBlog.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Existing Images ({currentBlog.images.length})</CardTitle>
              <CardDescription>
                Current images associated with this blog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentBlog.images
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((image) => (
                  <div key={image.imageId} className="space-y-2">
                    <div className="relative group">
                      <img
                        src={image.fileUrl}
                        alt={image.fileName}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => downloadImage(image.fileUrl, image.fileName)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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
                              <AlertDialogAction onClick={handleDeleteExistingImage}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p className="truncate">{image.fileName}</p>
                      <p>{(image.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Images */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Images</CardTitle>
            <CardDescription>
              Upload additional images (max {10 - (currentBlog.images.length + newImages.length)} more allowed)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImageUpload}
                className="hidden"
                id="new-image-upload"
              />
              <Label htmlFor="new-image-upload">
                <Button type="button" variant="outline" asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Images
                  </span>
                </Button>
              </Label>
              <p className="text-sm text-muted-foreground">
                {newImages.length} new image{newImages.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`New preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeNewImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/blogs/${id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || description.length < 150}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Blog'
            )}
          </Button>
        </div>
      </form>

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
            <AlertDialogAction onClick={handleDeleteExistingImage}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditBlogPage;
