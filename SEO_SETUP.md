# NITHISH GRAPHICS – DOMAIN, GOOGLE SEARCH CONSOLE & SEO SETUP GUIDE

This document provides step-by-step instructions for connecting the custom domain **https://www.nithishgraphics.com**, verifying ownership in Google Search Console, submitting the sitemap, and requesting fast indexing.

---

## 1. CUSTOM DOMAIN CONFIGURATION

### Primary Canonical Domain
* **Canonical URL**: `https://www.nithishgraphics.com/`
* **Alternative Backup Domain**: `https://www.nithishgraphics.in/`

### DNS & Redirect Setup
In your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare, Google Domains):

1. **CNAME Record** (for `www` subdomain):
   * **Host**: `www`
   * **Target**: Your Cloud Run / Hosting distribution CNAME (e.g. `cname.cloudrun.app`)
2. **A Record** (for Apex/Root domain `nithishgraphics.com`):
   * **Host**: `@`
   * **Points to**: The IP addresses provided by your host or Cloudflare reverse proxy.
3. **HTTP to HTTPS & Non-WWW Redirection**:
   Set up 301 Permanent Redirect rules so that all HTTP and non-www requests point to the canonical URL:
   * `http://nithishgraphics.com` ➔ `https://www.nithishgraphics.com/`
   * `http://www.nithishgraphics.com` ➔ `https://www.nithishgraphics.com/`
   * `https://nithishgraphics.com` ➔ `https://www.nithishgraphics.com/`

---

## 2. GOOGLE SEARCH CONSOLE (GSC) VERIFICATION

To manage Google Search indexing and monitor keyword performance:

### Step A: Add Property in Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**.
3. Choose **URL prefix**: `https://www.nithishgraphics.com/` (or **Domain property**: `nithishgraphics.com`).

### Step B: Verification via HTML Tag
1. Select **HTML tag** verification method in Search Console.
2. Copy the content code string from `<meta name="google-site-verification" content="YOUR_CODE_HERE" />`.
3. Set the environment variable in your production deployment or via the Admin Dashboard:
   ```env
   GOOGLE_SITE_VERIFICATION="YOUR_CODE_HERE"
   ```
   *Or navigate to `/admin/dashboard` on the website and paste the verification key directly under the **SEO & Verification Settings** section.*
4. Click **Verify** in Google Search Console.

---

## 3. SUBMITTING THE AUTOMATED SITEMAP

The website dynamically serves the official sitemap at:
`https://www.nithishgraphics.com/sitemap.xml`

### How to Submit:
1. Open Google Search Console for `https://www.nithishgraphics.com/`.
2. On the left navigation menu, click **Sitemaps**.
3. Under **Add a new sitemap**, type `sitemap.xml`.
4. Click **Submit**.
5. Verify that status displays **Success**.

The sitemap automatically includes all public indexable pages (`/`, `/services`, `/services/*`, `/pricing`, `/contact`, `/about`, `/order`) and excludes private endpoints (`/admin`, `/customer`, `/api`, `/uploads`).

---

## 4. URL INSPECTION & REQUESTING INDEXING

To fast-track Google's indexing of **Nithish Graphics**:

1. In Search Console, click **URL Inspection** in the top search bar.
2. Paste the canonical homepage URL: `https://www.nithishgraphics.com/`
3. Click **Test Live URL** to confirm that Googlebot can fetch the page without errors.
4. Click **Request Indexing**.
5. Repeat this process for core landing pages:
   * `https://www.nithishgraphics.com/services/bw-printing`
   * `https://www.nithishgraphics.com/services/color-printing`
   * `https://www.nithishgraphics.com/services/pdf-printing`
   * `https://www.nithishgraphics.com/services/spiral-binding`
   * `https://www.nithishgraphics.com/services/record-binding`
   * `https://www.nithishgraphics.com/contact`

---

## 5. MONITORING INDEXING ERRORS & SEARCH PERFORMANCE

### Page Indexing Report
* Check the **Pages** section in Search Console weekly.
* Verify that public pages are marked **Indexed**.
* Confirm that private admin pages (`/admin`, `/customer`) are correctly excluded by `noindex` and `robots.txt`.

### Search Performance Tracking
* Under **Performance ➔ Search results**, monitor queries such as:
  * `Nithish Graphics`
  * `nithishgraphics`
  * `Nithish Graphics printing`
  * `Nithish Graphics print shop`
  * `printing shop near me`
  * `PDF printing`
  * `Spiral binding`
  * `Record binding`

---

## 6. SITEMAP & STORE LOCATION UPDATES

Whenever you update business details or add new public service pages:
1. Update store location or operating hours via the `/admin/dashboard` interface.
2. The website will automatically update the `LocalBusiness` JSON-LD schema across pages.
3. The server will dynamically regenerate `https://www.nithishgraphics.com/sitemap.xml` with updated `<lastmod>` timestamps.

---

## SUMMARY CHECKLIST

- [x] Canonical domain set to `https://www.nithishgraphics.com/`
- [x] Robots.txt created at `/robots.txt`
- [x] Sitemap created at `/sitemap.xml`
- [x] LocalBusiness JSON-LD schema configured with name **Nithish Graphics** & Phone **7598730609**
- [x] Google Site Verification tag support enabled
- [x] Admin dashboard available for updating address & hours
- [x] `noindex` set on all private admin & customer routes
