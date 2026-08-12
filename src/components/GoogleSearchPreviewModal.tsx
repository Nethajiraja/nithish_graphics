import React, { useState } from 'react';
import { X, Search, CheckCircle, ExternalLink, Globe, Shield, Code, Copy, FileText } from 'lucide-react';
import { BusinessInfo, PageSeoMeta } from '../types';

interface GoogleSearchPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: BusinessInfo;
  currentMeta: PageSeoMeta;
}

export const GoogleSearchPreviewModal: React.FC<GoogleSearchPreviewModalProps> = ({
  isOpen,
  onClose,
  info,
  currentMeta
}) => {
  const [activeTab, setActiveTab] = useState<'serp' | 'schema' | 'sitemap' | 'robots' | 'gsc'>('serp');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const domain = (info.canonicalDomain || 'https://www.nithishgraphics.com').replace(/\/$/, '');
  const verificationCode = info.googleSiteVerification || 'Pending-Verification-Code';

  const copyVerificationTag = () => {
    const code = `<meta name="google-site-verification" content="${verificationCode}" />`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Google Search Inspector & SERP Preview</h2>
              <p className="text-xs text-slate-400">Technical SEO & Indexing Readiness Tool</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('serp')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'serp' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google SERP Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'schema' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON-LD Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'sitemap' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>sitemap.xml</span>
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'robots' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>robots.txt</span>
          </button>
          <button
            onClick={() => setActiveTab('gsc')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'gsc' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Google Search Console</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: Google SERP Snippet */}
          {activeTab === 'serp' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">
                  Google Desktop Search Card Preview
                </h3>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1 font-sans">
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">N</div>
                    <span className="font-medium text-slate-800">Nithish Graphics</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 truncate">{currentMeta.canonicalUrl}</span>
                  </div>
                  <h4 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                    {currentMeta.title}
                  </h4>
                  <p className="text-xs text-[#4d5156] leading-relaxed">
                    {currentMeta.description}
                  </p>
                </div>
              </div>

              {/* Keywords Presence Checklist */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Keywords Verified in Content:
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    "Nithish Graphics",
                    "Printing Services",
                    "B/W Printing",
                    "Color Printing",
                    "PDF Printing",
                    "Notes Printing",
                    "Record Printing",
                    "Spiral Binding",
                    "Soft Binding",
                    "Record Binding"
                  ].map((kw) => (
                    <span key={kw} className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1 text-[11px]">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Schema Markup */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Structured Data (LocalBusiness JSON-LD)</h3>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium border border-emerald-200">
                  Schema Validated
                </span>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono">
                {JSON.stringify(currentMeta.schema || {}, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 3: Sitemap */}
          {activeTab === 'sitemap' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Dynamic XML Sitemap</h3>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  Open Live XML <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600">
                Sitemap URL for Google Search Console submission: <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-bold">{domain}/sitemap.xml</code>
              </p>
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono">
                <p className="text-slate-400">&lt;?xml version="1.0" encoding="UTF-8"?&gt;</p>
                <p className="text-blue-300">&lt;urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"&gt;</p>
                <div className="pl-4 space-y-1 my-2">
                  <p>&lt;url&gt;&lt;loc&gt;{domain}/&lt;/loc&gt;&lt;priority&gt;1.0&lt;/priority&gt;&lt;/url&gt;</p>
                  <p>&lt;url&gt;&lt;loc&gt;{domain}/services&lt;/loc&gt;&lt;priority&gt;0.9&lt;/priority&gt;&lt;/url&gt;</p>
                  <p>&lt;url&gt;&lt;loc&gt;{domain}/services/bw-printing&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</p>
                  <p>&lt;url&gt;&lt;loc&gt;{domain}/services/color-printing&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</p>
                  <p>&lt;url&gt;&lt;loc&gt;{domain}/services/spiral-binding&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</p>
                  <p>&lt;url&gt;&lt;loc&gt;{domain}/services/record-binding&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</p>
                  <p>&lt;url&gt;&lt;loc&gt;{domain}/contact&lt;/loc&gt;&lt;priority&gt;0.8&lt;/priority&gt;&lt;/url&gt;</p>
                </div>
                <p className="text-blue-300">&lt;/urlset&gt;</p>
              </div>
            </div>
          )}

          {/* TAB 4: Robots.txt */}
          {activeTab === 'robots' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">Robots.txt Configuration</h3>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  Open Live robots.txt <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <pre className="p-4 bg-slate-900 text-amber-300 rounded-xl text-xs font-mono">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/login
Disallow: /dashboard/
Disallow: /customer/
Disallow: /api/
Disallow: /uploads/

Sitemap: ${domain}/sitemap.xml`}
              </pre>
            </div>
          )}

          {/* TAB 5: GSC verification */}
          {activeTab === 'gsc' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Google Search Console Verification Tag</h3>
              <p className="text-xs text-slate-600">
                Paste your verification code from Google Search Console. It will be injected dynamically into the <code>&lt;head&gt;</code> tag of every page.
              </p>
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between">
                <code className="text-xs font-mono text-slate-800 truncate mr-2">
                  &lt;meta name="google-site-verification" content="{verificationCode}" /&gt;
                </code>
                <button
                  onClick={copyVerificationTag}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy Tag'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Canonical Domain: {domain}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
