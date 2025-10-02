const express = require("express");
const fetchEmails = require("./utils/fetchemail"); // your IMAP fetch module
const app = express();
const cors=require("cors");
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // optional, for frontend assets

// API endpoint to get all emails as JSON
app.get("/emails", async (req, res) => {
  try {
    const emails = await fetchEmails(); // fetch emails from IMAP
    console.log(emails);
    res.json({ emails }); // send JSON response
  } catch (err) {
    console.error("Failed to fetch emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
