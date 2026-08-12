export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  startingPrice: string;
  features: string[];
  keywords: string[];
}

export interface BusinessInfo {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  openingHours: string;
  canonicalDomain: string;
  googleSiteVerification: string;
}

export interface PricingRate {
  id: string;
  category: string;
  name: string;
  unit: string;
  priceSingle: number;
  priceDouble?: number;
  description: string;
}

export interface OrderItem {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  serviceType: string;
  copies: number;
  pagesPerCopy: number;
  printType: 'bw' | 'color';
  sides: 'single' | 'double';
  paperGsm: string;
  bindingType: string;
  notes: string;
  totalAmount: number;
  fileName?: string;
  status: 'pending' | 'processing' | 'completed' | 'delivered';
}

export interface PageSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string[];
  h1: string;
  isPrivate?: boolean;
  ogType?: string;
  ogImage?: string;
  schema?: Record<string, any>[];
  breadcrumbs?: { name: string; url: string }[];
}
