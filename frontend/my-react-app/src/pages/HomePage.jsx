import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
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
import { useAccounts } from "../hooks/useAccounts";
import '../App.css';

function HomePage() {
  const dispatch = useDispatch();
  const { refetch: refetchAccounts } = useAccounts();
  
  // Load accounts on mount
  useEffect(() => {
    refetchAccounts();
  }, [refetchAccounts]);

  // Refetch emails after initial mount to catch newly indexed emails
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔄 Refetching emails after delay...');
      refetchEmails();
    }, 3000); // Wait 3 seconds for backend to index emails

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  // Redux state (client state)
  const { selectedEmailIndex, selectedCategory, searchQuery } = useSelector(
    (state) => state.email
  );
  const { autoRefresh, refreshInterval } = useSelector(
    (state) => state.userPreferences
  );
  const activeAccountId = useSelector((state) => state.accounts.activeAccountId);

  // Tanstack Query for server state
  const { data: emails = [], isLoading: loading, error: emailError, refetch: refetchEmails } = useQuery({
    queryKey: ['emails', activeAccountId],
    queryFn: async () => {
      try {
        const params = { q: '*' };
        if (activeAccountId) {
          params.account_id = activeAccountId;
        }
        
        console.log('📧 Fetching emails for account:', activeAccountId || 'all');
        const res = await axios.get("http://localhost:3000/search", { params });
        console.log('📧 Loaded emails:', res.data.emails?.length || 0);
        return res.data.emails || [];
      } catch (error) {
        console.error('❌ Failed to fetch emails:', error);
        throw error;
      }
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5000,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: true, // Always enabled, but filters by account
  });

  // Log when emails change
  useEffect(() => {
    console.log('Current emails count:', emails.length);
  }, [emails]);

  const handleSearch = (query) => {
    dispatch(setSearchQuery(query));
  };

  const handleSelectEmail = (idx) => {
    dispatch(setSelectedEmail(idx));
  };

  const handleCloseEmail = () => {
    dispatch(clearSelectedEmail());
  };

  const handleCategoryChange = (category) => {
    dispatch(setCategory(category));
  };

  const filteredEmails = emails.filter(email => {
    // Filter by label/category
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      matchesCategory = email.label === selectedCategory;
    }

    // Filter by search query
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = (
        email.subject?.toLowerCase().includes(query) ||
        email.from?.toLowerCase().includes(query) ||
        email.body?.toLowerCase().includes(query) ||
        email.body_text?.toLowerCase().includes(query)
      );
    }

    return matchesCategory && matchesSearch;
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 Filter Debug:', {
      totalEmails: emails.length,
      selectedCategory,
      searchQuery,
      filteredCount: filteredEmails.length
    });
  }, [emails, selectedCategory, searchQuery, filteredEmails.length]);

  if (emailError) {
    return (
      <div className="loading-container">
        <p style={{ color: 'var(--error)' }}>Error loading emails: {emailError.message}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar onSearch={handleSearch} />
      
      <div className="main-container">
        <Sidebar 
          selectedCategory={selectedCategory}
          emails={emails}
          onCategoryChange={handleCategoryChange}
        />
        
        <div className="content-area">
          {loading ? (
            <div className="loading-container">
              <p>Loading emails...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="loading-container">
              <p>No emails found</p>
              <button 
                onClick={() => refetchEmails()} 
                style={{ 
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Refresh Emails
              </button>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
                Try selecting "All Emails" or refresh
              </p>
            </div>
          ) : selectedEmailIndex === null ? (
            <EmailList 
              emails={filteredEmails}
              selectedEmail={selectedEmailIndex}
              onSelectEmail={handleSelectEmail}
            />
          ) : (
            <EmailDetail 
              email={filteredEmails[selectedEmailIndex]}
              onClose={handleCloseEmail}
              onBack={handleCloseEmail}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;

