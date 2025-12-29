import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

interface User {
  userId: number;
  username: string;
  role: string;
  token?: string;
  fullName?: string;
  phoneNumber?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }) => {
    const response = await api.post('/api/auth/signin', { username, password });
    const user = response.data;
    const token = user.token;

    // Debug: Log response data
    console.log('Login response data:', user);
    console.log('Extracted token:', token);

    // Store token in localStorage
    if (token) {
      localStorage.setItem('token', token);
    }

    return { user, token };
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await api.post('/api/auth/signout');
    localStorage.removeItem('token');
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    console.log('getCurrentUser - Making API call to /api/auth/me');
    try {
      const response = await api.get('/api/auth/me');
      console.log('getCurrentUser - API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getCurrentUser - API call failed:', error);
      throw error;
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: { fullName?: string; phoneNumber?: string }) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: { payload: { user: User; token: string } }) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('Login fulfilled - setting user:', action.payload.user);
        console.log('Login fulfilled - setting token:', action.payload.token);
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        console.log('getCurrentUser.fulfilled - User data:', action.payload);
        state.isLoading = false;
        state.user = action.payload;
        // Preserve the token from localStorage if it exists
        const token = localStorage.getItem('token');
        if (token) {
          state.token = token;
        }
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        console.log('getCurrentUser.rejected - Error:', action.error.message);
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get user data';
        // If we can't get user data, clear the token and allow retry
        localStorage.removeItem('token');
        sessionStorage.removeItem('authInitialized'); // Allow retry
        state.token = null;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Profile update failed';
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
