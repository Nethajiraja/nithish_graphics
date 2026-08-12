import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  : null;

// In-memory / JSON file fallback if no PostgreSQL connection is present
const FALLBACK_DIR = process.env.VERCEL || process.env.TMPDIR
  ? path.join(process.env.TMPDIR || '/tmp', '.data')
  : path.join(process.cwd(), '.data');

const ORDERS_FILE = path.join(FALLBACK_DIR, 'orders.json');
const DOCUMENTS_FILE = path.join(FALLBACK_DIR, 'documents.json');
const PRICING_FILE = path.join(FALLBACK_DIR, 'pricing.json');
const SETTINGS_FILE = path.join(FALLBACK_DIR, 'settings.json');
const ADMINS_FILE = path.join(FALLBACK_DIR, 'admins.json');
const USERS_FILE = path.join(FALLBACK_DIR, 'users.json');

function ensureFallbackStorage() {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Storage directory fallback warning:", err);
  }
}

function readJsonFile(filePath: string, defaultData: any) {
  ensureFallbackStorage();
  try {
    if (!fs.existsSync(filePath)) {
      try { fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2)); } catch (e) {}
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return defaultData;
  }
}

function writeJsonFile(filePath: string, data: any) {
  ensureFallbackStorage();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn("writeJsonFile warning:", err);
  }
}

// Initial Data Seeds
export const DEFAULT_BUSINESS_INFO = {
  name: "Nithish Graphics",
  phone: "7598730609",
  whatsapp: "917598730609",
  email: "contact@nithishgraphics2310@gmail.com",
  address: "No. 10, School Street, Reddichavadi, near AVMC Medical College and Rajiv Gandhi College of Engineering and Technology",
  city: "Cuddalore",
  state: "Tamil Nadu",
  pincode: "607002",
  openingHours: "Monday - Saturday: 8:30 AM - 9:30 PM | Sunday: 10:00 AM - 6:00 PM",
  canonicalDomain: process.env.CANONICAL_DOMAIN || "https://www.nithishgraphics.com",
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || "",
  whatsappTemplate: "Hi Nithish Graphics! Order #{order_id} placed. Name: {customer_name}. Total: ₹{total_price}. Download files: {download_links}",
  minOrderQuantity: "1"
};

export const INITIAL_PRICING_RATES = [
  {
    id: "p1",
    category: "B/W Printing",
    name: "A4 B/W Printing (70 GSM)",
    unit: "per page",
    priceSingle: 2.00,
    priceDouble: 1.50,
    description: "Standard paper for daily study notes and general documents.",
    isActive: true
  },
  {
    id: "p2",
    category: "B/W Printing",
    name: "A4 B/W Printing (80 GSM Executive)",
    unit: "per page",
    priceSingle: 3.00,
    priceDouble: 2.00,
    description: "Thicker premium bond paper for project reports and official documents.",
    isActive: true
  },
  {
    id: "p3",
    category: "Color Printing",
    name: "A4 Color Printing (Standard)",
    unit: "per page",
    priceSingle: 10.00,
    priceDouble: 8.00,
    description: "HD inkjet color printing for charts, diagrams, and assignments.",
    isActive: true
  },
  {
    id: "p4",
    category: "Color Printing",
    name: "A4 Color Laser Printing (High Gloss)",
    unit: "per page",
    priceSingle: 15.00,
    priceDouble: 12.00,
    description: "Premium laser photo-quality print on glossy bond/photo paper.",
    isActive: true
  },
  {
    id: "p5",
    category: "Binding Services",
    name: "Spiral Binding (Up to 150 Pages)",
    unit: "per document",
    priceSingle: 40.00,
    priceDouble: 40.00,
    description: "PVC spiral coil with front transparent cover & back card.",
    isActive: true
  },
  {
    id: "p6",
    category: "Binding Services",
    name: "Spiral Binding (150+ to 400 Pages)",
    unit: "per document",
    priceSingle: 50.00,
    priceDouble: 50.00,
    description: "Extra large gauge coil for thick notes & subject books.",
    isActive: true
  },
  {
    id: "p7",
    category: "Binding Services",
    name: "Soft / Thermal Tape Binding",
    unit: "per book",
    priceSingle: 50.00,
    priceDouble: 50.00,
    description: "Clean taped spine softcover for project reports.",
    isActive: true
  },
  {
    id: "p8",
    category: "Binding Services",
    name: "College Record Hardcover Binding",
    unit: "per record",
    priceSingle: 80.00,
    priceDouble: 80.00,
    description: "Sturdy hardcover record binding with custom gold embossing.",
    isActive: true
  }
];

