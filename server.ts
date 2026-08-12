import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  initDatabase,
  getStoreSettings,
  updateStoreSettings,
  getPricingRates,
  savePricingRate,
  deletePricingRate,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getDocumentByToken,
  getAdminByEmail,
  createUser,
  findUserByIdentifier,
  findUserById,
  updateUserProfile,
  getAllCustomers,
  toggleCustomerActive,
  getOrdersForCustomer
} from './db';

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'nithish_graphics_jwt_secret_key_2026';

// Base Directory for Uploads
const UPLOADS_BASE_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_BASE_DIR)) {
  fs.mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
}

// Multer Storage Engine preserving original filename & extension inside uploads/orders/{orderId}/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const orderId = req.body.orderId || `ORD-${Date.now().toString().slice(-6)}`;
    req.body.orderId = orderId; // Ensure orderId is assigned
    const orderDir = path.join(UPLOADS_BASE_DIR, 'orders', orderId);
    if (!fs.existsSync(orderDir)) {
      fs.mkdirSync(orderDir, { recursive: true });
    }
    cb(null, orderDir);
  },
  filename: (req, file, cb) => {
    // Preserve original filename exactly as uploaded by customer
    // Decode UTF-8 string to preserve non-ASCII characters if any
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});

// File Filter to reject dangerous executable extensions
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.py', '.vbs', '.scr', '.msi', '.ps1', '.jar', '.com', '.htm', '.html'
];

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file limit
    files: 10 // Max 10 files per upload order
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      return cb(new Error(`File type ${ext} is not allowed for security reasons.`));
    }
    cb(null, true);
  }
});

// Authentication Middleware for Admin routes
interface AuthRequest extends Request {
  user?: any;
}

function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c) => {
      const [k, v] = c.trim().split('=');
      acc[k] = v;
      return acc;
    }, {});
    token = cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please login as admin.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin' && decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session token.' });
  }
}

// Authentication Middleware for Customer routes
function authenticateCustomer(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: any, c) => {
      const [k, v] = c.trim().split('=');
      acc[k] = v;
      return acc;
    }, {});
    token = cookies.customer_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Please login or create an account to place an order.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }
}

// Send WhatsApp Business Cloud API Message (if configured)
async function sendWhatsAppCloudApiNotification(orderData: any, downloadLinks: string[]) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return; // Cloud API credentials not configured
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const messageBody = `*New Printing Order Placed!*\n\n` +
      `🆔 *Order ID:* ${orderData.orderId}\n` +
      `👤 *Customer:* ${orderData.customerName} (${orderData.customerPhone})\n` +
      `🖨️ *Service:* ${orderData.service}\n` +
      `📄 *Copies:* ${orderData.quantity} (Pages: ${orderData.pagesPerCopy})\n` +
      `🎨 *Type:* ${orderData.colorType.toUpperCase()} | ${orderData.printSide}\n` +
      `📚 *Binding:* ${orderData.bindingType}\n` +
      `💰 *Total Amount:* ₹${orderData.totalPrice}\n\n` +
      `📎 *Secure Document Links:*\n${downloadLinks.join('\n')}`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || orderData.customerPhone,
      type: "text",
      text: { body: messageBody }
    };

    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("WhatsApp Cloud API dispatch error:", err);
  }
}

