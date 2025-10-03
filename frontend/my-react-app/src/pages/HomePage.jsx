import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
import { 
  setSelectedEmail, 
  clearSelectedEmail, 
  setCategory, 
  setSearchQuery 
} from "../store/slices/emailSlice";
import { useEmails } from "../hooks/useEmails";
import { useInitialRefetch } from "../hooks/useInitialRefetch";
import { filterEmails } from "../utils/filterEmails";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import '../App.css';
export default function HomePage() {
  const dispatch = useDispatch();
  const { selectedEmailIndex, selectedCategory, searchQuery } = useSelector(state => state.email);
  const { autoRefresh, refreshInterval } = useSelector(state => state.userPreferences);
  const activeAccountId = useSelector(state => state.accounts.activeAccountId);

  const { data: emails = [], isLoading: loading, error: emailError, refetch: refetchEmails } = useEmails(activeAccountId, autoRefresh, refreshInterval);

  const filteredEmails = filterEmails(emails, selectedCategory, searchQuery);

  useInitialRefetch(refetchEmails, 3000);

  if (emailError) return <EmptyState message={`Error loading emails: ${emailError.message}`} onRetry={() => window.location.reload()} />;
  if (loading) return <Loading message="Loading emails..." />;
  if (!loading && filteredEmails.length === 0) return <EmptyState message="No emails found" onRetry={refetchEmails} />;

  return (
    <div className="app-container">
      <Navbar onSearch={q => dispatch(setSearchQuery(q))} />
      <div className="main-container">
        <Sidebar selectedCategory={selectedCategory} emails={emails} onCategoryChange={cat => dispatch(setCategory(cat))} />
        <div className="content-area">
          {selectedEmailIndex === null
            ? <EmailList emails={filteredEmails} selectedEmail={selectedEmailIndex} onSelectEmail={idx => dispatch(setSelectedEmail(idx))} />
            : <EmailDetail email={filteredEmails[selectedEmailIndex]} onClose={() => dispatch(clearSelectedEmail())} onBack={() => dispatch(clearSelectedEmail())} />
          }
        </div>
      </div>
    </div>
  );
}
