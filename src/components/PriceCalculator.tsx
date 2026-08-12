import React, { useState, useEffect } from 'react';
import { Calculator, Upload, MessageSquare, Check, FileText, Sparkles, AlertCircle, X, ShieldCheck, ExternalLink, Loader2, LogIn, Lock } from 'lucide-react';
import { BusinessInfo, PricingRate, CustomerUser } from '../types';

interface PriceCalculatorProps {
  info: BusinessInfo;
  customerUser?: CustomerUser | null;
  customerToken?: string | null;
  navigate?: (path: string) => void;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({ info, customerUser, customerToken, navigate }) => {
  const [pages, setPages] = useState<number>(30);
  const [copies, setCopies] = useState<number>(1);
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [sides, setSides] = useState<'single' | 'double'>('double');
  const [paperSize, setPaperSize] = useState<string>('A4');
  const [paperGsm, setPaperGsm] = useState<'70gsm' | '80gsm' | 'glossy'>('70gsm');
  const [binding, setBinding] = useState<'none' | 'spiral' | 'soft' | 'record'>('spiral');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('');

  // Customer Contact Info
  const [customerName, setCustomerName] = useState<string>(customerUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(customerUser?.phone || '');

  useEffect(() => {
    if (customerUser) {
      if (customerUser.name) setCustomerName(customerUser.name);
      if (customerUser.phone) setCustomerPhone(customerUser.phone);
    }
  }, [customerUser]);

  // Multi-File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic pricing rates from server
  const [rates, setRates] = useState<PricingRate[]>([]);

  useEffect(() => {
    fetch('/api/pricing')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRates(data);
      })
      .catch(() => {});
  }, []);

  // Check login requirement helper
  const checkAuthAndRedirect = (): boolean => {
    const token = customerToken || localStorage.getItem('customer_token');
    if (!token) {
      if (navigate) {
        navigate('/login?redirect=/order');
      }
      return false;
    }
    return true;
  };

  // Per page rate calculation dynamically using backend rates if available
  const bw70Rate = rates.find(r => r.name.includes('70 GSM')) || { priceSingle: 2.0, priceDouble: 1.5 };
  const bw80Rate = rates.find(r => r.name.includes('80 GSM')) || { priceSingle: 3.0, priceDouble: 2.0 };
  const colorStdRate = rates.find(r => r.name.includes('Standard') && r.category === 'Color Printing') || { priceSingle: 10.0, priceDouble: 8.0 };
  const colorGlossyRate = rates.find(r => r.name.includes('Laser') || r.name.includes('Gloss')) || { priceSingle: 15.0, priceDouble: 12.0 };

  let perPageRate = 2.0;
  if (printType === 'bw') {
    if (paperGsm === '80gsm') {
      perPageRate = sides === 'double' ? (bw80Rate.priceDouble || 2.0) : bw80Rate.priceSingle;
    } else {
      perPageRate = sides === 'double' ? (bw70Rate.priceDouble || 1.5) : bw70Rate.priceSingle;
    }
  } else {
    if (paperGsm === 'glossy') {
      perPageRate = sides === 'double' ? (colorGlossyRate.priceDouble || 12.0) : colorGlossyRate.priceSingle;
    } else {
      perPageRate = sides === 'double' ? (colorStdRate.priceDouble || 8.0) : colorStdRate.priceSingle;
    }
  }

  // Paper size multiplier
  if (paperSize === 'A3') perPageRate *= 2;

  // Binding cost per document
  let bindingCost = 0;
  if (binding === 'spiral') bindingCost = pages > 150 ? 50 : 40;
  if (binding === 'soft') bindingCost = 50;
  if (binding === 'record') bindingCost = 80;

  // Total calculation
  const sheetsPerCopy = sides === 'double' ? Math.ceil(pages / 2) : pages;
  const printCostPerCopy = pages * perPageRate;
  const totalCostPerCopy = printCostPerCopy + bindingCost;
  const grandTotal = Math.round(totalCostPerCopy * copies);

