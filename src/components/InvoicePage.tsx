import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Share2, ArrowLeft, CheckCircle2, Package, User, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';

interface RequestItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Request {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: RequestItem[];
  total: number;
  status: string;
  receipt_number?: string;
  createdat: string;
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://techhive-backend.onrender.com');

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/requests`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        const found = data.find((r: Request) => r.id === id);
        if (found) setRequest(found);
        else setError('Receipt not found');
      } catch (err) {
        setError('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id, API_BASE_URL]);

  const handlePrint = () => window.print();

  const handleShareWhatsApp = () => {
    if (!request) return;
    const message = `*Receipt from TechHive Ghana* 🚀\n\nHello ${request.name},\nYour order has been confirmed! Here is your digital receipt:\n\n*Receipt #:* ${request.receipt_number || 'N/A'}\n*Total:* GHS ${request.total.toLocaleString()}\n\nView full details here: ${window.location.href}\n\n*Simple | Smart | Secure*`;
    window.open(`https://wa.me/${request.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  if (error || !request) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-red-500 mb-4">{error || 'Receipt not found'}</h1>
      <Link to="/" className="text-indigo-400 hover:underline">Back to Shop</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        {/* Navigation / Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 no-print">
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="font-bold">Return to Shop</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 transition-all font-bold text-sm"
            >
              <Printer size={16} />
              Print PDF
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 rounded-xl hover:bg-green-700 transition-all font-bold text-sm shadow-lg shadow-green-600/20"
            >
              <Share2 size={16} />
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* The Receipt Paper */}
        <div className="bg-white text-black p-8 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden receipt-paper">
          {/* Subtle Watermark/Deco */}
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] select-none pointer-events-none">
            <ShieldCheck size={300} strokeWidth={1} />
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 border-b border-neutral-100 pb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo3.png" alt="Logo" className="w-12 h-12 object-contain" />
                <span className="text-3xl font-black tracking-tighter uppercase">TechHive</span>
              </div>
              <div className="space-y-1 text-sm text-neutral-500 font-medium">
                <p>Digital Excellence Hub</p>
                <p>Accra, Ghana</p>
                <p>053 721 2755</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-black text-neutral-900 tracking-tighter mb-2 uppercase">Official Receipt</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <CheckCircle2 size={12} />
                Order Confirmed
              </div>
              <div className="text-sm font-bold text-neutral-800">
                <p>Receipt #: {request.receipt_number || request.id}</p>
                <p>Date: {new Date(request.createdat).toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </div>

          {/* Customer & Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            <div className="space-y-4">
              <h2 className="text-[10px] uppercase font-black text-neutral-400 tracking-[0.2em] mb-4">Customer Details</h2>
              <div className="flex items-start gap-3">
                <User size={16} className="text-indigo-600 mt-1" />
                <div>
                  <p className="font-bold text-neutral-900">{request.name}</p>
                  <p className="text-sm text-neutral-500">{request.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-indigo-600 mt-1" />
                <p className="text-sm text-neutral-500 font-medium">{request.phone}</p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-[10px] uppercase font-black text-neutral-400 tracking-[0.2em] mb-4">Delivery Address</h2>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-indigo-600 mt-1" />
                <p className="text-sm text-neutral-500 leading-relaxed font-medium capitalize prose-sm">
                  {request.address}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-16">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900">
                  <th className="py-4 text-[10px] uppercase font-black text-neutral-400 tracking-widest">Description</th>
                  <th className="py-4 text-[10px] uppercase font-black text-neutral-400 tracking-widest text-center px-4">Qty</th>
                  <th className="py-4 text-[10px] uppercase font-black text-neutral-400 tracking-widest text-right">Unit Price</th>
                  <th className="py-4 text-[10px] uppercase font-black text-neutral-400 tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {request.items.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-5 font-bold text-neutral-900 flex items-center gap-3">
                      <Package size={14} className="text-neutral-300" />
                      {item.name}
                    </td>
                    <td className="py-5 text-neutral-500 text-center font-bold px-4">{item.quantity}</td>
                    <td className="py-5 text-neutral-500 text-right font-medium">GHS {item.price.toLocaleString()}</td>
                    <td className="py-5 text-neutral-900 text-right font-black">GHS {(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="flex justify-end mb-20">
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Subtotal</span>
                <span className="font-bold">GHS {request.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Tax / VAT (0%)</span>
                <span className="font-bold">GHS 0</span>
              </div>
              <div className="pt-4 border-t-2 border-neutral-900 flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tight">Total</span>
                <span className="text-2xl font-black text-indigo-700">GHS {request.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer / Disclaimer */}
          <div className="text-center pt-10 border-t border-dashed border-neutral-200">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShieldCheck size={20} className="text-green-600" />
              <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Simple | Smart | Secure</span>
            </div>
            <p className="text-[10px] text-neutral-400 max-w-sm mx-auto leading-relaxed">
              This is a digitally generated receipt. If you have any questions regarding this transaction, please contact us within 72 hours.
            </p>
            <div className="mt-8 flex items-center justify-center gap-1 text-[10px] text-neutral-300 font-bold uppercase tracking-[0.3em]">
              SIMPLE | SMART | SECURE
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .receipt-paper { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
