# Myriad Protocol Developer Documentation - V2

# Myriad Protocol API Reference

This document describes the public REST API exposed by the Myriad Protocol API service.

Base URL examples:

- Staging: Coming soon
- Production: [`https://api-v2.myriadprotocol.com/`](https://api-v2.myriadprotocol.com/)

## Authentication

All endpoints (except health) require an API key.

- Header: `x-api-key: <your_api_key>`
- Or Query: `?api_key=<your_api_key>`

To obtain an API key, please reach out to the Myriad team.

## Rate Limiting

- 5 requests/second per IP and/or API key.
- Headers included on responses:
    - `X-RateLimit-Limit`
    - `X-RateLimit-Remaining`
    - `X-RateLimit-Reset`

## Pagination

All list endpoints support pagination:

- `page` (default: 1)
- `limit` (default: 20, max: 100)

Response pagination object:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 123,
    "totalPages": 7,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Questions

A question is the canonical proposition (title + expiration), independent of where it’s traded. The same question can have multiple markets across different chains, each with its own liquidity, prices, and activity. 

Questions endpoints return the question with all its markets and a marketCount, letting clients compare performance across chains and build cross‑chain summaries, while trading/price data remains per‑market.

### GET /questions

Paginated list of questions with associated markets and outcome summaries.

Query params:

- `page`, `limit`
- `keyword`: search in question title
- `min_markets`: minimum number of linked markets
- `max_markets`: maximum number of linked markets

Example:

```
GET /questions?keyword=politics&page=2&limit=20&min_markets=2&max_markets=10

```

Response data (per question):

- `id`, `title`, `expiresAt`
- `marketCount`: number of linked markets
- `markets`: array of markets with:
    - `id` (blockchain market id), `slug`, `title`, `description`, `state`, `networkId`
    - `liquidity`, `volume`, `volume24h`, `imageUrl`, `expiresAt`, `topics`
    - `outcomes`: array with summary per outcome: `id`, `title`, `price`, `shares`

---

### GET /questions/:id

Get a single question with markets and outcomes.

Example:

```
GET /questions/1

```

Response (selected fields):

- `id`, `title`, `expiresAt`
- `markets`: array of markets with:
    - `id` (blockchain market id), `slug`, `title`, `description`, `state`, `networkId`
    - `liquidity`, `volume`, `volume24h`, `shares`, `imageUrl`, `expiresAt`, `topics`, `fees`
    - `outcomes`: array with `id`, `title`, `price`, `shares`, `imageUrl`

---

## Markets

### GET /markets

Paginated list of markets with filtering and sorting.

Query params:

- `page`, `limit` (pagination)
- `sort`: `volume` | `volume_24h` | `liquidity` | `expires_at` | `published_at` (default: `volume`)
- `order`: `asc` | `desc` (default: `desc`)
- `network_id`: number
- `state`: `open` | `closed` | `resolved`
- `token_address`: string
- `topics`: comma-separated list of topics
- `keyword`: full-text search across `title`, `description`, and outcome titles

Example:

```
GET /markets?keyword=eth&network_id=2741&page=1&limit=20&sort=volume_24h

```

Response data (per market):

- `id`: blockchain market id
- `networkId`: number
- `slug`, `title`, `description`
- `expiresAt`, `publishedAt`
- `fees`, `state`, `topics`, `resolutionSource`, `resolutionTitle`
- `tokenAddress`, `imageUrl`
- `liquidity`, `liquidityPrice`, `volume`, `volume24h`, `shares`
- `outcomes`: with numeric `id` (blockchain outcome id), `title`, `price`, `shares`, `sharesHeld`, etc.

Notes:

- Numeric monetary/decimal fields are returned as numbers.

---

### GET /markets/:id

Get a single market by slug or by `marketId + network_id`.

Modes:

- By slug: `GET /markets/{slug}`
- By id + network: `GET /markets/{marketId}?network_id=2741`

Price charts:

- Field `outcomes[*].price_charts`.
- Timeframes and buckets
    - `24h`: 5-minute (max 288)
    - `7d`: 30-minute (max 336)
    - `30d`: 4-hour (max 180)
    - `all`: 4-hour
- Series end at `min(now, expiresAt)` with backfill from the last known price before the window start.

Example:

```
GET /markets/164?network_id=2741

```

---

### GET /markets/:id/events

Paginated actions (trades/liquidity/claims) for a market, ordered by `timestamp desc`.

Lookup:

- By slug: `GET /markets/{slug}/events`
- By id + network: `GET /markets/{marketId}/events?network_id=2741`

Query params:

- `page`, `limit`
- `since`: unix seconds (inclusive)
- `until`: unix seconds (inclusive)

Response items:

- `user`: wallet address
- `action`: `buy` | `sell` | `add_liquidity` | `remove_liquidity` | `claim_winnings` | `claim_liquidity` | `claim_fees` | `claim_voided`
- `marketTitle`, `marketSlug`, `marketId`, `networkId`
- `outcomeTitle`, `outcomeId`
- `imageUrl`
- `shares`, `value`: numbers
- `timestamp`: unix seconds
- `blockNumber`: number
- `token`: ERC20 token address used for this market

Example:

```
GET /markets/164/events?network_id=2741&since=1755600000&until=1755800000&page=1&limit=50

```

---

### GET /markets/:id/holders

Market holders grouped by outcome. Aggregates buy/sell actions to compute net shares per user for each outcome, filters holders with at least 1 share, orders by shares, and applies the `limit` per outcome.

Lookup:

- By slug: `GET /markets/{slug}/holders`
- By id + network: `GET /markets/{marketId}/holders?network_id=2741`

Query params:

- `page`, `limit` (pagination; limit applies per outcome)
- `network_id` (required when using marketId)

Response data (per outcome):

- `outcomeId`: number
- `outcomeTitle`: string | null
- `totalHolders`: total addresses with ≥ 1 share in this outcome
- `holders`: array limited per outcome with:
    - `user`: address
    - `shares`: number

Pagination notes:

- `total` equals the maximum `total_holders` across outcomes for this market.
- `totalPages = ceil(max(total_holders) / limit)`; `limit` is applied per outcome.

Example:

```
GET /markets/164/holders?network_id=2741&page=1&limit=50
```

---

## Users

### GET /users/:address/events

Paginated actions for a user across markets, ordered by `timestamp desc`.

Query params:

- `page`, `limit`
- `marketId`: chain market id (optional)
- `networkId`: number (optional)
- `since`: unix seconds (inclusive)
- `until`: unix seconds (inclusive)

Response items:

- `user`: wallet address
- `action`: action type
- `marketTitle`, `marketSlug`, `marketId`, `networkId`
- `outcomeTitle`, `outcomeId`
- `imageUrl`
- `shares`, `value`: numbers
- `timestamp`: unix seconds
- `blockNumber`: number
- `token`: ERC20 token address

Example:

```
GET /users/0x1234.../events?network_id=2741&market_id=144&page=1&limit=50

```

---

### GET /users/:address/portfolio

Aggregated user positions per market/outcome/network, ordered by latest activity.

Query params:

- `page`, `limit`
- `market_id`: chain market id (optional)
- `network_id`: number (optional)
- `token_address`: ERC20 token address (optional)

Notes:

- Positions with `shares < 1` are excluded.
- Pagination and totals are computed after filtering.
- `price` is the current outcome price; `shares` is net buys minus sells; average buy price follows proportional cost-basis when selling.

Response items:

- `marketId`, `outcomeId`, `networkId`
- `shares`: net shares held (number)
- `price`: average buy price (number)
- `value`: `shares * currentPrice`
- `profit`: `shares * (currentPrice - price)`
- `roi`: `(profit - totalAmount) / totalAmount` (null if not computable)
- `winningsToClaim`: true if resolved, holding winning outcome, and no `claim_winnings`
- `winningsClaimed`: true if resolved, holding winning outcome, and `claim_winnings` exists

Example:

```
GET /users/0x1234.../portfolio?network_id=2741&token_address=0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1&page=1&limit=20
```

---

## Price Data

- Historical price data is built from on-chain events (`MarketOutcomeShares`) and stored in `prices`.
- Outcome prices are derived from outcome shares.
- Liquidity price computation follows the contract logic; resolved markets use final shares/liquidity, otherwise `#outcomes / (liquidity * Σ(1/shares))`.

---

## Errors

Common errors:

- `401 Unauthorized` – missing/invalid API key
- `429 Too Many Requests` – rate limit exceeded
- `400 Bad Request` – invalid query parameters
- `404 Not Found` – resource not found
- `500 Internal Server Error`

## Changelog

### **V2.0**

- Added API key authentication and request logging
- Added rate limiting
- Markets endpoints with keyword search and charts
- Market events and user events endpoints with timestamp filtering
- Historical prices ingestion + charting

