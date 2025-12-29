import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { store } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import { useAppDispatch } from './hooks/redux';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              There was an error initializing the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPage from './pages/EditBlogPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';


// Initialize auth state from localStorage
const AuthInitializer = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const authInitialized = sessionStorage.getItem('authInitialized');

      console.log('AuthInitializer - Token:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('AuthInitializer - User:', user);
      console.log('AuthInitializer - Auth initialized:', authInitialized);
      console.log('AuthInitializer - Is loading:', isLoading);

      // If we have a token but no user data (and we're not currently loading), fetch the current user
      if (token && !user && !isLoading) {
        if (!authInitialized) {
          console.log('AuthInitializer - First time initialization, fetching current user data');
          sessionStorage.setItem('authInitialized', 'true');
          dispatch(getCurrentUser());
        } else {
          console.log('AuthInitializer - Auth was initialized but user is still null, clearing flag to retry');
          sessionStorage.removeItem('authInitialized');
          // Retry after a short delay to avoid infinite loops
          setTimeout(() => {
            console.log('AuthInitializer - Retrying getCurrentUser');
            sessionStorage.setItem('authInitialized', 'true');
            dispatch(getCurrentUser());
          }, 1000);
        }
      }
    } catch (error) {
      console.error('AuthInitializer - Error during initialization:', error);
    }
  }, [dispatch, user, isLoading]);

  return null;
};

// Simple auth check component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Provider store={store}>
          <AuthInitializer />
          <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/blogs" element={<BlogsPage />} />
                        <Route path="/blogs/create" element={<CreateBlogPage />} />
                        <Route path="/blogs/:id" element={<BlogDetailPage />} />
                        <Route path="/blogs/:id/edit" element={<EditBlogPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </Provider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
