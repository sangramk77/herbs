# Vastu World

<p align="center">
  <img src="public/assets/img/logos.png" alt="Vastu World Logo" width="300">
</p>

<p align="center"><strong>A Modern E-Commerce Platform for Spiritual & Vastu Products</strong></p>

<p align="center">
  <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat&logo=laravel&logoColor=white" alt="Laravel"></a>
  <a href="https://reactjs.org"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <img src="https://img.shields.io/badge/React_Doctor-88%2F100-brightgreen?style=flat" alt="React Doctor Score">
</p>

---

## 📖 Overview

Vastu World is a full-featured e-commerce platform built with modern web technologies. It provides a seamless shopping experience for customers and a powerful admin panel for store management. The platform features a beautiful, responsive design with glassmorphism effects, smooth animations, and smart UX patterns inspired by top Indian e-commerce brands.

### ✨ Key Highlights

- 🛍️ **Complete E-Commerce Solution** — Product catalog, smart cart UX, checkout, and order management
- 🎨 **Modern UI/UX** — React 19, TypeScript, Tailwind CSS v4 with glassmorphism & micro-animations
- 🔍 **Instant Search** — Powered by Algolia for real-time product discovery
- 💳 **Secure Payments** — Razorpay integration with webhook safety for payment-order race conditions
- 📱 **Fully Responsive** — Optimised for desktop, tablet, and mobile (with dedicated mobile menu)
- 🤖 **AI-Powered Blog** — Generate blog content using Gemini AI
- 📊 **Admin Dashboard** — Comprehensive management for products, orders, CMS, and users
- 🗄️ **MongoDB Backend** — Flexible NoSQL database for scalable data storage
- 🏷️ **Coupon System** — Apply discount coupons at checkout
- ⚡ **React Compiler** — Enabled for automatic memoisation and performance

---

## 🚀 Features

### Customer Features

#### 🛒 Shopping Experience

- **Product Catalog** — Browse with filtering and sorting
- **Mega Menu Navigation** — Hover-based category mega menu with product previews
- **Product Details** — Image gallery (with lightbox), rich descriptions, specifications
- **Instant Search** — Algolia-powered search with highlights, category pills, and stock badges
- **Smart Cart Button** — Industry-standard 2-state: "Add to Cart" → morphs into live `− qty +` stepper + "Go to Cart" once added (Myntra/Nykaa pattern)
- **Shopping Cart Dropdown** — Persistent navbar cart with live quantity updates
- **Wishlist** — Save favourite products for later

#### 💰 Checkout & Payments

- **Secure Checkout** — Multi-step checkout with address management and validation
- **Coupon System** — Discount coupon codes applied at cart
- **Razorpay Integration** — Full payment gateway with webhook verification to prevent ghost orders
- **Order Tracking** — View order history and status (Placed → Shipped → Delivered → Cancelled)
- **Email Notifications** — Branded order confirmation and welcome emails

#### 📝 Content & Engagement

- **Blog** — Articles with Like / Love / Insightful reactions
- **FAQ Section** — Searchable FAQ
- **Contact Form** — With admin-side submission tracking
- **Newsletter** — Subscribe for updates
- **CMS Pages** — Dynamic About, Terms, Privacy, and custom pages
- **Testimonials** — Customer reviews

#### 👤 User Account

- **Registration & Login** — Secure authentication via Laravel Fortify
- **Email Verification & Password Reset** — Branded email flows
- **User Dashboard** — Orders, wishlist, profile settings

---

### Admin Features

#### 📦 Product Management

- CRUD with multi-image upload (Intervention Image)
- TipTap rich text editor for descriptions
- SEO meta fields (title, description, keywords)
- Stock, SKU, tags, category, featured flag, sort order
- Automatic discount % calculation
- Soft deletes

#### 📋 Order Management

- Order list with status filters, date range, and customer search
- Status update workflow (Placed → Shipped → Delivered → Cancelled)
- Bill/invoice upload
- Customer address view

#### 🎨 Content Management System (CMS)

- Custom pages with TipTap editor
- Homepage banners management
- Blog with AI content generation (Gemini)
- FAQ management
- Testimonials
- Newsletter subscriber list
- Contact submission inbox

#### ⚙️ System Settings

- General settings (site name, logo, contact info)
- Homepage counter stats
- Social media links
- Custom script injection (analytics, tracking)

#### 👥 User Management

- Customer list
- Admin management (Super Admin only)
- Role-based access: Admin / Super Admin
- Admin profile management

---

## 🛠️ Tech Stack

### Backend

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Framework        | Laravel 12                          |
| Language         | PHP 8.2+                            |
| Database         | MongoDB (`mongodb/laravel-mongodb`) |
| Authentication   | Laravel Fortify                     |
| Email            | Resend                              |
| Payment          | Razorpay                            |
| Search           | Laravel Scout + Algolia             |
| Image Processing | Intervention Image                  |
| AI               | Laravel AI SDK (Gemini)             |
| Queue            | Laravel Queue                       |