let isDbInitialized = false;

export async function initDatabase() {
  if (isDbInitialized) return;
  isDbInitialized = true;

  if (pool) {
    try {
      console.log('Connecting to PostgreSQL database...');
      // 0. Users table (Customers & Admins)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50),
          password_hash VARCHAR(255),
          role VARCHAR(50) DEFAULT 'CUSTOMER',
          is_active BOOLEAN DEFAULT TRUE,
          google_id VARCHAR(255) UNIQUE,
          auth_provider VARCHAR(50) DEFAULT 'LOCAL',
          profile_image_url TEXT,
          last_login_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'LOCAL';`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;`);

      // 1. Orders table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id VARCHAR(50) PRIMARY KEY,
          customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          service VARCHAR(255) NOT NULL,
          quantity INTEGER DEFAULT 1,
          pages_per_copy INTEGER DEFAULT 1,
          color_type VARCHAR(50) NOT NULL,
          paper_size VARCHAR(50) DEFAULT 'A4',
          paper_gsm VARCHAR(50) DEFAULT '70gsm',
          print_side VARCHAR(50) NOT NULL,
          binding_type VARCHAR(100) NOT NULL,
          additional_instructions TEXT,
          total_price NUMERIC(10, 2) NOT NULL,
          payment_status VARCHAR(50) DEFAULT 'Unpaid',
          order_status VARCHAR(50) DEFAULT 'Pending',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`);

      // 2. Order documents table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_documents (
          document_id SERIAL PRIMARY KEY,
          order_id VARCHAR(50) REFERENCES orders(order_id) ON DELETE CASCADE,
          original_filename VARCHAR(500) NOT NULL,
          stored_filename VARCHAR(500) NOT NULL,
          storage_path TEXT NOT NULL,
          mime_type VARCHAR(255) NOT NULL,
          file_size BIGINT NOT NULL,
          download_token VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Services pricing table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS services_pricing (
          id VARCHAR(50) PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          price_single NUMERIC(10, 2) NOT NULL,
          price_double NUMERIC(10, 2),
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed initial pricing if empty
      const pricingRes = await pool.query(`SELECT COUNT(*) FROM services_pricing`);
      if (parseInt(pricingRes.rows[0].count) === 0) {
        for (const item of INITIAL_PRICING_RATES) {
          await pool.query(
            `INSERT INTO services_pricing (id, category, name, unit, price_single, price_double, description, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [item.id, item.category, item.name, item.unit, item.priceSingle, item.priceDouble || item.priceSingle, item.description, item.isActive]
          );
        }
      }

      // 4. Business settings table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS business_settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value TEXT NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed initial settings if empty
      const settingsRes = await pool.query(`SELECT COUNT(*) FROM business_settings`);
      if (parseInt(settingsRes.rows[0].count) === 0) {
        for (const [key, value] of Object.entries(DEFAULT_BUSINESS_INFO)) {
          await pool.query(
            `INSERT INTO business_settings (setting_key, setting_value) VALUES ($1, $2)`,
            [key, String(value)]
          );
        }
      }

      // 5. Admins table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed initial admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@nithishgraphics.com';
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
      const adminRes = await pool.query(`SELECT * FROM admins WHERE email = $1`, [adminEmail]);
      if (adminRes.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(adminPass, 10);
        await pool.query(
          `INSERT INTO admins (email, password_hash) VALUES ($1, $2)`,
          [adminEmail, hashedPassword]
        );
        await pool.query(
          `INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
          ['System Admin', adminEmail, '7598730609', hashedPassword, 'ADMIN']
        );
        console.log(`Initial admin created with email: ${adminEmail}`);
      }

      console.log('PostgreSQL database initialized successfully.');
    } catch (err) {
      console.error('Error initializing PostgreSQL database:', err);
    }
  } else {
    console.log('Using local JSON storage fallback for development.');
    readJsonFile(USERS_FILE, []);
    readJsonFile(ORDERS_FILE, []);
    readJsonFile(DOCUMENTS_FILE, []);
    readJsonFile(PRICING_FILE, INITIAL_PRICING_RATES);
    readJsonFile(SETTINGS_FILE, DEFAULT_BUSINESS_INFO);
    
    // Seed initial admin fallback
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nithishgraphics.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const admins = readJsonFile(ADMINS_FILE, []);
    if (!admins.some((a: any) => a.email === adminEmail)) {
      const hash = bcrypt.hashSync(adminPass, 10);
      admins.push({ id: 1, email: adminEmail, password_hash: hash });
      writeJsonFile(ADMINS_FILE, admins);
    }
    const users = readJsonFile(USERS_FILE, []);
    if (!users.some((u: any) => u.email === adminEmail)) {
      const hash = bcrypt.hashSync(adminPass, 10);
      users.push({ id: 1, name: 'System Admin', email: adminEmail, phone: '7598730609', password_hash: hash, role: 'ADMIN', is_active: true, created_at: new Date().toISOString() });
      writeJsonFile(USERS_FILE, users);
    }
  }
}

// Data Access Layer Helpers
export async function getStoreSettings(): Promise<Record<string, string>> {
  if (pool) {
    const res = await pool.query(`SELECT setting_key, setting_value FROM business_settings`);
    const settings: Record<string, string> = { ...DEFAULT_BUSINESS_INFO };
    res.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  }
  return readJsonFile(SETTINGS_FILE, DEFAULT_BUSINESS_INFO);
}

export async function updateStoreSettings(newSettings: Record<string, string>): Promise<Record<string, string>> {
  if (pool) {
    for (const [key, value] of Object.entries(newSettings)) {
      await pool.query(
        `INSERT INTO business_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }
    return getStoreSettings();
  }
  const current = readJsonFile(SETTINGS_FILE, DEFAULT_BUSINESS_INFO);
  const updated = { ...current, ...newSettings };
  writeJsonFile(SETTINGS_FILE, updated);
  return updated;
}

