const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const sanitizeHtml = require("sanitize-html");

const DAY_MS = 24 * 60 * 60 * 1000;

function formatEmail(parsed) {
  let htmlBody = parsed.html || parsed.textAsHtml || "";

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

/**
 * Fetch new emails for a single account, using lastUid to only get new emails
 */
async function fetchEmails({ imap_user, imap_pass, lastUid = null }) {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: imap_user, pass: imap_pass },
    logger: false,
  });

  await client.connect();
  console.log(`✅ Connected to IMAP: ${imap_user}`);

  const emails = [];

  const lock = await client.getMailboxLock("INBOX");
  try {
    const searchCriteria = lastUid ? { uid: `${lastUid + 1}:*` } : { since: new Date(Date.now() - 30 * DAY_MS) };
    const uids = await client.search(searchCriteria);

    if (uids.length > 0) {
      for await (let msg of client.fetch(uids, { source: true })) {
        const parsed = await simpleParser(msg.source);
        const email = formatEmail(parsed);
        email.uid = msg.uid;
        emails.push(email);
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }

  const newLastUid = emails.length ? Math.max(...emails.map(e => e.uid)) : lastUid;
  return { emails, lastUid: newLastUid };
}

module.exports = fetchEmails;