### Frontend

| Layer         | Technology                     |
| ------------- | ------------------------------ |
| Framework     | React 19 (with React Compiler) |
| Language      | TypeScript 5.7                 |
| Routing       | Inertia.js                     |
| Build Tool    | Vite 7                         |
| Styling       | Tailwind CSS v4                |
| UI Components | Radix UI + Shadcn UI           |
| Icons         | Lucide React + React Icons     |
| Forms         | React Hook Form + Zod          |
| Rich Text     | TipTap v3                      |
| Search UI     | React InstantSearch (Algolia)  |
| Carousel      | Embla Carousel                 |
| Lightbox      | yet-another-react-lightbox     |
| Notifications | Sonner                         |
| Charts        | Recharts                       |
| Markdown      | React Markdown                 |

### Development Tools

- **Laravel Pint** — PHP formatter
- **PHPStan** — Static analysis
- **Rector** — PHP refactoring
- **ESLint + Prettier** — JS/TS linting and formatting
- **React Doctor** — React code quality scanner (current score: **88/100**)
- **pnpm** — Fast, disk-efficient package manager
- **Pest PHP** — Testing framework

---

## 📋 Prerequisites

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.0
- **pnpm** >= 9.0 (`npm install -g pnpm`)
- **MongoDB** >= 5.0

### Optional Services

