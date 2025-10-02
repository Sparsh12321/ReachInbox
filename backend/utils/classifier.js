const natural = require("natural");
const fs = require("fs");
const path = require("path");
const { htmlToText } = require("html-to-text");

const MODEL_FILE = path.join(__dirname, "emailClassifier.json");

let classifier = new natural.BayesClassifier();

// --- Clean HTML email bodies ---
function cleanEmailBody(html) {
  return htmlToText(html || "", {
    wordwrap: 130,
    ignoreHref: true,
    ignoreImage: true,
  }).replace(/\s+/g, " ").trim();
}

// --- Add training samples and train classifier ---
async function addTrainingData() {
  if (!classifier.docs || classifier.docs.length === 0) {
    // Interested
    classifier.addDocument("I would like to receive more information about your services", "Interested");
    classifier.addDocument("Could you provide details about pricing and features?", "Interested");
    classifier.addDocument("I'm considering your offer, please send me the brochure", "Interested");
    classifier.addDocument("Please let me know the next steps to get started", "Interested");
    classifier.addDocument("I’m curious to learn how your product can help us", "Interested");
    classifier.addDocument("I'd love to discuss your product in detail", "Interested");
    classifier.addDocument("Can you send me the product specification?", "Interested");

    // Meeting Booked
    classifier.addDocument("I have scheduled a call for Thursday at 10 AM", "Meeting Booked");
    classifier.addDocument("Looking forward to our meeting on Monday", "Meeting Booked");
    classifier.addDocument("The meeting has been confirmed for 3 PM", "Meeting Booked");
    classifier.addDocument("I accepted the calendar invite for our discussion", "Meeting Booked");
    classifier.addDocument("See you tomorrow at the agreed time for our call", "Meeting Booked");
    classifier.addDocument("Meeting confirmed, looking forward to it", "Meeting Booked");
    classifier.addDocument("I booked a slot for our session", "Meeting Booked");

    // Not Interested
    classifier.addDocument("Thank you, but I am not looking for this right now", "Not Interested");
    classifier.addDocument("Please remove me from your contact list", "Not Interested");
    classifier.addDocument("This is not relevant for my business", "Not Interested");
    classifier.addDocument("I don’t need this service, thank you", "Not Interested");
    classifier.addDocument("Not interested in pursuing this opportunity", "Not Interested");
    classifier.addDocument("I’m not interested in this product at the moment", "Not Interested");
    classifier.addDocument("This doesn’t match our current needs", "Not Interested");

    // Spam
    classifier.addDocument("You won a free iPhone, click here to claim", "Spam");
    classifier.addDocument("Get rich quick with this simple trick", "Spam");
    classifier.addDocument("Congratulations! You are selected for a prize", "Spam");
    classifier.addDocument("Earn $1000 daily from home, limited offer", "Spam");
    classifier.addDocument("Free lottery tickets, sign up now", "Spam");
    classifier.addDocument("Claim your prize money instantly", "Spam");
    classifier.addDocument("Win big with this exclusive offer", "Spam");

    // Out of Office
    classifier.addDocument("I am currently out of the office, will reply later", "Out of Office");
    classifier.addDocument("I am on leave until next Monday", "Out of Office");
    classifier.addDocument("Automatic reply: I am away from work this week", "Out of Office");
    classifier.addDocument("Thank you for your email, I’m out of office", "Out of Office");
    classifier.addDocument("I will be traveling and unable to respond until next week", "Out of Office");
    classifier.addDocument("I am away on vacation and will respond later", "Out of Office");
    classifier.addDocument("Out of office: please contact my colleague for urgent matters", "Out of Office");

    // Train classifier
    classifier.train();

    // Save classifier
    await new Promise((resolve, reject) => {
      classifier.save(MODEL_FILE, (err) => {
        if (err) {
          console.error("❌ Failed to save classifier:", err);
          reject(err);
        } else {
          console.log("✅ Classifier trained and saved");
          resolve();
        }
      });
    });
  }
}

// --- Load existing classifier or train new ---
async function loadClassifier() {
  if (fs.existsSync(MODEL_FILE)) {
    return new Promise((resolve, reject) => {
      natural.BayesClassifier.load(MODEL_FILE, null, async (err, loadedClassifier) => {
        if (err) {
          console.error("❌ Failed to load classifier, training new one", err);
          classifier = new natural.BayesClassifier();
          await addTrainingData();
          resolve();
        } else {
          classifier = loadedClassifier;
          console.log("✅ Classifier loaded");
          if (!classifier.docs || classifier.docs.length === 0) {
            await addTrainingData();
          }
          resolve();
        }
      });
    });
  } else {
    await addTrainingData();
  }
}

// --- Classify email ---
function classifyEmail(email) {
  const text = `${email.subject || ""} ${cleanEmailBody(email.body || "")}`;
  return classifier.classify(text);
}

// Export
module.exports = { classifyEmail, cleanEmailBody, loadClassifier };