const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./services/classifier"); // load classifier
require("./config/esClient");     // ensure ES client ready

const authRoutes = require("./routes/auth");
const accountsRoutes = require("./routes/accounts");
const emailsRoutes = require("./routes/emails");
const { pollNewEmails } = require("./services/emailPoller");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/auth", authRoutes);
app.use("/accounts", accountsRoutes);
app.use("/emails", emailsRoutes);

// Poll emails every 1 min
setInterval(pollNewEmails, 60 * 1000);

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
