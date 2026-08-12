import React from 'react';
import { BusinessInfo, CustomerUser } from '../types';
import { PriceCalculator } from '../components/PriceCalculator';
import { ShieldCheck } from 'lucide-react';

interface OrderPageProps {
  info: BusinessInfo;
  customerUser?: CustomerUser | null;
  customerToken?: string | null;
  navigate: (path: string) => void;
}

export const OrderPage: React.FC<OrderPageProps> = ({ info, customerUser, customerToken, navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 selection:bg-orange-500 selection:text-white">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          Instant Printing Dispatch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Online Document & PDF Printing Order
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Upload original files (PDF, DOCX, JPG, PNG, ZIP), customize print parameters, calculate live prices from PostgreSQL, and dispatch directly to Nithish Graphics!
        </p>
      </div>

      <PriceCalculator info={info} customerUser={customerUser} customerToken={customerToken} navigate={navigate} />

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs space-y-3 text-slate-700">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          How Online PDF Printing Works at Nithish Graphics:
        </h2>
        <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-600">
          <li>Select or drag your PDF document into the Cost Calculator above.</li>
          <li>Choose your print mode (B/W or Color), single or double sided, and binding style.</li>
          <li>Click <strong>Send Order Details via WhatsApp</strong> to notify our shop staff at <strong>{info.phone}</strong>.</li>
          <li>Collect your completed documents from our shop or coordinate local delivery.</li>
        </ol>
      </div>
    </div>
  );
};
