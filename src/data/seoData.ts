import { BusinessInfo, PageSeoMeta } from '../types';

export function getSeoMetadata(path: string, info: BusinessInfo): PageSeoMeta {
  const domain = (info.canonicalDomain || 'https://www.nithishgraphics.com').replace(/\/$/, '');
  const phone = info.phone || '7598730609';

  // Base LocalBusiness JSON-LD Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Nithish Graphics",
    "image": `${domain}/assets/nithish-graphics-logo.png`,
    "@id": `${domain}/#organization`,
    "url": `${domain}/`,
    "telephone": phone,
    "priceRange": "₹1 - ₹200",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": info.address,
      "addressLocality": info.city,
      "addressRegion": info.state,
      "postalCode": info.pincode,
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
      `https://wa.me/${info.whatsapp}`
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Printing & Binding Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "B/W Printing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Color Printing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "PDF Printing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Notes Printing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Record Printing" } },
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

  switch (path) {
    case '/':
    default:
      if (path !== '/' && !path.startsWith('/services') && path !== '/pricing' && path !== '/contact' && path !== '/about' && path !== '/order' && !path.startsWith('/admin') && !path.startsWith('/customer')) {
        // Fallback for custom URL matching
      }
      if (path === '/') {
        return {
          title: "Nithish Graphics | Printing & Binding Services",
          description: `Nithish Graphics provides B/W printing, color printing, PDF printing, notes printing, record printing, spiral binding, soft binding and record binding services. Contact us at ${phone}.`,
          canonicalUrl: `${domain}/`,
          keywords: ["Nithish Graphics", "nithishgraphics", "Nithish Graphics printing", "Nithish Graphics print shop", "printing shop near me", "PDF printing", "B/W printing", "Color printing", "Spiral binding", "Record binding", "Printing services"],
          h1: "Nithish Graphics – Professional Printing & Binding Services",
          schema: [localBusinessSchema, websiteSchema]
        };
      }

      if (path === '/services') {
        return {
          title: "Printing & Binding Services | Nithish Graphics",
          description: `Explore all printing & binding services at Nithish Graphics: B/W printing, HD color printing, PDF printing, study notes, record printing, spiral binding & hard record binding. Call ${phone}.`,
          canonicalUrl: `${domain}/services`,
          keywords: ["Printing services", "B/W Printing", "Color Printing", "PDF Printing", "Spiral Binding", "Record Binding", "Nithish Graphics"],
          h1: "Our Printing & Binding Services – Nithish Graphics",
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
      }

      if (path === '/services/bw-printing') {
        return {
          title: "B/W Printing Services | Nithish Graphics",
          description: `High-speed Black & White document, notes, and PDF printing services at Nithish Graphics. Crisp 1200 DPI laser printouts for students and offices. Call ${phone}.`,
          canonicalUrl: `${domain}/services/bw-printing`,
          keywords: ["B/W printing", "Black and white printing", "Notes printing", "Document printing", "Nithish Graphics printing"],
          h1: "High-Speed B/W Document & Notes Printing",
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
      }

      if (path === '/services/color-printing') {
        return {
          title: "Color Printing Services | Nithish Graphics",
          description: `Vibrant HD full-color printing for posters, project reports, certificates, and record diagrams at Nithish Graphics. Call ${phone} for quick quotes.`,
          canonicalUrl: `${domain}/services/color-printing`,
          keywords: ["Color printing", "HD color print", "Poster printing", "Record printing", "Nithish Graphics"],
          h1: "HD Full Color Printing & Project Graphics",
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
      }

      if (path === '/services/pdf-printing') {
        return {
          title: "PDF Printing Services | Nithish Graphics",
          description: `Fast online PDF document printing with instant upload and price calculator at Nithish Graphics. B/W & Color PDF prints dispatched quickly. Call ${phone}.`,
          canonicalUrl: `${domain}/services/pdf-printing`,
          keywords: ["PDF printing", "Online PDF printing", "PDF print shop near me", "Nithish Graphics"],
          h1: "Instant Online PDF Printing & Document Calculator",
          breadcrumbs: [
            { name: "Home", url: `${domain}/` },
            { name: "Services", url: `${domain}/services` },
            { name: "PDF Printing", url: `${domain}/services/pdf-printing` }
          ]
        };
      }

      if (path === '/services/spiral-binding') {
        return {
          title: "Spiral Binding Services | Nithish Graphics",
          description: `Durable PVC plastic & twin wire spiral binding with clear protective transparent covers at Nithish Graphics. Perfect for college notes. Call ${phone}.`,
          canonicalUrl: `${domain}/services/spiral-binding`,
          keywords: ["Spiral binding", "Plastic spiral binding", "Wire binding", "Notes binding", "Nithish Graphics"],
          h1: "Professional Spiral & Wire Binding Services",
          breadcrumbs: [
            { name: "Home", url: `${domain}/` },
            { name: "Services", url: `${domain}/services` },
            { name: "Spiral Binding", url: `${domain}/services/spiral-binding` }
          ]
        };
      }

      if (path === '/services/record-binding') {
        return {
          title: "College Record Binding Services | Nithish Graphics",
          description: `Hardcover college lab record binding with custom gold foil embossing at Nithish Graphics. Sturdy stitched binding for university guidelines. Call ${phone}.`,
          canonicalUrl: `${domain}/services/record-binding`,
          keywords: ["Record binding", "College record binding", "Hardcover binding", "Gold embossing", "Nithish Graphics"],
          h1: "Hardcover College Record Binding & Thesis Finishing",
          breadcrumbs: [
            { name: "Home", url: `${domain}/` },
            { name: "Services", url: `${domain}/services` },
            { name: "Record Binding", url: `${domain}/services/record-binding` }
          ]
        };
      }

      if (path === '/services/soft-binding') {
        return {
          title: "Soft Binding & Thermal Binding | Nithish Graphics",
          description: `Clean thermal glued softcover book binding for project reports, dissertations and manuals at Nithish Graphics. Call ${phone}.`,
          canonicalUrl: `${domain}/services/soft-binding`,
          keywords: ["Soft binding", "Thermal binding", "Softcover binding", "Nithish Graphics"],
          h1: "Sleek Softcover & Thermal Report Binding",
          breadcrumbs: [
            { name: "Home", url: `${domain}/` },
            { name: "Services", url: `${domain}/services` },
            { name: "Soft Binding", url: `${domain}/services/soft-binding` }
          ]
        };
      }

      if (path === '/pricing') {
        return {
          title: "Printing & Binding Price List | Nithish Graphics",
          description: `Transparent per-page rates for B/W printing, color printing, PDF printing, spiral binding and record binding at Nithish Graphics. Contact ${phone}.`,
          canonicalUrl: `${domain}/pricing`,
          keywords: ["Printing cost", "B/W printing rates", "Color print price", "Spiral binding cost", "Record binding price", "Nithish Graphics"],
          h1: "Transparent Printing & Binding Rates",
          breadcrumbs: [
            { name: "Home", url: `${domain}/` },
            { name: "Pricing", url: `${domain}/pricing` }
          ]
        };
      }

      if (path === '/about') {
        return {
          title: "About Nithish Graphics | Premier Printing & Binding Shop",
          description: `Learn about Nithish Graphics - your trusted partner for B/W printing, color printing, spiral binding, and college record binding with fast turnaround. Call ${phone}.`,
          canonicalUrl: `${domain}/about`,
          keywords: ["About Nithish Graphics", "Nithish Graphics print shop", "Best printing shop near me", "Nithish Graphics"],
          h1: "About Nithish Graphics – Craftsmanship in Printing",
          breadcrumbs: [
            { name: "Home", url: `${domain}/` },
            { name: "About Us", url: `${domain}/about` }
          ]
        };
      }

      if (path === '/contact') {
        return {
          title: "Contact Nithish Graphics | Phone: 7598730609",
          description: `Get in touch with Nithish Graphics. Phone: ${phone}. Visit our shop or order online via WhatsApp. Opening hours, address, and Google Maps direction details.`,
          canonicalUrl: `${domain}/contact`,
          keywords: ["Contact Nithish Graphics", "Nithish Graphics phone number", "Nithish Graphics address", "Nithish Graphics location", "7598730609"],
          h1: "Contact Nithish Graphics – Store Location & Inquiries",
          breadcrumbs: [
            { name: "Home", url: `${domain}/` },
            { name: "Contact", url: `${domain}/contact` }
          ],
          schema: [localBusinessSchema]
        };
      }

      if (path === '/order') {
        return {
          title: "Online Printing Order & Cost Estimator | Nithish Graphics",
          description: `Calculate your print cost and order online with Nithish Graphics. Upload PDF, choose B/W or color printing, spiral or record binding, and dispatch via WhatsApp.`,
          canonicalUrl: `${domain}/order`,
          keywords: ["Order printing online", "PDF print calculator", "Send PDF print WhatsApp", "Nithish Graphics order"],
          h1: "Instant Online Printing Cost Estimator & Order Upload",
          breadcrumbs: [
            { name: "Home", url: `${domain}/` },
            { name: "Order Online", url: `${domain}/order` }
          ]
        };
      }

      // PRIVATE PAGES (Admin / Customer dashboards / Order tracking) MUST NOT BE INDEXED
      if (path.startsWith('/admin') || path.startsWith('/customer') || path === '/dashboard') {
        return {
          title: "Private Admin Portal | Nithish Graphics",
          description: "Private management dashboard for Nithish Graphics staff.",
          canonicalUrl: `${domain}${path}`,
          keywords: [],
          h1: "Private Management Area",
          isPrivate: true
        };
      }

      // Default fallback for any other path
      return {
        title: "Nithish Graphics | Printing & Binding Services",
        description: `Nithish Graphics provides B/W printing, color printing, PDF printing, notes printing, record printing, spiral binding, soft binding and record binding services. Contact us at ${phone}.`,
        canonicalUrl: `${domain}${path}`,
        keywords: ["Nithish Graphics", "Printing services", "B/W printing", "Spiral binding"],
        h1: "Nithish Graphics – Professional Printing & Binding Services"
      };
  }
}