  // File addition & page estimation
  const handleFilesAdded = (newFiles: FileList | File[]) => {
    if (!checkAuthAndRedirect()) return;

    const validArray = Array.from(newFiles);
    setUploadedFiles(prev => [...prev, ...validArray]);

    // Estimate pages from multi-file total size
    let totalEstPages = 0;
    validArray.forEach(file => {
      const est = Math.min(Math.max(Math.round(file.size / 45000), 4), 150);
      totalEstPages += est;
    });
    if (totalEstPages > 0) {
      setPages(totalEstPages);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!checkAuthAndRedirect()) {
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name and phone number to complete the order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('customerName', customerName);
      formData.append('customerPhone', customerPhone);
      formData.append('service', printType === 'bw' ? 'B/W Printing' : 'Color Printing');
      formData.append('quantity', String(copies));
      formData.append('pagesPerCopy', String(pages));
      formData.append('colorType', printType);
      formData.append('paperSize', paperSize);
      formData.append('paperGsm', paperGsm);
      formData.append('printSide', sides);
      formData.append('bindingType', binding === 'spiral' ? 'Spiral Binding' : binding === 'soft' ? 'Soft Binding' : binding === 'record' ? 'Record Binding' : 'No Binding');
      formData.append('additionalInstructions', additionalInstructions);
      formData.append('totalPrice', String(grandTotal));

      uploadedFiles.forEach(file => {
        formData.append('documents', file);
      });

      const activeToken = customerToken || localStorage.getItem('customer_token') || '';

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.status === 401) {
        if (navigate) navigate('/login?redirect=/order');
        setErrorMessage('Please login or create an account to place an order.');
        return;
      }

      if (data.success) {
        setOrderResult(data);
      } else {
        setErrorMessage(data.message || 'Failed to submit order. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error submitting order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Card Header */}
      <div className="bg-linear-to-r from-slate-900 to-blue-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-orange-600 rounded-xl">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Instant Printing & Binding Order Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Upload original documents, customize options, get instant pricing & dispatch order via WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Guest Notice Banner */}
      {!customerUser && (
        <div className="mx-6 mt-6 sm:mx-8 sm:mt-8 p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div className="flex items-center space-x-2 text-amber-900 font-semibold">
            <Lock className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Please login or create an account to place an order.</span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate && navigate('/login?redirect=/order')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => navigate && navigate('/register?redirect=/order')}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              <span>Register</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Controls & Upload */}
        <div className="lg:col-span-7 space-y-6">
          {/* File Upload / Dropper */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Upload Original Customer Documents (PDF, DOCX, JPG, PNG, ZIP, etc.)
            </label>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFilesAdded(e.dataTransfer.files);
                }
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                  : uploadedFiles.length > 0
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/80'
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip,.rar,.7z"
                id="file-upload-input"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFilesAdded(e.target.files);
                  }
                }}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer block">
                <Upload className={`w-8 h-8 mx-auto mb-2 ${uploadedFiles.length > 0 ? 'text-emerald-600' : 'text-blue-600'}`} />
                <div>
                  <span className="text-sm font-semibold text-slate-800">
                    Drag & Drop your files here, or <span className="text-blue-600 underline">Browse Documents</span>
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOC, DOCX, JPG, PNG, ZIP & all document formats (Original format preserved)
                  </p>
                </div>
              </label>
            </div>

            {/* List of uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mt-3">
                <span className="text-xs font-bold text-slate-700">Uploaded Files ({uploadedFiles.length}):</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-emerald-900 truncate">{file.name}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Info Input */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs"
              />
            </div>
          </div>

          {/* Controls Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Pages per Copy
              </label>
              <input
                type="number"
                min="1"
                max="2000"
                value={pages}
                onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Number of Copies / Sets
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Paper Size
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 text-xs"
              >
                <option value="A4">A4 Standard Sheet</option>
                <option value="A3">A3 Poster / Large Sheet</option>
                <option value="Legal">Legal Size</option>
                <option value="Letter">Letter Size</option>
              </select>
            </div>
          </div>

          {/* Print Mode & Duplex Option */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Print Mode & Duplex Option
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrintType('bw')}
                className={`py-3 px-4 rounded-xl border text-xs font-semibold text-center transition-all flex items-center justify-center space-x-2 ${
                  printType === 'bw'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-700" />
                <span>B/W Laser Printing</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintType('color')}
                className={`py-3 px-4 rounded-xl border text-xs font-semibold text-center transition-all flex items-center justify-center space-x-2 ${
                  printType === 'color'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Full Color Printing</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSides('double')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                  sides === 'double'
                    ? 'border-slate-800 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Double Sided (Back-to-Back)
              </button>
              <button
                type="button"
                onClick={() => setSides('single')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                  sides === 'single'
                    ? 'border-slate-800 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Single Sided
              </button>
            </div>
          </div>

          {/* Paper Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Paper GSM & Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaperGsm('70gsm')}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  paperGsm === '70gsm' ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                70 GSM Regular
              </button>
              <button
                type="button"
                onClick={() => setPaperGsm('80gsm')}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  paperGsm === '80gsm' ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                80 GSM Executive
              </button>
              <button
                type="button"
                onClick={() => setPaperGsm('glossy')}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  paperGsm === 'glossy' ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Photo Glossy / Card
              </button>
            </div>
          </div>

          {/* Binding Finish */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Binding Finish
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setBinding('none')}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  binding === 'none' ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                No Binding
              </button>
              <button
                type="button"
                onClick={() => setBinding('spiral')}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  binding === 'spiral' ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Spiral Binding
              </button>
              <button
                type="button"
                onClick={() => setBinding('soft')}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  binding === 'soft' ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Soft Binding
              </button>
              <button
                type="button"
                onClick={() => setBinding('record')}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  binding === 'record' ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Record Binding
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Additional Instructions / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please add front transparent sheet for spiral binding."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-xs"
            />
          </div>
        </div>

        {/* Right column: Price Summary & Order Dispatch */}
        <div className="lg:col-span-5 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
              Price Summary Breakdown
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Print Mode:</span>
                <span className="font-semibold text-slate-900">
                  {printType === 'bw' ? 'B/W Laser Print' : 'Full Color Print'} ({sides === 'double' ? 'Double Sided' : 'Single Sided'})
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Paper Size & GSM:</span>
                <span className="font-semibold text-slate-900">{paperSize} - {paperGsm.toUpperCase()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Sheets per copy:</span>
                <span className="font-semibold text-slate-900">{sheetsPerCopy} sheets</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Rate per page:</span>
                <span className="font-semibold text-slate-900">₹{perPageRate.toFixed(2)} / page</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Printing Total ({copies} {copies > 1 ? 'copies' : 'copy'}):</span>
                <span className="font-semibold text-slate-900">₹{Math.round(printCostPerCopy * copies)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Binding Finish ({binding}):</span>
                <span className="font-semibold text-slate-900">₹{bindingCost * copies}</span>
              </div>

              <div className="pt-4 border-t border-slate-300 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Total Price:</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-blue-600">₹{grandTotal}</span>
                  <span className="block text-[10px] text-slate-500 font-normal">Inclusive of all taxes</span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Action Button & Confirmation Modal */}
          <div>
            {!orderResult ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading Documents & Creating Order...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Place Order & Dispatch via WhatsApp</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Order #{orderResult.orderId} Created Successfully!</span>
                </div>
                <p className="text-emerald-700">
                  Your documents are securely uploaded. Click below to open WhatsApp with your pre-filled order details & secure document download links.
                </p>
                <a
                  href={orderResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Order to WhatsApp Shop</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            )}

            <p className="text-center text-[11px] text-slate-500 mt-2">
              Contacts <strong>Nithish Graphics</strong> shop hotline at <strong>{info.phone}</strong>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
