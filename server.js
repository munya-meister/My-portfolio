import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env.development") });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));

const dataPath = path.join(__dirname, "server", "data", "db.json");

function readDb() {
  if (!fs.existsSync(dataPath)) {
    return {
      certificates: [],
      projects: [],
      about: {
        profilePic: "",
        heading: "Passionate About Building Brands, Websites & Creative Experiences.",
        bio1: "I'm Munyaradzi Mbewe, a Digital Marketer, Web Developer and Music Writer who enjoys combining creativity with technology to help businesses and creators grow online.",
        bio2: "From designing modern websites to creating high-converting marketing campaigns and writing music, I enjoy turning ideas into memorable digital experiences that leave a lasting impression.",
        cvUrl: "/cv.pdf",
        socials: {},
      },
    };
  }

  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveContactMessage(payload) {
  const fallbackFile = path.join(__dirname, "server", "data", "contact-messages.json");
  let messages = [];

  if (fs.existsSync(fallbackFile)) {
    try {
      messages = JSON.parse(fs.readFileSync(fallbackFile, "utf8"));
    } catch {
      messages = [];
    }
  }

  messages.unshift({
    ...payload,
    receivedAt: new Date().toISOString(),
    status: "queued",
  });

  fs.writeFileSync(fallbackFile, JSON.stringify(messages, null, 2));
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date(), version: "1.0" });
});

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const contactRecipient = process.env.CONTACT_EMAIL || "munyaradzi.mbewe01@gmail.com";

const transporter = emailUser && emailPass
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })
  : null;

app.post("/api/contact", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all required fields correctly.",
    });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
  }

  if (!transporter) {
    saveContactMessage({ name, email, subject, message, source: "smtp-unavailable" });

    return res.json({
      success: true,
      message: "Your message was received and saved securely. Mail delivery will be enabled once the email service is configured.",
      fallback: true,
    });
  }

  try {
    await transporter.sendMail({
      from: `Portfolio Contact <${emailUser}>`,
      to: contactRecipient,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      text: `New Portfolio Contact\n\nName:\n${name}\n\nEmail:\n${email}\n\nSubject:\n${subject}\n\nMessage:\n${message}`,
    });

    return res.json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Contact email error:", error);
    saveContactMessage({ name, email, subject, message, source: "smtp-failed", error: error.message });

    return res.json({
      success: true,
      message: "Your message was received and saved securely. We will follow up once the mail service is available.",
      fallback: true,
    });
  }
});

app.get("/api/about", (req, res) => {
  const db = readDb();
  res.json(db.about || {});
});

app.get("/api/certificates", (req, res) => {
  const db = readDb();
  res.json(db.certificates || []);
});

app.get("/api/projects", (req, res) => {
  const db = readDb();
  res.json(db.projects || []);
});

const distDir = path.join(__dirname, "dist");
const htmlPath = path.join(distDir, "index.html");

app.use(express.static(distDir, { index: false }));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Endpoint not found" });
  }

  if (fs.existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  }

  return res.status(404).json({ message: "App build not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("==================================");
  console.log("🚀 Portfolio Frontend + API Running");
  console.log(`📍 Port ${PORT}`);
  console.log("==================================");
});
