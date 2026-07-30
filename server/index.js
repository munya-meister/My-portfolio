import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",

  // Your Vercel domain
  "https://your-vercel-project.vercel.app",

  // Preview deployments
  /\.vercel\.app$/
];

app.use(cors({
  origin(origin, callback) {

    // Allow Postman and curl
    if (!origin) return callback(null, true);

    const allowed = allowedOrigins.some(item => {

      if (typeof item === "string") {
        return item === origin;
      }

      return item.test(origin);
    });

    if (allowed) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },

  credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "20mb"
}));

const uploadsDir = path.join(__dirname, "uploads");
const certDir = path.join(uploadsDir, "certificates");
const projectDir = path.join(uploadsDir, "projects");
const aboutDir = path.join(uploadsDir, "about");
const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "db.json");

[
    uploadsDir,
    certDir,
    projectDir,
    aboutDir,
    dataDir
].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(
        dbFile,
        JSON.stringify({
            certificates: [],
            projects: [],
            about: {
                profilePic: "",
                heading: "Passionate About Building Brands, Websites & Creative Experiences.",
                bio1: "I'm Munyaradzi Mbewe, a Digital Marketer, Web Developer and Music Writer who enjoys combining creativity with technology to help businesses and creators grow online.",
                bio2: "From designing modern websites to creating high-converting marketing campaigns and writing music, I enjoy turning ideas into memorable digital experiences that leave a lasting impression.",
                cvUrl: "/cv.pdf",
                socials: {}
            }
        }, null, 2)
    );
}

function readDB() {
    return JSON.parse(fs.readFileSync(dbFile, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (req.path.startsWith("/api/about")) {
            cb(null, aboutDir);
        } else if (req.path.startsWith("/api/certificates")) {
            cb(null, certDir);
        } else {
            cb(null, projectDir);
        }
    },

    filename(req, file, cb) {
        cb(
            null,
            uuidv4() + path.extname(file.originalname)
        );
    }
});

const upload = multer({

    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter(req, file, cb) {

        const allowed = [
            "image/png",
            "image/jpeg",
            "image/webp",
            "application/pdf"
        ];

        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Unsupported file type"));
        }

        cb(null, true);
    }

});

app.use("/uploads", express.static(uploadsDir));

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  const token = match ? match[1] : "";

  if (token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
}

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        time: new Date(),
        version: "1.0"
    });
});

app.get("/api/about", (req, res) => {
    const db = readDB();
    res.json(db.about || {});
});

app.put("/api/about", requireAdmin, upload.single("file"), (req, res) => {
    const db = readDB();

    const about = {
        profilePic: req.body.profilePic || db.about?.profilePic || "",
        heading: req.body.heading || db.about?.heading || "",
        bio1: req.body.bio1 || db.about?.bio1 || "",
        bio2: req.body.bio2 || db.about?.bio2 || "",
        cvUrl: req.body.cvUrl || db.about?.cvUrl || "",
        socials: (() => {
            try {
                return req.body.socials ? JSON.parse(req.body.socials) : (db.about?.socials || {});
            } catch {
                return db.about?.socials || {};
            }
        })()
    };

    if (req.file) {
        about.profilePic = `/uploads/about/${req.file.filename}`;
    }

    db.about = about;
    saveDB(db);

    res.json(about);
});

app.get("/api/certificates", (req, res) => {
    const db = readDB();
    res.json(db.certificates);
});

app.get("/api/projects", (req, res) => {
    const db = readDB();
    res.json(db.projects);
});

app.post(
  "/api/:type(certificates|projects)",
  requireAdmin,
  upload.single("file"),
  (req, res) => {
    const db = readDB();
    const { type } = req.params;

    const item = {
      id: uuidv4(),
      title: req.body.title || "",
      description: req.body.description || "",
      platform: req.body.platform || "",
      category: req.body.category || "",
      date: req.body.date || "",
      skills: req.body.skills
        ? req.body.skills.split(",").map(s => s.trim())
        : [],
      technologies: req.body.technologies
        ? req.body.technologies.split(",").map(t => t.trim())
        : [],
      demo: req.body.demo || "",
      github: req.body.github || "",
      url: req.body.url || "",
      verifyUrl: req.body.verifyUrl || "",
      imageUrl: req.body.imageUrl || "",
      fileUrl: req.file
        ? `/uploads/${type}/${req.file.filename}`
        : "",
      createdAt: new Date(),
    };

    if (type === "certificates") {
      db.certificates.unshift(item);
    } else {
      db.projects.unshift(item);
    }

    saveDB(db);
    res.status(201).json(item);
  }
);

app.put("/api/certificates/:id", requireAdmin, upload.single("file"), (req, res) => {
    const db = readDB();
    const index = db.certificates.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: "Certificate not found" });
    }

    const updated = {
        ...db.certificates[index],
        title: req.body.title || db.certificates[index].title,
        description: req.body.description || db.certificates[index].description,
        platform: req.body.platform || db.certificates[index].platform,
        category: req.body.category || db.certificates[index].category,
        date: req.body.date || db.certificates[index].date,
        skills: req.body.skills
            ? req.body.skills.split(",").map(s => s.trim())
            : db.certificates[index].skills,
        url: req.body.url || db.certificates[index].url,
        verifyUrl: req.body.verifyUrl || db.certificates[index].verifyUrl,
        imageUrl: req.body.imageUrl || db.certificates[index].imageUrl,
    };

    if (req.file) {
        updated.fileUrl = `/uploads/certificates/${req.file.filename}`;
    }

    db.certificates[index] = updated;
    saveDB(db);

    res.json(updated);
});

app.put("/api/projects/:id", requireAdmin, upload.single("file"), (req, res) => {
    const db = readDB();
    const index = db.projects.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: "Project not found" });
    }

    const updated = {
        ...db.projects[index],
        title: req.body.title || db.projects[index].title,
        description: req.body.description || db.projects[index].description,
        technologies: req.body.technologies
            ? req.body.technologies.split(",").map(t => t.trim())
            : db.projects[index].technologies,
        demo: req.body.demo || db.projects[index].demo,
        github: req.body.github || db.projects[index].github,
        imageUrl: req.body.imageUrl || db.projects[index].imageUrl,
    };

    if (req.file) {
        updated.fileUrl = `/uploads/projects/${req.file.filename}`;
    }

    db.projects[index] = updated;
    saveDB(db);

    res.json(updated);
});

app.delete("/api/certificates/:id", requireAdmin, (req, res) => {
    const db = readDB();
    db.certificates = db.certificates.filter(c => c.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

app.delete("/api/projects/:id", requireAdmin, (req, res) => {
    const db = readDB();
    db.projects = db.projects.filter(p => p.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

app.use((req, res) => {
    res.status(404).json({
        message: "Endpoint not found"
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: err.message || "Internal Server Error"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("==================================");
    console.log(`🚀 Portfolio Backend Running`);
    console.log(`📍 Port ${PORT}`);
    console.log("==================================");
});