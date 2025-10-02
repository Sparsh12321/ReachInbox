// classifier.js
const natural = require("natural");
const fs = require("fs");
const path = require("path");

const MODEL_FILE = path.join(__dirname, "emailClassifier.json");

// Initialize classifier
let classifier = new natural.BayesClassifier();

// Load existing classifier if available
if (fs.existsSync(MODEL_FILE)) {
  natural.BayesClassifier.load(MODEL_FILE, null, (err, loadedClassifier) => {
    if (err) {
      console.error("❌ Failed to load classifier:", err);
      classifier = new natural.BayesClassifier();
      addTrainingData(); // fallback to train if loading fails
    } else {
      console.log("✅ Loaded existing classifier");
      classifier = loadedClassifier;
      // Optionally retrain if needed
      if (!classifier.docs || classifier.docs.length === 0) addTrainingData();
    }
  });
} else {
  classifier = new natural.BayesClassifier();
  addTrainingData();
}

// Add training samples for the 5 labels
function addTrainingData() {
  if (!classifier.docs || classifier.docs.length === 0) {
    // --- Interested ---
classifier.addDocument("I would like to receive more information about your services", "Interested");
classifier.addDocument("Could you provide details about pricing and features?", "Interested");
classifier.addDocument("I'm considering your offer, please send me the brochure", "Interested");
classifier.addDocument("Please let me know the next steps to get started", "Interested");
classifier.addDocument("I’m curious to learn how your product can help us", "Interested");

// --- Meeting Booked ---
classifier.addDocument("I have scheduled a call for Thursday at 10 AM", "Meeting Booked");
classifier.addDocument("Looking forward to our meeting on Monday", "Meeting Booked");
classifier.addDocument("The meeting has been confirmed for 3 PM", "Meeting Booked");
classifier.addDocument("I accepted the calendar invite for our discussion", "Meeting Booked");
classifier.addDocument("See you tomorrow at the agreed time for our call", "Meeting Booked");

// --- Not Interested ---
classifier.addDocument("Thank you, but I am not looking for this right now", "Not Interested");
classifier.addDocument("Please remove me from your contact list", "Not Interested");
classifier.addDocument("This is not relevant for my business", "Not Interested");
classifier.addDocument("I don’t need this service, thank you", "Not Interested");
classifier.addDocument("Not interested in pursuing this opportunity", "Not Interested");

// --- Spam ---
classifier.addDocument("You won a free iPhone, click here to claim", "Spam");
classifier.addDocument("Get rich quick with this simple trick", "Spam");
classifier.addDocument("Congratulations! You are selected for a prize", "Spam");
classifier.addDocument("Earn $1000 daily from home, limited offer", "Spam");
classifier.addDocument("Free lottery tickets, sign up now", "Spam");

// --- Out of Office ---
classifier.addDocument("I am currently out of the office, will reply later", "Out of Office");
classifier.addDocument("I am on leave until next Monday", "Out of Office");
classifier.addDocument("Automatic reply: I am away from work this week", "Out of Office");
classifier.addDocument("Thank you for your email, I’m out of office", "Out of Office");
classifier.addDocument("I will be traveling and unable to respond until next week", "Out of Office");

    // Train the classifier
    classifier.train();

    // Save the model for future use
    classifier.save(MODEL_FILE, (err) => {
      if (err) console.error("❌ Failed to save classifier:", err);
      else console.log("✅ Classifier trained and saved");
    });
  }
}

// Function to classify an email
function classifyEmail(email) {
  const text = `${email.subject || ""} ${email.body || ""}`;
  return classifier.classify(text); // returns one of the 5 labels
}

module.exports = classifyEmail;
