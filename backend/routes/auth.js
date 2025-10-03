const express = require("express");
const router = express.Router();
const Account = require("../models/user");
const { setActiveAccount, pollNewEmails } = require("../services/emailPoller");

router.post("/login", async (req, res) => {
  const { imap_user, imap_pass } = req.body;
  if (!imap_user || !imap_pass) return res.status(400).json({ error: "imap_user and imap_pass required" });

  let account = await Account.findOne({ imap_user });
  if (!account) account = await Account.create({ imap_user, imap_pass });

  setActiveAccount(account);
  pollNewEmails();

  res.json({ message: `Active account set to ${imap_user}`, account });
});

module.exports = router;
