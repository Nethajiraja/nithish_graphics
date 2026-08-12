import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// In-memory store for dynamic store config & orders
let storeConfig = {
  name: "Nithish Graphics",
  phone: "7598730609",
  whatsapp: "917598730609",
  email: "contact@nithishgraphics2310@gmail.com",
  address: "No. 10, School Street, Reddichavadi, near AVMC Medical College and Rajiv Gandhi College of Engineering and Technology",
  city: "Cuddalore",
  state: "Tamil Nadu",
  pincode: "607002",
  openingHours: "Monday - Saturday: 8:30 AM - 9:30 PM | Sunday: 10:00 AM - 6:00 PM",
  canonicalDomain: "https://www.nithishgraphics.com",
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || ""
};

let ordersStore: any[] = [
  {
    id: "ORD-1001",
    createdAt: new Date().toISOString(),
    customerName: "Ramesh Kumar",
    phone: "9876543210",
    serviceType: "B/W Printing",
    copies: 2,
    pagesPerCopy: 45,
    printType: "bw",
    sides: "double",
    paperGsm: "70 GSM Standard",
    bindingType: "Spiral Binding",
    notes: "Please add clear transparent sheet on top.",
    totalAmount: 150,
    fileName: "Engineering_Physics_Unit1-5.pdf",
    status: "completed"
  }
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // Force HTTPS & Host redirection check header helper
  app.use((req: Request, res: Response, next) => {
    // Add canonical link headers or CORS if needed
    res.setHeader('X-Powered-By', 'Nithish Graphics SEO Engine');
    next();
  });

  // 1. SITEMAP.XML Endpoint
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const domain = (storeConfig.canonicalDomain || 'https://www.nithishgraphics.com').replace(/\/$/, '');
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
  app.get('/robots.txt', (req: Request, res: Response) => {
    const domain = (storeConfig.canonicalDomain || 'https://www.nithishgraphics.com').replace(/\/$/, '');
    const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/login
Disallow: /dashboard/
Disallow: /customer/
Disallow: /api/
Disallow: /uploads/

Sitemap: ${domain}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(content);
  });

  // 3. API ROUTES
  app.get('/api/info', (req: Request, res: Response) => {
    res.json(storeConfig);
  });

  app.post('/api/info', (req: Request, res: Response) => {
    const { address, city, state, pincode, openingHours, phone, whatsapp, googleSiteVerification, email } = req.body;
    if (address !== undefined) storeConfig.address = address;
    if (city !== undefined) storeConfig.city = city;
    if (state !== undefined) storeConfig.state = state;
    if (pincode !== undefined) storeConfig.pincode = pincode;
    if (openingHours !== undefined) storeConfig.openingHours = openingHours;
    if (phone !== undefined) storeConfig.phone = phone;
    if (whatsapp !== undefined) storeConfig.whatsapp = whatsapp;
    if (email !== undefined) storeConfig.email = email;
    if (googleSiteVerification !== undefined) storeConfig.googleSiteVerification = googleSiteVerification;

    res.json({ success: true, config: storeConfig });
  });

  app.get('/api/orders', (req: Request, res: Response) => {
    res.json(ordersStore);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...req.body
    };
    ordersStore.unshift(newOrder);
    res.json({ success: true, order: newOrder });
  });

  // 4. VITE / STATIC SERVING
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

  app.listen(PORT, HOST, () => {
    console.log(`Nithish Graphics server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
