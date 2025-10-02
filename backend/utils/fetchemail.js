const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const sanitizeHtml = require("sanitize-html");
require("dotenv").config();

const DAY_MS = 24 * 60 * 60 * 1000;

// Helper: format parsed email into clean object
function formatEmail(parsed) {
  let htmlBody = parsed.html || parsed.textAsHtml || "";

  // Sanitize HTML
  htmlBody = sanitizeHtml(htmlBody, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });

  return {
    from: parsed.from?.text || "",
    subject: parsed.subject || "",
    date: parsed.date || new Date(),
    body: htmlBody,
  };
}

// Main function to fetch emails and return as JSON
async function fetchEmails() {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT),
    secure: process.env.IMAP_SECURE === "true",
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS,
    },
    logger: false,
  });

  await client.connect();
  console.log("✅ Connected to IMAP");

  const emails = [];

  // Open inbox
  let lock = await client.getMailboxLock("INBOX");
  try {
    const sinceDate = new Date(Date.now() - 1 * DAY_MS);

    // Search last 30 days
    const uids = await client.search({ since: sinceDate });
    console.log(`📨 Found ${uids.length} emails in last 30 days`);

    // Fetch and parse
    for await (let msg of client.fetch(uids, { source: true })) {
      const parsed = await simpleParser(msg.source);
      const email = formatEmail(parsed);
      emails.push(email);
    }
  } finally {
    lock.release();
  }

  // Optional: start IDLE for new emails (push into array)
  (async () => {
    console.log("🔄 Entering IDLE mode for real-time updates...");
    while (true) {
      await client.idle(); // wait for new event
      console.log("📩 New activity detected!");

      let lock = await client.getMailboxLock("INBOX");
      try {
        const status = await client.status("INBOX", { messages: true });
        const latestUID = status.uidNext - 1;

        for await (let msg of client.fetch(latestUID, { source: true })) {
          const parsed = await simpleParser(msg.source);
          const email = formatEmail(parsed);
          emails.push(email);
          console.log("----- NEW MAIL -----", email.subject);
        }
      } finally {
        lock.release();
      }
    }
  })();

  return emails; // return all fetched emails
}

module.exports = fetchEmails;
