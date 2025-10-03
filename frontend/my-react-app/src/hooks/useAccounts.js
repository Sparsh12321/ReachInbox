import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { accountsApi } from '../api/accountsApi';
import { setAccounts, setActiveAccount, setError } from '../store/slices/accountsSlice';

export const useAccounts = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Fetch all accounts
  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const accounts = await accountsApi.getAllAccounts();
      dispatch(setAccounts(accounts));
      return accounts;
    },
    staleTime: 30000, // 30 seconds
  });

  // Switch account mutation
  const switchAccountMutation = useMutation({
    mutationFn: accountsApi.switchAccount,
    onSuccess: (data, accountId) => {
      dispatch(setActiveAccount(accountId));
      // Invalidate emails query to refetch for new account
      queryClient.invalidateQueries(['emails']);
      // Refetch after a delay to allow backend to index emails
      setTimeout(() => {
        console.log('🔄 Refetching emails after account switch...');
        queryClient.invalidateQueries(['emails']);
      }, 2000);
      console.log('✅ Switched account:', data.message);
    },
    onError: (error) => {
      console.error('❌ Failed to switch account:', error);
      dispatch(setError(error.message));
    },
  });

  return {
    accounts,
    isLoading,
    error,
    refetch,
    switchAccount: switchAccountMutation.mutateAsync,
    isSwitching: switchAccountMutation.isPending,
  };
};

