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
  whatsappTemplate?: string;
  minOrderQuantity?: number;
}

export interface PricingRate {
  id: string;
  category: string;
  name: string;
  unit: string;
  priceSingle: number;
  priceDouble?: number;
  description: string;
  isActive?: boolean;
}

export interface OrderDocument {
  document_id?: number;
  original_filename: string;
  stored_filename?: string;
  mime_type: string;
  file_size: number;
  download_token?: string;
  downloadUrl?: string;
  created_at?: string;
}

export interface OrderItem {
  order_id?: string;
  id?: string;
  created_at?: string;
  createdAt?: string;
  customer_name?: string;
  customerName?: string;
  customer_phone?: string;
  phone?: string;
  service?: string;
  serviceType?: string;
  quantity?: number;
  copies?: number;
  pages_per_copy?: number;
  pagesPerCopy?: number;
  color_type?: string;
  printType?: 'bw' | 'color';
  paper_size?: string;
  paper_gsm?: string;
  paperGsm?: string;
  print_side?: string;
  sides?: 'single' | 'double';
  binding_type?: string;
  bindingType?: string;
  additional_instructions?: string;
  notes?: string;
  total_price?: number;
  totalAmount?: number;
  payment_status?: string;
  order_status?: string;
  status?: string;
  documents?: OrderDocument[];
}

export interface CustomerUser {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | string;
  is_active?: boolean;
  google_id?: string;
  auth_provider?: 'LOCAL' | 'GOOGLE' | string;
  profile_image_url?: string;
  last_login_at?: string;
  created_at?: string;
}

export interface CustomerDetail extends CustomerUser {
  orderCount?: number;
  totalSpend?: number;
  recentOrders?: OrderItem[];
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
