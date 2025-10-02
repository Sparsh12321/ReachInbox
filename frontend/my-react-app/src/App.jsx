import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import EmailList from "./components/EmailList";
import EmailDetail from "./components/EmailDetail";

function App() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchEmails() {
      try {
        const res = await axios.get("http://localhost:3000/emails");
        setEmails(res.data.emails || []);
      } catch (err) {
        console.error("Failed to fetch emails:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEmails();

    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSelectEmail = (idx) => {
    setSelectedEmail(idx);
  };

  const handleCloseEmail = () => {
    setSelectedEmail(null);
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
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            setSelectedEmail(null); // Clear selection when changing category
          }}
        />
        
        <div className="content-area">
          {selectedEmail === null ? (
            <EmailList 
              emails={filteredEmails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleSelectEmail}
            />
          ) : (
            <EmailDetail 
              email={filteredEmails[selectedEmail]}
              onClose={handleCloseEmail}
              onBack={handleCloseEmail}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
