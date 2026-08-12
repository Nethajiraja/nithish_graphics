import React from 'react';
import { Printer, Phone, Mail, MapPin, Clock, ExternalLink, CheckCircle, Lock } from 'lucide-react';
import { BusinessInfo } from '../types';

interface FooterProps {
  navigate: (path: string) => void;
  info: BusinessInfo;
  onOpenSeoInspector: () => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, info, onOpenSeoInspector }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Core Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Nithish Graphics</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Nithish Graphics</strong> is your premier local printing and binding hub. We deliver top-tier <strong>B/W Printing</strong>, <strong>Color Printing</strong>, <strong>PDF Printing</strong>, <strong>Notes Printing</strong>, <strong>Record Printing</strong>, <strong>Spiral Binding</strong>, <strong>Soft Binding</strong>, and <strong>Record Binding</strong> services.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50">
                <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" />
                Google Search Engine Optimized
              </span>
            </div>
          </div>

          {/* Col 2: Printing & Binding Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              Printing Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/services/bw-printing')} className="hover:text-blue-400 transition-colors">
                  B/W Printing & Study Notes
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services/color-printing')} className="hover:text-blue-400 transition-colors">
                  Color Printing & HD Graphics
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services/pdf-printing')} className="hover:text-blue-400 transition-colors">
                  PDF Printing & Document Upload
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services/spiral-binding')} className="hover:text-blue-400 transition-colors">
                  Spiral Binding & Protective Sheets
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services/record-binding')} className="hover:text-blue-400 transition-colors">
                  Hardcover Record Binding & Embossing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services/soft-binding')} className="hover:text-blue-400 transition-colors">
                  Soft Binding & Thermal Glued Spine
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              Contact Nithish Graphics
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase">Phone / Hotline</span>
                  <a href={`tel:${info.phone}`} className="font-semibold text-white hover:text-blue-300">
                    {info.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase">Shop Location</span>
                  <span>{info.address}, {info.city}, {info.state} - {info.pincode}</span>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase">Opening Hours</span>
                  <span>{info.openingHours}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Technical & Search Engine Tools */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              Technical SEO & Domain
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Configured for canonical domain: <br />
              <code className="text-amber-300 font-mono text-[11px]">https://www.nithishgraphics.com/</code>
            </p>
            <div className="space-y-2 text-xs">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-slate-300 hover:text-white"
              >
                <ExternalLink className="w-3 h-3 mr-1 text-blue-400" />
                View XML Sitemap (/sitemap.xml)
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-slate-300 hover:text-white"
              >
                <ExternalLink className="w-3 h-3 mr-1 text-blue-400" />
                View Robots.txt (/robots.txt)
              </a>
              <button
                onClick={onOpenSeoInspector}
                className="flex items-center text-amber-300 hover:text-amber-200 font-medium"
              >
                <ExternalLink className="w-3 h-3 mr-1 text-amber-400" />
                Google SERP & Schema Inspector
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong>Nithish Graphics</strong>. All rights reserved. Professional Printing Services.
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/about')} className="hover:text-slate-300">
              About
            </button>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-300">
              Contact
            </button>
            <button onClick={() => navigate('/admin/dashboard')} className="hover:text-slate-300 flex items-center">
              <Lock className="w-3 h-3 mr-1 text-slate-400" />
              Admin Panel
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
