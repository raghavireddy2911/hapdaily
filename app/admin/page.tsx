'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Plus,
  Camera,
  X,
  LogOut,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Product, Order } from '@/types';
import { categories } from '@/lib/mockData';
import PhotoEditorModal from '@/components/PhotoEditorModal';
import ShopsBillingSection from '@/components/admin/ShopsBillingSection';
import CustomPopup, { PopupConfig } from '@/components/CustomPopup';

// ───────────────────────── helpers ─────────────────────────

type Tab = 'products' | 'orders' | 'reports' | 'shops';

const EMPTY_PRODUCT: Product = {
  id: '',
  name: '',
  brand: 'Arogya',
  description: '',
  price: 32,
  price_per_litre: null,
  image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',
  category: 'Milk',
  unit: '500ml',
  available: true,
};

const BRAND_STYLES: Record<string, string> = {
  Arogya: 'bg-blue-100 text-blue-800',
  Hatsun: 'bg-rose-100 text-rose-800',
};

const inputClass =
  'w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

/** fetch wrapper: throws on HTTP errors or { success: false } so callers can roll back */
async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

// ───────────────────────── component ─────────────────────────

export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('products');

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateString, setDateString] = useState('');

  // Photo editor
  const [editorOpen, setEditorOpen] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Error banner
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupConfig | null>(null);

  // Patch the product being edited (removes the repeated spread everywhere)
  const patchEditing = (patch: Partial<Product>) =>
    setEditingProduct((prev) => (prev ? { ...prev, ...patch } : prev));

  // ── data loading ──
  const loadData = useCallback(async () => {
    setLoading(true);
    const [prodRes, orderRes] = await Promise.allSettled([
      api('/api/products?all=true'),
      api('/api/orders'),
    ]);

    if (prodRes.status === 'fulfilled' && prodRes.value.products) {
      setProducts(prodRes.value.products);
    } else if (prodRes.status === 'rejected') {
      setError('Could not load products. Showing saved data.');
    }

    if (orderRes.status === 'fulfilled' && orderRes.value.orders) {
      setOrders(orderRes.value.orders);
    } else if (orderRes.status === 'rejected') {
      setError('Could not load orders.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setDateString(
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
    loadData();
  }, [loadData]);

  // Auto-hide error banner
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  // Debounce search input (250ms) to avoid re-filtering on every keystroke
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(search), 250);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [search]);

  // ── handlers ──
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    document.cookie = 'sb-owner-token=; path=/; max-age=0';
    document.cookie = 'sb-owner-email=; path=/; max-age=0';
    localStorage.removeItem('hapdaily_owner_email');
    router.push('/login');
  };

  const handleToggleAvailability = async (product: Product) => {
    const snapshot = products;
    const newStatus = !product.available;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, available: newStatus } : p))
    );
    try {
      await api(`/api/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ available: newStatus }),
      });
    } catch (err) {
      setProducts(snapshot); // roll back
      setError(`Could not update "${product.name}". Please try again.`);
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setPopup({
      isOpen: true,
      type: 'confirm',
      destructive: true,
      title: 'Remove Product?',
      message: `Are you sure you want to remove "${name}" from the store catalog? It will no longer be visible to customers.`,
      confirmText: 'Yes, Remove Product',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const snapshot = products;
        setProducts((prev) => prev.filter((p) => p.id !== id));
        try {
          await api(`/api/products/${id}`, { method: 'DELETE' });
        } catch (err) {
          setProducts(snapshot); // roll back
          setError(`Could not delete "${name}". Please try again.`);
        }
      },
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || saving) return;

    setSaving(true);
    try {
      if (isNewProduct) {
        const data = await api('/api/products', {
          method: 'POST',
          body: JSON.stringify(editingProduct),
        });
        if (data.product) setProducts((prev) => [data.product, ...prev]);
      } else {
        await api(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify(editingProduct),
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
        );
      }
      setEditingProduct(null);
      setIsNewProduct(false);
    } catch (err) {
      // keep the modal open so the owner doesn't lose what they typed
      setError(err instanceof Error ? err.message : 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const openPhotoStudioForProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsNewProduct(false);
    setEditorOpen(true);
  };

  const closeProductModal = () => {
    setEditingProduct(null);
    setIsNewProduct(false);
  };

  const handlePhotoSaved = async (newImageUrl: string) => {
    if (!editingProduct) return;
    patchEditing({ image_url: newImageUrl });

    // Existing product: persist the photo right away
    if (editingProduct.id) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, image_url: newImageUrl } : p))
      );
      try {
        await api(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ image_url: newImageUrl }),
        });
      } catch {
        setError('Photo changed here but could not be saved. Press Save Changes to retry.');
      }
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: string,
    payment_status?: string
  ) => {
    const snapshot = orders;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: status as any,
              payment_status: payment_status ? (payment_status as any) : o.payment_status,
            }
          : o
      )
    );
    try {
      await api(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, payment_status }),
      });
    } catch {
      setOrders(snapshot); // roll back
      setError('Could not update the order. Please try again.');
    }
  };

  // ── derived data ──
  const { totalOrdersCount, totalEarnings, itemsSoldCount, pendingOrders } = useMemo(
    () => ({
      totalOrdersCount: orders.length,
      totalEarnings: orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0),
      itemsSoldCount: orders.reduce(
        (acc, o) => acc + (o.items?.reduce((s, it) => s + (it.quantity || 1), 0) ?? 0),
        0
      ),
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
    }),
    [orders]
  );

  const productSalesMap = useMemo(() => {
    const map = new Map<string, { name: string; brand: string; qty: number; revenue: number }>();
    orders.forEach((ord) => {
      if (!Array.isArray(ord.items)) return;
      ord.items.forEach((it) => {
        const key = it.name || 'Unknown Item';
        const row = map.get(key) || {
          name: key,
          brand: it.brand || 'Dairy',
          qty: 0,
          revenue: 0,
        };
        row.qty += Number(it.quantity || 1);
        row.revenue += Number(it.item_total || it.price * (it.quantity || 1) || 0);
        map.set(key, row);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  const filteredProducts = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, debouncedSearch]);

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: 'products', label: `Products & Daily Availability (${products.length})` },
    { key: 'orders', label: `Customer Orders (${orders.length})` },
    { key: 'reports', label: 'Product-Wise Sales Report' },
    { key: 'shops', label: '🏪 Shops & Billing', badge: 'Wholesale' },
  ];

  const kpis = [
    {
      label: 'Total Sales Today',
      icon: <IndianRupee className="w-5 h-5" />,
      tone: 'bg-emerald-50 text-emerald-600',
      value: <>₹{totalEarnings.toFixed(0)}</>,
    },
    {
      label: 'Customer Orders',
      icon: <ShoppingBag className="w-5 h-5" />,
      tone: 'bg-blue-50 text-blue-600',
      value: (
        <>
          {totalOrdersCount}{' '}
          {pendingOrders > 0 && (
            <span className="text-xs font-bold text-amber-600">({pendingOrders} pending)</span>
          )}
        </>
      ),
    },
    {
      label: 'Packets / Units Sold',
      icon: <TrendingUp className="w-5 h-5" />,
      tone: 'bg-amber-50 text-amber-600',
      value: <>{itemsSoldCount}</>,
    },
    {
      label: 'Active In Catalog',
      icon: <Package className="w-5 h-5" />,
      tone: 'bg-purple-50 text-purple-600',
      value: (
        <>
          {products.filter((p) => p.available).length}{' '}
          <span className="text-xs text-gray-400 font-normal">/ {products.length}</span>
        </>
      ),
    },
  ];

  // ───────────────────────── render ─────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-bold shadow-lg"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ayyappa Enterprises • Hapdaily Authorized Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">Owner Store Manager 🏪</h1>
          <p className="text-xs text-gray-500 mt-0.5">{dateString}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition disabled:opacity-60"
            title="Refresh database records"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setIsNewProduct(true);
              setEditingProduct({ ...EMPTY_PRODUCT });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${k.tone}`}
            >
              {k.icon}
            </div>
            <span className="text-xs text-gray-400 font-semibold uppercase">{k.label}</span>
            <p className="text-2xl font-black text-gray-950 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs (scrolls sideways on small phones instead of breaking layout) */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-black mb-6 overflow-x-auto whitespace-nowrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 transition relative flex items-center gap-1.5 ${
              activeTab === t.key ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <span>{t.label}</span>
            {t.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                {t.badge}
              </span>
            )}
            {activeTab === t.key && (
              <motion.div
                layoutId="admin-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: PRODUCTS ── */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by brand, name, or category..."
              className="w-full py-1.5 text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {filteredProducts.length === 0 && (
              <p className="p-8 text-center text-sm text-gray-400">
                No products match &ldquo;{search}&rdquo;.
              </p>
            )}

            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition"
              >
                {/* Left: thumbnail & details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200/60">
                    <Image
                      src={prod.image_url}
                      alt={prod.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          BRAND_STYLES[prod.brand] ?? 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.brand}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{prod.category}</span>
                    </div>

                    <h3 className="font-extrabold text-gray-900 text-sm sm:text-base truncate mt-0.5">
                      {prod.name}
                    </h3>

                    <p className="text-xs text-gray-500 font-semibold">
                      ₹{prod.price}{' '}
                      <span className="font-normal text-gray-400">/ {prod.unit}</span>
                      {prod.price_per_litre ? (
                        <span className="ml-2 text-emerald-700">
                          ₹{prod.price_per_litre}
                          <span className="font-normal text-gray-400"> / litre</span>
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggleAvailability(prod)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      prod.available
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {prod.available ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                        <span>Available Today</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-red-500" />
                        <span>Hidden / Out</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openPhotoStudioForProduct(prod)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition"
                    title="Edit Product Photo"
                    aria-label={`Edit photo of ${prod.name}`}
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingProduct(prod);
                      setIsNewProduct(false);
                    }}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition"
                    title="Edit Details"
                    aria-label={`Edit details of ${prod.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition"
                    title="Delete Product"
                    aria-label={`Delete ${prod.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: ORDERS ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-gray-100">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800">No Orders Placed Yet</h3>
              <p className="text-xs text-gray-400 mt-1">
                Customer orders will appear here automatically when placed on the shop.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-gray-950">
                        {order.order_number || order.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          order.payment_status === 'paid_verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.payment_status === 'paid_verified'
                          ? 'Payment Verified ✓'
                          : 'Payment Pending Check'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.customer_name} • 📞 {order.customer_phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="text-xs font-bold bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {order.payment_status !== 'paid_verified' && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order.id, order.status, 'paid_verified')
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between bg-gray-50 p-2.5 rounded-xl">
                      <span className="font-medium text-gray-800">
                        {it.name} <span className="text-gray-400">× {it.quantity}</span>
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{it.item_total || it.price * (it.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-2 border-t border-gray-50 text-gray-600 gap-2">
                  <p>
                    <strong>Delivery to:</strong> {order.customer_address}
                  </p>
                  <p className="text-sm font-black text-gray-950 sm:text-right">
                    Total: ₹{order.total}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 3: SALES REPORT ── */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-950">Daily Product Sales Report</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Accurate breakdown of units sold and revenue per item from customer orders.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[11px]">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Brand</th>
                  <th className="pb-3 text-center">Packets Sold</th>
                  <th className="pb-3 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productSalesMap.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      No sales recorded today yet.
                    </td>
                  </tr>
                ) : (
                  productSalesMap.map((row) => (
                    <tr key={row.name} className="hover:bg-gray-50">
                      <td className="py-3.5 font-bold text-gray-900">{row.name}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-xs">
                          {row.brand}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-bold text-gray-800">{row.qty}</td>
                      <td className="py-3.5 text-right font-black text-emerald-700">
                        ₹{row.revenue.toFixed(0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: SHOPS & BILLING ── */}
      {activeTab === 'shops' && <ShopsBillingSection products={products} />}

      {/* ── EDIT / ADD PRODUCT MODAL ── */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-black text-gray-950 text-base">
                  {isNewProduct ? 'Add Dairy Product' : 'Edit Product Details'}
                </h3>
                <button
                  onClick={closeProductModal}
                  aria-label="Close"
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
                {/* Photo */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingProduct.image_url}
                      alt={editingProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-xs">Product Photo</p>
                    <p className="text-[11px] text-gray-500">
                      Snap camera photo, crop, rotate, or adjust filters
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditorOpen(true)}
                      className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Open Photo Studio</span>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => patchEditing({ name: e.target.value })}
                    placeholder="e.g. Arogya Full Cream Milk"
                    className={inputClass}
                  />
                </div>

                {/* Brand & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Brand *</label>
                    <select
                      value={editingProduct.brand}
                      onChange={(e) => patchEditing({ brand: e.target.value as Product['brand'] })}
                      className={`${inputClass} font-bold`}
                    >
                      <option value="Arogya">Arogya</option>
                      <option value="Hatsun">Hatsun</option>
                      <option value="Hapdaily">Hapdaily</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Category *</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => patchEditing({ category: e.target.value })}
                      className={inputClass}
                    >
                      {categories
                        .filter((c) => c !== 'All')
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Packet price & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Packet Price (₹) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={editingProduct.price}
                      onChange={(e) => patchEditing({ price: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} font-bold`}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Unit / Volume *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.unit}
                      onChange={(e) => patchEditing({ unit: e.target.value })}
                      placeholder="e.g. 500ml, 1 Litre, 200g"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Price per litre (independent of packet price) */}
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">
                    Price per Litre (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingProduct.price_per_litre ?? ''}
                    onChange={(e) =>
                      patchEditing({
                        price_per_litre:
                          e.target.value === '' ? null : parseFloat(e.target.value),
                      })
                    }
                    placeholder="Optional, e.g. 58"
                    className={`${inputClass} font-bold`}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Separate from the packet price. Leave empty if not sold by the litre.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold text-gray-700 mb-1 block">Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => patchEditing({ description: e.target.value })}
                    placeholder="Brief description about quality, SNF, fat % or usage"
                    className={`${inputClass} text-xs resize-none`}
                  />
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="available-check"
                    checked={editingProduct.available}
                    onChange={(e) => patchEditing({ available: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="available-check"
                    className="font-bold text-gray-800 cursor-pointer"
                  >
                    Mark Available for Customer Orders Today
                  </label>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-700 hover:to-teal-700 transition shadow-md disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PHOTO STUDIO MODAL ── */}
      <PhotoEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialImageUrl={editingProduct?.image_url}
        onSave={handlePhotoSaved}
      />

      {/* ── MOBILE FRIENDLY CUSTOM POPUP ── */}
      <CustomPopup popup={popup} onClose={() => setPopup(null)} />
    </div>
  );
}