import { BusinessInfo, ServiceItem, PricingRate } from '../types';

export const initialBusinessInfo: BusinessInfo = {
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
  googleSiteVerification: ""
};

export const defaultServices: ServiceItem[] = [
  {
    id: "bw-printing",
    slug: "bw-printing",
    title: "B/W Printing",
    shortDesc: "High-speed, crisp laser Black & White document, report, and notes printing.",
    fullDesc: "Nithish Graphics provides crystal-clear B/W printing for college notes, project reports, exam prep materials, office documentation, and bulk PDF prints using heavy-duty industrial laser printers at affordable per-page rates.",
    iconName: "FileText",
    startingPrice: "₹1.00 / page",
    features: [
      "High-speed 1200 DPI laser monochrome printing",
      "Bulk student discounts for notes & study material",
      "Standard 70GSM, 80GSM & 100GSM Executive Bond paper options",
      "Single-sided and double-sided (duplex) printing"
    ],
    keywords: ["B/W printing", "Black and white printing", "Notes printing", "PDF printing", "Document printing", "Nithish Graphics"]
  },
  {
    id: "color-printing",
    slug: "color-printing",
    title: "Color Printing",
    shortDesc: "Vibrant full-color printing for presentations, charts, certificates, and graphics.",
    fullDesc: "Get premium color printing services at Nithish Graphics. We deliver true-to-life color accuracy for college record sheets, diagrams, brochures, project submissions, posters, and flyers with glossy or matte finishing.",
    iconName: "Palette",
    startingPrice: "₹5.00 / page",
    features: [
      "High-definition HD color output on premium photo & bond paper",
      "Vibrant photo paper & glossy card stock available",
      "Ideal for project diagrams, lab records, and certificates",
      "Fast same-day turnaround for urgent assignments"
    ],
    keywords: ["Color printing", "Vibrant color printing", "Record printing", "Poster printing", "PDF color printing", "Nithish Graphics"]
  },
  {
    id: "pdf-printing",
    slug: "pdf-printing",
    title: "PDF Printing",
    shortDesc: "Instant PDF file printing directly from phone, WhatsApp, email, or USB drive.",
    fullDesc: "Seamlessly print your digital PDF files at Nithish Graphics. Upload your PDF documents directly via our website or send them over WhatsApp to get instant printing with auto page count & cost preview.",
    iconName: "FileUp",
    startingPrice: "₹1.00 / page",
    features: [
      "Instant online PDF upload & page calculator",
      "Supports multipage PDFs, e-books, slide decks, and manual forms",
      "Auto page sizing (A4, A3, Legal, Letter)",
      "Direct WhatsApp document dispatch"
    ],
    keywords: ["PDF printing", "Online PDF printing", "PDF printing near me", "Quick document print", "Nithish Graphics"]
  },
  {
    id: "spiral-binding",
    slug: "spiral-binding",
    title: "Spiral Binding",
    shortDesc: "Durable PVC spiral & wire-o binding with clear protective front and back covers.",
    fullDesc: "Keep your notes, study modules, project books, and manuals organized with professional spiral binding from Nithish Graphics. Available with heavy-gauge plastic spirals and transparent protective covers.",
    iconName: "BookOpen",
    startingPrice: "₹30.00 / book",
    features: [
      "High-durability flexible PVC plastic coil & metal twin-wire options",
      "Includes thick transparent plastic sheet cover & heavy back board",
      "Accommodates up to 500+ pages per document",
      "360-degree flat lay for convenient studying and writing"
    ],
    keywords: ["Spiral binding", "Plastic spiral binding", "Wire binding", "Notes binding", "Nithish Graphics"]
  },
  {
    id: "record-binding",
    slug: "record-binding",
    title: "Record Binding",
    shortDesc: "Hardcover college record binding with gold/silver foil title embossing.",
    fullDesc: "Nithish Graphics specializes in academic record binding for engineering, medical, polytechnic, and arts colleges. We provide sturdy hardcover binding with gold lettering embossing for lab records, project reports, and theses.",
    iconName: "BookMarked",
    startingPrice: "₹150.00 / record",
    features: [
      "Heavy-duty cloth/leatherette hardcover binding",
      "Custom gold foil lettering and emblem embossing",
      "Strict compliance with college & university guidelines",
      "Reinforced stitch binding designed to last for years"
    ],
    keywords: ["Record binding", "College record binding", "Hardcover record binding", "Gold embossing binding", "Nithish Graphics"]
  },
  {
    id: "soft-binding",
    slug: "soft-binding",
    title: "Soft Binding",
    shortDesc: "Clean thermal glued softcover binding for project reports & workbooks.",
    fullDesc: "Sleek softcover binding (thermal glued or taped) at Nithish Graphics gives your project reports, handbooks, dissertations, and corporate documents a polished paperback finish.",
    iconName: "Layers",
    startingPrice: "₹40.00 / book",
    features: [
      "Thermal glue soft cover perfect binding",
      "Printed cardstock outer cover with laminate film option",
      "Neat spine trim for clean shelf presentation",
      "Quick turn-around for batch thesis & assignment submissions"
    ],
    keywords: ["Soft binding", "Softcover binding", "Thermal binding", "Project report binding", "Nithish Graphics"]
  }
];

export const defaultPricingRates: PricingRate[] = [
  {
    id: "p1",
    category: "B/W Printing",
    name: "A4 B/W Printing (70 GSM)",
    unit: "per page",
    priceSingle: 1.50,
    priceDouble: 1.00,
    description: "Standard paper for daily study notes and general documents."
  },
  {
    id: "p2",
    category: "B/W Printing",
    name: "A4 B/W Printing (80 GSM Executive)",
    unit: "per page",
    priceSingle: 2.00,
    priceDouble: 1.50,
    description: "Thicker premium bond paper for project reports and official documents."
  },
  {
    id: "p3",
    category: "Color Printing",
    name: "A4 Color Printing (Standard)",
    unit: "per page",
    priceSingle: 6.00,
    priceDouble: 5.00,
    description: "HD inkjet color printing for charts, diagrams, and assignments."
  },
  {
    id: "p4",
    category: "Color Printing",
    name: "A4 Color Laser Printing (High Gloss)",
    unit: "per page",
    priceSingle: 10.00,
    priceDouble: 8.00,
    description: "Premium laser photo-quality print on glossy bond/photo paper."
  },
  {
    id: "p5",
    category: "Binding Services",
    name: "Spiral Binding (Up to 150 Pages)",
    unit: "per document",
    priceSingle: 30.00,
    description: "PVC spiral coil with front transparent cover & back card."
  },
  {
    id: "p6",
    category: "Binding Services",
    name: "Spiral Binding (150+ to 400 Pages)",
    unit: "per document",
    priceSingle: 50.00,
    description: "Extra large gauge coil for thick notes & subject books."
  },
  {
    id: "p7",
    category: "Binding Services",
    name: "Soft / Thermal Tape Binding",
    unit: "per book",
    priceSingle: 45.00,
    description: "Clean taped spine softcover for project reports."
  },
  {
    id: "p8",
    category: "Binding Services",
    name: "College Record Hardcover Binding",
    unit: "per record",
    priceSingle: 180.00,
    description: "Deluxe hardcover record binding with custom gold embossing."
  }
];
