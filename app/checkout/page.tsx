'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle,
  Loader2,
  User,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

const MERCHANT_UPI_ID = process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || 'ayyappadairy@upi';
const SHOP_NAME = 'Ayyappa Enterprises - Hapdaily';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    payment_method: 'upi' as 'upi' | 'cod',
  });
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [placing, setPlacing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Safe redirect on empty cart
  useEffect(() => {
    if (items.length === 0 && !createdOrder) {
      router.push('/products');
    }
  }, [items, createdOrder, router]);

  // Construct standard dynamic UPI deep link
  const exactAmount = totalPrice.toFixed(2);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(
    MERCHANT_UPI_ID
  )}&pn=${encodeURIComponent(SHOP_NAME)}&am=${exactAmount}&cu=INR&tn=${encodeURIComponent(
    `Order by ${form.name || 'Customer'}`
  )}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (form.phone.trim().length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number for morning delivery.');
      return;
    }
    setStep('payment');
  };

  const handleConfirmOrder = async () => {
    setPlacing(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: form.address,
          notes: form.notes,
          payment_method: form.payment_method,
        }),
      });

      const data = await response.json();

      if (data.success && data.order) {
        setCreatedOrder(data.order);
        clearCart();
        // Redirect to success page with order details
        router.push(
          `/success?order_number=${data.order.order_number}&total=${data.order.total}&name=${encodeURIComponent(
            data.order.customer_name
          )}&method=${data.order.payment_method}`
        );
      } else {
        setErrorMessage(data.error || 'Failed to place order. Please try again.');
        setPlacing(false);
      }
    } catch (err: any) {
      setErrorMessage('Unable to connect to order server. Please check connection.');
      setPlacing(false);
    }
  };

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Redirecting to products catalogue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
          <span>Ayyappa Enterprises • Hapdaily Checkout</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950">
          {step === 'details' ? 'Delivery Address' : 'Complete Payment'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {step === 'details'
            ? 'Enter your home address for fresh early morning delivery.'
            : 'Scan the dynamic UPI QR code with GPay, PhonePe, or Paytm.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Step Content */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="font-extrabold text-gray-900 text-base">Step 1: Contact & Delivery</h2>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Ayyappa Enterprises
                  </span>
                </div>

                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                      Customer Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. R. Subramanian"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                      Mobile Number (For Delivery Confirmation) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                      Complete Home / Apartment Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <textarea
                        required
                        rows={3}
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Door No., Building Name, Street, Landmark"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                      Delivery Instructions (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="e.g. Leave milk packet in basket outside door"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Payment Mode Choice */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                      Choose Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, payment_method: 'upi' })}
                        className={`p-3 rounded-2xl border text-left transition ${
                          form.payment_method === 'upi'
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold shadow-xs'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="block text-xs font-black">Dynamic UPI QR Code</span>
                        <span className="text-[11px] text-gray-500 font-normal">GPay, PhonePe, Paytm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, payment_method: 'cod' })}
                        className={`p-3 rounded-2xl border text-left transition ${
                          form.payment_method === 'cod'
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold shadow-xs'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="block text-xs font-black">Cash On Morning Delivery</span>
                        <span className="text-[11px] text-gray-500 font-normal">Pay cash at doorstep</span>
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition mt-3"
                  >
                    Continue to Payment (₹{totalPrice.toFixed(0)})
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step-payment"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 text-center space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <button
                    onClick={() => setStep('details')}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Address
                  </button>
                  <span className="text-xs font-bold text-emerald-600">Step 2: Pay</span>
                </div>

                {form.payment_method === 'upi' ? (
                  <div>
                    <h2 className="text-xl font-black text-gray-950 mb-1">
                      Scan Dynamic UPI QR Code
                    </h2>
                    <p className="text-xs text-gray-500 mb-5">
                      The QR code below is configured with the exact total of{' '}
                      <strong className="text-gray-900 font-black">₹{exactAmount}</strong>.
                    </p>

                    {/* QR Box with Border */}
                    <div className="inline-block p-4 sm:p-5 bg-white rounded-3xl border-2 border-emerald-500/80 shadow-xl shadow-emerald-600/10 mb-4">
                      <QRCodeSVG
                        value={upiUrl}
                        size={210}
                        bgColor="#ffffff"
                        fgColor="#065f46"
                        level="Q"
                        includeMargin={false}
                      />
                    </div>

                    {/* UPI ID Copy Bar */}
                    <div className="max-w-xs mx-auto bg-gray-50 rounded-2xl p-2.5 flex items-center justify-between border border-gray-200 mb-4">
                      <div className="text-left pl-1">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">
                          Merchant UPI ID
                        </span>
                        <span className="text-xs font-extrabold text-gray-800">{MERCHANT_UPI_ID}</span>
                      </div>
                      <button
                        onClick={handleCopyUPI}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1 transition"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Security Notice: Never mark verified without gateway */}
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-800 text-left mb-5 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Payment Security Policy:</strong> Your order will be
                        logged as <em>Payment Pending Verification</em> until our shop confirms your UPI reference.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-3xl mx-auto">
                      💵
                    </div>
                    <h2 className="text-xl font-black text-gray-950">Cash On Morning Delivery</h2>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Please keep <strong>₹{totalPrice.toFixed(0)}</strong> ready in cash when our delivery executive
                      arrives at your door between 6:00 AM - 7:30 AM.
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* Final Order Placement Button */}
                <button
                  onClick={handleConfirmOrder}
                  disabled={placing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Order to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {form.payment_method === 'upi' ? "I've Completed UPI Payment" : 'Confirm Order'}
                      </span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-extrabold text-gray-900 text-base pb-3 border-b border-gray-100">
              Order Items ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {item.product.brand} • {item.quantity} × ₹{item.product.price}
                    </p>
                  </div>
                  <span className="text-xs font-black text-gray-900">
                    ₹{(item.product.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charge</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-950 pt-2 border-t border-gray-100">
                <span>Total Payable</span>
                <span className="text-emerald-700">₹{totalPrice.toFixed(0)}</span>
              </div>
            </div>

            {form.name && (
              <div className="p-3 bg-gray-50 rounded-2xl text-[11px] text-gray-500 space-y-1">
                <p>
                  <strong>Deliver To:</strong> {form.name} ({form.phone})
                </p>
                {form.address && <p className="truncate">{form.address}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
