const express = require("express");
const router = express.Router();
const Account = require("../models/user");
const { setActiveAccount, pollNewEmails } = require("../services/emailPoller");

router.get("/", async (req, res) => {
  const accounts = await Account.find();
  res.json({ accounts });
});

router.post("/switch-account", async (req, res) => {
  const { accountId } = req.body;
  if (!accountId) return res.status(400).json({ error: "accountId is required" });

  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ error: "Account not found" });

  setActiveAccount(account);
  pollNewEmails();

  res.json({ message: `Switched to ${account.imap_user}`, account });
});

module.exports = router;