export async function getPricingRates(): Promise<any[]> {
  if (pool) {
    const res = await pool.query(`SELECT id, category, name, unit, price_single AS "priceSingle", price_double AS "priceDouble", description, is_active AS "isActive" FROM services_pricing ORDER BY category, name`);
    return res.rows.map(r => ({
      ...r,
      priceSingle: parseFloat(r.priceSingle),
      priceDouble: r.priceDouble ? parseFloat(r.priceDouble) : parseFloat(r.priceSingle)
    }));
  }
  return readJsonFile(PRICING_FILE, INITIAL_PRICING_RATES);
}

export async function savePricingRate(rate: any): Promise<any> {
  if (pool) {
    await pool.query(
      `INSERT INTO services_pricing (id, category, name, unit, price_single, price_double, description, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         category = $2, name = $3, unit = $4, price_single = $5, price_double = $6, description = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP`,
      [rate.id, rate.category, rate.name, rate.unit, rate.priceSingle, rate.priceDouble || rate.priceSingle, rate.description || '', rate.isActive !== false]
    );
    return rate;
  }
  const rates = readJsonFile(PRICING_FILE, INITIAL_PRICING_RATES);
  const idx = rates.findIndex((r: any) => r.id === rate.id);
  if (idx >= 0) {
    rates[idx] = { ...rates[idx], ...rate };
  } else {
    rates.push(rate);
  }
  writeJsonFile(PRICING_FILE, rates);
  return rate;
}

