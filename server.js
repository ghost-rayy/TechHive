import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDb();
  }
});

function initializeDb() {
  db.serialize(() => {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      specs TEXT,
      rating REAL,
      reviews INTEGER,
      isNew INTEGER DEFAULT 0
    )`);

    // Requests table
    db.run(`CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Visitors table
    db.run(`CREATE TABLE IF NOT EXISTS visitors (
      ip TEXT PRIMARY KEY,
      lastVisit DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (err) return;
      if (row.count === 0) {
        console.log('Database is empty and ready for products.');
      }
    });
  });
}

const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// --- Products Endpoints ---

app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const products = rows.map(row => {
      let parsedSpecs = [];
      try {
        parsedSpecs = row.specs ? (row.specs.startsWith('[') ? JSON.parse(row.specs) : row.specs.split(',').map(s => s.trim())) : [];
      } catch (e) {
        console.error("Failed to parse specs for product", row.id, row.specs);
      }
      return {
        ...row,
        specs: parsedSpecs,
        isNew: !!row.isNew,
        // Ensure image URL is absolute if it's a relative path from uploads
        image: row.image ? (row.image.startsWith('http') ? row.image : `${SERVER_URL}/${row.image}`) : 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop'
      };
    });
    res.json(products);
  });
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, category, price, description, specs, isNew } = req.body;
  const id = Date.now().toString();
  
  let image = req.body.image; 
  if (req.file) {
    image = `uploads/${req.file.filename}`;
  }

  let finalSpecs = specs;
  if (typeof specs === 'string' && !specs.startsWith('[')) {
    finalSpecs = JSON.stringify(specs.split(',').map(s => s.trim()).filter(s => s.length > 0));
  } else if (!specs) {
    finalSpecs = JSON.stringify([]);
  }

  const stmt = db.prepare("INSERT INTO products (id, name, category, price, description, image, specs, rating, reviews, isNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(
    id,
    name,
    category,
    price,
    description || '',
    image || '',
    finalSpecs,
    5.0,
    0,
    isNew === 'true' || isNew === 'on' || isNew === 1 ? 1 : 0,
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Product added successfully', id });
    }
  );
  stmt.finalize();
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted successfully' });
  });
});

// --- Requests Endpoints ---

app.get('/api/requests', (req, res) => {
  db.all("SELECT * FROM requests ORDER BY createdAt DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const requests = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
    res.json(requests);
  });
});

app.post('/api/requests', (req, res) => {
  const { name, email, phone, address, items, total } = req.body;
  const id = 'REQ' + Date.now().toString();
  
  const stmt = db.prepare("INSERT INTO requests (id, name, email, phone, address, items, total) VALUES (?, ?, ?, ?, ?, ?, ?)");
  stmt.run(
    id,
    name,
    email,
    phone,
    address,
    JSON.stringify(items),
    total,
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Request submitted successfully', id });
    }
  );
  stmt.finalize();
});

app.patch('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run("UPDATE requests SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Request updated successfully' });
  });
});

app.delete('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM requests WHERE id = ?", id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Request deleted successfully' });
  });
});

// --- Stats & Visitors Endpoints ---

app.post('/api/visit', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  db.run("INSERT OR REPLACE INTO visitors (ip, lastVisit) VALUES (?, CURRENT_TIMESTAMP)", [ip], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Visit recorded' });
  });
});

app.get('/api/stats/summary', (req, res) => {
  db.get("SELECT COUNT(*) as visitors FROM visitors", (err, visitorRow) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      totalVisitors: visitorRow.visitors
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
