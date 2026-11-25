# abs-digi.github.io

Static market tape for GitHub Pages. `index.html` is served from the repository root on the default branch. There is no build step and no server.

## What it shows

- **Equities:** SPCX, T, SO, F, HPQ, AMD, ABT, WMT, GOOGL, MSI, NVDA, ANT — last price, change, and percent change (green up, red down).
- **Crypto:** BTC, ETH, SOL, XRP, DOGE, ADA — price and 24-hour percent change.

A scrolling tape sits above a card grid. The page prints a number only when a feed returns it. If a symbol is missing, that card says **Data unavailable**.

## Data sources

| Feed | Source | When it updates |
| --- | --- | --- |
| Equities | [CNBC public quote feed](https://quote.cnbc.com) (no key, CORS open) | about every 45 seconds |
| Equities backup | [Finnhub](https://finnhub.io) `/quote`, only if you save a key in Settings | same cadence, and only for symbols CNBC did not return |
| Crypto | [Coinbase Exchange](https://docs.cdp.coinbase.com/exchange/websocket-feed/overview) ticker websocket, seeded from the public product stats endpoint | live |
| Crypto backup | Coinbase stats about every 8 seconds, then [CoinGecko](https://docs.coingecko.com/v3.0.1/reference/simple-price) simple price | 8s / ~30s |

The optional Finnhub key is stored in `localStorage` as `markets.finnhubKey`. It is sent only to `finnhub.io`. Do not commit a key.

## Local preview

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/`. Fetching the file directly (`file://`) will not load quotes, because the browser blocks those API calls.

## GitHub Pages

This is a user site (`abs-digi.github.io`). In the repository Pages settings, deploy from the default branch and the root folder (`/`). `.nojekyll` keeps Jekyll from processing the site.
