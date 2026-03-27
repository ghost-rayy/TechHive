import { ShieldCheck, ArrowLeft, Lock, Eye, Server, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-neutral-500 font-medium">Last Updated: March 2026</p>
        </header>

        <div className="space-y-12">
          <section className="bg-neutral-900/40 border border-neutral-800/50 p-8 md:p-12 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Eye size={120} />
            </div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-sm font-black">01</span>
              Information We Collect
            </h2>
            <div className="space-y-4 text-neutral-400 leading-relaxed">
              <p>At TechHive Ghana, we only collect information that is essential for providing you with a premium shopping experience. This includes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Personal details (Name, Email, Phone) provided during purchase requests.</li>
                <li>Shipping information for nationwide delivery in Ghana.</li>
                <li>Device information and IP addresses to help us optimize our storefront performance.</li>
              </ul>
            </div>
          </section>

          <section className="bg-neutral-900/40 border border-neutral-800/50 p-8 md:p-12 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Lock size={120} />
            </div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-sm font-black">02</span>
              How We Use Your Data
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              Your data is primarily used to fulfill your purchase requests, verify stock availability, and communicate with you via WhatsApp or Email regarding your orders. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-neutral-900/40 border border-neutral-800/50 p-8 rounded-[2.5rem]">
              <Server className="text-indigo-400 mb-4" size={24} />
              <h3 className="text-xl font-bold mb-3">Secure Storage</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                All order data is stored on secure, encrypted servers. Access is restricted to authorized TechHive staff only.
              </p>
            </div>
            <div className="bg-neutral-900/40 border border-neutral-800/50 p-8 rounded-[2.5rem]">
              <RefreshCcw className="text-indigo-400 mb-4" size={24} />
              <h3 className="text-xl font-bold mb-3">Your Rights</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                You can request the permanent deletion of your customer data at any time by contacting our support team via WhatsApp.
              </p>
            </div>
          </section>

          <footer className="pt-12 border-t border-neutral-800 text-center">
            <p className="text-neutral-500 text-sm">
              Questions about our privacy practices? <br />
              Contact us on WhatsApp at <span className="text-indigo-400 font-bold">053 721 2755</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
