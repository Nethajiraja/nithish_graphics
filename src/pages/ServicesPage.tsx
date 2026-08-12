import React from 'react';
import { ServiceItem, BusinessInfo } from '../types';
import { FileText, Palette, FileUp, BookOpen, BookMarked, Layers, ArrowRight, Phone, CheckCircle } from 'lucide-react';

interface ServicesPageProps {
  services: ServiceItem[];
  info: BusinessInfo;
  navigate: (path: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services, info, navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Complete Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Printing & Binding Services – Nithish Graphics
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nithish Graphics offers high-speed B/W printing, vibrant HD color printing, instant PDF document printing, spiral binding, soft cover binding, and college record binding. Call <strong>{info.phone}</strong> for quick quotes and express orders.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => {
          const IconComponent =
            service.id === 'bw-printing' ? FileText :
            service.id === 'color-printing' ? Palette :
            service.id === 'pdf-printing' ? FileUp :
            service.id === 'spiral-binding' ? BookOpen :
            service.id === 'record-binding' ? BookMarked : Layers;

          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                    {service.startingPrice}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {service.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {service.fullDesc}
                </p>

                <div className="space-y-2 mb-6">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Highlights:</h3>
                  <ul className="space-y-1.5">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/services/${service.slug}`)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>View Dedicated Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/order')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Order Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Order Callout */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">Need Custom Printing Specifications?</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          We handle custom paper GSM, oversized A3/A2 prints, bulk notes binding, and university thesis submissions.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <a
            href={`tel:${info.phone}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center space-x-1.5"
          >
            <Phone className="w-4 h-4" />
            <span>Call Shop: {info.phone}</span>
          </a>
          <button
            onClick={() => navigate('/contact')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-lg text-xs"
          >
            Contact Store
          </button>
        </div>
      </div>
    </div>
  );
};
