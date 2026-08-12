import React, { useState, useEffect } from 'react';
import { initialBusinessInfo, defaultServices, defaultPricingRates } from './data/initialBusinessInfo';
import { getSeoMetadata } from './data/seoData';
import { BusinessInfo, ServiceItem, PricingRate } from './types';
import { HeadSEO } from './components/HeadSEO';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GoogleSearchPreviewModal } from './components/GoogleSearchPreviewModal';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { OrderPage } from './pages/OrderPage';
import { AdminPage } from './pages/AdminPage';
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [storeInfo, setStoreInfo] = useState<BusinessInfo>(initialBusinessInfo);
  const [services] = useState<ServiceItem[]>(defaultServices);
  const [pricingRates] = useState<PricingRate[]>(defaultPricingRates);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);

  // Sync client router with window location
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch business store configuration from server
  useEffect(() => {
    fetch('/api/info')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.phone) {
          setStoreInfo((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Fallback to local initial info if server offline
      });
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStoreInfo = (updated: Partial<BusinessInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...updated }));
  };

  // Get current SEO Metadata
  const seoMeta = getSeoMetadata(currentPath, storeInfo);

  // Render Page Content based on Clean URL path
  const renderContent = () => {
    if (currentPath === '/') {
      return <HomePage info={storeInfo} services={services} navigate={navigate} />;
    }
    if (currentPath === '/services') {
      return <ServicesPage services={services} info={storeInfo} navigate={navigate} />;
    }
    if (currentPath.startsWith('/services/')) {
      const slug = currentPath.replace('/services/', '');
      return (
        <ServiceDetailPage
          serviceSlug={slug}
          services={services}
          info={storeInfo}
          navigate={navigate}
        />
      );
    }
    if (currentPath === '/pricing') {
      return <PricingPage rates={pricingRates} info={storeInfo} navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage info={storeInfo} navigate={navigate} />;
    }
    if (currentPath === '/about') {
      return <AboutPage info={storeInfo} navigate={navigate} />;
    }
    if (currentPath === '/order') {
      return <OrderPage info={storeInfo} navigate={navigate} />;
    }
    if (currentPath.startsWith('/admin')) {
      return (
        <AdminPage
          info={storeInfo}
          onUpdateInfo={handleUpdateStoreInfo}
          navigate={navigate}
        />
      );
    }
    if (currentPath.startsWith('/customer')) {
      return <CustomerOrdersPage info={storeInfo} navigate={navigate} />;
    }

    // Default Fallback to Homepage
    return <HomePage info={storeInfo} services={services} navigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Dynamic SEO Meta Tags & JSON-LD Schema Injection */}
      <HeadSEO meta={seoMeta} info={storeInfo} />

      {/* Main App Layout */}
      <div>
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          info={storeInfo}
          onOpenSeoInspector={() => setIsSeoModalOpen(true)}
        />
        <main>{renderContent()}</main>
      </div>

      {/* Footer */}
      <Footer
        navigate={navigate}
        info={storeInfo}
        onOpenSeoInspector={() => setIsSeoModalOpen(true)}
      />

      {/* Technical SERP & Schema Inspector Modal */}
      <GoogleSearchPreviewModal
        isOpen={isSeoModalOpen}
        onClose={() => setIsSeoModalOpen(false)}
        info={storeInfo}
        currentMeta={seoMeta}
      />
    </div>
  );
}
