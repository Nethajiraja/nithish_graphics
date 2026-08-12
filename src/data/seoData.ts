import { BusinessInfo, PageSeoMeta } from '../types';

export function getSeoMetadata(path: string, info: BusinessInfo): PageSeoMeta {
  const domain = (info.canonicalDomain || 'https://www.nithishgraphics.com').replace(/\/$/, '');
  const phone = info.phone || '7598730609';

  // Accurate LocalBusiness JSON-LD Schema using real store information
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Nithish Graphics",
    "image": `${domain}/assets/nithish-graphics-logo.png`,
    "logo": `${domain}/assets/nithish-graphics-logo.png`,
    "@id": `${domain}/#organization`,
    "url": `${domain}/`,
    "telephone": phone,
    "email": info.email || "contact@nithishgraphics2310@gmail.com",
    "priceRange": "₹1 - ₹200",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": info.address || "No. 10, School Street, Reddichavadi, near AVMC Medical College",
      "addressLocality": info.city || "Cuddalore",
      "addressRegion": info.state || "Tamil Nadu",
      "postalCode": info.pincode || "607002",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 11.7480,
      "longitude": 79.7714
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "08:30",
        "closes": "21:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Sunday"],
        "opens": "10:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      `https://wa.me/${info.whatsapp || '917598730609'}`
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Printing & Binding Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "B/W Printing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Color Printing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "PDF Printing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Document Printing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Spiral Binding" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Soft Binding" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Record Binding" } }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nithish Graphics",
    "url": `${domain}/`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${domain}/services?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // Base Keywords
  const baseKeywords = [
    "Nithish Graphics",
    "Nithish Graphics printing",
    "Nithish Graphics print shop",
    "Nithish Graphics online printing",
    "Nithishgraphics",
    "online printing",
    "document printing",
    "color printing",
    "black and white printing",
    "spiral binding",
    "B/W printing",
    "PDF printing",
    "record binding"
  ];

  switch (path) {
    case '/':
      return {
        title: "Nithish Graphics | Online Printing & Print Services",
        description: "Nithish Graphics offers online printing services including B/W and color printing, document printing, binding, and other print services. Upload your documents and place your print order online.",
        canonicalUrl: `${domain}/`,
        keywords: baseKeywords,
        h1: "Nithish Graphics – Online Printing & Print Services",
        schema: [localBusinessSchema, websiteSchema]
      };

    case '/services':
      return {
        title: "Printing Services | Nithish Graphics",
        description: `Explore all online printing and document printing services at Nithish Graphics: B/W printing, HD color printing, PDF printing, study notes, record printing, spiral binding, soft binding, and hard record binding. Call ${phone}.`,
        canonicalUrl: `${domain}/services`,
        keywords: baseKeywords,
        h1: "Printing Services | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Services", url: `${domain}/services` }
        ],
        schema: [
          localBusinessSchema,
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": `${domain}/` },
              { "@type": "ListItem", "position": 2, "name": "Services", "item": `${domain}/services` }
            ]
          }
        ]
      };

    case '/services/bw-printing':
      return {
        title: "B/W Printing Services | Nithish Graphics",
        description: `High-speed Black & White document, notes, and PDF printing services at Nithish Graphics. Crisp 1200 DPI laser printouts for students and offices. Call ${phone}.`,
        canonicalUrl: `${domain}/services/bw-printing`,
        keywords: ["B/W printing", "black and white printing", "document printing", "notes printing", "Nithish Graphics printing"],
        h1: "B/W Document & Notes Printing | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Services", url: `${domain}/services` },
          { name: "B/W Printing", url: `${domain}/services/bw-printing` }
        ],
        schema: [
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "B/W Printing",
            "provider": { "@type": "LocalBusiness", "name": "Nithish Graphics", "telephone": phone },
            "areaServed": `${info.city}, ${info.state}`,
            "description": "High-volume crisp monochrome document and study notes printing."
          }
        ]
      };

    case '/services/color-printing':
      return {
        title: "Color Printing Services | Nithish Graphics",
        description: `Vibrant HD full-color printing for posters, project reports, certificates, and record diagrams at Nithish Graphics. Call ${phone} for quick quotes.`,
        canonicalUrl: `${domain}/services/color-printing`,
        keywords: ["color printing", "HD color print", "poster printing", "record printing", "Nithish Graphics"],
        h1: "HD Full Color Printing | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Services", url: `${domain}/services` },
          { name: "Color Printing", url: `${domain}/services/color-printing` }
        ],
        schema: [
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Color Printing",
            "provider": { "@type": "LocalBusiness", "name": "Nithish Graphics", "telephone": phone },
            "description": "High-definition color printing for charts, diagrams, and brochures."
          }
        ]
      };

    case '/services/pdf-printing':
      return {
        title: "PDF Printing Services | Nithish Graphics",
        description: `Fast online PDF document printing with instant upload and price calculator at Nithish Graphics. B/W & Color PDF prints dispatched quickly. Call ${phone}.`,
        canonicalUrl: `${domain}/services/pdf-printing`,
        keywords: ["PDF printing", "online printing", "online PDF printing", "document printing", "Nithish Graphics"],
        h1: "Online PDF Printing & Calculator | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Services", url: `${domain}/services` },
          { name: "PDF Printing", url: `${domain}/services/pdf-printing` }
        ]
      };

    case '/services/spiral-binding':
      return {
        title: "Spiral Binding Services | Nithish Graphics",
        description: `Durable PVC plastic & twin wire spiral binding with clear protective transparent covers at Nithish Graphics. Perfect for college notes. Call ${phone}.`,
        canonicalUrl: `${domain}/services/spiral-binding`,
        keywords: ["spiral binding", "plastic spiral binding", "wire binding", "notes binding", "Nithish Graphics"],
        h1: "Spiral & Wire Binding Services | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Services", url: `${domain}/services` },
          { name: "Spiral Binding", url: `${domain}/services/spiral-binding` }
        ]
      };

    case '/services/record-binding':
      return {
        title: "College Record Binding Services | Nithish Graphics",
        description: `Hardcover college lab record binding with custom gold foil embossing at Nithish Graphics. Sturdy stitched binding for university guidelines. Call ${phone}.`,
        canonicalUrl: `${domain}/services/record-binding`,
        keywords: ["record binding", "college record binding", "hardcover binding", "gold embossing", "Nithish Graphics"],
        h1: "Hardcover College Record Binding | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Services", url: `${domain}/services` },
          { name: "Record Binding", url: `${domain}/services/record-binding` }
        ]
      };

    case '/services/soft-binding':
      return {
        title: "Soft Binding Services | Nithish Graphics",
        description: `Clean thermal glued softcover book binding for project reports, dissertations and manuals at Nithish Graphics. Call ${phone}.`,
        canonicalUrl: `${domain}/services/soft-binding`,
        keywords: ["soft binding", "thermal binding", "softcover binding", "Nithish Graphics"],
        h1: "Softcover & Thermal Report Binding | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Services", url: `${domain}/services` },
          { name: "Soft Binding", url: `${domain}/services/soft-binding` }
        ]
      };

    case '/pricing':
      return {
        title: "Printing & Binding Price List | Nithish Graphics",
        description: `Transparent per-page rates for B/W printing, color printing, PDF printing, spiral binding and record binding at Nithish Graphics. Contact ${phone}.`,
        canonicalUrl: `${domain}/pricing`,
        keywords: ["Printing cost", "B/W printing rates", "Color print price", "Spiral binding cost", "Nithish Graphics"],
        h1: "Transparent Printing & Binding Rates | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Pricing", url: `${domain}/pricing` }
        ]
      };

    case '/about':
      return {
        title: "About Nithish Graphics",
        description: `Learn about Nithish Graphics - your trusted partner for B/W printing, color printing, spiral binding, and college record binding with fast turnaround. Call ${phone}.`,
        canonicalUrl: `${domain}/about`,
        keywords: ["About Nithish Graphics", "Nithish Graphics print shop", "Nithish Graphics", "Nithishgraphics"],
        h1: "About Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "About Us", url: `${domain}/about` }
        ]
      };

    case '/contact':
      return {
        title: "Contact Nithish Graphics",
        description: `Get in touch with Nithish Graphics. Phone: ${phone}. Visit our store in Cuddalore or order online. Opening hours, address, and Google Maps direction details.`,
        canonicalUrl: `${domain}/contact`,
        keywords: ["Contact Nithish Graphics", "Nithish Graphics phone number", "Nithish Graphics address", "Nithish Graphics location", "7598730609"],
        h1: "Contact Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Contact", url: `${domain}/contact` }
        ],
        schema: [localBusinessSchema]
      };

    case '/order':
      return {
        title: "Online Printing Order & Cost Estimator | Nithish Graphics",
        description: "Calculate your print cost and order online with Nithish Graphics. Upload PDF, choose B/W or color printing, spiral or record binding, and place your order online.",
        canonicalUrl: `${domain}/order`,
        keywords: ["Order printing online", "PDF print calculator", "Nithish Graphics online printing", "Nithish Graphics"],
        h1: "Online Printing Order & Cost Estimator | Nithish Graphics",
        breadcrumbs: [
          { name: "Home", url: `${domain}/` },
          { name: "Order Online", url: `${domain}/order` }
        ]
      };

    case '/track-order':
      return {
        title: "Track Print Order Status | Nithish Graphics",
        description: "Track the real-time status of your print order at Nithish Graphics using your Order ID and registered mobile number.",
        canonicalUrl: `${domain}/track-order`,
        keywords: ["Track print order", "Nithish Graphics order status", "Track order"],
        h1: "Real-Time Print Order Tracking | Nithish Graphics"
      };

    case '/login':
      return {
        title: "Customer Login | Nithish Graphics",
        description: "Customer account login for Nithish Graphics online printing dashboard and order tracking.",
        canonicalUrl: `${domain}/login`,
        keywords: ["Nithish Graphics login", "Customer login"],
        h1: "Customer Account Login"
      };

    case '/register':
      return {
        title: "Create Customer Account | Nithish Graphics",
        description: "Register a new customer account at Nithish Graphics to place online printing orders and upload documents.",
        canonicalUrl: `${domain}/register`,
        keywords: ["Nithish Graphics register", "Customer sign up"],
        h1: "Create Customer Account"
      };

    default:
      // PRIVATE PAGES (Admin / Customer dashboards / Order history / Private profiles) MUST NOT BE INDEXED
      if (path.startsWith('/admin') || path.startsWith('/customer') || path === '/dashboard') {
        return {
          title: "Private Account Portal | Nithish Graphics",
          description: "Private user account portal for Nithish Graphics.",
          canonicalUrl: `${domain}${path}`,
          keywords: [],
          h1: "Private Portal",
          isPrivate: true
        };
      }

      // Default fallback for public routes
      return {
        title: "Nithish Graphics | Online Printing & Print Services",
        description: "Nithish Graphics offers online printing services including B/W and color printing, document printing, binding, and other print services. Upload your documents and place your print order online.",
        canonicalUrl: `${domain}${path}`,
        keywords: baseKeywords,
        h1: "Nithish Graphics – Online Printing & Print Services"
      };
  }
}