export async function deletePricingRate(id: string): Promise<boolean> {
  if (pool) {
    await pool.query(`DELETE FROM services_pricing WHERE id = $1`, [id]);
    return true;
  }
  let rates = readJsonFile(PRICING_FILE, INITIAL_PRICING_RATES);
  rates = rates.filter((r: any) => r.id !== id);
  writeJsonFile(PRICING_FILE, rates);
  return true;
}

export async function createOrder(orderData: any, documents: any[]): Promise<any> {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const orderRes = await client.query(
        `INSERT INTO orders (
          order_id, customer_id, customer_name, customer_phone, service, quantity, pages_per_copy,
          color_type, paper_size, paper_gsm, print_side, binding_type,
          additional_instructions, total_price, payment_status, order_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          orderData.orderId, orderData.customerId || null, orderData.customerName, orderData.customerPhone, orderData.service,
          orderData.quantity || 1, orderData.pagesPerCopy || 1, orderData.colorType,
          orderData.paperSize || 'A4', orderData.paperGsm || '70gsm', orderData.printSide,
          orderData.bindingType, orderData.additionalInstructions || '', orderData.totalPrice,
          orderData.paymentStatus || 'Unpaid', orderData.orderStatus || 'Pending'
        ]
      );

      const createdDocs = [];
      for (const doc of documents) {
        const docRes = await client.query(
          `INSERT INTO order_documents (
            order_id, original_filename, stored_filename, storage_path, mime_type, file_size, download_token
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            orderData.orderId, doc.originalFilename, doc.storedFilename, doc.storagePath,
            doc.mimeType, doc.fileSize, doc.downloadToken
          ]
        );
        createdDocs.push(docRes.rows[0]);
      }

      await client.query('COMMIT');
      return { order: orderRes.rows[0], documents: createdDocs };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  const orders = readJsonFile(ORDERS_FILE, []);
  const allDocs = readJsonFile(DOCUMENTS_FILE, []);

  const newOrder = {
    order_id: orderData.orderId,
    customer_id: orderData.customerId || null,
    customer_name: orderData.customerName,
    customer_phone: orderData.customerPhone,
    service: orderData.service,
    quantity: orderData.quantity || 1,
    pages_per_copy: orderData.pagesPerCopy || 1,
    color_type: orderData.colorType,
    paper_size: orderData.paperSize || 'A4',
    paper_gsm: orderData.paperGsm || '70gsm',
    print_side: orderData.printSide,
    binding_type: orderData.bindingType,
    additional_instructions: orderData.additionalInstructions || '',
    total_price: orderData.totalPrice,
    payment_status: orderData.paymentStatus || 'Unpaid',
    order_status: orderData.orderStatus || 'Pending',
    created_at: new Date().toISOString()
  };

  orders.unshift(newOrder);
  writeJsonFile(ORDERS_FILE, orders);

  const createdDocs = documents.map(d => ({
    document_id: Date.now() + Math.random(),
    order_id: orderData.orderId,
    original_filename: d.originalFilename,
    stored_filename: d.storedFilename,
    storage_path: d.storagePath,
    mime_type: d.mimeType,
    file_size: d.fileSize,
    download_token: d.downloadToken,
    created_at: new Date().toISOString()
  }));

  allDocs.push(...createdDocs);
  writeJsonFile(DOCUMENTS_FILE, allDocs);

  return { order: newOrder, documents: createdDocs };
}

