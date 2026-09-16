# 🔥 LinkFlare — World-Class Free URL Shortener

A full-featured, premium URL shortener platform built with Next.js 14, Tailwind CSS, Upstash Redis, and deployed on Netlify.

## ✨ Features

- ⚡ **Lightning-fast redirects** via Next.js Edge Middleware (<5ms globally)
- 🔗 **Custom aliases** — pick your own back-half
- 📊 **Real-time analytics** — clicks, countries, devices, referrers, browsers
- 📱 **QR Code generation** — auto-generated, downloadable PNG for every link
- 🔐 **Password protection** — lock links with a password
- ⏰ **Link expiration** — by date/time OR by number of clicks
- 🌙 **Dark/Light mode** — toggle with preference saved
- 📱 **Fully responsive** — works perfectly on mobile
- 🆓 **100% Free** — all premium features, no credit card, forever

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
- `UPSTASH_REDIS_REST_URL` — from [upstash.com](https://upstash.com) → your database → REST API
- `UPSTASH_REDIS_REST_TOKEN` — from [upstash.com](https://upstash.com) → your database → REST API
- `JWT_SECRET` — run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` to generate
- `NEXT_PUBLIC_BASE_URL` — your deployed URL (e.g., `https://linkflare.netlify.app`)

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Getting Upstash Redis

1. Go to [upstash.com](https://upstash.com) and sign up (free)
2. Click **Create Database**
3. Choose **Global** type (for low-latency worldwide reads)
4. Copy the **REST URL** and **REST Token**
5. Paste into your `.env.local`

## 🚢 Deploy to Netlify

1. Push your code to GitHub
2. Connect your repo on [netlify.com](https://netlify.com)
3. Set environment variables in **Site Settings → Environment Variables**
4. Deploy! Netlify auto-detects Next.js

## 🏛️ Architecture

```
User visits /abc123
     ↓
Next.js Middleware (Edge)
  → Fetch link from Upstash Redis (~1ms)
  → Check expiry / click limit / password
  → Fire async click tracking
  → HTTP 307 redirect to longUrl
     ↓
Destination URL (< 5ms total)
```

## 📁 Project Structure

```
linkflare/
├── app/
│   ├── api/
│   │   ├── auth/            # signup, login, logout
│   │   ├── links/           # CRUD + analytics + password verify
│   │   └── track/           # async click tracking
│   ├── dashboard/           # protected user dashboard + analytics
│   ├── login/ signup/       # auth pages
│   ├── protected/[slug]/    # password entry page
│   ├── expired/             # expired link page
│   └── not-found.tsx        # custom 404
├── components/
│   ├── charts/              # Recharts components
│   ├── CreateLinkModal.tsx
│   ├── EditLinkModal.tsx
│   ├── LinkCard.tsx
│   ├── QRModal.tsx
│   ├── Navbar.tsx
│   └── ThemeProvider.tsx
├── lib/
│   ├── redis.ts             # Upstash client + helpers
│   ├── auth.ts              # JWT sign/verify
│   └── utils.ts             # slug gen, URL parse, click tracking
└── middleware.ts             # Edge redirect + auth guard
```

---

**Developed by [V.P.R. Lakshan Vidanapathirana](https://lakshan.vercel.app/)**
