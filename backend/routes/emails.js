const express = require("express");
const router = express.Router();
const esClient = require("../config/esClient");

router.get("/search", async (req, res) => {
  const { q, account_id } = req.query;
  if (!q) return res.status(400).json({ error: "Query missing" });

  let query;
  if (q === "*" || q === "from:*") {
    query = account_id ? { bool: { must: { match_all: {} }, filter: { term: { account_id } } } } : { match_all: {} };
  } else {
    const textQuery = { multi_match: { query: q, fields: ["from","subject","body_text","label"], fuzziness: "AUTO" } };
    query = account_id ? { bool: { must: textQuery, filter: { term: { account_id } } } } : textQuery;
  }

  const result = await esClient.search({ index: "emails", body: { query, size: 1000, sort: [{ date: { order: "desc" } }] } });
  res.json({ emails: result.hits.hits.map(h => h._source) });
});

router.get("/debug/emails-count", async (req, res) => {
  const count = await esClient.count({ index: "emails" });
  const sample = await esClient.search({ index: "emails", body: { query: { match_all: {} }, size: 5, sort: [{ date: { order: "desc" } }] } });
  res.json({ total: count.count, sampleEmails: sample.hits.hits.map(h => h._source) });
});

module.exports = router;