- [Algolia](https://www.algolia.com) — Instant search
- [Razorpay](https://razorpay.com) — Payment processing
- [Resend](https://resend.com) — Transactional emails
- [Google AI Studio](https://makersuite.google.com/app/apikey) — Gemini API for AI blog

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vastuworld
```

### 2. Install Dependencies

```bash
composer install
pnpm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Update the following in `.env`:

```env
# Application
APP_NAME="Vastu World"
APP_URL=http://localhost:8000

# Database (MongoDB)
DB_CONNECTION=mongodb
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=vastuworld

# Algolia Search
ALGOLIA_APP_ID=your_app_id
ALGOLIA_SECRET=your_secret_key
VITE_ALGOLIA_APP_ID=your_app_id
VITE_ALGOLIA_SEARCH_KEY=your_search_key
VITE_ALGOLIA_INDEX_NAME=products

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=naturalsecret

# Email (Resend)
RESEND_API_KEY=re_xxxxx
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Gemini AI
GEMINI_API_KEY=xxxxx
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Seed Super Admin

```bash
php artisan db:seed --class=Database\\Seeders\\SuperAdminSeeder
```

**Default credentials:**

- Email: `superadmin@naturalrudraksha.com`
- Password: `password`

> ⚠️ **Change these immediately after first login!**

### 7. Start Development Server

```bash
composer run dev
```

Runs concurrently:

- Laravel dev server (`:8000`)
- Queue worker
- Log viewer (Pail)
- Vite dev server

App available at: **http://localhost:8000**

---

## 📦 Alternative Setup

### Automated One-Command Setup

```bash
composer run setup
```

Installs Composer deps, copies `.env`, generates key, runs migrations, installs pnpm deps, and builds assets.

### SSR Development

```bash
composer run dev:ssr
```

---

## 🎯 Common Commands

### Development

```bash
composer run dev          # Full dev server (Laravel + Vite + Queue + Pail)
pnpm dev                  # Vite dev server only
```

### Building

```bash
pnpm build                # Production assets
pnpm build:ssr            # Production + SSR bundle
```

### Code Quality

```bash
# PHP
composer run lint         # Format PHP (Pint)
composer run test:lint    # Check PHP formatting
vendor/bin/phpstan analyse
composer run rector:dry   # Dry-run refactoring
composer run rector:refactor

# JS / TS
pnpm lint                 # ESLint fix
pnpm format               # Prettier write
pnpm format:check         # Prettier check
pnpm types                # TypeScript type check

# React health check
pnpm dlx react-doctor@latest . --verbose --diff
```

### Testing

```bash
composer run test
php artisan test
```

### Database

```bash
php artisan migrate
php artisan migrate:rollback
php artisan migrate:fresh --seed
```

### Search (Algolia)

```bash
php artisan scout:import "App\Models\Product"   # Index all products
php artisan scout:flush "App\Models\Product"    # Clear index
```

### Queue

```bash
php artisan queue:work
php artisan queue:listen
```

### Cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize      # Production optimise
```

---

## 📁 Project Structure

```
vastuworld/
├── app/
│   ├── Actions/             # Fortify actions
│   ├── Http/
│   │   ├── Controllers/     # Application controllers
│   │   └── Middleware/      # Custom middleware
│   ├── Jobs/                # Queue jobs
│   ├── Mail/                # Email classes
│   └── Models/              # Eloquent models (MongoDB)
├── config/                  # Configuration files
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
├── public/
│   ├── assets/              # Static assets (images, logos, SVGs)
│   └── uploads/             # User-uploaded files
├── resources/
│   ├── js/
│   │   ├── components/      # React components
│   │   │   ├── site/        # Header, Footer, Cart, Search, Nav
│   │   │   ├── admin/       # Admin UI components
│   │   │   ├── home/        # Homepage sections
│   │   │   ├── product/     # Product components
│   │   │   └── ui/          # Shadcn UI primitives
│   │   ├── pages/           # Inertia page components
│   │   ├── layouts/         # Layout wrappers
│   │   ├── styles/          # SCSS variables & keyframes
│   │   └── lib/             # Utilities and helpers
│   ├── views/               # Blade templates (emails)
│   └── css/                 # Global CSS (Tailwind + custom)
├── routes/
│   ├── web.php              # Web routes
│   └── settings.php         # Settings routes
├── tests/                   # Pest test files
├── .env.example
├── composer.json
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🔐 Admin Panel

**URL:** `http://localhost:8000/admin`

| Route                           | Purpose                   |
| ------------------------------- | ------------------------- |
| `/admin`                        | Dashboard                 |
| `/admin/products`               | Product management        |
| `/admin/categories`             | Category management       |
| `/admin/orders`                 | Order management          |
| `/admin/customers`              | Customer list             |
| `/admin/cms/pages`              | CMS pages                 |
| `/admin/cms/banner`             | Banners                   |
| `/admin/cms/blog`               | Blog                      |
| `/admin/cms/faq`                | FAQs                      |
| `/admin/cms/testimonial`        | Testimonials              |
| `/admin/contact-submissions`    | Contact inbox             |
| `/admin/newsletter-subscribers` | Newsletter list           |
| `/admin/system/settings`        | System settings           |
| `/admin/admins`                 | Admin users (Super Admin) |
| `/admin/profile`                | Admin profile             |

---

## 🔧 Service Configuration

### Razorpay

1. Create account at [razorpay.com](https://razorpay.com)
2. Get keys from Dashboard → Settings → API Keys

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=naturalsecret
```

#### Testing Webhooks Locally (with Herd)

```bash
# 1. Enable Herd SSL for your site
# 2. Install ngrok
brew install ngrok

# 3. Start tunnel
ngrok http https://vastuworld.test --host-header=vastuworld.test

# 4. Add webhook in Razorpay Dashboard → Settings → Webhooks
#    URL: https://xxxx.ngrok.io/webhook/razorpay
#    Secret: naturalsecret
#    Events: payment.captured, payment.failed

# 5. Monitor at http://localhost:4040
```

### Algolia

```env
ALGOLIA_APP_ID=xxxxx
ALGOLIA_SECRET=xxxxx
VITE_ALGOLIA_APP_ID=xxxxx
VITE_ALGOLIA_SEARCH_KEY=xxxxx
VITE_ALGOLIA_INDEX_NAME=products
```

```bash
php artisan scout:import "App\Models\Product"
```

### Resend (Email)

```env
RESEND_API_KEY=re_xxxxx
MAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### Gemini AI (Blog Generation)

```env
GEMINI_API_KEY=xxxxx
```

---

## 🌐 Deployment

### Production Build

```bash
pnpm build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

Set in `.env`:

```env
APP_ENV=production
APP_DEBUG=false
```

### Server Requirements

- PHP >= 8.2 with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, MongoDB
- Composer, Node.js, pnpm
- MongoDB server
- Nginx / Apache
- Supervisor (for queue workers in production)

### File Permissions

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## 🐛 Troubleshooting

### MongoDB Not Connecting

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Vite Build Errors

```bash
rm -rf node_modules
pnpm install
pnpm build
```

### Permission Errors

```bash
chmod -R 755 storage bootstrap/cache
```

### Queue Not Processing

```bash
php artisan queue:work
```

Use **Supervisor** in production to keep the worker alive.

---

## 📊 Code Quality

React Doctor (last scan — Feb 2026):

```
88 / 100  Great
16 errors · 31 warnings · across 14/24 changed files
```

Key areas tracked: React Compiler compatibility, hook ordering, key props, component size, GPU memory (will-change), state management patterns.

---

## 📝 License

MIT License. See `composer.json` for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📧 Support

Email: [sangramdev7@gmail.com](mailto:sangramdev7@gmail.com) or open an issue.

---

## 🙏 Credits

**Sangram Keshari** — Full Stack Developer & Creator
([sangramdev7@gmail.com](mailto:sangramdev7@gmail.com))

Built with ❤️ using Laravel + React + MongoDB
