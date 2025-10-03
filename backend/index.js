const express = require("express");
const fetchEmails = require("./utils/fetchemail");
const esClient = require("./utils/esClient");
const { classifyEmail, loadClassifier } = require("./utils/classifier");
const cors = require("cors");
const crypto = require("crypto");
const { htmlToText } = require("html-to-text");
const Account = require("./models/user"); // Mongo model

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// --- Elasticsearch index setup ---
async function ensureIndex() {
  const exists = await esClient.indices.exists({ index: "emails" });
  if (!exists) {
    await esClient.indices.create({
      index: "emails",
      body: {
        mappings: {
          properties: {
            from: { type: "text" },
            subject: { type: "text" },
            body_html: { type: "text" },
            body_text: { type: "text" },
            date: { type: "date" },
            messageId: { type: "keyword" },
            label: { type: "keyword" },
            account_id: { type: "keyword" },
            imap_user: { type: "keyword" },
          },
        },
      },
    });
    console.log("✅ Created 'emails' index in Elasticsearch");
  }
}

// --- Classifier setup ---
let classifierReady = false;
(async () => {
  await ensureIndex();
  try {
    await loadClassifier();
    classifierReady = true;
    console.log("✅ Classifier loaded and ready");
  } catch (err) {
    console.error("❌ Error loading classifier:", err.message);
  }
})();

// --- Track last UID for logged-in account ---
let lastUid = null;
let activeAccount = null; // set when user logs in

// --- Function to fetch and index new emails ---
async function pollNewEmails() {
  if (!activeAccount) return; // no logged-in account

  try {
    console.log(`🔄 Polling emails for ${activeAccount.imap_user} (lastUid: ${lastUid || 'initial fetch'})`);
    const { emails, lastUid: newUid } = await fetchEmails({
      imap_user: activeAccount.imap_user,
      imap_pass: activeAccount.imap_pass,
      lastUid,
    });

    console.log(`📧 Fetched ${emails.length} emails from IMAP`);
    lastUid = newUid;

    const enrichedEmails = emails.map((email) => {
      const bodyHtml = email.body || "";
      const bodyText = htmlToText(bodyHtml, { wordwrap: 130, ignoreHref: true, ignoreImage: true }).replace(/\s+/g, " ").trim();

      let label = "Unclassified";
      if (classifierReady) {
        try {
          label = classifyEmail({ ...email, body: bodyText });
        } catch (err) {
          console.warn(`⚠️ Classification failed for "${email.subject}": ${err.message}`);
        }
      }

      const emailId = crypto.createHash("md5").update((email.subject || "") + (email.date || "") + activeAccount.imap_user).digest("hex");

      return { 
        ...email, 
        _id: emailId, 
        body_html: bodyHtml, 
        body_text: bodyText, 
        label,
        account_id: activeAccount._id.toString(),
        imap_user: activeAccount.imap_user
      };
    });

    if (enrichedEmails.length > 0) {
      const bulkOps = enrichedEmails.flatMap(email => [
        { index: { _index: "emails", _id: email._id } },
        {
          from: email.from,
          subject: email.subject,
          body_html: email.body_html,
          body_text: email.body_text,
          date: email.date,
          messageId: email.messageId,
          label: email.label,
          account_id: email.account_id,
          imap_user: email.imap_user
        }
      ]);

      await esClient.bulk({ refresh: true, body: bulkOps });
      console.log(`✅ Indexed ${enrichedEmails.length} new emails for ${activeAccount.imap_user}`);
    } else {
      console.log(`📭 No new emails found for ${activeAccount.imap_user}`);
    }
  } catch (err) {
    console.error("❌ Failed to poll new emails:", err.message);
  }
}

