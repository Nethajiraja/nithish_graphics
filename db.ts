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
const FALLBACK_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(FALLBACK_DIR, 'orders.json');
const DOCUMENTS_FILE = path.join(FALLBACK_DIR, 'documents.json');
const PRICING_FILE = path.join(FALLBACK_DIR, 'pricing.json');
const SETTINGS_FILE = path.join(FALLBACK_DIR, 'settings.json');
const ADMINS_FILE = path.join(FALLBACK_DIR, 'admins.json');

function ensureFallbackStorage() {
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
  }
}

function readJsonFile(filePath: string, defaultData: any) {
  ensureFallbackStorage();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return defaultData;
  }
}

function writeJsonFile(filePath: string, data: any) {
  ensureFallbackStorage();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

export async function initDatabase() {
  if (pool) {
    try {
      console.log('Connecting to PostgreSQL database...');
      // 1. Orders table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id VARCHAR(50) PRIMARY KEY,
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
        console.log(`Initial admin created with email: ${adminEmail}`);
      }

      console.log('PostgreSQL database initialized successfully.');
    } catch (err) {
      console.error('Error initializing PostgreSQL database:', err);
    }
  } else {
    console.log('Using local JSON storage fallback for development.');
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
          order_id, customer_name, customer_phone, service, quantity, pages_per_copy,
          color_type, paper_size, paper_gsm, print_side, binding_type,
          additional_instructions, total_price, payment_status, order_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          orderData.orderId, orderData.customerName, orderData.customerPhone, orderData.service,
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
