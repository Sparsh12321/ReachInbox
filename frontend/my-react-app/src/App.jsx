import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store/store';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import { useAuth } from './hooks/useAuth';

// ============================================
// 🔧 DEVELOPMENT MODE - Toggle Login State
// ============================================
// 
// Since there's no login API yet, use this variable to control authentication:
//
// DEV_MODE_SKIP_AUTH = true  → Skip authentication, go directly to /home
// DEV_MODE_SKIP_AUTH = false → Require login through /login page
//
// Usage:
// 1. Set to `true` to work on the main app without logging in
// 2. Set to `false` when you want to test the login/register flow
// 3. Once you have a real API, set to `false` and remove this variable
//
const DEV_MODE_SKIP_AUTH = true;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // In dev mode, skip authentication check
  if (DEV_MODE_SKIP_AUTH) {
    return children;
  }
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to={DEV_MODE_SKIP_AUTH ? "/home" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

function App() {
  // Log dev mode status
  React.useEffect(() => {
    if (DEV_MODE_SKIP_AUTH) {
      console.log(
        '%c🔧 DEV MODE: Authentication is bypassed',
        'background: #4CAF50; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold;'
      );
      console.log(
        '%cTo enable authentication, set DEV_MODE_SKIP_AUTH to false in App.jsx',
        'color: #666; font-style: italic;'
      );
    }
  }, []);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
