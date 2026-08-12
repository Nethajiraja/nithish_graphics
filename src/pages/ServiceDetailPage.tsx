import React from 'react';
import { ServiceItem, BusinessInfo } from '../types';
import { PriceCalculator } from '../components/PriceCalculator';
import { Phone, MessageSquare, CheckCircle, ArrowLeft, Shield, Zap, Sparkles } from 'lucide-react';

interface ServiceDetailPageProps {
  serviceSlug: string;
  services: ServiceItem[];
  info: BusinessInfo;
  navigate: (path: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceSlug,
  services,
  info,
  navigate
}) => {
  const service = services.find((s) => s.slug === serviceSlug) || services[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button>
        <span>/</span>
        <button onClick={() => navigate('/services')} className="hover:text-blue-600">Services</button>
        <span>/</span>
        <span className="font-semibold text-slate-900">{service.title}</span>
      </div>

      {/* Main Service Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nithish Graphics Specialty Service</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {service.title} Services – Nithish Graphics
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {service.fullDesc}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg">
              Starting Rate: {service.startingPrice}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="w-4 h-4" /> Fast Same-Day Pickup
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Shield className="w-4 h-4 text-blue-400" /> Quality Paper Guarantee
            </span>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <a
              href={`tel:${info.phone}`}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Call Shop: {info.phone}</span>
            </a>
            <a
              href={`https://wa.me/${info.whatsapp}?text=Hi%20Nithish%20Graphics,%20I%20am%20interested%20in%20${encodeURIComponent(service.title)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Order via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Feature Specification Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            Why Choose Nithish Graphics for {service.title}?
          </h2>

          <ul className="space-y-4">
            {service.features.map((feat, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-sm text-slate-700">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{feat}</span>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider">Related Keywords & Terms:</h3>
            <div className="flex flex-wrap gap-1.5">
              {service.keywords.map((kw, i) => (
                <span key={i} className="bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-600">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Store Quick Contact</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Have specific formatting or paper requirements for your document? Connect directly with Nithish Graphics staff.
            </p>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
              <div>
                <strong className="block text-slate-900">Phone Number:</strong>
                <a href={`tel:${info.phone}`} className="text-blue-600 font-bold">{info.phone}</a>
              </div>
              <div>
                <strong className="block text-slate-900">Address:</strong>
                <span>{info.address}, {info.city}</span>
              </div>
              <div>
                <strong className="block text-slate-900">Hours:</strong>
                <span>{info.openingHours}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/order')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-colors"
          >
            Calculate Price for {service.title}
          </button>
        </div>
      </div>

      {/* Embedded Estimator */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Estimate Price for {service.title}</h2>
          <p className="text-xs text-slate-600">Test different page counts and print specs below.</p>
        </div>
        <PriceCalculator info={info} navigate={navigate} />
      </section>
    </div>
  );
};
