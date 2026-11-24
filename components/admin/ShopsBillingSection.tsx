'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  Plus,
  Search,
  IndianRupee,
  Phone,
  MapPin,
  Truck,
  FileText,
  Printer,
  Pencil,
  Trash2,
  AlertCircle,
  Clock,
  ChevronRight,
  X,
  Loader2,
  Tag,
  RefreshCw,
  Wallet,
  User,
} from 'lucide-react';
import { Shop, ShopRate, Delivery, Payment, Product } from '@/types';
import CustomPopup, { PopupConfig } from '@/components/CustomPopup';
import {
  round2,
  todayLocal,
  daysAgoLocal,
  monthStartLocal,
  getLitresPerPacket,
  litresToPackets,
  packetsToLitres,
} from '@/lib/units';

interface ShopsBillingSectionProps {
  products: Product[];
}

export default function ShopsBillingSection({ products }: ShopsBillingSectionProps) {
  // State
  const [shops, setShops] = useState<Shop[]>([]);
  const [summary, setSummary] = useState({
    total_unpaid_all: 0,
    pending_shops_count: 0,
    today_total_deliveries: 0,
    total_shops_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');

  // Selected Shop for Detail/Billing View
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopDetail, setShopDetail] = useState<{
    shop: Shop | null;
    rates: ShopRate[];
    deliveries: Delivery[];
    payments: Payment[];
  }>({
    shop: null,
    rates: [],
    deliveries: [],
    payments: [],
  });
  const [detailLoading, setDetailLoading] = useState(false);

  // Modals
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopSaving, setShopSaving] = useState(false);

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [targetShopForDelivery, setTargetShopForDelivery] = useState<Shop | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetShopForPayment, setTargetShopForPayment] = useState<Shop | null>(null);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [showRatesModal, setShowRatesModal] = useState(false);
  const [targetShopForRates, setTargetShopForRates] = useState<Shop | null>(null);

  // Today's Deliveries Quick View Modal
  const [showTodayDeliveriesQuickView, setShowTodayDeliveriesQuickView] = useState(false);
  const [todayDeliveriesData, setTodayDeliveriesData] = useState<{
    total_deliveries: number;
    total_amount_today: number;
    total_packets_today: number;
    deliveries: any[];
  } | null>(null);
  const [todayLoading, setTodayLoading] = useState(false);

  // Bill Date Filter
  const [billFilter, setBillFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [popup, setPopup] = useState<PopupConfig | null>(null);

  const showError = (title: string, message: string) =>
    setPopup({ isOpen: true, type: 'error', title, message, confirmText: 'OK' });

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(search), 250);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  // Load shops list
  const loadShops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shops');
      const data = await res.json();
      if (data.success) {
        setShops(data.shops || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load single shop details
  const loadShopDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/shops/${id}`);
      const data = await res.json();
      if (data.success) {
        setShopDetail({
          shop: data.shop,
          rates: data.rates || [],
          deliveries: data.deliveries || [],
          payments: data.payments || [],
        });
      }
    } catch (err) {
      console.error('Error fetching shop detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Load today's quick view
  const loadTodayDeliveries = useCallback(async () => {
    setTodayLoading(true);
    try {
      const res = await fetch('/api/admin/deliveries/today');
      const data = await res.json();
      if (data.success) {
        setTodayDeliveriesData(data);
      }
    } catch (err) {
      console.error('Error fetching today deliveries:', err);
    } finally {
      setTodayLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  useEffect(() => {
    if (selectedShopId) {
      loadShopDetail(selectedShopId);
    }
  }, [selectedShopId, loadShopDetail]);

  // Filtered and Sorted Shops
  const filteredShops = useMemo(() => {
    let result = [...shops];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.owner_name.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.address.toLowerCase().includes(q)
      );
    }

    if (filterStatus === 'unpaid') {
      result = result.filter((s) => (s.balance || 0) > 0);
    } else if (filterStatus === 'paid') {
      result = result.filter((s) => (s.balance || 0) <= 0);
    }

    // Always sort by highest unpaid balance first
    result.sort((a, b) => (b.balance || 0) - (a.balance || 0));

    return result;
  }, [shops, debouncedSearch, filterStatus]);

  // Handle Delete Shop
  const handleDeleteShop = (id: string, name: string) => {
    setPopup({
      isOpen: true,
      type: 'confirm',
      destructive: true,
      title: 'Delete Shop?',
      message: `Are you sure you want to delete "${name}"? All deliveries, rates, and payments for this shop will be permanently removed.`,
      confirmText: 'Yes, Delete Shop',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/shops/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Server could not delete the shop.');
          setShops((prev) => prev.filter((s) => s.id !== id));
          if (selectedShopId === id) {
            setSelectedShopId(null);
          }
          loadShops();
        } catch (err: any) {
          console.error('Failed to delete shop:', err);
          showError('Could Not Delete Shop', err.message || 'Please try again.');
        }
      },
    });
  };

  // Handle Delete Delivery
  const handleDeleteDelivery = (deliveryId: string) => {
    if (!selectedShopId) return;
    setPopup({
      isOpen: true,
      type: 'confirm',
      destructive: true,
      title: 'Delete Delivery Entry?',
      message:
        'Are you sure you want to delete this delivery entry? The shop balance will be updated automatically.',
      confirmText: 'Yes, Delete Entry',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(
            `/api/admin/shops/${selectedShopId}/deliveries/${deliveryId}`,
            { method: 'DELETE' }
          );
          if (!res.ok) throw new Error('Server could not delete this delivery.');
          loadShopDetail(selectedShopId);
          loadShops();
        } catch (err: any) {
          console.error(err);
          showError('Could Not Delete Delivery', err.message || 'Please try again.');
        }
      },
    });
  };

  // Handle Delete Payment
  const handleDeletePayment = (paymentId: string) => {
    if (!selectedShopId) return;
    setPopup({
      isOpen: true,
      type: 'confirm',
      destructive: true,
      title: 'Delete Payment Receipt?',
      message:
        'Are you sure you want to delete this payment receipt? The shop balance will be updated automatically.',
      confirmText: 'Yes, Delete Receipt',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(
            `/api/admin/shops/${selectedShopId}/payments?paymentId=${paymentId}`,
            { method: 'DELETE' }
          );
          if (!res.ok) throw new Error('Server could not delete this payment.');
          loadShopDetail(selectedShopId);
          loadShops();
        } catch (err: any) {
          console.error(err);
          showError('Could Not Delete Payment', err.message || 'Please try again.');
        }
      },
    });
  };

  // Filter deliveries for bill summary (uses local IST dates, not UTC)
  const filteredDeliveries = useMemo(() => {
    const list = shopDetail.deliveries;
    if (billFilter === 'all') return list;

    if (billFilter === 'today') {
      const t = todayLocal();
      return list.filter((d) => d.delivery_date === t);
    }
    if (billFilter === 'week') {
      const from = daysAgoLocal(6); // today + previous 6 days = 7 days
      return list.filter((d) => d.delivery_date >= from);
    }
    if (billFilter === 'month') {
      const from = monthStartLocal(); // real calendar month
      return list.filter((d) => d.delivery_date >= from);
    }
    return list;
  }, [shopDetail.deliveries, billFilter]);

  const billTotalAmount = useMemo(
    () => round2(filteredDeliveries.reduce((sum, d) => sum + Number(d.total_amount || 0), 0)),
    [filteredDeliveries]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SUB-VIEW: SINGLE SHOP BILLING & STATEMENT
  // ──────────────────────────────────────────────────────────────────────────
  if (selectedShopId && shopDetail.shop) {
    const currentShop = shopDetail.shop;
    const isUnpaid = (currentShop.balance || 0) > 0;
    const isFiltered = billFilter !== 'all';

    return (
      <div className="space-y-6">
        {/* Back and Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedShopId(null)}
              className="p-2 sm:p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition text-xs sm:text-sm flex items-center gap-1.5"
            >
              ← All Shops
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                  {currentShop.name}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${
                    isUnpaid
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isUnpaid ? `UNPAID ₹${currentShop.balance?.toFixed(0)}` : 'PAID'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Contact: {currentShop.owner_name}</span>
                <span>•</span>
                <a
                  href={`tel:${currentShop.phone}`}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> {currentShop.phone}
                </a>
                <span>•</span>
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-3 h-3 text-gray-400" /> {currentShop.address}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons for this Shop */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTargetShopForDelivery(currentShop);
                setShowDeliveryModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition"
            >
              <Truck className="w-4 h-4" />
              <span>+ Record Delivery</span>
            </button>

            <button
              onClick={() => {
                setTargetShopForPayment(currentShop);
                setShowPaymentModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition"
            >
              <IndianRupee className="w-4 h-4" />
              <span>+ Record Payment</span>
            </button>

            <button
              onClick={() => {
                setTargetShopForRates(currentShop);
                setShowRatesModal(true);
              }}
              className="px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition"
              title="Set wholesale prices for this shop"
            >
              <Tag className="w-4 h-4 text-amber-700" />
              <span>Wholesale Rates ({shopDetail.rates.length})</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition"
              title="Print bill statement"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Deliveries Billed
            </span>
            <p className="text-2xl font-black text-gray-950 mt-1">
              ₹{(currentShop.total_billed || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {shopDetail.deliveries.length} deliveries recorded
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Payments Received
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              ₹{(currentShop.total_paid || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {shopDetail.payments.length} payment receipts
            </p>
          </div>

          <div
            className={`p-5 rounded-3xl border shadow-sm ${
              isUnpaid ? 'bg-red-50/80 border-red-200' : 'bg-emerald-50/80 border-emerald-200'
            }`}
          >
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isUnpaid ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              Net Balance Due
            </span>
            <p
              className={`text-3xl font-black mt-1 ${
                isUnpaid ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              ₹{(currentShop.balance || 0).toFixed(2)}
            </p>
            <p
              className={`text-xs font-bold mt-1 ${
                isUnpaid ? 'text-red-800' : 'text-emerald-800'
              }`}
            >
              {isUnpaid ? 'Pending payment from shop' : 'All dues fully settled!'}
            </p>
          </div>
        </div>

        {/* Printable Invoice */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="border-b border-gray-200 pb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
                  HaPdaily Authorized Wholesale Supply
                </span>
              </div>
              <h3 className="text-2xl font-black text-gray-950 mt-0.5">Ayyappa Enterprises</h3>
              <p className="text-xs text-gray-500">
                Fresh Milk & Dairy Products Wholesale Distribution
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 uppercase">Customer Statement</span>
              <p className="text-base font-extrabold text-gray-900 mt-0.5">{currentShop.name}</p>
              <p className="text-xs text-gray-500">{currentShop.address}</p>
              <p className="text-xs font-semibold text-gray-700">Phone: {currentShop.phone}</p>
            </div>
          </div>

          {/* Statement Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 text-xs font-bold">
              <span className="px-2 text-gray-400">Date Range:</span>
              {(['all', 'today', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBillFilter(mode)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    billFilter === mode
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode === 'all'
                    ? 'All Time'
                    : mode === 'today'
                    ? 'Today'
                    : mode === 'week'
                    ? 'Last 7 Days (Weekly)'
                    : 'This Month'}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-gray-500">
              Showing {filteredDeliveries.length} deliveries • Subtotal: ₹{billTotalAmount.toFixed(2)}
            </span>
          </div>

          {/* Deliveries Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Product Delivered</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                  <th className="py-2.5 px-3 text-center print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 font-semibold">
                      No deliveries found for this period. Click "+ Record Delivery" to add today's
                      supply.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50/80 transition group">
                      <td className="py-3 px-3 align-top font-bold text-gray-900 whitespace-nowrap">
                        {delivery.delivery_date}
                        {delivery.notes && (
                          <span className="block text-[11px] text-gray-400 font-normal">
                            {delivery.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 align-top" colSpan={4}>
                        <div className="space-y-1">
                          {delivery.items && delivery.items.length > 0 ? (
                            delivery.items.map((it, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-4 gap-2 text-xs py-0.5 border-b border-gray-50 last:border-0"
                              >
                                <span className="font-semibold text-gray-800">
                                  {it.product_name}
                                </span>
                                <span className="text-center text-gray-500">
                                  {it.product_unit}
                                </span>
                                <span className="text-right font-bold text-blue-600">
                                  {it.quantity} pkts
                                </span>
                                <span className="text-right text-gray-600 font-medium">
                                  ₹{it.rate} = ₹{it.line_total}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Details saved</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top text-right font-black text-gray-950 text-sm">
                        ₹{Number(delivery.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 align-top text-center print:hidden">
                        <button
                          onClick={() => handleDeleteDelivery(delivery.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete delivery"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Statement Grand Total Summary Box */}
          <div className="border-t border-gray-200 pt-4 flex flex-col items-end space-y-1.5 text-xs sm:text-sm">
            {isFiltered && (
              <div className="flex justify-between w-72 text-gray-600">
                <span>Deliveries in selected period:</span>
                <span className="font-bold text-gray-950">₹{billTotalAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-72 text-gray-600">
              <span>{isFiltered ? 'All-time Deliveries Amount:' : 'Total Deliveries Amount:'}</span>
              <span className="font-bold text-gray-950">
                ₹{(currentShop.total_billed || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between w-72 text-gray-600">
              <span>{isFiltered ? 'All-time Payments Received:' : 'Total Payments Received:'}</span>
              <span className="font-bold text-emerald-600">
                (-) ₹{(currentShop.total_paid || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between w-72 pt-2 border-t border-gray-200 text-base font-black">
              <span className={isUnpaid ? 'text-red-600' : 'text-emerald-700'}>
                {isUnpaid ? 'Total Balance Due:' : 'Net Balance:'}
              </span>
              <span className={isUnpaid ? 'text-red-600' : 'text-emerald-700'}>
                ₹{(currentShop.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payments History List */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Payments Received History</span>
            </h4>

            {shopDetail.payments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No payments recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shopDetail.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-black text-emerald-700 text-sm">
                        <span>₹{Number(p.amount).toFixed(2)}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-800">
                          {p.payment_method}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {p.payment_date} {p.notes ? `• ${p.notes}` : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePayment(p.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition print:hidden"
                      title="Delete payment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals that can be opened from the detail view */}
        <AnimatePresence>
          {showDeliveryModal && targetShopForDelivery && (
            <DailyDeliveryModal
              shop={targetShopForDelivery}
              products={products}
              onClose={() => setShowDeliveryModal(false)}
              onSaved={() => {
                setShowDeliveryModal(false);
                loadShops();
                if (selectedShopId) loadShopDetail(selectedShopId);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPaymentModal && targetShopForPayment && (
            <PaymentModal
              shop={targetShopForPayment}
              saving={paymentSaving}
              setSaving={setPaymentSaving}
              showError={showError}
              onClose={() => setShowPaymentModal(false)}
              onSaved={() => {
                setShowPaymentModal(false);
                loadShops();
                if (selectedShopId) loadShopDetail(selectedShopId);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRatesModal && targetShopForRates && (
            <ShopRatesModal
              shop={targetShopForRates}
              products={products}
              onClose={() => setShowRatesModal(false)}
              onSaved={() => {
                setShowRatesModal(false);
                if (selectedShopId) loadShopDetail(selectedShopId);
              }}
            />
          )}
        </AnimatePresence>

        {/* Custom Mobile-Friendly Popup */}
        <CustomPopup popup={popup} onClose={() => setPopup(null)} />
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN VIEW: SHOPS LIST, SEARCH, STATS RIBBON, TODAY QUICK VIEW
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2">
            <span>Shops & Billing (Wholesale Milk Supply)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Father's digital notebook • Automatic wholesale rates, daily deliveries & unpaid
            tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              loadTodayDeliveries();
              setShowTodayDeliveriesQuickView(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs sm:text-sm border border-blue-200 flex items-center gap-2 transition"
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Today's Deliveries Quick View</span>
          </button>

          <button
            onClick={() => {
              setEditingShop(null);
              setShowAddShopModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Shop</span>
          </button>

          <button
            onClick={loadShops}
            className="p-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 transition"
            title="Refresh shops list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-50/90 p-5 rounded-3xl border border-red-200 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-black text-red-700 uppercase tracking-wider">
            Total Unpaid Due
          </span>
          <p className="text-2xl sm:text-3xl font-black text-red-600 mt-1">
            ₹{summary.total_unpaid_all.toFixed(0)}
          </p>
          <p className="text-xs text-red-800 font-bold mt-1">
            Across {summary.pending_shops_count} pending shop
            {summary.pending_shops_count === 1 ? '' : 's'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Pending Shops
          </span>
          <p className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
            {summary.pending_shops_count}{' '}
            <span className="text-xs text-gray-400 font-normal">/ {summary.total_shops_count}</span>
          </p>
          <p className="text-xs text-amber-600 font-semibold mt-1">Need payment collection</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Today's Wholesale Supply
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            ₹{summary.today_total_deliveries.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">Supplied to town shops today</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Shops
          </span>
          <p className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
            {summary.total_shops_count}
          </p>
          <p className="text-xs text-blue-600 font-semibold mt-1">Town regular buyers</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shop by name, owner, phone, or town area..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200 text-xs font-bold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Shops ({shops.length})
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'unpaid'
                ? 'bg-red-500 text-white shadow-xs'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            Pending Unpaid ({shops.filter((s) => (s.balance || 0) > 0).length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            All Paid ({shops.filter((s) => (s.balance || 0) <= 0).length})
          </button>
        </div>
      </div>

      {/* Shops Grid */}
      {filteredShops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <Store className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-base font-bold text-gray-700">No shops found matching your search</p>
          <button
            onClick={() => {
              setEditingShop(null);
              setShowAddShopModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4" /> Add your first shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((shop) => {
            const isUnpaid = (shop.balance || 0) > 0;

            return (
              <motion.div
                key={shop.id}
                layout
                className={`bg-white rounded-3xl p-5 border transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
                  isUnpaid ? 'border-red-200 shadow-sm' : 'border-gray-100 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-gray-950 leading-snug">
                        {shop.name}
                      </h3>
                      <p className="text-xs font-semibold text-gray-600 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-gray-400" /> {shop.owner_name}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black tracking-wide shrink-0 ${
                        isUnpaid
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isUnpaid ? `UNPAID ₹${shop.balance?.toFixed(0)}` : 'PAID'}
                    </span>
                  </div>

                  <div className="space-y-1 my-3 text-xs text-gray-600">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <a
                        href={`tel:${shop.phone}`}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {shop.phone}
                      </a>
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100 flex items-center justify-between text-xs my-3">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        Total Billed
                      </span>
                      <p className="font-black text-gray-900">₹{(shop.total_billed || 0).toFixed(0)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        Total Paid
                      </span>
                      <p className="font-black text-emerald-600">
                        ₹{(shop.total_paid || 0).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        Balance Due
                      </span>
                      <p className={`font-black ${isUnpaid ? 'text-red-600' : 'text-emerald-700'}`}>
                        ₹{(shop.balance || 0).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setTargetShopForDelivery(shop);
                        setShowDeliveryModal(true);
                      }}
                      className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>+ Delivery</span>
                    </button>

                    <button
                      onClick={() => {
                        setTargetShopForPayment(shop);
                        setShowPaymentModal(true);
                      }}
                      className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>+ Payment</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-xs">
                    <button
                      onClick={() => setSelectedShopId(shop.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-600" />
                      <span>View Bill & History</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button
                      onClick={() => {
                        setTargetShopForRates(shop);
                        setShowRatesModal(true);
                      }}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition"
                      title="Set custom rates"
                    >
                      <Tag className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingShop(shop);
                        setShowAddShopModal(true);
                      }}
                      className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition"
                      title="Edit shop details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteShop(shop.id, shop.name)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition"
                      title="Delete shop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT SHOP */}
      <AnimatePresence>
        {showAddShopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <span>{editingShop ? 'Edit Shop Details' : 'Add New Wholesale Shop'}</span>
                </h3>
                <button
                  onClick={() => setShowAddShopModal(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (shopSaving) return;
                  setShopSaving(true);
                  const form = e.currentTarget;
                  const payload = {
                    name: (form.elements.namedItem('name') as HTMLInputElement).value,
                    owner_name: (form.elements.namedItem('owner_name') as HTMLInputElement).value,
                    phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
                    address: (form.elements.namedItem('address') as HTMLInputElement).value,
                    notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
                  };

                  try {
                    const res = editingShop
                      ? await fetch(`/api/admin/shops/${editingShop.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        })
                      : await fetch('/api/admin/shops', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });
                    if (!res.ok) throw new Error('Server could not save the shop.');
                    setShowAddShopModal(false);
                    loadShops();
                  } catch (err: any) {
                    console.error('Save shop error:', err);
                    showError('Could Not Save Shop', err.message || 'Please try again.');
                  } finally {
                    setShopSaving(false);
                  }
                }}
                className="space-y-3.5 text-xs sm:text-sm"
              >
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Shop Name * (e.g., Sri Krishna Bakery)
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={editingShop?.name || ''}
                    placeholder="Enter store/tea stall/mess name"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Owner Name * (Contact Person)
                    </label>
                    <input
                      name="owner_name"
                      required
                      defaultValue={editingShop?.owner_name || ''}
                      placeholder="e.g. Suresh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Phone Number *</label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      defaultValue={editingShop?.phone || ''}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Address / Town Area * (e.g. Gandhi Road, Near Bus Stand)
                  </label>
                  <input
                    name="address"
                    required
                    defaultValue={editingShop?.address || ''}
                    placeholder="Shop location / street address"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={editingShop?.notes || ''}
                    placeholder="e.g. Delivery at 6:00 AM, payment every Saturday"
                    className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddShopModal(false)}
                    className="px-4 py-2.5 rounded-2xl text-gray-600 font-bold hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={shopSaving}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {shopSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : editingShop ? (
                      'Save Changes'
                    ) : (
                      'Create Shop'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DAILY DELIVERY ENTRY */}
      <AnimatePresence>
        {showDeliveryModal && targetShopForDelivery && (
          <DailyDeliveryModal
            shop={targetShopForDelivery}
            products={products}
            onClose={() => setShowDeliveryModal(false)}
            onSaved={() => {
              setShowDeliveryModal(false);
              loadShops();
              if (selectedShopId) loadShopDetail(selectedShopId);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL 3: RECORD PAYMENT */}
      <AnimatePresence>
        {showPaymentModal && targetShopForPayment && (
          <PaymentModal
            shop={targetShopForPayment}
            saving={paymentSaving}
            setSaving={setPaymentSaving}
            showError={showError}
            onClose={() => setShowPaymentModal(false)}
            onSaved={() => {
              setShowPaymentModal(false);
              loadShops();
              if (selectedShopId) loadShopDetail(selectedShopId);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL 4: WHOLESALE RATES PER SHOP */}
      <AnimatePresence>
        {showRatesModal && targetShopForRates && (
          <ShopRatesModal
            shop={targetShopForRates}
            products={products}
            onClose={() => setShowRatesModal(false)}
            onSaved={() => {
              setShowRatesModal(false);
              if (selectedShopId) loadShopDetail(selectedShopId);
            }}
          />
        )}
      </AnimatePresence>

      {/* MODAL 5: TODAY'S DELIVERIES QUICK VIEW */}
      <AnimatePresence>
        {showTodayDeliveriesQuickView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-xl font-black text-gray-950 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Today's Wholesale Supply Summary</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Date:{' '}
                    {new Date().toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setShowTodayDeliveriesQuickView(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {todayLoading ? (
                <div className="py-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-bold">Loading today's supplies...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 bg-blue-50/80 p-4 rounded-2xl border border-blue-200">
                    <div>
                      <span className="text-[11px] font-bold text-blue-700 uppercase">
                        Today's Total Value
                      </span>
                      <p className="text-2xl font-black text-blue-900 mt-0.5">
                        ₹{(todayDeliveriesData?.total_amount_today || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-blue-700 uppercase">
                        Total Units Delivered
                      </span>
                      <p className="text-2xl font-black text-blue-900 mt-0.5">
                        {todayDeliveriesData?.total_packets_today || 0} packets
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Shop Deliveries Recorded Today ({todayDeliveriesData?.deliveries?.length || 0})
                    </h4>

                    {!todayDeliveriesData?.deliveries ||
                    todayDeliveriesData.deliveries.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs italic">
                        No deliveries logged yet today. Click "+ Delivery" on any shop card to
                        record morning supply.
                      </div>
                    ) : (
                      todayDeliveriesData.deliveries.map((del) => (
                        <div
                          key={del.id}
                          className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-extrabold text-sm text-gray-900">{del.shop_name}</p>
                            <p className="text-gray-500">{del.address}</p>
                            <div className="mt-1 space-y-0.5">
                              {del.items?.map((it: any, idx: number) => (
                                <p key={idx} className="text-gray-700 font-medium">
                                  • {it.product_name}:{' '}
                                  <strong className="text-blue-600">{it.quantity} pkts</strong> @ ₹
                                  {it.rate} = ₹{it.line_total}
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                              Day's Total
                            </span>
                            <p className="text-lg font-black text-emerald-700">
                              ₹{Number(del.total_amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowTodayDeliveriesQuickView(false)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Mobile-Friendly Popup */}
      <CustomPopup popup={popup} onClose={() => setPopup(null)} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: RECORD PAYMENT MODAL
// ────────────────────────────────────────────────────────────────────────────
function PaymentModal({
  shop,
  saving,
  setSaving,
  showError,
  onClose,
  onSaved,
}: {
  shop: Shop;
  saving: boolean;
  setSaving: (v: boolean) => void;
  showError: (title: string, message: string) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [popup, setPopup] = useState<PopupConfig | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-lg font-black text-gray-950 flex items-center gap-1.5">
              <IndianRupee className="w-5 h-5 text-blue-600" />
              <span>Record Payment Received</span>
            </h3>
            <p className="text-xs text-gray-500">{shop.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-900 flex items-center justify-between">
          <span>Current Unpaid Balance:</span>
          <span className="text-base font-black text-red-600">
            ₹{(shop.balance || 0).toFixed(2)}
          </span>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (saving) return;
            const form = e.currentTarget;
            const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
            const payment_date = (form.elements.namedItem('payment_date') as HTMLInputElement).value;
            const payment_method = (form.elements.namedItem('payment_method') as HTMLSelectElement)
              .value;
            const notes = (form.elements.namedItem('notes') as HTMLInputElement).value;

            if (isNaN(amount) || amount <= 0) {
              setPopup({
                isOpen: true,
                type: 'alert',
                title: 'Invalid Payment Amount',
                message:
                  'Please enter a valid amount in rupees (greater than ₹0) to record this payment.',
                confirmText: 'OK',
              });
              return;
            }

            setSaving(true);
            try {
              const res = await fetch(`/api/admin/shops/${shop.id}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, payment_date, payment_method, notes }),
              });
              if (!res.ok) throw new Error('Server could not save the payment.');
              onSaved();
            } catch (err: any) {
              console.error(err);
              showError('Could Not Save Payment', err.message || 'Please try again.');
            } finally {
              setSaving(false);
            }
          }}
          className="space-y-3.5 text-xs sm:text-sm"
        >
          <div>
            <label className="font-bold text-gray-700 block mb-1">Amount Received (₹) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-gray-400">
                ₹
              </span>
              <input
                name="amount"
                type="number"
                step="1"
                required
                placeholder="e.g. 1500"
                defaultValue={shop.balance && shop.balance > 0 ? Math.round(shop.balance) : ''}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-lg font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Payment Date *</label>
              <input
                name="payment_date"
                type="date"
                required
                defaultValue={todayLocal()}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Payment Mode *</label>
              <select
                name="payment_method"
                defaultValue="cash"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="cash">💵 Cash in Hand</option>
                <option value="upi">📱 UPI / GPay / PhonePe</option>
                <option value="other">🏦 Other / Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Receipt Note (Optional)</label>
            <input
              name="notes"
              placeholder="e.g. Paid by Murugan at morning supply"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-gray-600 font-bold hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Payment Receipt'
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <CustomPopup popup={popup} onClose={() => setPopup(null)} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// DELIVERY LINE TYPE + HELPERS
// ────────────────────────────────────────────────────────────────────────────
type DeliveryLine = {
  product_id: string;
  product_name: string;
  product_unit: string;
  quantity: number; // ALWAYS whole packets (this is what gets saved)
  rate: number; // per packet
  line_total: number;
  inputMode: 'packets' | 'litres';
  inputValue: string; // what the owner is typing
  litresPerPacket: number | null;
};

// Rate (per packet) for a product:
//  1. Shop special rate (always per packet) wins
//  2. In litres mode, use the "Price per Litre" from Products x litres in one packet
//  3. Otherwise the normal packet price from Products
const resolveRate = (
  p: Product,
  shopRates: ShopRate[],
  mode: 'packets' | 'litres' = 'packets'
) => {
  const custom = shopRates.find((r) => r.product_id === p.id);
  if (custom && custom.rate > 0) return custom.rate;

  const lpp = getLitresPerPacket(p);
  const ppl = Number(p.price_per_litre);
  if (mode === 'litres' && lpp && ppl > 0) return round2(ppl * lpp);

  return p.price;
};

const makeLine = (p: Product, rate: number, qty = 0): DeliveryLine => ({
  product_id: p.id,
  product_name: p.name,
  product_unit: p.unit,
  quantity: qty,
  rate,
  line_total: round2(qty * rate),
  inputMode: 'packets',
  inputValue: qty === 0 ? '' : String(qty),
  litresPerPacket: getLitresPerPacket(p),
});

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: DAILY DELIVERY ENTRY MODAL (WITH LIVE AUTO-CALCULATOR)
// ────────────────────────────────────────────────────────────────────────────
function DailyDeliveryModal({
  shop,
  products,
  onClose,
  onSaved,
}: {
  shop: Shop;
  products: Product[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [deliveryDate, setDeliveryDate] = useState(todayLocal());
  const [notes, setNotes] = useState('');
  const [shopRates, setShopRates] = useState<ShopRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<PopupConfig | null>(null);

  const [lines, setLines] = useState<DeliveryLine[]>([]);

  // Fetch this shop's special rates
  useEffect(() => {
    fetch(`/api/admin/shops/${shop.id}/rates`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setShopRates(data.rates || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRates(false));
  }, [shop.id]);

  // Prepopulate with top products, only AFTER shop rates have loaded
  useEffect(() => {
    if (loadingRates) return;
    if (products.length > 0 && lines.length === 0) {
      setLines(products.slice(0, 3).map((p) => makeLine(p, resolveRate(p, shopRates))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, shopRates, loadingRates]);

  // Keep rates, names, units and pack size in sync when product prices or shop rates change
  useEffect(() => {
    setLines((prev) =>
      prev.map((l) => {
        const p = products.find((x) => x.id === l.product_id);
        if (!p) return l;
        const lpp = getLitresPerPacket(p);
        const mode = lpp ? l.inputMode : 'packets';
        const rate = resolveRate(p, shopRates, mode);
        return {
          ...l,
          rate,
          inputMode: mode,
          product_name: p.name,
          product_unit: p.unit,
          litresPerPacket: lpp,
          line_total: round2(l.quantity * rate),
        };
      })
    );
  }, [products, shopRates]);

  // Apply a new quantity (in whole PACKETS) to a line
  const applyPackets = (line: DeliveryLine, packets: number, inputValue: string): DeliveryLine => {
    const safe = Math.max(0, packets);
    return {
      ...line,
      quantity: safe,
      line_total: round2(safe * line.rate),
      inputValue,
    };
  };

  // Owner typed in the box
  const handleInputChange = (index: number, text: string) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const val = parseFloat(text);
        if (isNaN(val)) return applyPackets(line, 0, text);
        if (line.inputMode === 'litres' && line.litresPerPacket) {
          return applyPackets(line, litresToPackets(val, line.litresPerPacket), text);
        }
        return applyPackets(line, Math.floor(val), text);
      })
    );
  };

  // +/- buttons (delta is in whichever unit is selected: packets or litres)
  const adjustBy = (index: number, delta: number) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const isLitres = line.inputMode === 'litres' && !!line.litresPerPacket;

        if (isLitres) {
          const lpp = line.litresPerPacket!;
          const currentLitres = packetsToLitres(line.quantity, lpp);
          const nextLitres = Math.max(0, round2(currentLitres + delta));
          const packets = litresToPackets(nextLitres, lpp);
          const shown = packetsToLitres(packets, lpp);
          return applyPackets(line, packets, shown === 0 ? '' : String(shown));
        }

        const next = Math.max(0, Math.floor(line.quantity + delta));
        return applyPackets(line, next, next === 0 ? '' : String(next));
      })
    );
  };

  // Switching Packets / Litres also switches the rate (litre price vs packet price)
  const setInputMode = (index: number, mode: 'packets' | 'litres') => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        if (mode === 'litres' && !line.litresPerPacket) return line;
        const p = products.find((x) => x.id === line.product_id);
        const rate = p ? resolveRate(p, shopRates, mode) : line.rate;
        const shown =
          mode === 'litres' ? packetsToLitres(line.quantity, line.litresPerPacket!) : line.quantity;
        return {
          ...line,
          inputMode: mode,
          rate,
          line_total: round2(line.quantity * rate),
          inputValue: shown === 0 ? '' : String(shown),
        };
      })
    );
  };

  const addProductLine = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setLines((prev) => [...prev, makeLine(prod, resolveRate(prod, shopRates), 0)]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = useMemo(
    () => round2(lines.reduce((sum, it) => sum + (it.line_total || 0), 0)),
    [lines]
  );

  const totalPackets = useMemo(
    () => lines.reduce((sum, it) => sum + (it.quantity || 0), 0),
    [lines]
  );

  const totalLitres = useMemo(
    () =>
      lines.reduce((s, it) => s + (it.litresPerPacket ? it.quantity * it.litresPerPacket : 0), 0),
    [lines]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const activeItems = lines.filter((it) => it.quantity > 0);

    if (activeItems.length === 0) {
      setPopup({
        isOpen: true,
        type: 'alert',
        title: 'No Products Selected',
        message:
          "Please enter a quantity for at least one dairy product before saving today's delivery.",
        confirmText: 'Understood',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/shops/${shop.id}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_date: deliveryDate,
          notes,
          items: activeItems.map((it) => ({
            product_id: it.product_id,
            product_name: it.product_name,
            product_unit: it.product_unit,
            quantity: it.quantity,
            rate: it.rate,
            line_total: it.line_total,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        setPopup({
          isOpen: true,
          type: 'error',
          title: 'Could Not Save Delivery',
          message: data.error || 'Failed to save delivery. Please try again.',
          confirmText: 'OK',
        });
      }
    } catch (err: any) {
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Connection Error',
        message: err.message || 'Error saving delivery. Please check network connection.',
        confirmText: 'OK',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-xl font-black text-gray-950 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Daily Delivery Entry</span>
            </h3>
            <p className="text-xs text-gray-500">
              For: <strong className="text-gray-900">{shop.name}</strong> • {shop.address}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Delivery Date *</label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Morning 6:00 AM wholesale drop"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Add Product Selector */}
          <div className="flex items-center gap-2 pt-2">
            <span className="font-bold text-gray-600 text-xs">+ Add Product to Delivery:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addProductLine(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-bold focus:outline-none"
            >
              <option value="" disabled>
                Select product...
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Products Line Items */}
          <div className="space-y-2.5 border-y border-gray-100 py-3">
            {loadingRates && (
              <p className="text-xs text-gray-400 text-center py-2">Loading shop rates...</p>
            )}
            {lines.map((line, idx) => (
              <div
                key={`${line.product_id}-${idx}`}
                className="bg-gray-50 p-3 sm:p-3.5 rounded-2xl border border-gray-200/80 flex flex-wrap items-center justify-between gap-3"
              >
                {/* Product Name & Rate */}
                <div className="min-w-[160px] flex-1">
                  <p className="font-black text-gray-900 text-sm">{line.product_name}</p>
                  <p className="text-[11px] text-gray-500">
                    Unit: {line.product_unit} • Rate (per packet):{' '}
                    <strong className="text-emerald-700">₹{line.rate}</strong>
                  </p>
                  {line.litresPerPacket ? (
                    <p className="text-[11px] text-gray-400">
                      1 packet = {line.litresPerPacket} L • 1 L = {round2(1 / line.litresPerPacket)}{' '}
                      packets • ₹{round2(line.rate / line.litresPerPacket)} per litre
                    </p>
                  ) : (
                    <p className="text-[11px] text-red-500">
                      Pack size not set. Set "1 Litre = how many packets?" for this product in
                      Products to use Litres mode.
                    </p>
                  )}
                </div>

                {/* Quantity Controls with Packets / Litres toggle */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex bg-white border border-gray-200 rounded-xl p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setInputMode(idx, 'packets')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        line.inputMode === 'packets' ? 'bg-emerald-600 text-white' : 'text-gray-500'
                      }`}
                    >
                      Packets
                    </button>
                    <button
                      type="button"
                      disabled={!line.litresPerPacket}
                      onClick={() => setInputMode(idx, 'litres')}
                      title={!line.litresPerPacket ? 'Pack size not set for this product' : ''}
                      className={`px-2.5 py-1 rounded-lg transition disabled:opacity-40 ${
                        line.inputMode === 'litres' ? 'bg-emerald-600 text-white' : 'text-gray-500'
                      }`}
                    >
                      Litres
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustBy(idx, -10)}
                      className="w-8 h-8 rounded-xl bg-white border border-gray-200 font-black text-gray-700 hover:bg-gray-100 flex items-center justify-center text-xs"
                      title="-10"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustBy(idx, -1)}
                      className="w-8 h-8 rounded-xl bg-white border border-gray-200 font-black text-gray-700 hover:bg-gray-100 flex items-center justify-center text-sm"
                      title="-1"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      step={line.inputMode === 'litres' ? '0.5' : '1'}
                      value={line.inputValue}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      placeholder="0"
                      className="w-16 h-8 text-center font-black text-base bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => adjustBy(idx, 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-gray-200 font-black text-gray-700 hover:bg-gray-100 flex items-center justify-center text-sm"
                      title="+1"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustBy(idx, 10)}
                      className="w-8 h-8 rounded-xl bg-white border border-gray-200 font-black text-emerald-700 hover:bg-emerald-50 flex items-center justify-center text-xs"
                      title="+10"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustBy(idx, 20)}
                      className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 font-black text-emerald-800 hover:bg-emerald-100 flex items-center justify-center text-xs"
                      title="+20"
                    >
                      +20
                    </button>
                  </div>

                  {/* Show the equivalent so nothing is confusing */}
                  {line.quantity > 0 && line.litresPerPacket && (
                    <p className="text-[11px] text-gray-500">
                      {line.inputMode === 'litres'
                        ? `= ${line.quantity} packets (${packetsToLitres(
                            line.quantity,
                            line.litresPerPacket
                          )} L billed)`
                        : `= ${packetsToLitres(line.quantity, line.litresPerPacket)} litres`}
                    </p>
                  )}
                </div>

                {/* Line Total */}
                <div className="w-24 text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Total</span>
                  <p className="font-black text-gray-950 text-sm">₹{line.line_total.toFixed(2)}</p>
                </div>

                {/* Remove Line */}
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                  title="Remove product"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Grand Total Display Bar */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Automatic Calculation
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Total packets: <strong className="text-gray-900">{totalPackets}</strong> • Litres:{' '}
                <strong className="text-gray-900">{round2(totalLitres)} L</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-800 uppercase">Day's Total Bill</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                ₹{grandTotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-gray-600 font-bold hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={grandTotal <= 0 || submitting || loadingRates}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-lg disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Bill...</span>
                </>
              ) : (
                `Save Delivery (₹${grandTotal.toFixed(0)})`
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <CustomPopup popup={popup} onClose={() => setPopup(null)} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: WHOLESALE RATES MODAL
// ────────────────────────────────────────────────────────────────────────────
function ShopRatesModal({
  shop,
  products,
  onClose,
  onSaved,
}: {
  shop: Shop;
  products: Product[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ratesMap, setRatesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState<PopupConfig | null>(null);

  useEffect(() => {
    fetch(`/api/admin/shops/${shop.id}/rates`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.rates) {
          const map: Record<string, string> = {};
          data.rates.forEach((r: ShopRate) => {
            map[r.product_id] = r.rate.toString();
          });
          setRatesMap(map);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shop.id]);

  const handleRateChange = (productId: string, val: string) => {
    setRatesMap((prev) => ({ ...prev, [productId]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Blank / invalid / zero => null, meaning "use the normal product price"
    const ratesArray = Object.entries(ratesMap).map(([product_id, rate]) => {
      const n = parseFloat(rate);
      return { product_id, rate: rate.trim() && !isNaN(n) && n > 0 ? n : null };
    });

    try {
      const res = await fetch(`/api/admin/shops/${shop.id}/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: ratesArray }),
      });
      if (!res.ok) throw new Error('Server could not save the rates.');
      onSaved();
    } catch (err: any) {
      console.error(err);
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Could Not Save Rates',
        message: err.message || 'Please try again.',
        confirmText: 'OK',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-600" />
              <span>Special Wholesale Rates</span>
            </h3>
            <p className="text-xs text-gray-500">
              For: <strong className="text-gray-900">{shop.name}</strong> • Leave blank to use
              normal product price (per packet)
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-xs">Loading rates...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto pr-1">
              {products.map((prod) => {
                const currentVal = ratesMap[prod.id] || '';
                const hasCustom = currentVal !== '' && parseFloat(currentVal) > 0;

                return (
                  <div
                    key={prod.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{prod.name}</p>
                      <p className="text-xs text-gray-400">
                        Current product price:{' '}
                        <span className="font-semibold text-gray-700">₹{prod.price}</span> / packet (
                        {prod.unit})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          placeholder={prod.price.toString()}
                          value={currentVal}
                          onChange={(e) => handleRateChange(prod.id, e.target.value)}
                          className={`w-full pl-6 pr-2 py-1.5 rounded-xl text-xs sm:text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            hasCustom
                              ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-black'
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        />
                      </div>

                      {hasCustom && (
                        <button
                          type="button"
                          onClick={() => handleRateChange(prod.id, '')}
                          className="text-[11px] text-gray-400 hover:text-red-500 underline"
                          title="Reset to product price"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-gray-600 font-bold hover:bg-gray-100 text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Special Rates'}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      <CustomPopup popup={popup} onClose={() => setPopup(null)} />
    </div>
  );
}