// --- API: Set active account (simulate login) ---
// --- API: Create or switch active account ---
app.post("/login", async (req, res) => {
  const { imap_user, imap_pass } = req.body;
  if (!imap_user || !imap_pass) return res.status(400).json({ error: "imap_user and imap_pass required" });

  let account = await Account.findOne({ imap_user });
  
  if (!account) {
    account = await Account.create({ imap_user, imap_pass });
    console.log(`✅ Created new account for ${imap_user}`);
  } else {
    console.log(`✅ Using existing account for ${imap_user}`);
  }

  // Set as active account for polling
  activeAccount = account;
  lastUid = null; // reset UID to fetch incrementally from the latest

  res.json({ message: `Active account set to ${imap_user}`, account });

  // Start polling for this account immediately
  console.log(`🚀 Starting initial email fetch for ${imap_user}`);
  pollNewEmails();
});


// Poll every 1 minute for new emails
setInterval(pollNewEmails, 60 * 1000);

// --- API: Search emails ---
app.get("/search", async (req, res) => {
  const { q, account_id } = req.query;
  if (!q) return res.status(400).json({ error: "Query missing" });

  try {
    console.log(`🔍 Search request received for query: "${q}", account: ${account_id || 'all'}`);
    
    // Build query with account filter
    let query;
    
    if (q === '*' || q === 'from:*') {
      // Match all, but filter by account if provided
      if (account_id) {
        query = {
          bool: {
            must: { match_all: {} },
            filter: { term: { account_id } }
          }
        };
      } else {
        query = { match_all: {} };
      }
    } else {
      // Text search with optional account filter
      const textQuery = {
        multi_match: {
          query: q,
          fields: ["from", "subject", "body_text", "label"],
          fuzziness: "AUTO",
        }
      };
      
      if (account_id) {
        query = {
          bool: {
            must: textQuery,
            filter: { term: { account_id } }
          }
        };
      } else {
        query = textQuery;
      }
    }

    console.log('🔎 Fetching emails from Elasticsearch with account filter...');
    const result = await esClient.search({
      index: "emails",
      body: {
        query,
        size: 1000,
        sort: [{ date: { order: "desc" } }]
      }
    });

    const hits = result.hits.hits.map(hit => hit._source);
    console.log(`✅ Search returned ${hits.length} emails for account ${account_id || 'all'}`);
    res.json({ emails: hits });
  } catch (err) {
    console.error("❌ Search failed:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

// --- API: Debug - Get ES stats ---
app.get("/debug/emails-count", async (req, res) => {
  try {
    const count = await esClient.count({ index: "emails" });
    const sample = await esClient.search({
      index: "emails",
      body: {
        query: { match_all: {} },
        size: 5,
        sort: [{ date: { order: "desc" } }]
      }
    });
    
    res.json({ 
      total: count.count,
      sampleEmails: sample.hits.hits.map(hit => ({
        from: hit._source.from,
        subject: hit._source.subject,
        date: hit._source.date,
        label: hit._source.label
      }))
    });
  } catch (err) {
    console.error("❌ Failed to get ES stats:", err.message);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

app.get("/accounts", async (req, res) => {
  try {
    const accounts = await Account.find(); // only send imap_user
    res.json({ accounts });
  } catch (err) {
    console.error("❌ Failed to fetch accounts:", err.message);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});
app.post("/switch-account", async (req, res) => {
  const { accountId } = req.body;
  if (!accountId) return res.status(400).json({ error: "accountId is required" });

  try {
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ error: "Account not found" });

    // Set as active account for incremental polling
    activeAccount = account;
    lastUid = null; // reset UID to fetch incrementally
    console.log(`✅ Switched to account: ${account.imap_user}`);

    // Immediately poll for new emails for this account
    console.log(`🚀 Starting email fetch after account switch to ${account.imap_user}`);
    pollNewEmails();

    res.json({ message: `Active account set to ${account.imap_user}`, account });
  } catch (err) {
    console.error("❌ Failed to switch account:", err.message);
    res.status(500).json({ error: "Failed to switch account" });
  }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
