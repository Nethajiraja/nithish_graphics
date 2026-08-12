import React from 'react';
import { BusinessInfo } from '../types';
import { Printer, ShieldCheck, Award, Users, Phone, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  info: BusinessInfo;
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ info, navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Our Story & Quality
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Nithish Graphics
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nithish Graphics is dedicated to providing students, academic institutions, and local businesses with top-tier printing and document finishing services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900">
            Craftsmanship in Printing & Document Finishing
          </h2>
          <p>
            At <strong>Nithish Graphics</strong>, we understand that quality prints make all the difference — whether it is a college record submission with gold title embossing, a set of lecture study notes, or a business project presentation.
          </p>
          <p>
            Equipped with industrial 1200 DPI laser printing machinery and heavy-gauge spiral and hardcover binding equipment, our team ensures every page is printed with extreme clarity and durability.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <span className="block text-2xl font-extrabold text-blue-600">100%</span>
              <span className="text-xs text-slate-600 font-medium">Quality Guaranteed</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <span className="block text-2xl font-extrabold text-emerald-600">Express</span>
              <span className="text-xs text-slate-600 font-medium">Same-Day Pickup</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Printer className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold">Why Students & Businesses Choose Us</h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Strict adherence to university & college record binding guidelines.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Transparent per-page rate card with no hidden charges.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Instant PDF document submission via WhatsApp or Web.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Located conveniently near major educational hubs.</span>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href={`tel:${info.phone}`}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-5 rounded-xl text-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Nithish Graphics: {info.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
