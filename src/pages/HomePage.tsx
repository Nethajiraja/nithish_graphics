import React from 'react';
import {
  Printer,
  FileText,
  Palette,
  FileUp,
  BookOpen,
  BookMarked,
  Layers,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
import { BusinessInfo, ServiceItem } from '../types';
import { PriceCalculator } from '../components/PriceCalculator';

interface HomePageProps {
  info: BusinessInfo;
  services: ServiceItem[];
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ info, services, navigate }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background graphics */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Top Brand Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-400/30 text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Official Website of Nithish Graphics Print Shop</span>
            </div>

            {/* MANDATORY H1 HEADING */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Nithish Graphics – Professional Printing & Binding Services
            </h1>

            {/* NATURAL KEYWORD PARAGRAPH */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              Welcome to <strong>Nithish Graphics</strong>, your trusted destination for all <strong>Printing Services</strong>. We deliver high-speed <strong>B/W Printing</strong>, HD <strong>Color Printing</strong>, online <strong>PDF Printing</strong>, student <strong>Notes Printing</strong>, and college <strong>Record Printing</strong>. Keep your books organized with durable <strong>Spiral Binding</strong>, sleek <strong>Soft Binding</strong>, and hardcover <strong>Record Binding</strong> with gold foil embossing. Call us directly at <strong>7598730609</strong> for fast same-day dispatch!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/order')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 text-sm"
              >
                <span>Calculate Print Cost & Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${info.phone}`}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Shop: {info.phone}</span>
              </a>

              <a
                href={`https://wa.me/${info.whatsapp}?text=Hi%20Nithish%20Graphics,%20I%20want%20to%20order%20printing%20services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3.5 rounded-xl transition-colors flex items-center space-x-2 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Express Printing</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>High 1200DPI Laser</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>University Formats</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Student Discounts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Interactive Cost Estimator Section */}
        <section id="cost-estimator">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
              Instant Online Tool
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Calculate Your Printing & Binding Price
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Select your PDF page count, B/W or color mode, paper GSM, and binding finish at Nithish Graphics.
            </p>
          </div>
          <PriceCalculator info={info} navigate={navigate} />
        </section>

        {/* Services Showcase Grid */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
                Our Core Services
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Complete Printing & Binding Solutions at Nithish Graphics
              </h2>
            </div>
            <button
              onClick={() => navigate('/services')}
              className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                        {service.startingPrice}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {service.shortDesc}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-start text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/services/${service.slug}`)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Explore Service Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Academic & College Specialization Banner */}
        <section className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-400/30 inline-block">
                College & Student Preferred Shop
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Record Printing & Hardcover Binding for Engineering, Polytechnic & Arts Students
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong>Nithish Graphics</strong> specializes in college lab record binding, final year project thesis printing, and study material spiral binding. We follow strict university margin and format specifications with gold lettering title embossing.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Lab Records</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Final Year Thesis</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Subject Notes PDF</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hardcover Embossing</span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-4">
              <h3 className="text-lg font-bold">Have Urgent Record Submissions?</h3>
              <p className="text-xs text-slate-200">
                Send your record PDF files over WhatsApp for quick processing!
              </p>
              <a
                href={`https://wa.me/${info.whatsapp}?text=Hi%20Nithish%20Graphics,%20I%20have%20an%20urgent%20college%20record%20binding%20order.`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md"
              >
                Send Record PDF to {info.phone}
              </a>
            </div>
          </div>
        </section>

        {/* Local Business Location & Shop Hours */}
        <section className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                Visit Store
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Nithish Graphics Location & Hours
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visit our physical printing store for high-speed document printing, spiral binding, and hardcover record binding.
              </p>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Address:</strong>
                    <span>{info.address}, {info.city}, {info.state} - {info.pincode}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Phone Hotline:</strong>
                    <a href={`tel:${info.phone}`} className="text-blue-700 font-semibold hover:underline">
                      {info.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Store Hours:</strong>
                    <span>{info.openingHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
                >
                  View Full Contact & Direction Details
                </button>
              </div>
            </div>

            {/* Simulated Interactive Map Display */}
            <div className="bg-slate-200 rounded-xl p-6 border border-slate-300 text-center space-y-3 flex flex-col justify-center items-center min-h-[220px]">
              <MapPin className="w-10 h-10 text-red-600 animate-bounce" />
              <h3 className="text-sm font-bold text-slate-900">Nithish Graphics Print Shop</h3>
              <p className="text-xs text-slate-600">
                {info.address}, {info.city}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent('Nithish Graphics ' + info.address + ' ' + info.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-600 mt-1">Everything you need to know about printing at Nithish Graphics</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                How can I send my PDF files for printing at Nithish Graphics?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can upload your PDF directly on our website using our instant Cost Estimator, or send files via WhatsApp to <strong>{info.phone}</strong>. You can also bring files on a USB pen drive to our shop.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Do you offer B/W and Color printing on double-sided (duplex) pages?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes! We support single-sided and double-sided (back-to-back) printing for both B/W and HD Color documents. Double-sided printing saves paper and reduces total cost.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                What binding options are available for college record books?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We offer durable plastic Spiral Binding, sleek Soft/Thermal Binding, and heavy-duty Hardcover Record Binding with gold or silver foil title embossing compliant with university standards.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
