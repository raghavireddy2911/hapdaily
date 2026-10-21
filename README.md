# Ayyappa Enterprises – Hapdaily 🥛

A fast, colorful, premium, fully responsive dairy e-commerce website built for **Ayyappa Enterprises** (Authorized **Hapdaily** Outlet), featuring **Hatsun** and **Arogya** dairy brands.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Motion (Framer Motion)**, and **Supabase (PostgreSQL, Auth & Storage)**.

---

## 🌟 Key Highlights

### 1. Correct Branding
- **Shop Name**: **Ayyappa Enterprises**
- **Brand**: **Hapdaily** (`H-A-P-D-A-I-L-Y`)
- **Key Dairy Brands Featured**: **Hatsun** (Curd, Ghee, Paneer, Butter) and **Arogya** (Standardized Green Magic, Full Cream Orange, Toned Milk)
- **Design Palette**: Vibrant dairy blue, fresh farm emerald, cream, and clean white.

### 2. Customer Experience
- **Word-by-word animated hero reveal**: "Welcome to Ayyappa Enterprises"
- **Smooth fly-to-cart animation**: Product image flies directly into navbar cart icon.
- **Brand and Category filtering**: One-click pills for Hatsun, Arogya, or all products.
- **Real-time search and availability badges**: Instantly flags products out of stock for the day.
- **Cart & Checkout**:
  - Live quantity adjustment, remove items, itemized subtotal.
  - Two-step checkout: Customer details & delivery notes.
  - **Dynamic UPI QR Code**: Encodes merchant UPI ID with exact order total (`upi://pay?pa=...&am=...`).
  - One-click copy for Merchant UPI ID.
- **Celebratory Order Success Page**: Confetti particle animation, exact order number, delivery window (`6:00 AM - 7:30 AM`).

### 3. Secure Owner Dashboard (`/login` & `/admin`)
- **Server-side authorization**: Protected via Next.js Middleware and cookie verification.
- **Father's Photo Studio (Camera & File Picker)**:
  - Take photo directly from mobile phone camera (`capture="environment"`).
  - Pick images from phone gallery or laptop files.
  - **In-browser Editor**: Zoom (up to 2.5x), 90° rotation, Brightness, Contrast, Saturation sliders, and Dairy filters (*Fresh Milk*, *Golden Ghee*, *Vibrant*, *Crisp Cool*, *B&W*).
  - Canvas export & upload to Supabase Storage `products` bucket.
- **Product Management**: Add new products, edit price/unit/description, toggle daily availability (*Available Today / Hidden*), delete products.
- **Order Management**: View incoming orders, customer addresses, phone numbers, change status (*Pending*, *Confirmed*, *Delivered*, *Cancelled*).
- **Payment Verification**: Follows security rule: never marks payments as verified without manual or gateway verification.
- **Accurate Sales Reporting**: Calculates actual revenue, total orders, packets sold, and product-wise sales breakdown directly from database orders.

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
cd hapdaily
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Login to Father's Owner Dashboard
Navigate to **[http://localhost:3000/login](http://localhost:3000/login)** or **[http://localhost:3000/admin](http://localhost:3000/admin)**:
- **Default Owner Email**: `father@ayyappa.com`
- **Default Password**: `hapdaily123`

---

## 🗄️ Supabase Setup (3 Easy Steps)

1. **Create a project** on [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the entire [`supabase-schema.sql`](file:///c:/Users/Raghavi/Pictures/Screenshots/HapDaily/hapdaily/supabase-schema.sql) file.
   - Creates `products` table with Hatsun & Arogya seed rows.
   - Creates `orders` table.
   - Sets Row Level Security (RLS) policies.
   - Creates public `products` storage bucket for uploaded photos.
3. In your Supabase Dashboard:
   - Go to **Authentication > Users** and click **Add User**:
     - Email: `father@ayyappa.com`
     - Password: Choose a strong password (e.g. `hapdaily123`).
   - Copy your project credentials from **Settings > API** and create `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     NEXT_PUBLIC_MERCHANT_UPI_ID=ayyappadairy@upi
     ```

---

## 📁 Project Architecture

```
hapdaily/
├── app/
│   ├── layout.tsx                 # Root layout with brand title & meta
│   ├── page.tsx                   # Colorful Home page with brand cards
│   ├── products/page.tsx          # Catalogue with brand filter pills & search
│   ├── cart/page.tsx              # Animated shopping cart
│   ├── checkout/page.tsx          # Dynamic UPI QR & delivery form
│   ├── success/page.tsx           # Order confirmation with confetti
│   ├── login/page.tsx             # Secure owner login
│   ├── admin/
│   │   ├── page.tsx               # Full Owner Dashboard
│   │   ├── login/page.tsx         # Redirect to /login
│   │   └── dashboard/page.tsx     # Redirect to /admin
│   └── api/
│       ├── products/route.ts      # Server-side products CRUD
│       ├── products/[id]/route.ts # Dynamic product PATCH/DELETE
│       ├── orders/route.ts        # Secure calculation & order insert
│       ├── orders/[id]/route.ts   # Order status update
│       └── upload/route.ts        # Photo upload to Supabase Storage
├── components/
│   ├── Navbar.tsx                 # Branding + Top-Right Hapdaily logo
│   ├── HeroSection.tsx            # Word-by-word reveal hero animation
│   ├── ProductCard.tsx            # Hatsun & Arogya badge card + fly trigger
│   ├── PhotoEditorModal.tsx       # Studio: Camera, gallery, zoom, rotate, filters
│   ├── FlyingCartAnimation.tsx    # Smooth parabolic add-to-cart effect
│   └── Footer.tsx                 # Authentic outlet details & quick links
├── context/
│   └── CartContext.tsx            # Cart provider with coordinates for fly effect
├── lib/
│   ├── supabase.ts                # Browser Supabase client
│   ├── supabase-server.ts         # Server-side cookie authenticated client
│   ├── supabase-admin.ts          # Service-role admin client
│   └── mockData.ts                # Hatsun & Arogya fallback dataset
├── types/
│   └── index.ts                   # Complete TypeScript interfaces
├── middleware.ts                  # Server-side authorization guard
├── supabase-schema.sql            # Ready-to-execute PostgreSQL schema
├── .env.example                   # Environment configuration guide
└── Ayyappa-Enterprises-Hapdaily.zip # Downloadable project archive
```

---

## ⚡ Performance Verification

- **Production Build**: Verified with `npm run build` (`Next.js 16.4.0 Turbopack`).
- **Static & Dynamic Routes**: All 15 routes compiled cleanly with 0 type errors.
- **Images**: Uses `next/image` with responsive `sizes` attribute and GPU-accelerated CSS transforms.
- **Mobile Friendly**: Touch-optimized photo editor, camera capture (`capture="environment"`), and smooth scrolling.
