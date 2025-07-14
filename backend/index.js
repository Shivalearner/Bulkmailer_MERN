const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config(); // At the very top


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "https://bulkmailer-mern.vercel.app",
    "https://bulkmailer-mern-c26jq5654-shivas-projects-a760db6f.vercel.app"
  ],
  methods: ["POST", "GET"]
}));


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch(() => console.log("Failed to connect to Database"));

// Model
const Credential = mongoose.model("credential", {}, "bulkmailer");

// Send Email Route
app.post("/sendemail", async (req, res) => {
  const { subject, msg, emailList } = req.body;

  try {
    const creds = await Credential.find();
    if (!creds.length) {
      return res.status(500).send("No credentials found");
    }

    const { user, pass } = creds[0].toJSON();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: user,
        to: emailList[i],
        subject,
        text: msg
      });
    }

    res.send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.send("Failed");
  }
});

// Use dynamic port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