export async function getAllOrders(): Promise<any[]> {
  if (pool) {
    const ordersRes = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC`);
    const docsRes = await pool.query(`SELECT * FROM order_documents`);
    
    const docsByOrder: Record<string, any[]> = {};
    docsRes.rows.forEach(doc => {
      if (!docsByOrder[doc.order_id]) docsByOrder[doc.order_id] = [];
      docsByOrder[doc.order_id].push(doc);
    });

    return ordersRes.rows.map(o => ({
      ...o,
      documents: docsByOrder[o.order_id] || []
    }));
  }

  const orders = readJsonFile(ORDERS_FILE, []);
  const allDocs = readJsonFile(DOCUMENTS_FILE, []);

  const docsByOrder: Record<string, any[]> = {};
  allDocs.forEach((doc: any) => {
    if (!docsByOrder[doc.order_id]) docsByOrder[doc.order_id] = [];
    docsByOrder[doc.order_id].push(doc);
  });

  return orders.map((o: any) => ({
    ...o,
    documents: docsByOrder[o.order_id] || []
  }));
}

export async function updateOrderStatus(orderId: string, orderStatus: string, paymentStatus?: string): Promise<any> {
  if (pool) {
    let query = `UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP`;
    const params: any[] = [orderStatus];
    if (paymentStatus) {
      query += `, payment_status = $2`;
      params.push(paymentStatus);
    }
    query += ` WHERE order_id = $${params.length + 1} RETURNING *`;
    params.push(orderId);

    const res = await pool.query(query, params);
    return res.rows[0];
  }

  const orders = readJsonFile(ORDERS_FILE, []);
  const order = orders.find((o: any) => o.order_id === orderId);
  if (order) {
    order.order_status = orderStatus;
    if (paymentStatus) order.payment_status = paymentStatus;
    writeJsonFile(ORDERS_FILE, orders);
  }
  return order;
}

export async function getDocumentByToken(token: string): Promise<any | null> {
  if (pool) {
    const res = await pool.query(`SELECT * FROM order_documents WHERE download_token = $1`, [token]);
    return res.rows[0] || null;
  }
  const allDocs = readJsonFile(DOCUMENTS_FILE, []);
  return allDocs.find((d: any) => (d.download_token && d.download_token === token) || (d.downloadToken && d.downloadToken === token)) || null;
}

export async function getAdminByEmail(email: string): Promise<any | null> {
  if (pool) {
    const res = await pool.query(`SELECT * FROM admins WHERE email = $1`, [email]);
    return res.rows[0] || null;
  }
  const admins = readJsonFile(ADMINS_FILE, []);
  return admins.find((a: any) => a.email === email) || null;
}

// User & Customer Management Helper Functions

export async function createUser(userData: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role?: string;
}): Promise<any> {
  const role = userData.role || 'CUSTOMER';

  if (pool) {
    const res = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, is_active, created_at`,
      [userData.name, userData.email.toLowerCase(), userData.phone, userData.passwordHash, role]
    );
    return res.rows[0];
  }

  const users = readJsonFile(USERS_FILE, []);
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map((u: any) => Number(u.id) || 0)) + 1 : 1,
    name: userData.name,
    email: userData.email.toLowerCase(),
    phone: userData.phone,
    password_hash: userData.passwordHash,
    role,
    is_active: true,
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  writeJsonFile(USERS_FILE, users);

  const { password_hash, ...safeUser } = newUser;
  return safeUser;
}

export async function findUserByIdentifier(identifier: string): Promise<any | null> {
  const term = identifier.trim().toLowerCase();

  if (pool) {
    const res = await pool.query(
      `SELECT * FROM users WHERE LOWER(email) = $1 OR phone = $2 LIMIT 1`,
      [term, identifier.trim()]
    );
    return res.rows[0] || null;
  }

  const users = readJsonFile(USERS_FILE, []);
  return users.find((u: any) => u.email.toLowerCase() === term || u.phone === identifier.trim()) || null;
}

