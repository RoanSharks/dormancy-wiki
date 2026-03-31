// --- Image Upload Middleware ---
const upload = require("./upload-middleware");
const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
// Serve uploaded images statically (must be before catch-all)
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
const PORT = process.env.PORT || 3001;
const DATA_PATH = path.join(__dirname, "data", "wiki.json");
const USERS_PATH = path.join(__dirname, "data", "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// --- Image Upload Endpoint ---
app.post("/api/upload", authenticateToken, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  // Return the public URL to the uploaded image
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});
// --- User Auth Helpers ---
async function readUsers() {
  if (!existsSync(USERS_PATH)) return [];
  const raw = await fs.readFile(USERS_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeUsers(users) {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

function generateToken(user) {
  return jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "2h" });
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}
// --- Auth Endpoints ---
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }
  try {
    const users = await readUsers();
    if (users.find((u) => u.username === username)) {
      return res.status(409).json({ message: "Username already exists." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = { username, password: hashed };
    users.push(user);
    await writeUsers(users);
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Registration failed." });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }
  try {
    const users = await readUsers();
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials." });
    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed." });
  }
});
const DIST_PATH = path.join(__dirname, "..", "dist");


async function readPages() {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writePages(pages) {
  await fs.writeFile(DATA_PATH, JSON.stringify(pages, null, 2), "utf-8");
}

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/api/pages", async (_, res) => {
  try {
    const pages = await readPages();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: "Failed to load pages." });
  }
});

app.get("/api/pages/:slug", async (req, res) => {
  try {
    const pages = await readPages();
    const page = pages.find((entry) => entry.slug === req.params.slug);

    if (!page) {
      return res.status(404).json({ message: "Page not found." });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: "Failed to load page." });
  }
});


// Save or update a page (with optional pinning)
app.post("/api/pages", authenticateToken, requireAdmin, async (req, res) => {
  const { title, slug, summary, content, pinned, category, image } = req.body;

  if (!title || !slug || !summary || !content) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const pages = await readPages();
    const normalizedSlug = String(slug).trim().toLowerCase();
    const existing = pages.find((entry) => entry.slug === normalizedSlug);

    // Pinning logic: max 3 pinned
    let pinCount = pages.filter((p) => p.pinned).length;
    // If pinning and not already pinned, check limit
    if (pinned && (!existing || !existing.pinned)) {
      if (pinCount >= 3) {
        return res.status(400).json({ message: "Maximum 3 pinned articles allowed." });
      }
    }

    if (existing) {
      existing.title = title;
      existing.summary = summary;
      existing.content = content;
      existing.category = category;
      if (typeof image !== "undefined") existing.image = image;
      if (typeof pinned !== "undefined") existing.pinned = !!pinned;
    } else {
      // Generate next ID in order
      let maxId = 0;
      for (const p of pages) {
        const pid = parseInt(p.id, 10);
        if (!isNaN(pid) && pid > maxId) maxId = pid;
      }
      const newId = String(maxId + 1);
      const newPage = { id: newId, title, slug: normalizedSlug, summary, content, category };
      if (typeof image !== "undefined") newPage.image = image;
      if (pinned) newPage.pinned = true;
      pages.push(newPage);
    }

    await writePages(pages);
    res.status(201).json({ message: "Page saved.", slug: normalizedSlug });
  } catch (error) {
    res.status(500).json({ message: "Failed to save page." });
  }
});

// Pin/unpin an article (admin only)
app.post("/api/pages/:slug/pin", authenticateToken, requireAdmin, async (req, res) => {
  const { pinned } = req.body;
  try {
    const pages = await readPages();
    const page = pages.find((entry) => entry.slug === req.params.slug);
    if (!page) return res.status(404).json({ message: "Page not found." });
    let pinCount = pages.filter((p) => p.pinned).length;
    if (pinned && !page.pinned && pinCount >= 3) {
      return res.status(400).json({ message: "Maximum 3 pinned articles allowed." });
    }
    page.pinned = !!pinned;
    await writePages(pages);
    res.json({ message: pinned ? "Article pinned." : "Article unpinned." });
  } catch (error) {
    res.status(500).json({ message: "Failed to update pin status." });
  }
});

// --- Admin check middleware ---
async function requireAdmin(req, res, next) {
  const users = await readUsers();
  const user = users.find((u) => u.username === req.user.username);
  if (!user || !user.admin) {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

// --- Delete Page Endpoint ---
app.delete("/api/pages/:slug", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pages = await readPages();
    const idx = pages.findIndex((entry) => entry.slug === req.params.slug);
    if (idx === -1) return res.status(404).json({ message: "Page not found." });
    pages.splice(idx, 1);
    await writePages(pages);
    res.json({ message: "Page deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete page." });
  }
});


if (existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  // Catch-all route for SPA (must be last)
  app.get(/.*/, (req, res, next) => {
    // Let API and static file requests through
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Dormancy wiki API listening on port ${PORT}`);
});
