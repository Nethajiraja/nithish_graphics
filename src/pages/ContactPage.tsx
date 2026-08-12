import React, { useState } from 'react';
import { BusinessInfo } from '../types';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle, ExternalLink } from 'lucide-react';

interface ContactPageProps {
  info: BusinessInfo;
  navigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ info }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('B/W Printing');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Local Store & Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Nithish Graphics
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          We are ready to assist with B/W printing, color printing, PDF uploads, spiral binding, and record binding. Call or visit our store!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Contact Information */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 rounded-2xl shadow-lg space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-3">
              Nithish Graphics Store Info
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-600/30 text-blue-400 rounded-lg shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[10px] font-bold">Phone Hotline</span>
                  <a href={`tel:${info.phone}`} className="text-base font-bold text-white hover:text-blue-300">
                    {info.phone}
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Direct line for instant print inquiry</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-lg shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[10px] font-bold">WhatsApp Dispatch</span>
                  <a
                    href={`https://wa.me/${info.whatsapp}?text=Hi%20Nithish%20Graphics`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-emerald-400 hover:underline"
                  >
                    +91 {info.phone}
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Send PDF files directly over WhatsApp</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[10px] font-bold">Shop Address</span>
                  <p className="text-sm font-semibold text-slate-200">
                    {info.address}, {info.city}, {info.state} - {info.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-600/30 text-amber-400 rounded-lg shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-slate-400 uppercase text-[10px] font-bold">Store Hours</span>
                  <p className="text-xs text-slate-200 font-medium">{info.openingHours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <a
              href={`tel:${info.phone}`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-colors"
            >
              Call {info.phone} Now
            </a>
          </div>
        </div>

        {/* Right Col: Interactive Inquiry Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Send an Online Inquiry</h2>
          <p className="text-xs text-slate-600 mb-6">
            Fill out the form below and our printing team at Nithish Graphics will respond immediately.
          </p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-xl text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold">Inquiry Sent Successfully!</h3>
              <p className="text-xs text-slate-600">
                Thank you {name}. We will call you back at <strong>{phone}</strong> regarding your <strong>{service}</strong> request.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anbu Selvan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Service Required</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                >
                  <option value="B/W Printing">B/W Printing & Study Notes</option>
                  <option value="Color Printing">HD Color Printing</option>
                  <option value="PDF Printing">PDF Document Printing</option>
                  <option value="Spiral Binding">Spiral Binding</option>
                  <option value="College Record Binding">College Record Hardcover Binding</option>
                  <option value="Soft Binding">Soft Cover Binding</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Additional Details / Notes</label>
                <textarea
                  rows={4}
                  placeholder="Provide page count, paper requirements, or record formatting preferences..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2 text-sm shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to Nithish Graphics</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
