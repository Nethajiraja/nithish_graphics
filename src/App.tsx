import React, { useState, useEffect } from 'react';
import { initialBusinessInfo, defaultServices, defaultPricingRates } from './data/initialBusinessInfo';
import { getSeoMetadata } from './data/seoData';
import { BusinessInfo, ServiceItem, PricingRate, CustomerUser } from './types';
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

// Customer Auth & Dashboard Pages
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';

// Admin Portal Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPricingPage } from './pages/admin/AdminPricingPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [storeInfo, setStoreInfo] = useState<BusinessInfo>(initialBusinessInfo);
  const [services] = useState<ServiceItem[]>(defaultServices);
  const [pricingRates, setPricingRates] = useState<PricingRate[]>(defaultPricingRates);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);

  // Customer Auth State
  const [customerToken, setCustomerToken] = useState<string | null>(() => localStorage.getItem('customer_token'));
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    const raw = localStorage.getItem('customer_user');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return null;
  });

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

  // Process Google OAuth callback URL parameters if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const userParam = params.get('user');
    const loginFlag = params.get('login');

    if (tokenParam && userParam && loginFlag === 'google_success') {
      try {
        const parsedUser = JSON.parse(userParam);
        setCustomerToken(tokenParam);
        setCustomerUser(parsedUser);
        localStorage.setItem('customer_token', tokenParam);
        localStorage.setItem('customer_user', JSON.stringify(parsedUser));

        window.history.replaceState({}, document.title, '/customer/dashboard');
        setCurrentPath('/customer/dashboard');
      } catch (e) {
        console.error("Failed to parse Google OAuth URL callback data:", e);
      }
    }
  }, []);

  // Fetch updated customer profile on mount if token exists
  useEffect(() => {
    if (customerToken) {
      fetch('/api/customer/profile', {
        headers: { Authorization: `Bearer ${customerToken}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCustomerUser(data.user);
            localStorage.setItem('customer_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    }
  }, [customerToken]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStoreInfo = (updated: Partial<BusinessInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...updated }));
  };

  const handleCustomerLoginSuccess = (user: CustomerUser, token: string) => {
    setCustomerToken(token);
    setCustomerUser(user);
    localStorage.setItem('customer_token', token);
    localStorage.setItem('customer_user', JSON.stringify(user));
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    setCustomerToken(null);
    setCustomerUser(null);
    navigate('/');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken(null);
    navigate('/admin/login');
  };

  // Extract redirect query parameter if present in current search
  const searchParams = new URLSearchParams(window.location.search);
  const redirectParam = searchParams.get('redirect') || undefined;

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

    // Customer Authentication Pages
    if (currentPath.startsWith('/register')) {
      return (
        <RegisterPage
          info={storeInfo}
          onLoginSuccess={handleCustomerLoginSuccess}
          navigate={navigate}
          redirectPath={redirectParam}
        />
      );
    }

    if (currentPath.startsWith('/login')) {
      return (
        <LoginPage
          info={storeInfo}
          onLoginSuccess={handleCustomerLoginSuccess}
          navigate={navigate}
          redirectPath={redirectParam}
          noticeMessage={redirectParam ? "Please login or create an account to place an order." : undefined}
        />
      );
    }

    // Customer Order Creation Page (Restricted to logged-in customers)
    if (currentPath === '/order') {
      if (!customerToken) {
        return (
          <LoginPage
            info={storeInfo}
            onLoginSuccess={handleCustomerLoginSuccess}
            navigate={navigate}
            redirectPath="/order"
            noticeMessage="Please login or create an account to place an order."
          />
        );
      }
      return (
        <OrderPage
          info={storeInfo}
          customerUser={customerUser}
          customerToken={customerToken}
          navigate={navigate}
        />
      );
    }

    // Customer Dashboard Pages
    if (currentPath.startsWith('/customer')) {
      if (!customerToken || !customerUser) {
        return (
          <LoginPage
            info={storeInfo}
            onLoginSuccess={handleCustomerLoginSuccess}
            navigate={navigate}
            redirectPath={currentPath}
            noticeMessage="Please login or create an account to access your customer dashboard."
          />
        );
      }

      let activeTab: 'dashboard' | 'orders' | 'profile' = 'dashboard';
      if (currentPath.includes('/orders')) activeTab = 'orders';
      if (currentPath.includes('/profile')) activeTab = 'profile';

      return (
        <CustomerDashboardPage
          info={storeInfo}
          user={customerUser}
          token={customerToken}
          onLogout={handleCustomerLogout}
          onUserUpdated={(updated) => {
            setCustomerUser(updated);
            localStorage.setItem('customer_user', JSON.stringify(updated));
          }}
          navigate={navigate}
          activeTab={activeTab}
        />
      );
    }

    // Admin Portal Routing (Completely separate from customer login)
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

    if (currentPath === '/admin/customers') {
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
        <AdminCustomersPage
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

    // Default Fallback to Homepage
    return <HomePage info={storeInfo} services={services} navigate={navigate} />;
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Dynamic SEO Meta Tags & JSON-LD Schema Injection */}
      <HeadSEO meta={seoMeta} info={storeInfo} />

      {/* Main App Layout */}
      <div>
        {!isAdminRoute && (
          <Navbar
            currentPath={currentPath}
            navigate={navigate}
            info={storeInfo}
            customerUser={customerUser}
            onCustomerLogout={handleCustomerLogout}
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
