const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://garvitadlakha08:Complex08@cluster0.5oxq0.mongodb.net/reachinbox").then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
});
const accountSchema = new mongoose.Schema({
  imap_user: { type: String, required: true, unique: true },  // email
  imap_pass: { type: String, required: true },                // password (⚠️ encrypt in prod)
}, { timestamps: true });

module.exports = mongoose.model("Account", accountSchema);
