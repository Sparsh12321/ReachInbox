const express = require("express");
const fetchEmails = require("./utils/fetchemail");
const esClient = require("./utils/esClient");
const {classifyEmail, loadClassifier, cleanEmailBody} = require("./utils/classifier");
const cors = require("cors");
const crypto = require("crypto");
const { htmlToText } = require("html-to-text");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// --- Ensure "emails" index exists in Elasticsearch ---
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
          },
        },
      },
    });
    console.log("✅ Created 'emails' index in Elasticsearch");
  }
}

// --- Initialize server ---
let classifierReady = false;

(async () => {
  try {
    await ensureIndex();
  } catch (err) {
    console.error("❌ Error ensuring index:", err.message);
  }
  
  try {
    await loadClassifier();
    classifierReady = true;
    console.log("✅ Classifier loaded and ready");
  } catch (err) {
    console.error("❌ Error loading classifier:", err.message);
  }
})();

// --- API: Fetch emails, classify, index ---
app.get("/emails", async (req, res) => {
  try {
    const emails = await fetchEmails();
    if (!emails || emails.length === 0) return res.json({ emails: [] });

    const enrichedEmails = emails.map((email) => {
      try {
        // Convert HTML body to plain text
        const bodyHtml = email.body || "";
        const bodyText = htmlToText(bodyHtml, {
          wordwrap: 130,
          ignoreHref: true,
          ignoreImage: true,
        }).replace(/\s+/g, " ").trim();
        
        // Create email object with text body for classification
        const emailForClassification = {
          ...email,
          body: bodyText
        };
        
        // Only classify if classifier is ready
        let label = "Unclassified";
        if (classifierReady) {
          try {
            label = classifyEmail(emailForClassification);
          } catch (classifyErr) {
            console.warn(`⚠️ Classification failed for "${email.subject}":`, classifyErr.message);
          }
        }
        
        const emailId = email.messageId || crypto.createHash("md5").update((email.subject || "") + (email.date || "")).digest("hex");

        return {
          ...email,
          _id: emailId,
          body_html: bodyHtml,
          body_text: bodyText,
          label,
        };
      } catch (err) {
        console.error(`❌ Error processing email "${email.subject || 'Unknown'}":`, err.message);
        return null;
      }
    });

    const validEmails = enrichedEmails.filter((e) => e !== null);

    if (validEmails.length > 0) {
      const bulkOps = validEmails.flatMap((email) => [
        { index: { _index: "emails", _id: email._id } },
        {
          from: email.from,
          subject: email.subject,
          body_html: email.body_html,
          body_text: email.body_text,
          date: email.date,
          messageId: email.messageId,
          label: email.label,
        },
      ]);

      await esClient.bulk({ refresh: true, body: bulkOps });
      console.log(`✅ Indexed ${validEmails.length} emails into Elasticsearch`);
    }

    res.json({ emails: validEmails });
  } catch (err) {
    console.error("❌ Failed to fetch/classify/index emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// --- API: Search emails ---
app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query missing" });

  try {
    const result = await esClient.search({
      index: "emails",
      query: {
        multi_match: {
          query: q,
          fields: ["from", "subject", "body_text", "label"], // Search in plain text, not HTML
          fuzziness: "AUTO",
        },
      },
    });

    const hits = result.hits.hits.map((hit) => hit._source);
    res.json({ emails: hits });
  } catch (err) {
    console.error("❌ Search failed:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});