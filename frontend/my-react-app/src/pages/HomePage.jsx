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
  
  // Redux state (client state)
  const { selectedEmailIndex, selectedCategory, searchQuery } = useSelector(
    (state) => state.email
  );
  const { autoRefresh, refreshInterval } = useSelector(
    (state) => state.userPreferences
  );

  // Tanstack Query for server state
  const { data: emails = [], isLoading: loading } = useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      // Use search endpoint with wildcard to get all emails
      const res = await axios.get("http://localhost:3000/search", {
        params: { q: '*' }
      });
      return res.data.emails || [];
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000,
    retry: 1,
  });

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

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading emails...</p>
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
          {selectedEmailIndex === null ? (
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

