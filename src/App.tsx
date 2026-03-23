import {
  ShoppingCart, Star, Plus, Minus, X, ArrowRight, Gamepad2, Briefcase, Tag,
  Sparkles, ShoppingBag, CreditCard, ChevronRight, MessageCircle, Trash2,
  LayoutDashboard, PlusCircle, Package, Mail, Phone, Menu, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, PurchaseRequest } from './types';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : '');

type Tab = 'home' | 'gaming' | 'casual' | 'budget' | 'low-cost' | 'cheap-deals' | 'cart';

interface CartItem extends Product {
  quantity: number;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

function StoreFront() {
  useEffect(() => {
    // Record unique visitor
    fetch(`${API_BASE_URL}/api/visit`, { method: 'POST' }).catch(() => { });
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'home' || activeTab === 'cart') return products;
    if (activeTab === 'cheap-deals') return products.filter(p => p.category === 'budget' || p.category === 'low-cost' || p.price < 3000);
    if (activeTab === 'low-cost') return products.filter(p => p.category === 'low-cost');
    if (activeTab === 'budget') return products.filter(p => p.category === 'budget');
    if (activeTab === 'casual') return products.filter(p => p.category === 'casual');
    if (activeTab === 'gaming') return products.filter(p => p.category === 'gaming');
    return products;
  }, [activeTab, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-15 h-15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <img src="/logo3.png" alt="TechHive" className="w-15 h-15 object-contain" />
            </div>
            <span style={{ marginLeft: '-20px' }} className="text-xl font-black tracking-tighter">Tech<span className="text-indigo-500">Hive</span></span>
          </div>

          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-neutral-900/50 p-1.5 rounded-full border border-neutral-800/50">
            <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" icon={<LayoutDashboard size={18} />} />
            <TabButton active={activeTab === 'gaming'} onClick={() => setActiveTab('gaming')} label="Gaming" icon={<Gamepad2 size={18} />} />
            <TabButton active={activeTab === 'casual'} onClick={() => setActiveTab('casual')} label="Professional" icon={<Briefcase size={18} />} />
            <TabButton active={activeTab === 'cheap-deals'} onClick={() => setActiveTab('cheap-deals')} label="Cheap Deals" icon={<Tag size={18} />} />
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('cart')}
              className="relative p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-indigo-500/50 transition-all group"
            >
              <ShoppingCart size={20} className="text-neutral-400 group-hover:text-indigo-400 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-neutral-950">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-indigo-500/50 transition-all"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-neutral-800 bg-neutral-950 overflow-hidden"
            >
              <div className="p-4 grid grid-cols-2 gap-2">
                 <button onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }} className="p-4 bg-neutral-900 rounded-2xl text-left font-bold text-sm">Home</button>
                 <button onClick={() => { setActiveTab('gaming'); setIsMenuOpen(false); }} className="p-4 bg-neutral-900 rounded-2xl text-left font-bold text-sm">Gaming</button>
                 <button onClick={() => { setActiveTab('casual'); setIsMenuOpen(false); }} className="p-4 bg-neutral-900 rounded-2xl text-left font-bold text-sm">Professional</button>
                 <button onClick={() => { setActiveTab('cheap-deals'); setIsMenuOpen(false); }} className="p-4 bg-neutral-900 rounded-2xl text-left font-bold text-sm">Cheap Deals</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HeroSection onExplore={() => setActiveTab('gaming')} />}

          {activeTab === 'cart' ? (
            <CartView
              items={cart}
              onRemove={removeFromCart}
              onUpdate={updateQuantity}
              total={cartTotal}
              onRequest={() => setIsRequesting(true)}
              onStartShopping={() => setActiveTab('home')}
            />
          ) : (
            <section className="max-w-7xl mx-auto px-4 mt-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
                  <p className="text-neutral-400 mt-1">Discover our hand-picked selection of premium devices.</p>
                </div>
              </div>
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-neutral-900/30 border border-neutral-800/80 rounded-[3rem] text-center w-full">
                  <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mb-8 text-neutral-700 shadow-xl border border-neutral-800">
                    <Package size={36} />
                  </div>
                  <h3 className="text-2xl font-black mb-3">No Gear Available Yet</h3>
                  <p className="text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    We're currently updating our inventory for the <span className="text-indigo-400 font-bold">{activeTab.replace('-', ' ')}</span> collection. 
                    Stay tuned for premium performance tech.
                  </p>
                  <button onClick={() => setActiveTab('home')} className="mt-8 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold transition-all">
                    Browse All Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => {
                    const cartItem = cart.find(item => item.id === product.id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onView={() => setSelectedProduct(product)}
                        onAdd={() => addToCart(product)}
                        quantity={cartItem ? cartItem.quantity : 0}
                        onUpdate={(delta) => updateQuantity(product.id, delta)}
                        onRemove={() => removeFromCart(product.id)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </AnimatePresence>
      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAdd={() => {
              addToCart(selectedProduct);
              setSelectedProduct(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Request Form Modal */}
      <AnimatePresence>
        {isRequesting && (
          <RequestModal
            onClose={() => setIsRequesting(false)}
            cartInfo={cart}
            total={cartTotal}
            onComplete={() => {
              setIsRequesting(false);
              setCart([]);
              setActiveTab('home');
            }}
          />
        )}
      </AnimatePresence>

      <footer className="bg-neutral-900/50 border-t border-neutral-800 py-12 px-4">
        {/* ... (footer content remains unchanged) */}
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/233537212755"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-green-500 text-white p-4 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-110 active:scale-95 transition-all group"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-neutral-900 border border-neutral-800 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Questions? Chat with us
        </span>
      </a>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 flex items-center gap-2 rounded-full text-sm font-medium transition-all ${active
        ? 'bg-indigo-600/10 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.1)]'
        : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function HeroSection({ onExplore }: { onExplore: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 pt-16 md:pt-24 text-center"
    >
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
        Elevate Your Digital <br /> Performance.
      </h1>
      <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Discover high-end laptops, peripherals, and essential tech accessories designed for creators, gamers, and professionals.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onExplore}
          className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105"
        >
          Explore Collection <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 rounded-xl font-bold transition-all">
          View Accessories
        </button>
      </div>

      <div className="mt-20 relative rounded-3xl overflow-hidden border border-neutral-800 aspect-[21/9] group">
        <img
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop"
          alt="Hero"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10 text-left">
          <p className="text-indigo-400 font-bold mb-2">LIMITED EDITION</p>
          <h3 className="text-3xl font-bold">Midnight Pro 2024</h3>
        </div>
      </div>
    </motion.section>
  );
}

function ProductCard({
  product, onAdd, onView, quantity, onUpdate, onRemove
}: {
  product: Product;
  onAdd: () => void;
  onView: () => void;
  quantity: number;
  onUpdate: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col"
    >
      <div
        className="relative aspect-video overflow-hidden cursor-pointer"
        onClick={onView}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.isNew && (
          <span className="absolute top-4 left-4 bg-indigo-600 text-[10px] font-bold px-2 py-1 rounded uppercase">New Arrival</span>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold">Quick View</button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{product.category.replace('-', ' ')}</span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold">{product.rating}</span>
          </div>
        </div>
        <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{product.name}</h3>
        <p className="text-neutral-400 text-sm line-clamp-2 mb-4 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800/50">
          <span className="text-xl font-black text-white">₵ {product.price}</span>

          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div
                key="quantity-selector"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3 bg-indigo-600/10 border border-indigo-500/30 p-1 rounded-xl"
              >
                <button
                  onClick={() => quantity === 1 ? onRemove() : onUpdate(-1)}
                  className="p-1.5 hover:bg-indigo-600/20 text-indigo-400 rounded-lg transition-all"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-sm min-w-[1rem] text-center text-indigo-100">{quantity}</span>
                <button
                  onClick={() => onUpdate(1)}
                  className="p-1.5 hover:bg-indigo-600/20 text-indigo-400 rounded-lg transition-all"
                >
                  <Plus size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onAdd}
                className="p-2.5 bg-neutral-800 hover:bg-indigo-600 text-white rounded-lg transition-all shadow-lg active:scale-90"
              >
                <Plus size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Re-using interfaces from types.tsx

function CartView({ items, onRemove, onUpdate, total, onRequest, onStartShopping }: {
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, delta: number) => void;
  total: number;
  onRequest: () => void;
  onStartShopping: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-neutral-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-600">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-neutral-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <button onClick={onStartShopping} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold">Start Shopping</button>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 mt-12">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        Shopping Cart <span className="text-indigo-400">({items.length})</span>
      </h2>

      <div className="space-y-4">
        {items.map((item) => (
          <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={item.id}
            className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4"
          >
            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-neutral-400 text-sm">₵ {item.price} per unit</p>
            </div>

            <div className="flex items-center gap-4 bg-neutral-800/50 p-1.5 rounded-xl border border-neutral-700">
              <button onClick={() => onUpdate(item.id, -1)} className="p-1.5 hover:bg-neutral-700 rounded-lg text-neutral-400"><Minus size={16} /></button>
              <span className="font-bold w-4 text-center">{item.quantity}</span>
              <button onClick={() => onUpdate(item.id, 1)} className="p-1.5 hover:bg-neutral-700 rounded-lg text-neutral-400"><Plus size={16} /></button>
            </div>

            <div className="text-right min-w-[100px]">
              <p className="font-bold text-lg text-indigo-400">₵ {item.price * item.quantity}</p>
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-neutral-400 mb-1">Total Amount</p>
            <p className="text-4xl font-black">₵ {total.toLocaleString()}</p>
          </div>
          <button
            onClick={onRequest}
            className="w-full md:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
          >
            Request to Buy <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ProductModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-1/2 aspect-square md:aspect-auto">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white"><X size={24} /></button>

          <div className="flex items-center gap-2 mb-4">
            <span className="bg-indigo-600/20 text-indigo-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">{product.category}</span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={14} fill="currentColor" />
              <span className="text-sm font-bold">{product.rating}</span>
            </div>
          </div>

          <h2 className="text-3xl font-black mb-4">{product.name}</h2>
          <p className="text-neutral-400 mb-8 leading-relaxed">{product.description}</p>

          {product.specs && (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {product.specs.map(spec => (
                <div key={spec} className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700/50 text-xs font-medium text-neutral-300">
                  {spec}
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <span className="text-neutral-400">Total Price</span>
              <span className="text-3xl font-black text-white">₵ {product.price}</span>
            </div>
            <button
              onClick={onAdd}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/10"
            >
              Add to Shopping Cart
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RequestModal({ onClose, cartInfo, total, onComplete }: { onClose: () => void; cartInfo: CartItem[]; total: number; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      items: cartInfo,
      total: total
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setStep(2);
      } else {
        const result = await response.json();
        setError(result.error || 'Oops! There was a problem submitting your request');
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-8"
      >
        <button onClick={onClose} disabled={loading} className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white disabled:opacity-50"><X size={24} /></button>

        {step === 1 ? (
          <>
            <div className="bg-indigo-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-indigo-500">
              <CreditCard size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request to Purchase</h2>
            <p className="text-neutral-400 mb-8 text-sm">Please provide your details so our team can finalize your order and provide a direct payment link.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Full Name</label>
                <input required name="name" type="text" className="w-full bg-neutral-800 border-none rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Email Address</label>
                <input required name="email" type="email" className="w-full bg-neutral-800 border-none rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Phone Number</label>
                <input required name="phone" type="tel" className="w-full bg-neutral-800 border-none rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none" placeholder="+233 XX XXX XXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Shipping Address</label>
                <textarea required name="address" rows={3} className="w-full bg-neutral-800 border-none rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none resize-none" placeholder="Enter your full shipping address..." />
              </div>

              {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

              <div className="pt-4 mt-6 border-t border-neutral-800">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-neutral-400">{cartInfo.length} items in cart</span>
                  <span className="text-white font-bold">₵ {total.toLocaleString()}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : 'Submit Purchase Request'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">Request Received!</h2>
            <p className="text-neutral-400 mb-8">Our sales team will contact you within 24 hours via email/phone with your invoice and payment instructions.</p>
            <button
              onClick={onComplete}
              className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold transition-all"
            >
              Back to Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'products' | 'requests'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/requests`);
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats/summary`);
      const data = await res.json();
      setVisitorCount(data.totalVisitors);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchRequests(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans relative">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:relative top-0 bottom-0 left-0 z-[90] w-80 lg:w-80 border-r border-neutral-800/80 bg-[#0a0a0a] flex flex-col p-8 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <img src="/logo3.png" alt="TechHive" className="w-6 h-6 object-contain brightness-0 invert" />
          </div>
          <span className="text-xl font-black tracking-tighter">TechHive Admin</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto p-2 text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-neutral-400 hover:bg-neutral-900'
              }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-semibold">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveSection('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'products'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-neutral-400 hover:bg-neutral-900'
              }`}
          >
            <ShoppingBag size={20} />
            <span className="font-semibold">Manage Products</span>
          </button>

          <button
            onClick={() => setActiveSection('requests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'requests'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-neutral-400 hover:bg-neutral-900'
              }`}
          >
            <MessageCircle size={20} />
            <span className="font-semibold">Requests</span>
          </button>
        </nav>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-white transition-all mt-auto"
        >
          <X size={20} />
          <span className="font-semibold">Exit Admin</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4 sm:p-6 lg:p-10">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400">
              <Menu size={20} />
            </button>
            <span className="font-bold text-sm tracking-tight">Admin Menu</span>
          </div>
          <Link to="/" className="p-2 text-neutral-400 hover:text-white">
            <ChevronLeft size={20} />
          </Link>
        </div>

        {activeSection === 'dashboard' ? (
          <OverviewSection products={products} requests={requests} visitorCount={visitorCount} />
        ) : activeSection === 'products' ? (
          <ManageProductsSection
            products={products}
            onDelete={deleteProduct}
            onSuccess={fetchProducts}
            loading={loading}
          />
        ) : (
          <RequestsSection
            requests={requests}
            loading={loading}
            onSuccess={fetchRequests}
          />
        )}
      </main>
    </div>
  );
}

function OverviewSection({ products, requests, visitorCount }: { products: Product[]; requests: PurchaseRequest[]; visitorCount: number }) {
  const totalRevenue = useMemo(() => requests.filter(r => r.status === 'completed').reduce((acc, r) => acc + r.total, 0), [requests]);
  const newRequests = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);

  const stats = [
    { label: 'Total Visitors', value: visitorCount.toLocaleString(), change: 'Live IPs', icon: <MessageCircle className="text-blue-400" /> },
    { label: 'Total Products', value: products.length.toString(), change: 'Live', icon: <ShoppingBag className="text-indigo-400" /> },
    { label: 'Quotes & Orders', value: requests.length.toString(), change: `+${newRequests} new`, icon: <CreditCard className="text-green-400" /> },
    { label: 'Total Revenue', value: `₵ ${totalRevenue.toLocaleString()}`, change: 'Real-time', icon: <Tag className="text-yellow-400" /> }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Overview</h1>
        <p className="text-neutral-500">Platform performance and statistics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-[2rem] hover:border-neutral-700 transition-all flex flex-col justify-between h-48 group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-neutral-800 rounded-2xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${i === 1 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-green-500/10 text-green-400'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Card */}
      <div className="bg-neutral-900/40 border border-neutral-800/50 p-8 rounded-[2.5rem]">
        <h2 className="text-xl font-bold mb-8">Recent Request Activity</h2>
        <div className="space-y-4">
          {requests.slice(0, 3).length === 0 ? (
            <p className="text-neutral-500 text-center py-10 italic">No recent order activity found.</p>
          ) : (
            requests.slice(0, 3).map((request, i) => (
              <div key={request.id} className="flex items-center gap-4 bg-neutral-950/50 p-5 rounded-3xl border border-neutral-800/30">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-neutral-200">New request from {request.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-sm">₵ {request.total.toLocaleString()}</p>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{request.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ManageProductsSection({ products, onDelete, onSuccess, loading }: {
  products: Product[];
  onDelete: (id: string) => void;
  onSuccess: () => void;
  loading: boolean;
}) {
  const [formLoading, setFormLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const isNew = formData.get('isNew') === 'on' ? 'true' : 'false';
    formData.set('isNew', isNew);

    try {
      await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body: formData
      });
      onSuccess();
      (e.target as HTMLFormElement).reset();
      setPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 animate-in fade-in duration-500 lg:h-full lg:max-h-[85vh]">
      {/* Add New Product - Left Column */}
      <div className="lg:col-span-2 bg-neutral-900/40 border border-neutral-800/50 p-8 rounded-[2.5rem] flex flex-col overflow-hidden">
        <h2 className="text-2xl font-bold mb-8">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Product Name</label>
            <input required name="name" className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all" placeholder="e.g., MacBook Pro 16" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Category</label>
              <select name="category" className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                <option value="gaming">Gaming</option>
                <option value="casual">Casual</option>
                <option value="budget">Budget</option>
                <option value="low-cost">Low Cost</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Price (₵ )</label>
              <input required name="price" type="number" className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all" placeholder="0" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Product Photo</label>
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer h-40 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center overflow-hidden ${
                isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700'
              }`}
            >
              <input 
                ref={fileInputRef}
                required 
                name="image" 
                type="file" 
                accept="image/*" 
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                className="hidden" 
              />
              
              {preview ? (
                <div className="absolute inset-0 group/preview">
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center">
                      <PlusCircle size={32} className="mx-auto text-indigo-400 mb-2" />
                      <p className="text-xs font-bold text-white">Change Photo</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-3 text-neutral-600 group-hover:text-indigo-400 transition-colors">
                    <PlusCircle size={24} />
                  </div>
                  <p className="text-sm font-bold text-neutral-400 group-hover:text-neutral-300">Drag & drop or <span className="text-indigo-500">browse</span></p>
                  <p className="text-[10px] text-neutral-600 mt-1 uppercase tracking-widest font-bold">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Full Description</label>
            <textarea required name="description" rows={3} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all resize-none" placeholder="Enter product details..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Specs (add one by one)</label>
            <div className="flex gap-2">
              <input name="specs" className="flex-1 bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all" placeholder="e.g., Intel i7, 16GB RAM" />
              <button type="button" className="bg-neutral-800 hover:bg-neutral-700 px-6 rounded-2xl font-bold transition-all text-neutral-300">Add</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Default Rating (Cleaniness of Device)</label>
              <input name="rating" type="number" step="0.1" defaultValue={4.5} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl px-5 py-4 outline-none" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-6 mb-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 accent-indigo-500 rounded-lg bg-neutral-950 border-neutral-800" defaultChecked />
                <span className="text-sm font-semibold text-neutral-400 group-hover:text-white transition-all">In Stock</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input name="isNew" type="checkbox" className="w-5 h-5 accent-indigo-500 rounded-lg bg-neutral-950 border-neutral-800" />
                <span className="text-sm font-semibold text-neutral-400 group-hover:text-white transition-all">New Arrival</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            {formLoading ? <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" /> : 'Add Product'}
          </button>
        </form>
      </div>

      {/* All Products List - Right Column */}
      <div className="lg:col-span-3 bg-neutral-900/40 border border-neutral-800/50 p-8 rounded-[2.5rem] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">All Products ({products.length})</h2>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-4">
            {products.map(product => {
              const absoluteImage = product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`;
              return (
                <div key={product.id} className="bg-black/40 border border-neutral-800/50 p-5 rounded-3xl group flex items-center justify-between hover:border-neutral-700 transition-all hover:bg-neutral-950/50">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img src={absoluteImage} className="w-20 h-20 object-cover rounded-2xl border border-neutral-800" alt="" />
                      {product.isNew && <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">N</div>}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 leading-tight">{product.name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-400 font-bold">₵ {product.price}</span>
                        <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                        <span className="text-sm text-neutral-500 capitalize">{product.category}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <span className="text-[8px] font-black px-2 py-0.5 bg-green-500/10 text-green-400 rounded uppercase tracking-widest">In Stock</span>
                        {product.isNew && <span className="text-[8px] font-black px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded uppercase tracking-widest">New</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all">
                      <Sparkles size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-3 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestsSection({ requests, loading, onSuccess }: { requests: PurchaseRequest[]; loading: boolean; onSuccess: () => void }) {
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const fulfillRequest = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
        headers: { 'Content-Type': 'application/json' }
      });
      setSelectedRequest(null);
      onSuccess();
    } catch (err) {
      alert('Failed to fulfill request');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/requests/${id}`, { method: 'DELETE' });
      onSuccess();
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Purchase Requests ({requests.length})</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-[2.5rem] p-20 text-center">
          <div className="w-20 h-20 bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-500">
            <MessageCircle size={40} />
          </div>
          <h3 className="text-xl font-bold mb-2">No requests yet</h3>
          <p className="text-neutral-500 max-w-xs mx-auto">Purchase requests from the storefront will appear here once submitted.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {requests.map(request => (
            <div key={request.id} className="group bg-neutral-900/40 border border-neutral-800/50 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold leading-tight">{request.name}</h3>
                      <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-wider">{request.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                      <span className="flex items-center gap-1.5"><Mail size={14} /> {request.email}</span>
                      <span className="flex items-center gap-1.5"><Phone size={14} /> {request.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-neutral-500 uppercase font-black tracking-widest mb-1">Total Order</p>
                    <p className="text-xl font-black text-white">₵ {request.total.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-5 py-3 h-12 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold transition-all text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => deleteRequest(request.id)}
                      className="w-12 h-12 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-neutral-900 border border-neutral-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden">
              <div className="p-8 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Order Details</h3>
                  <p className="text-neutral-500 text-sm mt-1">ID: {selectedRequest.id} • {new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 text-neutral-400 hover:text-white"><X size={24} /></button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Customer Information</h4>
                    <div className="space-y-2">
                      <p className="text-white font-bold">{selectedRequest.name}</p>
                      <p className="text-neutral-400 text-sm">{selectedRequest.email}</p>
                      <p className="text-neutral-400 text-sm">{selectedRequest.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Shipping Address</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">{selectedRequest.address}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Items Ordered</h4>
                  <div className="space-y-3">
                    {selectedRequest.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-xs">{item.quantity}x</div>
                          <span className="font-bold text-sm text-neutral-200">{item.name}</span>
                        </div>
                        <span className="font-bold text-indigo-400 text-sm">₵ {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-between">
                <div>
                  <p className="text-neutral-500 text-xs font-black uppercase tracking-widest mb-1">Total Value</p>
                  <p className="text-3xl font-black text-white">₵ {selectedRequest.total.toLocaleString()}</p>
                </div>
                {selectedRequest.status === 'pending' ? (
                  <button
                    onClick={() => fulfillRequest(selectedRequest.id)}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all"
                  >
                    Mark as Fulfilled
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-6 py-3 rounded-2xl font-bold">
                    <Package size={18} />
                    <span>Order Fulfilled</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
