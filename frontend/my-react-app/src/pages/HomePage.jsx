import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
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
import { emailsApi } from "../api/emailsApi";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import '../App.css';

export default function HomePage() {
  const dispatch = useDispatch();
  const { selectedEmailIndex, selectedCategory, searchQuery } = useSelector(state => state.email);
  const { autoRefresh, refreshInterval } = useSelector(state => state.userPreferences);
  const activeAccountId = useSelector(state => state.accounts.activeAccountId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: emails = [], isLoading: loading, error: emailError, refetch: refetchEmails } = useEmails(activeAccountId, autoRefresh, refreshInterval);

  const filteredEmails = filterEmails(emails, selectedCategory, searchQuery);

  useInitialRefetch(refetchEmails, 3000);

  // Handler to trigger backend sync + frontend refetch
  const handleRefresh = async () => {
    if (!activeAccountId) {
      console.warn("No active account to refresh");
      return;
    }
    
    setIsRefreshing(true);
    try {
      // Trigger backend to sync new emails and update classifiers
      await emailsApi.triggerRefresh(activeAccountId);
      // Wait a moment for backend to process
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Refetch emails from Elasticsearch
      await refetchEmails();
    } catch (error) {
      console.error("Error refreshing emails:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Only show full-page loading on initial load (when there are no emails yet)
  if (emailError && emails.length === 0) {
    return <EmptyState message={`Error loading emails: ${emailError.message}`} onRetry={() => window.location.reload()} />;
  }
  
  if (loading && emails.length === 0) {
    return <Loading message="Loading emails..." />;
  }

  return (
    <div className="app-container">
      <Navbar onSearch={q => dispatch(setSearchQuery(q))} />
      <div className="main-container">
        <Sidebar selectedCategory={selectedCategory} emails={emails} onCategoryChange={cat => dispatch(setCategory(cat))} />
        <div className="content-area">
          {loading || isRefreshing ? (
            <Loading message={isRefreshing ? "Syncing emails and updating classifiers..." : "Loading emails..."} />
          ) : filteredEmails.length === 0 ? (
            <EmptyState 
              message={selectedCategory === 'all' ? "No emails found" : `No ${selectedCategory} emails`} 
              onRetry={handleRefresh} 
            />
          ) : selectedEmailIndex === null ? (
            <EmailList 
              emails={filteredEmails} 
              selectedEmail={selectedEmailIndex} 
              onSelectEmail={idx => dispatch(setSelectedEmail(idx))}
              onRefresh={handleRefresh}
            />
          ) : (
            <EmailDetail email={filteredEmails[selectedEmailIndex]} onClose={() => dispatch(clearSelectedEmail())} onBack={() => dispatch(clearSelectedEmail())} />
          )}
        </div>
      </div>
    </div>
  );
}
