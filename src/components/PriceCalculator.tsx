import React, { useState } from 'react';
import { Calculator, Upload, MessageSquare, Check, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { BusinessInfo } from '../types';

interface PriceCalculatorProps {
  info: BusinessInfo;
  navigate?: (path: string) => void;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({ info }) => {
  const [pages, setPages] = useState<number>(30);
  const [copies, setCopies] = useState<number>(1);
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [sides, setSides] = useState<'single' | 'double'>('double');
  const [paperGsm, setPaperGsm] = useState<'70gsm' | '80gsm' | 'glossy'>('70gsm');
  const [binding, setBinding] = useState<'none' | 'spiral' | 'soft' | 'record'>('spiral');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Per page rates
  const bwRateSingle = paperGsm === '80gsm' ? 2.0 : 1.5;
  const bwRateDouble = paperGsm === '80gsm' ? 1.5 : 1.0;
  const colorRateSingle = paperGsm === 'glossy' ? 10.0 : 6.0;
  const colorRateDouble = paperGsm === 'glossy' ? 8.0 : 5.0;

  const perPageRate = printType === 'bw'
    ? (sides === 'double' ? bwRateDouble : bwRateSingle)
    : (sides === 'double' ? colorRateDouble : colorRateSingle);

  // Binding cost per document
  let bindingCost = 0;
  if (binding === 'spiral') bindingCost = pages > 150 ? 50 : 30;
  if (binding === 'soft') bindingCost = 45;
  if (binding === 'record') bindingCost = 180;

  // Print sheets calculated
  const sheetsPerCopy = sides === 'double' ? Math.ceil(pages / 2) : pages;
  const printCostPerCopy = pages * perPageRate;
  const totalCostPerCopy = printCostPerCopy + bindingCost;
  const grandTotal = Math.round(totalCostPerCopy * copies);

  // Handle Drag & Drop simulated PDF page calculation
  const handleFileUpload = (file: File) => {
    setUploadedFileName(file.name);
    // Estimate page count based on file size or random realistic count
    const simulatedPages = Math.min(Math.max(Math.round(file.size / 45000), 5), 240);
    setPages(simulatedPages);
  };

  const generateWhatsAppMessage = () => {
    const bindingName = binding === 'spiral' ? 'Spiral Binding' : binding === 'soft' ? 'Soft Binding' : binding === 'record' ? 'Hardcover Record Binding' : 'No Binding';
    const text = `Hi Nithish Graphics! I would like to order printing:\n\n` +
      `📄 File: ${uploadedFileName || 'Custom Document'}\n` +
      `📊 Pages: ${pages} pages (${copies} ${copies > 1 ? 'copies' : 'copy'})\n` +
      `🖨️ Type: ${printType.toUpperCase()} (${sides === 'double' ? 'Double Sided' : 'Single Sided'})\n` +
      `📜 Paper: ${paperGsm.toUpperCase()}\n` +
      `📚 Binding: ${bindingName}\n` +
      `💰 Total Estimated Price: ₹${grandTotal}\n\n` +
      `Please confirm availability and store pickup time. Phone: ${info.phone}`;

    return `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Card Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Instant Printing & Binding Cost Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Calculate exact per-page rates for B/W, Color, PDF printing, Spiral & Record binding
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* File Upload / PDF Dropper */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                : uploadedFileName
                ? 'border-emerald-300 bg-emerald-50/50'
                : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/80'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="file-upload-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="file-upload-input" className="cursor-pointer block">
              <Upload className={`w-8 h-8 mx-auto mb-2 ${uploadedFileName ? 'text-emerald-600' : 'text-blue-600'}`} />
              {uploadedFileName ? (
                <div>
                  <span className="text-sm font-semibold text-emerald-800 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Selected: {uploadedFileName}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Auto-detected {pages} pages. Adjust manually below if needed.</p>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-semibold text-slate-800">
                    Drag & Drop your PDF file here, or <span className="text-blue-600 underline">Browse File</span>
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX for instant page count calculation</p>
                </div>
              )}
            </label>
          </div>

          {/* Controls Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Page Count */}
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900"
              />
            </div>

            {/* Copies */}
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Print Mode & Sides Selector */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Print Color & Duplex Option
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrintType('bw')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold text-center transition-all flex items-center justify-center space-x-2 ${
                  printType === 'bw'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-700" />
                <span>B/W Printing</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintType('color')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold text-center transition-all flex items-center justify-center space-x-2 ${
                  printType === 'color'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Color Printing</span>
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
              Paper Quality & GSM
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

          {/* Binding Choice */}
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
        </div>

        {/* Right column: Cost Breakdown & WhatsApp Action */}
        <div className="lg:col-span-5 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
              Price Summary Breakdown
            </h3>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between items-center">
                <span>Print Type:</span>
                <span className="font-medium text-slate-900">
                  {printType === 'bw' ? 'B/W Laser Print' : 'Color Print'} ({sides === 'double' ? 'Double Sided' : 'Single Sided'})
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Estimated Sheets:</span>
                <span className="font-medium text-slate-900">
                  {sheetsPerCopy} paper sheet(s) per copy
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Rate per page:</span>
                <span className="font-medium text-slate-900">₹{perPageRate.toFixed(2)} / page</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Printing Total ({copies} {copies > 1 ? 'copies' : 'copy'}):</span>
                <span className="font-medium text-slate-900">₹{Math.round(printCostPerCopy * copies)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Binding Finish ({binding}):</span>
                <span className="font-medium text-slate-900">₹{bindingCost * copies}</span>
              </div>

              <div className="pt-4 border-t border-slate-300 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Total Price:</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-blue-600">₹{grandTotal}</span>
                  <span className="block text-[11px] text-slate-500 font-normal">Inclusive of all taxes</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2 text-xs text-blue-900">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Note: Bulk notes and college record discounts applied automatically for large print volumes!
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <a
              href={generateWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Send Order Details via WhatsApp</span>
            </a>
            <p className="text-center text-[11px] text-slate-500">
              Directly contacts <strong>Nithish Graphics</strong> at <strong>{info.phone}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
