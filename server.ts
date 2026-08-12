import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
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
  findUserByPhone,
  findUserById,
  updateUserProfile,
  getAllCustomers,
  toggleCustomerActive,
  getOrdersForCustomer,
  findUserByGoogleId,
  createGoogleUser,
  linkGoogleAccount,
  updateCustomerMobile,
  linkOrdersToCustomer,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceActive,
  deleteService,
  // Order management functions (previously missing — root cause of sync bug)
  generateOrderNumber,
  getAdminOrdersFiltered,
  getOrderById,
  getOrderByNumber,
  getOrderStatusHistory,
  recordStatusChange,
  getDashboardStats,
  trackOrderByNumberAndPhone
} from './db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'nithish_graphics_jwt_secret_key_2026';

// Base Directory for Uploads (uses /tmp/uploads when deployed on Vercel serverless)
const UPLOADS_BASE_DIR = process.env.VERCEL || process.env.TMPDIR
  ? path.join(process.env.TMPDIR || '/tmp', 'uploads')
  : path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_BASE_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
  } catch (e) {}
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

let appInstance: express.Express | null = null;

export async function createApp() {
  if (appInstance) return appInstance;

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
      { url: '/order', priority: '0.9', changefreq: 'daily' },
      { url: '/track-order', priority: '0.8', changefreq: 'daily' },
      { url: '/login', priority: '0.6', changefreq: 'monthly' },
      { url: '/register', priority: '0.6', changefreq: 'monthly' }
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
Disallow: /customer/
Disallow: /api/
Disallow: /uploads/

Sitemap: ${domain}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(content);
  });

  // 2b. DYNAMIC GOOGLE SEARCH CONSOLE HTML FILE VERIFICATION ENDPOINT
  // Automatically answers any Google verification request like /google1234567890.html
  app.get(/^\/google[a-zA-Z0-9_-]+\.html$/, (req: Request, res: Response) => {
    const filename = path.basename(req.path);
    res.header('Content-Type', 'text/html');
    res.send(`google-site-verification: ${filename}`);
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

  // 4b. Printing Services API (Public)
  app.get('/api/services', async (req: Request, res: Response) => {
    try {
      const services = await getAllServices(false);
      res.json({ success: true, services });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
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
      const userPhone = (mobileNumber || phone || '').replace(/[^0-9]/g, '').trim();
      const rawEmail = (email || '').trim();
      const userEmail = rawEmail ? rawEmail.toLowerCase() : undefined;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Full Name is required.' });
      }
      if (!userPhone || !/^[0-9]{10,12}$/.test(userPhone)) {
        return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required.' });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
      }

      const existingPhone = await findUserByPhone(userPhone);
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          code: 'ACCOUNT_EXISTS',
          message: 'An account already exists with this mobile number. Please login instead.'
        });
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
        { id: user.id, name: user.name, email: user.email || '', phone: user.phone, role: 'CUSTOMER' },
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

  // 2. Customer Login API (Strictly Phone Number + Password)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { identifier, phone, mobileNumber, password } = req.body;
      const rawPhone = (phone || mobileNumber || identifier || '').trim();
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

      if (!rawPhone || !password) {
        return res.status(400).json({ success: false, message: 'Mobile number and password are required.' });
      }

      const user = (await findUserByPhone(rawPhone)) || (await findUserByPhone(cleanPhone)) || (await findUserByIdentifier(rawPhone));
      if (!user) {
        return res.status(401).json({ success: false, message: 'No customer account found with this mobile number.' });
      }

      if (user.is_active === false) {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact store admin.' });
      }

      if (!user.password_hash) {
        return res.status(401).json({ success: false, message: 'Password is not set for this account.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }

      // Link any previous unlinked orders matching this user's phone
      if (user.phone) {
        await linkOrdersToCustomer(user.id, user.phone);
      }

      const userRole = 'CUSTOMER';
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email || '', phone: user.phone, role: userRole },
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
      safeUser.role = userRole;

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

  // 3. Current Authenticated User API (Authentication check on page load)
  app.get('/api/auth/me', async (req: AuthRequest, res: Response) => {
    try {
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
        return res.status(401).json({ success: false, message: 'Unauthenticated.' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await findUserById(decoded.id);
      if (!user || user.is_active === false) {
        return res.status(401).json({ success: false, message: 'Invalid or deactivated session.' });
      }

      const { password_hash, ...safeUser } = user;
      res.json({
        success: true,
        token,
        user: safeUser
      });
    } catch (err) {
      res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
    }
  });

  // 4. Logout Customer API
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('customer_token');
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // ==================== GOOGLE OAUTH 2.0 ENDPOINTS ====================

  // 2a. Initiate Google OAuth Authorization Redirect
  app.get('/api/auth/google', (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.redirect(`/login?error=${encodeURIComponent('Google Client ID is not configured on server.')}`);
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const defaultRedirectUri = `${protocol}://${host}/api/auth/google/callback`;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri;

    const state = crypto.randomBytes(16).toString('hex');
    res.cookie('oauth_state', state, { httpOnly: true, maxAge: 10 * 60 * 1000 });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&state=${encodeURIComponent(state)}` +
      `&prompt=select_account`;

    res.redirect(googleAuthUrl);
  });

  // 2b. Google OAuth Callback Endpoint
  app.get('/api/auth/google/callback', async (req: Request, res: Response) => {
    try {
      const { code, error } = req.query;

      if (error) {
        return res.redirect(`/login?error=${encodeURIComponent('Google login was cancelled or denied.')}`);
      }

      if (!code || typeof code !== 'string') {
        return res.redirect(`/login?error=${encodeURIComponent('Invalid authorization code from Google.')}`);
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return res.redirect(`/login?error=${encodeURIComponent('Google OAuth server credentials missing.')}`);
      }

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const defaultRedirectUri = `${protocol}://${host}/api/auth/google/callback`;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri;

      // Exchange code for Google Access Token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokenData: any = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        console.error('Google token exchange failed:', tokenData);
        return res.redirect(`/login?error=${encodeURIComponent(tokenData.error_description || 'Failed to authenticate code with Google.')}`);
      }

      // Fetch user profile from Google UserInfo endpoint
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      const profile: any = await profileRes.json();
      if (!profileRes.ok || !profile.email) {
        return res.redirect(`/login?error=${encodeURIComponent('Failed to retrieve user email from Google.')}`);
      }

      const googleId = profile.id;
      const email = profile.email.toLowerCase().trim();
      const name = profile.name || profile.given_name || email.split('@')[0];
      const picture = profile.picture || '';

      // Account Linking & Registration Logic
      let user = await findUserByGoogleId(googleId);

      if (!user) {
        const existingUser = await findUserByIdentifier(email);
        if (existingUser) {
          user = await linkGoogleAccount(existingUser.id, googleId, picture);
        } else {
          user = await createGoogleUser({
            name,
            email,
            googleId,
            profileImageUrl: picture
          });
        }
      } else {
        user = await linkGoogleAccount(user.id, googleId, picture);
      }

      if (!user || user.is_active === false) {
        return res.redirect(`/login?error=${encodeURIComponent('Account is deactivated. Please contact store admin.')}`);
      }

      // Strict Customer Role Enforcement
      const userRole = 'CUSTOMER';

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: userRole,
          google_id: user.google_id,
          profile_image_url: user.profile_image_url || picture
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.cookie('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      const safeUserData = JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: userRole,
        google_id: user.google_id,
        auth_provider: user.auth_provider || 'GOOGLE',
        profile_image_url: user.profile_image_url || picture
      });

      res.redirect(`/customer/dashboard?token=${encodeURIComponent(token)}&user=${encodeURIComponent(safeUserData)}&login=google_success`);
    } catch (err: any) {
      console.error('Google callback error:', err);
      res.redirect(`/login?error=${encodeURIComponent('Google login failed due to a server error.')}`);
    }
  });

  // 2c. Google One-Tap Credential Token Verification Endpoint
  app.post('/api/auth/google/credential', async (req: Request, res: Response) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({ success: false, message: 'Google credential token is required.' });
      }

      const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      const payload: any = await tokenInfoRes.json();

      if (!tokenInfoRes.ok || !payload.email) {
        return res.status(401).json({ success: false, message: 'Invalid Google credential token.' });
      }

      const googleId = payload.sub || payload.user_id;
      const email = payload.email.toLowerCase().trim();
      const name = payload.name || payload.given_name || email.split('@')[0];
      const picture = payload.picture || '';

      let user = await findUserByGoogleId(googleId);

      if (!user) {
        const existingUser = await findUserByIdentifier(email);
        if (existingUser) {
          user = await linkGoogleAccount(existingUser.id, googleId, picture);
        } else {
          user = await createGoogleUser({
            name,
            email,
            googleId,
            profileImageUrl: picture
          });
        }
      } else {
        user = await linkGoogleAccount(user.id, googleId, picture);
      }

      if (!user || user.is_active === false) {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact store admin.' });
      }

      const userRole = 'CUSTOMER';
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: userRole,
          google_id: user.google_id,
          profile_image_url: user.profile_image_url || picture
        },
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
      safeUser.role = userRole;

      res.json({
        success: true,
        token,
        user: safeUser
      });
    } catch (err: any) {
      console.error('Google credential verification error:', err);
      res.status(500).json({ success: false, message: 'Google authentication failed.' });
    }
  });

  // 2d. Update Customer Mobile Number Endpoint (for Google customers without phone number)
  app.put('/api/customer/mobile', authenticateCustomer, async (req: AuthRequest, res: Response) => {
    try {
      const { phone } = req.body;
      const cleanPhone = (phone || '').replace(/[^0-9]/g, '').trim();

      if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 12) {
        return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
      }

      const existingUser = await findUserByPhone(cleanPhone);
      if (existingUser && String(existingUser.id) !== String(req.user.id)) {
        return res.status(400).json({
          success: false,
          code: 'ACCOUNT_EXISTS',
          message: 'An account with this mobile number already belongs to another user.'
        });
      }

      const updatedUser = await updateCustomerMobile(req.user.id, cleanPhone);
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'Customer account not found.' });
      }

      await linkOrdersToCustomer(req.user.id, cleanPhone);

      const userRole = 'CUSTOMER';
      const token = jwt.sign(
        {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email || '',
          phone: updatedUser.phone,
          role: userRole,
          google_id: updatedUser.google_id,
          profile_image_url: updatedUser.profile_image_url
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      const { password_hash, ...safeUser } = updatedUser;
      safeUser.role = userRole;

      res.json({
        success: true,
        message: 'Mobile number updated successfully.',
        token,
        user: safeUser
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update mobile number.' });
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
      const orderNumber = await generateOrderNumber();
      req.body.orderId = orderId;
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
        orderNumber,
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
        `🆔 Order ID: ${orderNumber}\n` +
        `👤 Name: ${finalName}\n` +
        `📞 Phone: ${finalPhone}\n` +
        `🖨️ Service: ${orderPayload.service}\n` +
        `📊 Copies: ${orderPayload.quantity} (Pages per copy: ${orderPayload.pagesPerCopy})\n` +
        `🎨 Print Option: ${orderPayload.colorType.toUpperCase()} | ${orderPayload.printSide === 'double' ? 'Double Sided' : 'Single Sided'} (${orderPayload.paperSize})\n` +
        `📚 Binding: ${orderPayload.bindingType}\n` +
        (additionalInstructions ? `📝 Instructions: ${additionalInstructions}\n` : '') +
        `💰 Total Price: ₹${orderPayload.totalPrice}\n` +
        `📋 Status: Pending\n` +
        filesText + `\n\nPlease confirm availability and turnaround time. Thank you!`;

      const waNumber = (storeSettings.whatsapp || '917598730609').replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

      // Trigger WhatsApp Cloud API if configured
      await sendWhatsAppCloudApiNotification(orderPayload, downloadLinks);

      res.json({
        success: true,
        orderId,
        orderNumber,
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
      const { email, adminId, identifier, password } = req.body;
      const loginId = (email || adminId || identifier || '').trim();

      if (!loginId || !password) {
        return res.status(400).json({ success: false, message: 'Admin ID/Email and password are required.' });
      }

      const admin = await getAdminByEmail(loginId);

      let isMatch = false;

      if (admin && admin.password_hash) {
        isMatch = await bcrypt.compare(password, admin.password_hash);
      } else if (
        (loginId === 'nithishgraphics@admin' && password === 'iam@nethu*2310') ||
        (loginId === 'admin@nithishgraphics.com' && password === 'admin123')
      ) {
        isMatch = true;
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
      }

      const token = jwt.sign(
        { email: loginId, role: 'ADMIN' },
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
        admin: { email: loginId, role: 'ADMIN' }
      });
    } catch (err: any) {
      console.error('Admin login error:', err);
      res.status(500).json({ success: false, message: 'Login failed due to server error.' });
    }
  });

  // 1b. Admin Services APIs (Admin Protected CRUD)
  app.get('/api/admin/services', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const services = await getAllServices(true);
      res.json({ success: true, services });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/admin/services', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { name, description, price, pricing_unit, image_url, is_active } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Service name is required.' });
      }
      if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number.' });
      }
      if (!pricing_unit || !pricing_unit.trim()) {
        return res.status(400).json({ success: false, message: 'Pricing unit is required.' });
      }

      const newService = await createService({
        name: name.trim(),
        description,
        price: Number(price),
        pricing_unit: pricing_unit.trim(),
        image_url,
        is_active: is_active !== false
      });

      res.json({ success: true, service: newService });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create service.' });
    }
  });

  app.put('/api/admin/services/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const serviceId = req.params.id;
      const { name, description, price, pricing_unit, image_url, is_active } = req.body;

      if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
        return res.status(400).json({ success: false, message: 'Price must be a valid non-negative number.' });
      }

      const updated = await updateService(serviceId, {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        pricing_unit,
        image_url,
        is_active
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Service not found.' });
      }

      res.json({ success: true, service: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update service.' });
    }
  });

  app.patch('/api/admin/services/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const serviceId = req.params.id;
      const { isActive } = req.body;
      const updated = await toggleServiceActive(serviceId, Boolean(isActive));
      res.json({ success: true, service: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/admin/services/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const serviceId = req.params.id;
      await deleteService(serviceId);
      res.json({ success: true, message: 'Service deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
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

  // 4. Get All Orders (Admin Protected) - with backend search + filter
  app.get('/api/admin/orders', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const search = String(req.query.search || '');
      const status = String(req.query.status || 'all');
      const page = parseInt(String(req.query.page || '1'));
      const limit = parseInt(String(req.query.limit || '100'));

      const { orders, total } = await getAdminOrdersFiltered({ search, status, page, limit });
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

      const ordersWithUrls = orders.map(order => ({
        ...order,
        documents: (order.documents || []).map((doc: any) => ({
          ...doc,
          downloadUrl: `${baseUrl}/api/documents/download/${doc.download_token || doc.downloadToken}`
        }))
      }));

      res.json({ success: true, orders: ordersWithUrls, total });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4b. Get Single Order (Admin Protected)
  app.get('/api/admin/orders/:orderId', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const orderId = req.params.orderId;
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

      // Try by order_id first, then order_number
      let order = await getOrderById(orderId);
      if (!order) {
        order = await getOrderByNumber(orderId);
      }
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      order.documents = (order.documents || []).map((doc: any) => ({
        ...doc,
        downloadUrl: `${baseUrl}/api/documents/download/${doc.download_token || doc.downloadToken}`
      }));
      const history = await getOrderStatusHistory(order.order_id);
      res.json({ success: true, order, history });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 3. Update Order Status (Admin Protected) - records status history
  app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const orderId = req.params.id;
      const { orderStatus, paymentStatus } = req.body;

      if (!orderStatus) {
        return res.status(400).json({ success: false, message: 'Order status is required.' });
      }

      // Normalize to lowercase — single source of truth format
      const normalizedStatus = String(orderStatus).toLowerCase().trim();
      const validStatuses = ['pending', 'confirmed', 'printing', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(normalizedStatus)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      // Get current order (try by order_id first, then by order_number)
      let currentOrder = await getOrderById(orderId);
      if (!currentOrder) {
        currentOrder = await getOrderByNumber(orderId);
      }
      if (!currentOrder) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const previousStatus = currentOrder.order_status || null;
      const updated = await updateOrderStatus(currentOrder.order_id, normalizedStatus, paymentStatus);

      // Record status change in history
      if (updated) {
        const adminEmail = req.user?.email || 'Admin';
        await recordStatusChange(currentOrder.order_id, previousStatus, normalizedStatus, adminEmail);
      }

      res.json({ success: true, order: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Admin Dashboard Statistics
  app.get('/api/admin/dashboard/stats', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await getDashboardStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Public: Track order by order_number + phone (supports both orderNumber and orderId query params)
  app.get('/api/orders/track', async (req: Request, res: Response) => {
    try {
      // Accept both orderNumber and orderId as query params
      const rawOrderNum = String(req.query.orderNumber || req.query.orderId || '').trim().toUpperCase();
      const phone = String(req.query.phone || '').trim();

      if (!rawOrderNum || !phone) {
        return res.status(400).json({ success: false, message: 'Order ID and mobile number are required.' });
      }

      const order = await trackOrderByNumberAndPhone(rawOrderNum, phone);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found. Please check your Order ID and mobile number.' });
      }

      const history = await getOrderStatusHistory(order.order_id);

      // Return safe subset (no documents download tokens for public)
      res.json({
        success: true,
        order: {
          order_id: order.order_id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          service: order.service,
          quantity: order.quantity,
          total_price: order.total_price,
          payment_status: order.payment_status,
          order_status: order.order_status,
          created_at: order.created_at,
          updated_at: order.updated_at
        },
        history
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Public: Lightweight status-only endpoint for real-time polling (customer order detail page)
  // Returns only the current order_status from DB — no auth needed but validates by order_number
  app.get('/api/orders/:orderNumber/status', async (req: Request, res: Response) => {
    try {
      const orderNumber = req.params.orderNumber.trim().toUpperCase();
      const order = await getOrderByNumber(orderNumber);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      res.json({
        success: true,
        orderNumber: order.order_number,
        order_status: order.order_status,
        updated_at: order.updated_at
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Customer: Get single order detail by order_number (ownership verified)
  app.get('/api/customer/orders/:orderNumber', authenticateCustomer, async (req: AuthRequest, res: Response) => {
    try {
      const orderNumber = req.params.orderNumber;
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

      const order = await getOrderByNumber(orderNumber);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Ownership check: must be logged-in customer's order
      const isOwner = (req.user.id && String(order.customer_id) === String(req.user.id)) ||
                      (req.user.phone && order.customer_phone === req.user.phone);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You do not have permission to view this order.' });
      }

      const history = await getOrderStatusHistory(order.order_id);
      order.documents = (order.documents || []).map((doc: any) => ({
        ...doc,
        downloadUrl: `${baseUrl}/api/documents/download/${doc.download_token || doc.downloadToken}`
      }));

      res.json({ success: true, order, history });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Order Status History (customer - own orders, or admin)
  app.get('/api/orders/:orderNumber/status-history', async (req: AuthRequest, res: Response) => {
    try {
      const orderNumber = req.params.orderNumber;
      // Try to get order (lookup by number)
      const order = await getOrderByNumber(orderNumber);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      const history = await getOrderStatusHistory(order.order_id);
      res.json({ success: true, history });
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

  appInstance = app;
  return app;
}

async function startServer() {
  const app = await createApp();
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
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
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