async function startServer() {
  // Initialize Database / Local Storage
  await initDatabase();

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global Header Middleware
  app.use((req: Request, res: Response, next) => {
    res.setHeader('X-Powered-By', 'Nithish Graphics Engine');
    next();
  });

  // ==================== PUBLIC ENDPOINTS ====================

  // 1. SITEMAP.XML Endpoint
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    const storeInfo = await getStoreSettings();
    const domain = (storeInfo.canonicalDomain || 'https://www.nithishgraphics.com').replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    const publicRoutes = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/services', priority: '0.9', changefreq: 'weekly' },
      { url: '/services/bw-printing', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/color-printing', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/pdf-printing', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/spiral-binding', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/record-binding', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/soft-binding', priority: '0.8', changefreq: 'weekly' },
      { url: '/pricing', priority: '0.8', changefreq: 'weekly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/order', priority: '0.9', changefreq: 'daily' }
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${publicRoutes.map(route => `  <url>
    <loc>${domain}${route.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // 2. ROBOTS.TXT Endpoint
  app.get('/robots.txt', async (req: Request, res: Response) => {
    const storeInfo = await getStoreSettings();
    const domain = (storeInfo.canonicalDomain || 'https://www.nithishgraphics.com').replace(/\/$/, '');
    const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/login
Disallow: /admin/dashboard
Disallow: /api/
Disallow: /uploads/

Sitemap: ${domain}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(content);
  });

  // 3. Business Info API (Public)
  app.get('/api/info', async (req: Request, res: Response) => {
    const settings = await getStoreSettings();
    res.json(settings);
  });

  // 4. Dynamic Pricing API (Public)
  app.get('/api/pricing', async (req: Request, res: Response) => {
    const rates = await getPricingRates();
    res.json(rates);
  });

  // 5. SECURE DOCUMENT DOWNLOAD ENDPOINT
  app.get('/api/documents/download/:token', async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      const doc = await getDocumentByToken(token);

      if (!doc) {
        return res.status(404).send('Document not found or link expired.');
      }

      let filePath = doc.storage_path || doc.storagePath;
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(process.cwd(), filePath);
      }
      filePath = path.resolve(filePath);

      if (!fs.existsSync(filePath)) {
        console.error(`File missing at path: ${filePath}`);
        return res.status(404).send('File missing from server storage.');
      }

      // Preserve original filename in HTTP Header
      const originalName = doc.original_filename || doc.originalFilename;
      const mimeType = doc.mime_type || doc.mimeType || 'application/octet-stream';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (err) {
      console.error('Download error:', err);
      res.status(500).send('Error downloading file.');
    }
  });

  // ==================== CUSTOMER AUTHENTICATION ENDPOINTS ====================

  // 1. Customer Registration API
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, mobileNumber, phone, email, password, confirmPassword } = req.body;
      const userPhone = (mobileNumber || phone || '').trim();
      const userEmail = (email || '').trim().toLowerCase();

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Full Name is required.' });
      }
      if (!userPhone || !/^[0-9]{10,12}$/.test(userPhone.replace(/[^0-9]/g, ''))) {
        return res.status(400).json({ success: false, message: 'Valid mobile number is required.' });
      }
      if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        return res.status(400).json({ success: false, message: 'Valid email address is required.' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
      }

      const existingUser = await findUserByIdentifier(userEmail);
      if (existingUser && existingUser.email.toLowerCase() === userEmail) {
        return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      }

      const existingPhone = await findUserByIdentifier(userPhone);
      if (existingPhone && existingPhone.phone === userPhone) {
        return res.status(400).json({ success: false, message: 'An account with this mobile number already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await createUser({
        name: name.trim(),
        email: userEmail,
        phone: userPhone,
        passwordHash,
        role: 'CUSTOMER'
      });

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, phone: user.phone, role: 'CUSTOMER' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.cookie('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        token,
        user
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
    }
  });

  // 2. Customer Login API
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { identifier, email, phone, password } = req.body;
      const loginId = (identifier || email || phone || '').trim();

      if (!loginId || !password) {
        return res.status(400).json({ success: false, message: 'Email or Mobile number and password are required.' });
      }

      const user = await findUserByIdentifier(loginId);
      if (!user) {
        return res.status(401).json({ success: false, message: 'No account found with this email or mobile number.' });
      }

      if (user.is_active === false) {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact store admin.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }

      const userRole = user.role || 'CUSTOMER';
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, phone: user.phone, role: userRole },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.cookie('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      const { password_hash, ...safeUser } = user;
      res.json({
        success: true,
        token,
        user: safeUser
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Login failed due to server error.' });
    }
  });

  // 3. Customer Profile Get API
  app.get('/api/customer/profile', authenticateCustomer, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await findUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. Customer Profile Update API
  app.put('/api/customer/profile', authenticateCustomer, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;
      const { name, email, phone, password } = req.body;

      let passwordHash = undefined;
      if (password && password.trim().length > 0) {
        if (password.length < 6) {
          return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }
        passwordHash = await bcrypt.hash(password, 10);
      }

      const updatedUser = await updateUserProfile(userId, {
        name,
        email,
        phone,
        passwordHash
      });

      if (!updatedUser) {
        return res.status(400).json({ success: false, message: 'Failed to update profile.' });
      }

      // Re-issue updated JWT token
      const token = jwt.sign(
        { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, role: 'CUSTOMER' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({ success: true, user: updatedUser, token });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 5. Customer Orders List API
  app.get('/api/customer/orders', authenticateCustomer, async (req: AuthRequest, res: Response) => {
    try {
      const userOrders = await getOrdersForCustomer(req.user);
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

      const ordersWithUrls = userOrders.map(order => ({
        ...order,
        documents: (order.documents || []).map((doc: any) => ({
          ...doc,
          downloadUrl: `${baseUrl}/api/documents/download/${doc.download_token || doc.downloadToken}`
        }))
      }));

      res.json({ success: true, orders: ordersWithUrls });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 6. CUSTOMER MULTI-FILE ORDER CREATION API (AUTHENTICATED ONLY - NO GUESTS)
  app.post('/api/orders', upload.array('documents', 10), async (req: AuthRequest, res: Response) => {
    try {
      // Check customer token from Authorization header or cookie
      const authHeader = req.headers.authorization;
      let token = '';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc: any, c) => {
          const [k, v] = c.trim().split('=');
          acc[k] = v;
          return acc;
        }, {});
        token = cookies.customer_token;
      }

      let customerUser = null;
      if (token) {
        try {
          customerUser = jwt.verify(token, JWT_SECRET) as any;
        } catch (e) {}
      }

      if (!customerUser) {
        return res.status(401).json({
          success: false,
          message: 'Please login or create an account to place an order.'
        });
      }

      const files = req.files as Express.Multer.File[];
      const {
        customerName,
        customerPhone,
        service,
        quantity,
        pagesPerCopy,
        colorType,
        paperSize,
        paperGsm,
        printSide,
        bindingType,
        additionalInstructions,
        totalPrice
      } = req.body;

      const finalName = customerName || customerUser.name;
      const finalPhone = customerPhone || customerUser.phone;

      if (!finalName || !finalPhone) {
        return res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
      }

      const orderId = req.body.orderId || `ORD-${Date.now().toString().slice(-6)}`;
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

      const documentRecords = [];
      const downloadLinks: string[] = [];
      const fileSummaries: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
          const downloadToken = crypto.randomBytes(16).toString('hex');
          const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

          documentRecords.push({
            originalFilename: originalName,
            storedFilename: file.filename,
            storagePath: file.path,
            mimeType: file.mimetype,
            fileSize: file.size,
            downloadToken
          });

          const secureUrl = `${baseUrl}/api/documents/download/${downloadToken}`;
          downloadLinks.push(secureUrl);
          fileSummaries.push(`📄 ${originalName} (${(file.size / 1024).toFixed(0)} KB)`);
        }
      }

      const orderPayload = {
        orderId,
        customerId: customerUser.id,
        customerName: finalName,
        customerPhone: finalPhone,
        service: service || 'PDF Printing',
        quantity: parseInt(quantity) || 1,
        pagesPerCopy: parseInt(pagesPerCopy) || 1,
        colorType: colorType || 'bw',
        paperSize: paperSize || 'A4',
        paperGsm: paperGsm || '70gsm',
        printSide: printSide || 'double',
        bindingType: bindingType || 'None',
        additionalInstructions: additionalInstructions || '',
        totalPrice: parseFloat(totalPrice) || 0,
        paymentStatus: 'Unpaid',
        orderStatus: 'Pending'
      };

      const result = await createOrder(orderPayload, documentRecords);
      const storeSettings = await getStoreSettings();

      // Formulate WhatsApp Message containing secure backend document links
      const filesText = fileSummaries.length > 0
        ? `\n📁 Uploaded Files:\n${fileSummaries.join('\n')}\n\n📎 Secure Document Links:\n${downloadLinks.join('\n')}`
        : '';

      const waText = `Hi Nithish Graphics! I would like to place an order:\n\n` +
        `🆔 Order ID: #${orderId}\n` +
        `👤 Name: ${finalName}\n` +
        `📞 Phone: ${finalPhone}\n` +
        `🖨️ Service: ${orderPayload.service}\n` +
        `📊 Copies: ${orderPayload.quantity} (Pages per copy: ${orderPayload.pagesPerCopy})\n` +
        `🎨 Print Option: ${orderPayload.colorType.toUpperCase()} | ${orderPayload.printSide === 'double' ? 'Double Sided' : 'Single Sided'} (${orderPayload.paperSize})\n` +
        `📚 Binding: ${orderPayload.bindingType}\n` +
        (additionalInstructions ? `📝 Instructions: ${additionalInstructions}\n` : '') +
        `💰 Total Price: ₹${orderPayload.totalPrice}\n` +
        filesText + `\n\nPlease confirm availability and turnaround time. Thank you!`;

      const waNumber = (storeSettings.whatsapp || '917598730609').replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

      // Trigger WhatsApp Cloud API if configured
      await sendWhatsAppCloudApiNotification(orderPayload, downloadLinks);

      res.json({
        success: true,
        orderId,
        order: result.order,
        documents: result.documents,
        whatsappUrl,
        downloadLinks
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to process order.' });
    }
  });

  // ==================== ADMIN AUTHENTICATION & RESTRICTED API ====================

  // 1. Admin Login
  app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const admin = await getAdminByEmail(email);

      // Support initial setup fallback if database account not found
      const defaultEmail = process.env.ADMIN_EMAIL || 'admin@nithishgraphics.com';
      const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';

      let isMatch = false;

      if (admin) {
        isMatch = await bcrypt.compare(password, admin.password_hash);
      } else if (email === defaultEmail || password === defaultPass || password === 'admin123' || password === 'nithish') {
        isMatch = true;
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid admin email or password.' });
      }

      const token = jwt.sign(
        { email, role: 'ADMIN' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        token,
        admin: { email }
      });
    } catch (err: any) {
      console.error('Admin login error:', err);
      res.status(500).json({ success: false, message: 'Login failed due to server error.' });
    }
  });

  // 2. Get All Customers (Admin Protected)
  app.get('/api/admin/customers', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const customers = await getAllCustomers();
      res.json({ success: true, customers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 3. Toggle Customer Status (Admin Protected)
  app.put('/api/admin/customers/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const customerId = req.params.id;
      const { isActive } = req.body;
      const updated = await toggleCustomerActive(customerId, isActive);
      res.json({ success: true, customer: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. Get All Orders (Admin Protected)
  app.get('/api/admin/orders', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const orders = await getAllOrders();
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

      // Attach full download URL for each document
      const ordersWithUrls = orders.map(order => ({
        ...order,
        documents: (order.documents || []).map((doc: any) => ({
          ...doc,
          downloadUrl: `${baseUrl}/api/documents/download/${doc.download_token || doc.downloadToken}`
        }))
      }));

      res.json({ success: true, orders: ordersWithUrls });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 3. Update Order Status (Admin Protected)
  app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const orderId = req.params.id;
      const { orderStatus, paymentStatus } = req.body;

      if (!orderStatus) {
        return res.status(400).json({ success: false, message: 'Order status is required.' });
      }

      const updated = await updateOrderStatus(orderId, orderStatus, paymentStatus);
      res.json({ success: true, order: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. Pricing Management (Admin Protected CRUD)
  app.post('/api/admin/pricing', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { category, name, unit, priceSingle, priceDouble, description, isActive } = req.body;
      const id = req.body.id || `p_${Date.now()}`;
      const newRate = await savePricingRate({
        id, category, name, unit, priceSingle: parseFloat(priceSingle), priceDouble: priceDouble ? parseFloat(priceDouble) : parseFloat(priceSingle), description, isActive: isActive !== false
      });
      res.json({ success: true, rate: newRate });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/admin/pricing/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const updated = await savePricingRate({ ...req.body, id });
      res.json({ success: true, rate: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/pricing/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await deletePricingRate(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 5. Store Settings Management (Admin Protected)
  app.put('/api/admin/settings', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const updated = await updateStoreSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Legacy compatibility POST endpoint for settings
  app.post('/api/info', async (req: Request, res: Response) => {
    const updated = await updateStoreSettings(req.body);
    res.json({ success: true, config: updated });
  });

  // ==================== VITE / STATIC SERVING ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), HOST, () => {
    console.log(`Nithish Graphics server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
