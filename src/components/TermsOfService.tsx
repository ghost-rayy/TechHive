import { Scale, ArrowLeft, CreditCard, Truck, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans selection:bg-indigo-500/30 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-12 transition-colors group"
        >
          <div className="p-2 bg-neutral-900 rounded-xl group-hover:bg-neutral-800 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="font-bold">Back to Storefront</span>
        </Link>

        <header className="mb-16">
          <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 border border-indigo-500/20">
            <Scale size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-neutral-500 font-medium">Simple | Smart | Secure Trading at TechHive Ghana</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-neutral-900/40 border border-neutral-800/50 p-8 rounded-[2.5rem] flex flex-col">
            <CreditCard className="text-indigo-400 mb-6" size={28} />
            <h3 className="text-xl font-bold mb-4">Purchase Requests</h3>
            <p className="text-neutral-400 text-sm leading-relaxed flex-1">
              Submitting a purchase request on the storefront does not constitute a final contract. Our sales team will verify availability and provide a formal invoice before payment.
            </p>
          </div>
          <div className="bg-neutral-900/40 border border-neutral-800/50 p-8 rounded-[2.5rem] flex flex-col">
            <Truck className="text-indigo-400 mb-6" size={28} />
            <h3 className="text-xl font-bold mb-4">Delivery & Pickup</h3>
            <p className="text-neutral-400 text-sm leading-relaxed flex-1">
              We offer nationwide delivery across Ghana. Delivery timelines are provided upon order confirmation. In-person pickups can be arranged at our Accra hub.
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800/50 p-8 md:p-12 rounded-[3.5rem] space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
              <AlertCircle size={24} className="text-indigo-400" />
              Warranty & Returns
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              Every premium laptop from TechHive Ghana comes with a standard warranty unless stated otherwise. Returns are only accepted for manufacturer defects within 7 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
              <FileText size={24} className="text-indigo-400" />
              User Responsibility
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              Users are responsible for providing accurate contact and shipping information. TechHive Ghana is not liable for delivery failures due to incorrect details provided by the customer.
            </p>
          </section>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-neutral-600 text-[10px] uppercase font-bold tracking-[0.2em]">
            © {new Date().getFullYear()} TechHive Ghana • Premium Digital Trading
          </p>
        </footer>
      </div>
    </div>
  );
}
