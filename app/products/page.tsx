'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, Sparkles, Filter, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { mockProducts, categories, brands } from '@/lib/mockData';

function ProductsContent() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState<string>(brandParam || 'All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
  }, [brandParam]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products?all=true')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.products) {
          setProducts(res.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
      const matchesAvailability = onlyAvailable ? p.available : true;

      return matchesSearch && matchesCategory && matchesBrand && matchesAvailability;
    });
  }, [products, search, selectedCategory, selectedBrand, onlyAvailable]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ayyappa Enterprises • Hapdaily Catalogue</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
          Hatsun & Arogya Dairy Store
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select pure milk, thick curd, ghee, paneer, and butter. Add to cart to see live fly animations.
        </p>
      </div>

      {/* Brand Tabs (Hatsun, Arogya, All) */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {brands.map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBrand(b)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
              selectedBrand === b
                ? b === 'Arogya'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : b === 'Hatsun'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {b === 'All' ? 'All Dairy Brands' : `${b} Brand`}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-gray-100 shadow-sm mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search milk, ghee, paneer, curd, brand..."
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Availability Toggle */}
          <button
            onClick={() => setOnlyAvailable((prev) => !prev)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition flex items-center justify-center gap-2 ${
              onlyAvailable
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{onlyAvailable ? 'Showing In Stock Only' : 'Include Out of Stock'}</span>
          </button>
        </div>

        {/* Category Pills Scrollable */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Results */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
          <div className="text-5xl mb-3">🥛</div>
          <h3 className="text-base sm:text-lg font-black text-gray-900">No matching products found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try checking spelling or clear selected brand/category filters to explore our full dairy range.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedBrand('All');
              setSelectedCategory('All');
              setOnlyAvailable(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}

      {/* Footer count indicator */}
      <div className="mt-8 text-center text-xs font-semibold text-gray-400">
        Displaying {filteredProducts.length} of {products.length} products • Ayyappa Enterprises Hapdaily
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-sm font-bold text-gray-400">Loading Hapdaily products...</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