export async function findUserById(id: number | string): Promise<any | null> {
  if (pool) {
    const res = await pool.query(`SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  const users = readJsonFile(USERS_FILE, []);
  const user = users.find((u: any) => String(u.id) === String(id));
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function updateUserProfile(id: number | string, data: { name?: string; email?: string; phone?: string; passwordHash?: string }): Promise<any> {
  if (pool) {
    let query = `UPDATE users SET updated_at = CURRENT_TIMESTAMP`;
    const params: any[] = [];

    if (data.name) {
      params.push(data.name);
      query += `, name = $${params.length}`;
    }
    if (data.email) {
      params.push(data.email.toLowerCase());
      query += `, email = $${params.length}`;
    }
    if (data.phone) {
      params.push(data.phone);
      query += `, phone = $${params.length}`;
    }
    if (data.passwordHash) {
      params.push(data.passwordHash);
      query += `, password_hash = $${params.length}`;
    }

    params.push(id);
    query += ` WHERE id = $${params.length} AND role = 'CUSTOMER' RETURNING id, name, email, phone, role, is_active, created_at`;

    const res = await pool.query(query, params);
    return res.rows[0];
  }

  const users = readJsonFile(USERS_FILE, []);
  const idx = users.findIndex((u: any) => String(u.id) === String(id));
  if (idx >= 0) {
    if (data.name) users[idx].name = data.name;
    if (data.email) users[idx].email = data.email.toLowerCase();
    if (data.phone) users[idx].phone = data.phone;
    if (data.passwordHash) users[idx].password_hash = data.passwordHash;
    users[idx].role = 'CUSTOMER'; // Enforce role stays CUSTOMER
    writeJsonFile(USERS_FILE, users);
    const { password_hash, ...safeUser } = users[idx];
    return safeUser;
  }
  return null;
}

export async function getAllCustomers(): Promise<any[]> {
  const allOrders = await getAllOrders();

  if (pool) {
    const res = await pool.query(
      `SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE role = 'CUSTOMER' ORDER BY created_at DESC`
    );

    return res.rows.map(user => {
      const userOrders = allOrders.filter(o => String(o.customer_id) === String(user.id) || o.customer_phone === user.phone || o.customer_name === user.name);
      const totalSpend = userOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);

      return {
        ...user,
        orderCount: userOrders.length,
        totalSpend,
        recentOrders: userOrders.slice(0, 5)
      };
    });
  }

  const users = readJsonFile(USERS_FILE, []);
  const customers = users.filter((u: any) => u.role === 'CUSTOMER' || !u.role);

  return customers.map((user: any) => {
    const userOrders = allOrders.filter((o: any) => String(o.customer_id) === String(user.id) || o.customer_phone === user.phone || o.customer_name === user.name);
    const totalSpend = userOrders.reduce((sum: number, o: any) => sum + Number(o.total_price || 0), 0);
    const { password_hash, ...safeUser } = user;

    return {
      ...safeUser,
      orderCount: userOrders.length,
      totalSpend,
      recentOrders: userOrders.slice(0, 5)
    };
  });
}

export async function toggleCustomerActive(id: number | string, isActive: boolean): Promise<any> {
  if (pool) {
    const res = await pool.query(
      `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, phone, role, is_active`,
      [isActive, id]
    );
    return res.rows[0];
  }

  const users = readJsonFile(USERS_FILE, []);
  const user = users.find((u: any) => String(u.id) === String(id));
  if (user) {
    user.is_active = isActive;
    writeJsonFile(USERS_FILE, users);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
  return null;
}

export async function getOrdersForCustomer(user: { id?: number | string; phone?: string; email?: string }): Promise<any[]> {
  const allOrders = await getAllOrders();
  return allOrders.filter((o: any) => {
    if (user.id && String(o.customer_id) === String(user.id)) return true;
    if (user.phone && o.customer_phone === user.phone) return true;
    return false;
  });
}

export async function findUserByGoogleId(googleId: string): Promise<any | null> {
  if (pool) {
    const res = await pool.query(
      `SELECT id, name, email, phone, role, is_active, google_id, auth_provider, profile_image_url, created_at, last_login_at FROM users WHERE google_id = $1`,
      [googleId]
    );
    return res.rows[0] || null;
  }

  const users = readJsonFile(USERS_FILE, []);
  const user = users.find((u: any) => u.google_id === googleId);
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function createGoogleUser(data: { name: string; email: string; googleId: string; profileImageUrl?: string; phone?: string }): Promise<any> {
  const emailClean = data.email.trim().toLowerCase();
  const now = new Date().toISOString();

  if (pool) {
    const res = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, google_id, auth_provider, profile_image_url, last_login_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'CUSTOMER', $5, 'GOOGLE', $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, phone, role, is_active, google_id, auth_provider, profile_image_url, created_at, last_login_at`,
      [data.name.trim(), emailClean, data.phone || '', '', data.googleId, data.profileImageUrl || '']
    );
    return res.rows[0];
  }

  const users = readJsonFile(USERS_FILE, []);
  const newId = users.length > 0 ? Math.max(...users.map((u: any) => Number(u.id) || 0)) + 1 : 1;
  const newUser = {
    id: newId,
    name: data.name.trim(),
    email: emailClean,
    phone: data.phone || '',
    password_hash: '',
    role: 'CUSTOMER',
    is_active: true,
    google_id: data.googleId,
    auth_provider: 'GOOGLE',
    profile_image_url: data.profileImageUrl || '',
    last_login_at: now,
    created_at: now,
    updated_at: now
  };
  users.push(newUser);
  writeJsonFile(USERS_FILE, users);
  const { password_hash, ...safeUser } = newUser;
  return safeUser;
}

