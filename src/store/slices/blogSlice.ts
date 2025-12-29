import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface BlogImage {
  imageId: number;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  displayOrder: number;
  createdAt: string;
}

interface BlogAuthor {
  userId: number;
  username: string;
  fullName?: string;
}

interface Blog {
  blogId: number;
  title: string;
  description: string;
  author: BlogAuthor;
  images: BlogImage[];
  createdAt: string;
  updatedAt: string;
}

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 0,
};

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async ({ page = 0, size = 10 }: { page?: number; size?: number } = {}) => {
    const response = await api.get(`/api/blogs?page=${page}&size=${size}`);
    return response.data;
  }
);

export const fetchBlogById = createAsyncThunk(
  'blogs/fetchBlogById',
  async (blogId: number) => {
    const response = await api.get(`/api/blogs/${blogId}`);
    return response.data;
  }
);

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (blogData: { title: string; description: string }) => {
    const response = await api.post('/api/blogs', blogData);
    return response.data;
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ blogId, blogData }: { blogId: number; blogData: { title: string; description: string } }) => {
    const response = await api.put(`/api/blogs/${blogId}`, blogData);
    return response.data;
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (blogId: number) => {
    await api.delete(`/api/blogs/${blogId}`);
    return blogId;
  }
);

export const uploadBlogImages = createAsyncThunk(
  'blogs/uploadImages',
  async ({ blogId, files, displayOrders }: { blogId: number; files: File[]; displayOrders?: number[] }) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (displayOrders) {
      displayOrders.forEach(order => formData.append('displayOrders', order.toString()));
    }

    const response = await api.post(`/api/blogs/${blogId}/images/multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { blogId, images: response.data };
  }
);

export const deleteBlogImage = createAsyncThunk(
  'blogs/deleteImage',
  async (imageId: number) => {
    await api.delete(`/api/blogs/images/${imageId}`);
    return imageId;
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBlog: (state, action) => {
      state.currentBlog = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.content || action.payload;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.pageable?.pageNumber || 0;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch blogs';
      })
      // Fetch single blog
      .addCase(fetchBlogById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch blog';
      })
      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create blog';
      })
      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.blogs.findIndex(blog => blog.blogId === action.payload.blogId);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        if (state.currentBlog?.blogId === action.payload.blogId) {
          state.currentBlog = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update blog';
      })
      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = state.blogs.filter(blog => blog.blogId !== action.payload);
        if (state.currentBlog?.blogId === action.payload) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete blog';
      })
      // Upload images
      .addCase(uploadBlogImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadBlogImages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { blogId, images } = action.payload;
        const blogIndex = state.blogs.findIndex(blog => blog.blogId === blogId);
        if (blogIndex !== -1) {
          state.blogs[blogIndex].images.push(...images);
        }
        if (state.currentBlog?.blogId === blogId) {
          state.currentBlog.images.push(...images);
        }
      })
      .addCase(uploadBlogImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to upload images';
      })
      // Delete image
      .addCase(deleteBlogImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBlogImage.fulfilled, (state, action) => {
        state.isLoading = false;
        const imageId = action.payload;
        // Remove from blogs list
        state.blogs.forEach(blog => {
          blog.images = blog.images.filter(img => img.imageId !== imageId);
        });
        // Remove from current blog if exists
        if (state.currentBlog) {
          state.currentBlog.images = state.currentBlog.images.filter(img => img.imageId !== imageId);
        }
      })
      .addCase(deleteBlogImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete image';
      });
  },
});

export const { clearError, setCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;
