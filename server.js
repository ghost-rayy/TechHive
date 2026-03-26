import express from 'express';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', true);

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// PostgreSQL Configuration
if (!process.env.DATABASE_URL) {
  console.error('CRITICAL: DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Multer in-memory storage for Cloudinary uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function initializeDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC NOT NULL,
        description TEXT,
        image TEXT,
        specs TEXT,
        rating NUMERIC,
        reviews INTEGER,
        isNew BOOLEAN DEFAULT FALSE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        items TEXT NOT NULL,
        total NUMERIC NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY,
        ip TEXT,
        user_agent TEXT,
        lastVisit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS part_requests (
        id TEXT PRIMARY KEY,
        brand TEXT,
        model TEXT,
        part TEXT,
        whatsapp TEXT,
        status TEXT DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Connected and initialized PostgreSQL database');
  } catch (err) {
    console.error('Error initializing database', err);
  }
}

initializeDb();

const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// --- Products Endpoints ---

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products");
    console.log(`Fetched ${rows.length} products from database`);
    const products = rows.map(row => {
      let parsedSpecs = [];
      try {
        parsedSpecs = row.specs ? (row.specs.startsWith('[') ? JSON.parse(row.specs) : row.specs.split(',').map(s => s.trim())) : [];
      } catch (e) {
        console.error("Failed to parse specs for product", row.id, row.specs);
      }
      return {
        ...row,
        price: parseFloat(row.price),
        specs: parsedSpecs,
        isNew: !!row.isnew,
        image: row.image || '',
        rating: parseFloat(row.rating || 4.5)
      };
    });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, category, price, description, specs, isNew, rating } = req.body;
  const id = Date.now().toString();
  
  let image = req.body.image; 
  if (req.file) {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "techhive_products"
      });
      image = result.secure_url;
    } catch (err) {
      return res.status(500).json({ error: 'Cloudinary upload failed: ' + err.message });
    }
  }

  let finalSpecs = specs;
  if (typeof specs === 'string' && !specs.startsWith('[')) {
    finalSpecs = JSON.stringify(specs.split(',').map(s => s.trim()).filter(s => s.length > 0));
  } else if (!specs) {
    finalSpecs = JSON.stringify([]);
  }

  try {
    const finalRating = rating ? parseFloat(rating) : 4.5;
    await pool.query(
      'INSERT INTO products (id, name, category, price, description, image, specs, isNew, rating, reviews) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [id, name, category, price, description || '', image || '', finalSpecs, isNew === 'true', finalRating, 0]
    );
    res.status(201).json({ message: 'Product added successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, specs, isNew, rating } = req.body;
  
  let image = req.body.image; 
  if (req.file) {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "techhive_products"
      });
      image = result.secure_url;
    } catch (err) {
      return res.status(500).json({ error: 'Cloudinary upload failed: ' + err.message });
    }
  }

  let finalSpecs = specs;
  if (typeof specs === 'string' && !specs.startsWith('[')) {
    finalSpecs = JSON.stringify(specs.split(',').map(s => s.trim()).filter(s => s.length > 0));
  } else if (!specs) {
    // Keep existing specs if not provided, or set to empty array if needed.
    // Usually we want to keep what's there if not in the payload.
  }

  try {
    const isNewBool = isNew === 'true' || isNew === 'on';
    const ratingNum = rating ? parseFloat(rating) : null;

    let query = 'UPDATE products SET name = $1, category = $2, price = $3, description = $4, specs = $5, isNew = $6';
    let params = [name, category, price, description, finalSpecs, isNewBool];

    let paramIdx = 7;
    if (image) {
      query += `, image = $${paramIdx++}`;
      params.push(image);
    }
    if (ratingNum !== null) {
      query += `, rating = $${paramIdx++}`;
      params.push(ratingNum);
    }

    query += ` WHERE id = $${paramIdx}`;
    params.push(id);

    await pool.query(query, params);
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Requests Endpoints ---

app.get('/api/requests', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM requests ORDER BY \"createdat\" DESC");
    const requests = rows.map(row => ({
      ...row,
      total: parseFloat(row.total),
      items: JSON.parse(row.items)
    }));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/requests', async (req, res) => {
  const { name, email, phone, address, items, total } = req.body;
  const id = 'REQ' + Date.now().toString();
  
  try {
    await pool.query(
      "INSERT INTO requests (id, name, email, phone, address, items, total) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [id, name, email, phone, address, JSON.stringify(items), total]
    );
    res.status(201).json({ message: 'Request submitted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await pool.query("UPDATE requests SET status = $1 WHERE id = $2", [status, id]);
    res.json({ message: 'Request updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Part Requests Endpoints ---

app.get('/api/part-requests', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM part_requests ORDER BY createdAt DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/part-requests', async (req, res) => {
  const { brand, model, part, whatsapp } = req.body;
  const id = 'PRQ' + Date.now().toString();
  
  try {
    await pool.query(
      "INSERT INTO part_requests (id, brand, model, part, whatsapp) VALUES ($1, $2, $3, $4, $5)",
      [id, brand, model, part, whatsapp]
    );
    res.status(201).json({ message: 'Part request submitted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/part-requests/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await pool.query("UPDATE part_requests SET status = $1 WHERE id = $2", [status, id]);
    res.json({ message: 'Part request updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/part-requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM part_requests WHERE id = $1", [id]);
    res.json({ message: 'Part request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM requests WHERE id = $1", [id]);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Stats & Visitors Endpoints ---

app.post('/api/visit', async (req, res) => {
  const { visitorId, userAgent } = req.body;
  const ip = req.ip;

  if (!visitorId) return res.status(400).json({ error: 'visitorId is required' });

  // Basic bot filtering
  const botKeywords = ['bot', 'crawler', 'spider', 'criteo', 'lighthouse', 'headless'];
  const isBot = userAgent && botKeywords.some(keyword => userAgent.toLowerCase().includes(keyword));
  
  if (isBot) return res.status(200).json({ message: 'Bot visit ignored' });

  try {
    await pool.query(
      "INSERT INTO visitors (id, ip, user_agent, \"lastvisit\") VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET \"lastvisit\" = CURRENT_TIMESTAMP, ip = $2, user_agent = $3",
      [visitorId, ip, userAgent]
    );
    res.status(200).json({ message: 'Visit recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/stats/visitors', async (req, res) => {
  try {
    await pool.query("DELETE FROM visitors");
    res.json({ message: 'Visitor count reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats/summary', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*) as visitors FROM visitors");
    res.json({
      totalVisitors: parseInt(rows[0].visitors)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    // Assets (js, css, images) can be cached for longer if they have hashes
    // but index.html MUST never be cached
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Fallback for SPA routing - serve index.html with no-cache headers
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }, (err) => {
    if (err && !res.headersSent) {
      // If index.html is missing (e.g. build failed), return a simple message
      res.status(404).send('Application not found. Please ensure the project is built.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
