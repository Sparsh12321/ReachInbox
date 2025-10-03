import { useDispatch } from 'react-redux';
import { addAccountToList, setActiveAccount } from '../store/slices/accountsSlice';
import { useAuth } from './useAuth';

export function useLoginSubmit() {
  const dispatch = useDispatch();
  const { login, isLoggingIn, loginError } = useAuth();

  const submitLogin = async (formData) => {
    const result = await login(formData);

    if (result?.account) {
      const accountData = {
        id: result.account._id,
        name: result.account.imap_user.split('@')[0],
        email: result.account.imap_user,
        avatar: result.account.imap_user.charAt(0).toUpperCase(),
        isActive: true,
      };
      dispatch(addAccountToList(accountData));
      dispatch(setActiveAccount(accountData.id));
    }

    return result;
  };

  return { submitLogin, isLoggingIn, loginError };
}
