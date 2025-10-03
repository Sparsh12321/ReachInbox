import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

// Custom hook for authentication
export const useAuth = () => {
  const queryClient = useQueryClient();

  // Query to get current user
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: Infinity,
    enabled: !!localStorage.getItem('authToken'),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });

  // Wrapper functions that return the full result
  const loginWrapper = async (credentials) => {
    const result = await loginMutation.mutateAsync(credentials);
    return result;
  };

  const registerWrapper = async (userData) => {
    const result = await registerMutation.mutateAsync(userData);
    return result;
  };

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    login: loginWrapper,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerWrapper,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};

