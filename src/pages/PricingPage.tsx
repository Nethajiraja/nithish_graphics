import React from 'react';
import { PricingRate, BusinessInfo } from '../types';
import { Phone, MessageSquare, Check, HelpCircle } from 'lucide-react';
import { PriceCalculator } from '../components/PriceCalculator';

interface PricingPageProps {
  rates: PricingRate[];
  info: BusinessInfo;
  navigate: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ rates, info, navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Transparent Rates
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Nithish Graphics Printing & Binding Rate Card
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Affordable, clear per-page printing prices for students, businesses, and professionals. Call <strong>{info.phone}</strong> for bulk notes and college record discounts!
        </p>
      </div>

      {/* Pricing Rate Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold">Standard Rate Card Summary</h2>
            <p className="text-xs text-slate-300">All prices in Indian Rupees (₹)</p>
          </div>
          <a
            href={`tel:${info.phone}`}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Shop: {info.phone}</span>
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Service Category</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Single Sided</th>
                <th className="py-3.5 px-6">Double Sided</th>
                <th className="py-3.5 px-6">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rates.map((rate) => (
                <tr key={rate.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{rate.name}</td>
                  <td className="py-4 px-6 text-slate-600">{rate.description}</td>
                  <td className="py-4 px-6 font-bold text-blue-600">₹{rate.priceSingle.toFixed(2)}</td>
                  <td className="py-4 px-6 font-bold text-emerald-600">
                    {rate.priceDouble ? `₹${rate.priceDouble.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-slate-500">{rate.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Calculator */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Custom Order Cost Calculator</h2>
          <p className="text-xs text-slate-600">Get an exact total for your document package</p>
        </div>
        <PriceCalculator info={info} navigate={navigate} />
      </section>
    </div>
  );
};
