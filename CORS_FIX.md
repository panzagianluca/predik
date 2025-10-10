# CORS Fix: Myriad API Proxy

## Problem
The Myriad API doesn't set CORS headers, so direct browser requests from `localhost:3000` are blocked:
```
Access-Control-Allow-Origin header is present on the requested resource
```

## Solution
We've created Next.js API routes that act as a **server-side proxy**:

### API Routes Created:

1. **`/api/markets`** - Fetch all markets
   - Proxies to: `https://api-v1.staging.myriadprotocol.com/markets`
   - Supports query params: `state`, `token`, `network_id`
   - Includes caching (60s)

2. **`/api/markets/[slug]`** - Fetch single market
   - Proxies to: `https://api-v1.staging.myriadprotocol.com/markets/:slug`
   - Includes caching (30s)

### How It Works:

```
Browser (Client)  →  Next.js API Route (Server)  →  Myriad API
    ↓                         ↓                          ↓
 No CORS issue!      Fetches from server         Returns data
```

**Server-to-server** requests don't have CORS restrictions! ✅

### Updated Files:

- `app/api/markets/route.ts` - Market list endpoint
- `app/api/markets/[slug]/route.ts` - Single market endpoint  
- `lib/myriad/api.ts` - Now calls `/api/markets` instead of direct API

### Benefits:

1. ✅ **No CORS errors** - Server-side requests bypass CORS
2. ✅ **Caching** - Reduces API calls with Next.js cache
3. ✅ **Error handling** - Better error messages
4. ✅ **Security** - Can add auth/rate limiting if needed

### Testing:

Visit http://localhost:3000/uitest and you should now see markets loading! 🎉

If you want to test the API directly:
- http://localhost:3000/api/markets?network_id=11142220&state=open
- http://localhost:3000/api/markets/[any-market-slug]
