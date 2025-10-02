// index.js
const express = require("express");
const fetchEmails = require("./utils/fetchemail"); // your IMAP fetch module
const esClient = require("./utils/esClient"); // Elasticsearch client
const classifyEmail = require("./utils/classifier"); // Naive Bayes classifier
const crypto = require("crypto");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // optional frontend

// --- Ensure "emails" index exists in Elasticsearch ---
async function ensureIndex() {
    try {
        const exists = await esClient.indices.exists({ index: "emails" });
        if (!exists) {
            await esClient.indices.create({
                index: "emails",
                body: {
                    mappings: {
                        properties: {
                            from: { type: "text" },
                            subject: { type: "text" },
                            body: { type: "text" },
                            date: { type: "date" },
                            messageId: { type: "keyword" },
                            label: { type: "keyword" } // classified label
                        }
                    }
                }
            });
            console.log("✅ Created 'emails' index in Elasticsearch");
        } else {
            console.log("ℹ️ 'emails' index already exists");
        }
    } catch (err) {
        console.error("❌ Error ensuring index:", err);
    }
}

// Initialize index on server start
ensureIndex();

// --- API: Fetch emails, classify, and index ---
app.get("/emails", async (req, res) => {
    try {
        const emails = await fetchEmails(); // fetch from IMAP

        if (!emails || emails.length === 0) {
            return res.json({ emails: [] });
        }

        const enrichedEmails = emails.map(email => {
            const label = classifyEmail(email); // classify email
            email.label = label;

            // Generate safe _id
            const emailId = email.messageId || crypto.createHash("md5").update((email.subject || "") + (email.date || "")).digest("hex");
            email._id = emailId;

            console.log(`📧 Email from "${email.from}" classified as "${label}"`);
            return email;
        });

        // Prepare bulk operations
        const bulkOps = enrichedEmails.flatMap(email => [
            { index: { _index: "emails", _id: email._id } },
            {
                from: email.from || "",
                subject: email.subject || "",
                body: email.body || "",
                date: email.date || null,
                messageId: email.messageId || "",
                label: email.label || ""
            }
        ]);

        // Bulk insert
        const bulkResponse = await esClient.bulk({ refresh: true, body: bulkOps });

        if (bulkResponse.errors) {
            console.error("❌ Bulk indexing errors:", JSON.stringify(bulkResponse.items, null, 2));
        } else {
            console.log(`✅ Indexed ${enrichedEmails.length} emails into Elasticsearch`);
        }

        res.json({ emails: enrichedEmails });

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
                    fields: ["from", "subject", "body", "label"],
                    fuzziness: "AUTO"
                }
            }
        });

        const hits = result.hits.hits.map(hit => hit._source);
        res.json({ emails: hits });
    } catch (err) {
        console.error("❌ Search failed:", err);
        res.status(500).json({ error: "Search failed" });
    }
});

// --- Start server ---
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
