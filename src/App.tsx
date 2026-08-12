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
import { CustomerOrdersPage } from './pages/CustomerOrdersPage';

// Admin Portal Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPricingPage } from './pages/admin/AdminPricingPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [storeInfo, setStoreInfo] = useState<BusinessInfo>(initialBusinessInfo);
  const [services] = useState<ServiceItem[]>(defaultServices);
  const [pricingRates, setPricingRates] = useState<PricingRate[]>(defaultPricingRates);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);

  // Admin JWT Token authentication state
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('admin_token'));

  // Sync client router with window location
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch business store configuration & dynamic pricing from server
  useEffect(() => {
    fetch('/api/info')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.phone) {
          setStoreInfo((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});

    fetch('/api/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPricingRates(data);
        }
      })
      .catch(() => {});
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStoreInfo = (updated: Partial<BusinessInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...updated }));
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken(null);
    navigate('/admin/login');
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

    // Admin Portal Routing
    if (currentPath === '/admin/login') {
      return (
        <AdminLoginPage
          info={storeInfo}
          onLoginSuccess={(token) => setAdminToken(token)}
          navigate={navigate}
        />
      );
    }

    if (currentPath === '/admin/dashboard' || currentPath === '/admin') {
      if (!adminToken) {
        return (
          <AdminLoginPage
            info={storeInfo}
            onLoginSuccess={(token) => setAdminToken(token)}
            navigate={navigate}
          />
        );
      }
      return (
        <AdminDashboardPage
          info={storeInfo}
          token={adminToken}
          onLogout={handleAdminLogout}
          navigate={navigate}
        />
      );
    }

    if (currentPath === '/admin/pricing') {
      if (!adminToken) {
        return (
          <AdminLoginPage
            info={storeInfo}
            onLoginSuccess={(token) => setAdminToken(token)}
            navigate={navigate}
          />
        );
      }
      return (
        <AdminPricingPage
          info={storeInfo}
          token={adminToken}
          onLogout={handleAdminLogout}
          navigate={navigate}
        />
      );
    }

    if (currentPath === '/admin/settings') {
      if (!adminToken) {
        return (
          <AdminLoginPage
            info={storeInfo}
            onLoginSuccess={(token) => setAdminToken(token)}
            navigate={navigate}
          />
        );
      }
      return (
        <AdminSettingsPage
          info={storeInfo}
          token={adminToken}
          onUpdateInfo={handleUpdateStoreInfo}
          onLogout={handleAdminLogout}
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

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Dynamic SEO Meta Tags & JSON-LD Schema Injection */}
      <HeadSEO meta={seoMeta} info={storeInfo} />

      {/* Main App Layout */}
      <div>
        {!isAdminRoute && (
          <Navbar
            currentPath={currentPath}
            navigate={navigate}
            info={storeInfo}
            onOpenSeoInspector={() => setIsSeoModalOpen(true)}
          />
        )}
        <main>{renderContent()}</main>
      </div>

      {/* Footer */}
      {!isAdminRoute && (
        <Footer
          navigate={navigate}
          info={storeInfo}
          onOpenSeoInspector={() => setIsSeoModalOpen(true)}
        />
      )}

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
