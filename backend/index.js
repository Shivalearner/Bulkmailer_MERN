const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/passkey")
  .then(() => console.log("Database Connected"))
  .catch(() => console.log("Failed to connect to Database"));

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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
