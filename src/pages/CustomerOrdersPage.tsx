import React from 'react';
import { BusinessInfo } from '../types';
import { Phone, CheckCircle, Clock } from 'lucide-react';

interface CustomerOrdersPageProps {
  info: BusinessInfo;
  navigate: (path: string) => void;
}

export const CustomerOrdersPage: React.FC<CustomerOrdersPageProps> = ({ info }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <Clock className="w-12 h-12 text-blue-600 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Customer Private Order Area</h1>
        <p className="text-xs text-slate-600">
          This page is private and not indexed by search engines. To check your print order status, call Nithish Graphics directly.
        </p>
        <a
          href={`tel:${info.phone}`}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-xs"
        >
          <Phone className="w-4 h-4" />
          <span>Call Shop: {info.phone}</span>
        </a>
      </div>
    </div>
  );
};
