import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Simple test component to check if emails are being fetched
function TestEmails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        console.log('🔍 Fetching emails from http://localhost:3000/search?q=*');
        const response = await axios.get('http://localhost:3000/search?q=*');
        console.log('✅ Response:', response.data);
        console.log('📧 Number of emails:', response.data.emails?.length || 0);
        setEmails(response.data.emails || []);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching emails:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (loading) return <div style={{ padding: '40px', color: 'white' }}>Loading...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <h1>Email Test Page</h1>
      <h2>Total Emails: {emails.length}</h2>
      
      <div style={{ marginTop: '20px' }}>
        {emails.slice(0, 5).map((email, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            margin: '10px 0', 
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}>
            <div><strong>From:</strong> {email.from}</div>
            <div><strong>Subject:</strong> {email.subject}</div>
            <div><strong>Date:</strong> {new Date(email.date).toLocaleString()}</div>
            <div><strong>Label:</strong> {email.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestEmails;