export async function linkGoogleAccount(userId: number | string, googleId: string, profileImageUrl?: string): Promise<any> {
  const now = new Date().toISOString();

  if (pool) {
    const res = await pool.query(
      `UPDATE users
       SET google_id = $1,
           auth_provider = CASE WHEN auth_provider = 'LOCAL' THEN 'GOOGLE' ELSE auth_provider END,
           profile_image_url = COALESCE(NULLIF($2, ''), profile_image_url),
           last_login_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND role = 'CUSTOMER'
       RETURNING id, name, email, phone, role, is_active, google_id, auth_provider, profile_image_url, created_at, last_login_at`,
      [googleId, profileImageUrl || '', userId]
    );
    return res.rows[0];
  }

  const users = readJsonFile(USERS_FILE, []);
  const idx = users.findIndex((u: any) => String(u.id) === String(userId));
  if (idx >= 0) {
    users[idx].google_id = googleId;
    if (profileImageUrl) users[idx].profile_image_url = profileImageUrl;
    users[idx].last_login_at = now;
    users[idx].role = 'CUSTOMER'; // Security constraint
    writeJsonFile(USERS_FILE, users);
    const { password_hash, ...safeUser } = users[idx];
    return safeUser;
  }
  return null;
}

export async function updateCustomerMobile(userId: number | string, phone: string): Promise<any> {
  const phoneClean = phone.trim();

  if (pool) {
    const res = await pool.query(
      `UPDATE users SET phone = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND role = 'CUSTOMER' RETURNING id, name, email, phone, role, is_active, google_id, auth_provider, profile_image_url, created_at, last_login_at`,
      [phoneClean, userId]
    );
    return res.rows[0];
  }

  const users = readJsonFile(USERS_FILE, []);
  const idx = users.findIndex((u: any) => String(u.id) === String(userId));
  if (idx >= 0) {
    users[idx].phone = phoneClean;
    writeJsonFile(USERS_FILE, users);
    const { password_hash, ...safeUser } = users[idx];
    return safeUser;
  }
  return null;
}

