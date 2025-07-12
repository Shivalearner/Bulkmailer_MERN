const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "https://bulkmailer-mern.vercel.app/",
  methods: ["POST", "GET"],
  credentials: true
}));


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("DB Error", err));

// Model to access `bulkmailer` collection
const Credential = mongoose.model("credential", {}, "bulkmailer");

// API to send emails
app.post("/sendemail", async (req, res) => {
  const { subject, msg, emailList } = req.body;

  try {
    const creds = await Credential.find();
    if (!creds.length) {
      return res.status(500).send("No credentials found in database");
    }

    const { user, pass } = creds[0].toJSON();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: user,
        to: emailList[i],
        subject: subject,
        text: msg,
      });
    }

    res.send("Success");
  } catch (error) {
    console.error("Error sending emails:", error);
    res.send("Failed");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

