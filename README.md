# Predik

> **El futuro tiene precio** — The premier prediction market platform for Latin America

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![BNB Chain](https://img.shields.io/badge/BNB_Chain-Mainnet-yellow)](https://www.bnbchain.org/)
[![Myriad Protocol](https://img.shields.io/badge/Myriad-Protocol-purple)](https://myriadprotocol.com/)

Predik is a decentralized prediction market application built on BNB Smart Chain, powered by Myriad Protocol. Trade on outcomes of real-world events — from elections and sports to crypto prices and cultural moments.

---

## 🌟 Features

### Core Trading

- **🎯 Binary Prediction Markets** — Trade on Yes/No outcomes with USDT
- **💹 Real-time Pricing** — Live market prices from Polkamarkets SDK
- **⚡ Instant Execution** — Execute trades in seconds on BNB Chain
- **💰 Claim Winnings** — Automatic settlement when markets resolve

### User Experience

- **🔐 Social Login** — Connect with wallet, email, Google, or X (Twitter) via Dynamic
- **🌉 Built-in Bridge** — Deposit funds from any chain via Li.Fi integration
- **📱 Mobile-Optimized** — Responsive design with native-feeling mobile UI
- **🌙 Dark Mode** — Beautiful themes that respect your preferences
- **🇪🇸 Spanish-First** — Native Spanish content with full translations

### Community Features

- **💬 Comments** — Discuss markets with the community
- **❤️ Save Markets** — Bookmark your favorite predictions
- **📊 Ranking System** — Track top holders and traders
- **🎯 Market Proposals** — Request new markets the community wants
- **🔔 Notifications** — Stay updated on market activity

### Developer Experience

- **📦 Monorepo Architecture** — Organized workspaces for web, app, and admin
- **🗃️ Type-Safe Database** — Drizzle ORM with full TypeScript support
- **📈 Analytics** — PostHog integration for user behavior insights
- **🔍 Subgraph Support** — The Graph indexing for on-chain data

---

## 🏗️ Architecture

### Monorepo Structure

```
predik/
├── apps/
│   ├── web/                      # Marketing site (predik.io)
│   │   ├── Landing pages
│   │   ├── Legal docs (Terms, Privacy)
│   │   └── SEO-optimized static content
│   │
│   ├── app/                      # Main application (app.predik.io)
│   │   ├── Market discovery & trading
│   │   ├── User portfolio & analytics
│   │   ├── Social features (comments, proposals)
│   │   └── Wallet integration & bridge
│   │
│   └── admin/                    # Admin panel (backend.predik.io)
│       ├── Market metadata management
│       ├── Comment moderation
│       ├── Notification system
│       └── Translation management
│
├── packages/
│   ├── database/                 # @predik/database
│   │   ├── Drizzle ORM schema
│   │   ├── Database client
│   │   └── Migrations
│   │
│   ├── ui/                       # @predik/ui
│   │   └── Shared Shadcn components
│   │
│   └── config/                   # @predik/config
│       └── Shared configurations
│
├── subgraph/                     # The Graph indexer
│   ├── Schema definitions
│   ├── Event mappings
│   └── GraphQL queries
│
└── Docs/                         # Technical documentation
    ├── Architecture guides
    ├── API specifications
    └── Implementation details
```

---

## 🚀 Tech Stack

### Frontend

- **[Next.js 16](https://nextjs.org/)** — React framework with App Router
- **[React 19](https://react.dev/)** — Latest React with Server Components
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling
- **[Shadcn UI](https://ui.shadcn.com/)** — Beautiful, accessible components
- **[Motion](https://motion.dev/)** — Smooth animations

### Blockchain & Web3

- **[BNB Smart Chain](https://www.bnbchain.org/)** — Layer 1 blockchain (BSC Mainnet)
- **[Myriad Protocol](https://myriadprotocol.com/)** — Prediction market infrastructure
- **[Polkamarkets SDK](https://github.com/Polkamarkets/polkamarkets-js)** — Smart contract interactions
- **[Wagmi](https://wagmi.sh/)** — React hooks for Ethereum
- **[Viem](https://viem.sh/)** — TypeScript-first Ethereum client
- **[Dynamic](https://www.dynamic.xyz/)** — Wallet authentication & embedded wallets
- **[Li.Fi](https://li.fi/)** — Cross-chain bridge aggregator

### Database & Backend

- **[Neon PostgreSQL](https://neon.tech/)** — Serverless Postgres database
- **[Drizzle ORM](https://orm.drizzle.team/)** — Type-safe database toolkit
- **[The Graph](https://thegraph.com/)** — Blockchain indexing & querying

### Analytics & Monitoring

- **[PostHog](https://posthog.com/)** — Product analytics & session replay
- **[Vercel Analytics](https://vercel.com/analytics)** — Performance monitoring

### Deployment

- **[Vercel](https://vercel.com/)** — Frontend hosting & edge functions
- **[Cloudflare](https://www.cloudflare.com/)** — DNS & Zero Trust authentication

---

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "^16.0.1",
    "react": "^19.2.0",
    "typescript": "^5.9.3",

    "@dynamic-labs/sdk-react-core": "^4.41.0",
    "@dynamic-labs/ethereum": "^4.41.0",
    "@dynamic-labs/wagmi-connector": "^4.41.0",

    "wagmi": "^2.19.2",
    "viem": "^2.38.6",
    "polkamarkets-js": "^3.2.0",

    "drizzle-orm": "^0.44.6",
    "@neondatabase/serverless": "^1.0.2",

    "@lifi/widget": "^3.33.1",
    "posthog-js": "^1.275.1",

    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.18",
    "lucide-react": "^0.544.0"
  }
}
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js 18+** (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm** (comes with Node.js)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/panzagianluca/predik.git
cd predik

# Install dependencies
npm install

# Set up environment variables
cp apps/app/.env.example apps/app/.env.local
# Edit .env.local with your API keys (see Environment Variables section)

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev        # Main app (port 3001)
npm run dev:web    # Marketing site (port 3000)
npm run dev:admin  # Admin panel (port 3002)
```

Visit:

- **Main app**: http://localhost:3001
- **Marketing**: http://localhost:3000
- **Admin**: http://localhost:3002

### Environment Variables

Create `apps/app/.env.local`:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Blockchain (BNB Smart Chain)
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_USDT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Smart Contracts (Myriad Protocol on BSC)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x39E66eE6b2ddaf4DEfDEd3038E0162180dbeF340
NEXT_PUBLIC_PREDICTION_MARKET_QUERIER=0x0e8E61e1E5B3E37F2E4Ed0f7F17B16df0E11cA4B

# Myriad API
NEXT_PUBLIC_MYRIAD_API_URL=https://api-v2.myriadprotocol.com
MYRIAD_API_KEY=your_api_key_here

# Dynamic (Wallet Authentication)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_env_id_here
DYNAMIC_API_KEY=your_api_key_here

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# The Graph (Subgraph)
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/your-id/predik-bsc/version/latest

# Optional: Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

---

## 📊 Database Schema

### Core Tables

**Users & Authentication**

- `users` — User profiles and wallet addresses
- `user_stats` — Trading statistics per user
- `email_verification_tokens` — Email verification for social logins

**Markets & Content**

- `market_metadata` — Spanish translations and featured markets
- `market_translations` — Multi-language support
- `saved_markets` — User bookmarks

**Social Features**

- `comments` — User comments on markets
- `comment_votes` — Upvote/downvote system
- `comment_reports` — Community moderation
- `notifications` — User notifications and announcements

**Community**

- `market_proposals` — User-requested markets
- `proposal_votes` — Voting on proposals

**Admin**

- `admin_actions` — Audit log for admin operations
- `banned_users` — Moderation enforcement

### Migrations

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

---

## 🎨 Design System

### Colors

```css
/* Primary */
--electric-purple: #a855f7;

/* Neutrals */
--slate-black: #1c1917;
--soft-white: #f9fafb;
```

### Typography

- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Responsive Sizing**: Tailwind's fluid typography
- **Language**: Spanish-first with English fallbacks

### Components

All UI components use **Shadcn UI** with custom theming:

- Consistent spacing scale
- Smooth transitions (0.5s easeInOut)
- Accessible ARIA labels
- Mobile-optimized touch targets

---

## 🔐 Authentication & Security

### User Authentication (Dynamic)

```typescript
// Users can connect with:
✅ Embedded wallets (email, Google, X)
✅ External wallets (MetaMask, WalletConnect)
✅ Multi-wallet support (link multiple wallets)
✅ Social login with Web3 fallback
```

### Admin Authentication (Cloudflare Zero Trust)

```typescript
// Admins access via:
✅ Email magic links
✅ Two-factor authentication (TOTP)
✅ IP allowlisting (optional)
✅ Audit logging for all actions
```

### Smart Contract Security

- **Non-custodial**: Users always control their funds
- **Audited contracts**: Polkamarkets protocol
- **Rate limiting**: Upstash Redis for API protection

---

## 📈 Analytics & Tracking

### PostHog Events

**Trading Activity**

- `trade_calculated` — User enters trade amount
- `trade_initiated` — User clicks trade button
- `trade_completed` — Successful transaction
- `trade_failed` — Transaction failed

**User Engagement**

- `market_clicked` — User views market details
- `outcome_clicked` — User explores outcome
- `market_saved` — User bookmarks market
- `comment_posted` — User posts comment

**Bridge & Deposits**

- `deposit_modal_opened` — User opens deposit flow
- `bridge_used` — User bridges funds
- `address_copied` — User copies wallet address

See [POSTHOG_ANALYTICS.md](./Docs/POSTHOG_ANALYTICS.md) for complete tracking guide.

---

## 🌉 Bridge Integration

Predik uses **Li.Fi** for seamless cross-chain deposits:

```typescript
// Users can bridge from:
- Ethereum
- Polygon
- Arbitrum
- Optimism
- Base
- And 20+ other chains
```

**To BNB Smart Chain with:**

- USDT (preferred)
- USDC (converted to USDT)
- Native tokens (swapped to USDT)

---

## 🔍 Subgraph Integration

The Graph subgraph indexes on-chain data for:

- User transaction history
- Open positions per market
- Trading volume statistics
- Portfolio performance metrics

**Deploy subgraph:**

```bash
cd subgraph
npm install
npm run codegen
npm run build
npm run deploy
```

See [subgraph/README.md](./subgraph/README.md) for detailed setup.

---

## 🚀 Deployment

### Vercel Configuration

**Project 1: Marketing Site**

```json
{
  "name": "predik-web",
  "rootDirectory": "apps/web",
  "framework": "nextjs",
  "domains": ["predik.io"]
}
```

**Project 2: Main App**

```json
{
  "name": "predik-app",
  "rootDirectory": "apps/app",
  "framework": "nextjs",
  "domains": ["app.predik.io"]
}
```

**Project 3: Admin Panel**

```json
{
  "name": "predik-admin",
  "rootDirectory": "apps/admin",
  "framework": "nextjs",
  "domains": ["backend.predik.io"]
}
```

### Build Commands

```bash
# Build all apps
npm run build

# Build specific app
npm run build:web
npm run build:app
npm run build:admin
```

### Environment Setup

1. **Vercel Dashboard** → Each project → Settings → Environment Variables
2. Add all variables from `.env.example`
3. Set for Production, Preview, and Development
4. Deploy from `main` branch

See [SETUP_GUIDE.md](./Docs/SETUP_GUIDE.md) for complete deployment guide.

---

## 📱 Mobile Support

### Responsive Breakpoints

```css
sm:   640px   /* Mobile landscape */
md:   768px   /* Tablet portrait */
lg:   1024px  /* Tablet landscape / Small desktop */
xl:   1280px  /* Desktop */
2xl:  1536px  /* Large desktop */
```

### Mobile Features

- **Bottom Navigation** — Persistent nav bar on mobile
- **Touch-Optimized** — 44px minimum touch targets
- **Swipe Gestures** — Native-feeling interactions
- **Mobile Trading Modal** — Full-screen trading on mobile
- **Adaptive Layout** — Components reorganize for small screens

---

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Test blockchain interactions (UI test page)
npm run dev:app
# Visit http://localhost:3001/uitest
```

---

## 📚 Documentation

### Main Docs

- [PROJECT_SPEC.md](./Docs/PROJECT_SPEC.md) — Project specification & architecture
- [MONOREPO_ARCHITECTURE.md](./Docs/MONOREPO_ARCHITECTURE.md) — Monorepo structure & decisions
- [SETUP_GUIDE.md](./Docs/SETUP_GUIDE.md) — Deployment & configuration guide
- [POSTHOG_ANALYTICS.md](./Docs/POSTHOG_ANALYTICS.md) — Analytics implementation

### Integration Guides

- [Polkamarkets-SDK.md](./Docs/Polkamarkets-SDK.md) — Smart contract integration
- [SUBGRAPH_INTEGRATION.md](./Docs/SUBGRAPH_INTEGRATION.md) — The Graph setup
- [POSTHOG_SETUP.md](./Docs/POSTHOG_SETUP.md) — Analytics configuration

### Feature Docs

- [SHARE_BUTTON_IMPLEMENTATION.md](./Docs/SHARE_BUTTON_IMPLEMENTATION.md) — Social sharing
- [CLAIM_WINNINGS_IMPLEMENTATION.md](./Docs/CLAIM_WINNINGS_IMPLEMENTATION.md) — Winnings flow
- [TWITTER_METRICS_SNAPSHOTS.md](./Docs/TWITTER_METRICS_SNAPSHOTS.md) — Social media cards

---

## 🤝 Contributing

### Development Workflow

1. **Create feature branch** from `main`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following our standards:

   - Read [Standards.instructions.md](.github/instructions/Standards.instructions.md)
   - Follow TypeScript strict mode
   - Use Shadcn UI components
   - Add PostHog tracking for new features
   - Update documentation

3. **Test thoroughly**

   - Test on BNB testnet first
   - Verify mobile responsiveness
   - Check wallet integration
   - Test with multiple wallets

4. **Submit PR** to `main`
   - Clear description of changes
   - Screenshots for UI changes
   - Reference any related issues

### Code Standards

**MUST READ FIRST:**

- [.github/instructions/Standards.instructions.md](.github/instructions/Standards.instructions.md)
- [.github/instructions/codacy.instructions.md](.github/instructions/codacy.instructions.md)

**Key Rules:**

- ✅ Get context before coding (list files, understand patterns)
- ✅ One file per response (no splits)
- ✅ Max 1600 lines per file
- ✅ Clean, modular, testable code
- ✅ Comment methods with docstrings
- ✅ Run Codacy analysis after edits
- ❌ No guesswork (ask clarifying questions)
- ❌ No renaming methods unnecessarily
- ❌ No translation key changes without approval

---

## 🐛 Troubleshooting

### Common Issues

**Build Fails: "Cannot find module '@predik/database'"**

```bash
# Install dependencies at root
npm install

# Build packages first
npm run build --workspace=packages/database
```

**Wallet Connection Issues**

```bash
# Check Dynamic environment ID
echo $NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID

# Verify chain ID matches BNB Chain (56)
echo $NEXT_PUBLIC_CHAIN_ID
```

**Database Connection Fails**

```bash
# Test connection
npm run db:studio

# Check DATABASE_URL format
# postgresql://user:pass@host:port/db?sslmode=require
```

**Trades Not Executing**

```bash
# Verify contract addresses
echo $NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS
echo $NEXT_PUBLIC_PREDICTION_MARKET_QUERIER

# Check user has USDT balance
# Check user is on BNB Chain (not testnet)
```

**PostHog Events Not Showing**

```bash
# Check browser console for PostHog logs
# Verify cookie consent was given
# Check ad blocker isn't blocking /ingest
```

---

## 📊 Project Status

### ✅ Completed Features

- [x] Monorepo architecture with 3 apps
- [x] Market discovery & browsing
- [x] Trading interface (buy/sell shares)
- [x] Dynamic wallet integration
- [x] Li.Fi bridge integration
- [x] Comment system with moderation
- [x] Market proposals & voting
- [x] User profiles & portfolios
- [x] Ranking system (holders & traders)
- [x] PostHog analytics
- [x] The Graph subgraph
- [x] Mobile-responsive design
- [x] Dark mode support
- [x] Spanish translations

### 🚧 In Progress

- [ ] Admin panel UI completion
- [ ] Cloudflare Zero Trust setup
- [ ] Custom domain configuration
- [ ] Notification system (backend)
- [ ] Market resolution tracking

### 📋 Planned Features

- [ ] Price alerts
- [ ] Liquidity provider interface
- [ ] Advanced portfolio analytics
- [ ] Social features (follow users)
- [ ] Market creation (verified users)
- [ ] Mobile app (React Native)

---

## 📞 Support & Community

### Links

- **Website**: [predik.io](https://predik.io)
- **App**: [app.predik.io](https://app.predik.io)
- **Twitter**: [@predik_io](https://twitter.com/predik_io)
- **Telegram**: [t.me/predik_official](https://t.me/predik_official)
- **Documentation**: [docs.predik.io](https://docs.predik.io)

### Contact

- **Email**: hello@predik.io
- **Support**: support@predik.io
- **Admin**: admin@predik.io

---

## 📄 License

This project is proprietary software. All rights reserved.

See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:

- **[Myriad Protocol](https://myriadprotocol.com/)** — Prediction market infrastructure
- **[Polkamarkets](https://www.polkamarkets.com/)** — Smart contract framework
- **[Dynamic](https://www.dynamic.xyz/)** — Wallet authentication
- **[Shadcn UI](https://ui.shadcn.com/)** — Component library
- **[Vercel](https://vercel.com/)** — Deployment platform

Special thanks to the BNB Chain and Web3 community.

---

<div align="center">

**Made with ❤️ for Latin America**

[Website](https://predik.io) • [Twitter](https://twitter.com/predik_io) • [Telegram](https://t.me/predik_official)

</div>
