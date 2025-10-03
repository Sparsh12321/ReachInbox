const fetchEmails = require("../utils/fetchemail");
const esClient = require("../config/esClient");
const crypto = require("crypto");
const { htmlToText } = require("html-to-text");
const { classifyEmail, classifierReady } = require("./classifier");
const Account = require("../models/user");

// Track active account
let lastUid = null;
let activeAccount = null;

const setActiveAccount = (account) => {
  activeAccount = account;
  lastUid = null;
};

const getActiveAccount = () => activeAccount;

async function pollNewEmails() {
  if (!activeAccount) return;

  try {
    console.log(`🔄 Polling emails for ${activeAccount.imap_user}`);
    const { emails, lastUid: newUid } = await fetchEmails({
      imap_user: activeAccount.imap_user,
      imap_pass: activeAccount.imap_pass,
      lastUid,
    });
    lastUid = newUid;

    const enrichedEmails = emails.map((email) => {
      const bodyHtml = email.body || "";
      const bodyText = htmlToText(bodyHtml, { wordwrap: 130, ignoreHref: true, ignoreImage: true }).replace(/\s+/g, " ").trim();

      let label = "Unclassified";
      if (classifierReady) {
        try {
          label = classifyEmail({ ...email, body: bodyText });
        } catch {}
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
        { ...email }
      ]);

      await esClient.bulk({ refresh: true, body: bulkOps });
      console.log(`✅ Indexed ${enrichedEmails.length} emails for ${activeAccount.imap_user}`);
    }
  } catch (err) {
    console.error("❌ Failed to poll emails:", err.message);
  }
}

module.exports = { pollNewEmails, setActiveAccount, getActiveAccount };
