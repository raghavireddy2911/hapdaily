import Link from 'next/link';
import { Milk, Phone, MapPin, AtSign, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-14 pb-8 mt-16 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-emerald-600 to-green-500 rounded-2xl flex items-center justify-center text-white shadow-md">
                <Milk className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-blue-400 font-extrabold tracking-widest uppercase">
                  Authorized Hapdaily Store
                </p>
                <p className="text-base font-black text-white leading-tight">
                  Ayyappa Enterprises
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Your neighborhood dairy partner bringing fresh, chilled{' '}
              <strong className="text-gray-200">Arogya Milk</strong> and{' '}
              <strong className="text-gray-200">Hatsun Curd & Ghee</strong> directly to your home every
              single morning.
            </p>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 border border-gray-800 rounded-xl w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-gray-300">Hapdaily Express Delivery</span>
            </div>
          </div>

          {/* Featured Dairy Brands */}
          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4">
              Featured Brands
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/products?brand=Arogya"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Arogya Green Magic Milk
                </Link>
              </li>
              <li>
                <Link
                  href="/products?brand=Arogya"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  Arogya Full Cream Orange Milk
                </Link>
              </li>
              <li>
                <Link
                  href="/products?brand=Hatsun"
                  className="text-gray-400 hover:text-rose-400 transition"
                >
                  Hatsun Homestyle Curd Pouches
                </Link>
              </li>
              <li>
                <Link
                  href="/products?brand=Hatsun"
                  className="text-gray-400 hover:text-rose-400 transition"
                >
                  Hatsun Pure Cow Ghee Jars
                </Link>
              </li>
              <li>
                <Link
                  href="/products?brand=Hatsun"
                  className="text-gray-400 hover:text-rose-400 transition"
                >
                  Hatsun Fresh Paneer & Butter
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-gray-400 hover:text-emerald-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-emerald-400 transition">
                  Product Catalogue
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-400 hover:text-emerald-400 transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-gray-400 hover:text-emerald-400 transition">
                  UPI Instant Checkout
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-blue-400 transition">
                  Owner Dashboard Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider mb-4">
              Store & Morning Deliveries
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Ayyappa Enterprises, Authorized Hapdaily Outlet, Tamil Nadu / India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>+91 98400 12345 / 94440 67890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Hatsun Agro Product Ltd. Franchise</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>
            © 2026 Ayyappa Enterprises – Hapdaily. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Cold-Chain Maintained</span>
            <span>•</span>
            <span>Morning Fresh Guaranteed 🥛</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
