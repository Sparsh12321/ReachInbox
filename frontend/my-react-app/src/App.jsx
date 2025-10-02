import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);

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

  if (loading) return <p>Loading emails...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#333" }}>Inbox</h1>

      {emails.length === 0 && <p style={{ color: "#666" }}>No emails found.</p>}

      <div>
        {emails.map((email, idx) => (
          <div
            key={idx}
            style={{
              borderBottom: "1px solid #ccc",
              padding: "12px",
              cursor: "pointer",
              backgroundColor: selectedEmail === idx ? "#e6f7ff" : "#fff",
              transition: "background-color 0.2s",
            }}
            onClick={() => setSelectedEmail(idx)}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedEmail === idx ? "#e6f7ff" : "#fff"}
          >
            <p style={{ margin: "2px 0", color: "#222" }}><b>From:</b> {email.from || "(Unknown Sender)"}</p>
            <p style={{ margin: "2px 0", color: "#000" }}><b>Subject:</b> {email.subject || "(No Subject)"}</p>
            <p style={{ margin: "2px 0", fontSize: "0.85em", color: "#555" }}>
              {new Date(email.date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {selectedEmail !== null && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          backgroundColor: "#fefefe",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#111" }}>{emails[selectedEmail].subject}</h2>
          <p style={{ color: "#333" }}><b>From:</b> {emails[selectedEmail].from}</p>
          <p style={{ color: "#555" }}><b>Date:</b> {new Date(emails[selectedEmail].date).toLocaleString()}</p>
          <div style={{ marginTop: "10px", color: "#222", lineHeight: "1.5" }}>
            <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "#f7f7f7", padding: "10px", borderRadius: "4px" }}>
              {emails[selectedEmail].body || "(No Content)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
