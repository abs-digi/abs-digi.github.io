import {
  parseCnbcQuote,
  parseCoinbase,
  parseCoinGeckoRow,
  parseFinnhub,
  directionOf,
  formatPrice,
  formatPct,
  formatWhen,
} from "./quotes.js";

const KEY = "markets.finnhubKey";
const STOCK_MS = 45000;
const CRYPTO_POLL_MS = 8000;
const COINGECKO_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  LTC: "litecoin",
  LINK: "chainlink",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  BCH: "bitcoin-cash",
  SHIB: "shiba-inu",
};

const WATCH_STOCKS = [
  ["SPCX", "Space Exploration Technologies"],
  ["T", "AT&T"],
  ["SO", "Southern Company"],
  ["F", "Ford"],
  ["HPQ", "HP"],
  ["AMD", "Advanced Micro Devices"],
  ["ABT", "Abbott Laboratories"],
  ["WMT", "Walmart"],
  ["GOOGL", "Alphabet"],
  ["MSI", "Motorola Solutions"],
  ["NVDA", "NVIDIA"],
  ["ANT", "Anthropic"],
].map(([symbol, name]) => ({ symbol, name }));

const MARKET_STOCKS = [
  ["AAPL", "Apple"],
  ["MSFT", "Microsoft"],
  ["AMZN", "Amazon"],
  ["META", "Meta"],
  ["TSLA", "Tesla"],
  ["SPY", "S&P 500 ETF"],
  ["QQQ", "Nasdaq 100 ETF"],
  ["DIA", "Dow Jones ETF"],
].map(([symbol, name]) => ({ symbol, name }));

const WATCH_CRYPTO = [
  ["BTC", "Bitcoin"],
  ["ETH", "Ethereum"],
  ["SOL", "Solana"],
  ["XRP", "XRP"],
  ["DOGE", "Dogecoin"],
  ["ADA", "Cardano"],
].map(asCoin);

const MARKET_CRYPTO = [
  ["LTC", "Litecoin"],
  ["LINK", "Chainlink"],
  ["AVAX", "Avalanche"],
  ["DOT", "Polkadot"],
  ["BCH", "Bitcoin Cash"],
  ["SHIB", "Shiba Inu"],
].map(asCoin);

function asCoin([symbol, name]) {
  return { symbol, name, product: symbol + "-USD", id: COINGECKO_IDS[symbol] };
}

const STOCKS = [...WATCH_STOCKS, ...MARKET_STOCKS];
const CRYPTO = [...WATCH_CRYPTO, ...MARKET_CRYPTO];
const SECTIONS = [
  {
    label: "Watchlist",
    stocks: WATCH_STOCKS,
    crypto: WATCH_CRYPTO,
    stockHost: "watch-stock-cards",
    cryptoHost: "watch-crypto-cards",
  },
  {
    label: "Market",
    stocks: MARKET_STOCKS,
    crypto: MARKET_CRYPTO,
    stockHost: "market-stock-cards",
    cryptoHost: "market-crypto-cards",
  },
];

const byProduct = new Map(CRYPTO.map((coin) => [coin.product, coin]));
const refs = new Map();
const stockState = {};
const cryptoState = {};
const feed = {
  stock: { updatedAt: 0, source: "", state: "loading", note: "Loading quotes…", degraded: false },
  crypto: { updatedAt: 0, source: "", state: "loading", note: "Connecting to Coinbase…", degraded: false },
};

let memoryKey = "";
let stockTimer = null;
let stockInFlight = false;
let pollTimer = null;
let ws = null;
let wsAlive = false;
let wantWs = true;
let backoff = 1000;
let reconnectTimer = null;
let connectTimer = null;
let geckoAt = 0;
let tapeReady = false;

function readKey() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored != null) return stored.trim();
  } catch {
    /* private mode or blocked storage */
  }
  return memoryKey;
}

function writeKey(value) {
  memoryKey = value;
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {
    /* keep the in-memory copy for this tab */
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function arrow(dir) {
  if (dir === "up") return "▲";
  if (dir === "down") return "▼";
  return "–";
}

function ageText(ts) {
  if (!ts) return "";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 2) return "just now";
  if (s < 60) return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  return Math.floor(m / 60) + "h ago";
}

function paintStatus(which) {
  const f = feed[which];
  const dot = document.getElementById(which + "-dot");
  const text = document.getElementById(which + "-status");
  if (!dot || !text) return;
  dot.dataset.state =
    f.state === "bad" ? "bad" : f.state === "loading" ? "wait" : f.degraded || f.state === "stale" ? "poll" : "live";
  if (f.state === "loading") {
    text.textContent = f.note || "Loading quotes…";
    return;
  }
  if (f.state === "bad") {
    text.textContent = f.note || "Data unavailable";
    return;
  }
  const parts = [];
  if (f.state === "live") parts.push("Live");
  else if (f.state === "stale") parts.push("Showing last quote");
  else parts.push("Updated");
  if (f.source) parts.push(f.source);
  if (f.updatedAt) {
    parts.push(formatWhen(new Date(f.updatedAt)));
    parts.push(ageText(f.updatedAt));
  }
  if (f.note) parts.push(f.note);
  text.textContent = parts.join(" · ");
}

function paintMeta(node, meta) {
  node.replaceChildren();
  const bits = String(meta || "").split(" · ").filter(Boolean);
  for (const bit of bits) {
    const span = document.createElement("span");
    span.className = "meta-bit";
    span.textContent = bit;
    node.append(span);
  }
}

function paintQuote(ref, quote) {
  if (!ref) return;
  if (!quote || quote.unavailable) {
    ref.card.dataset.dir = "flat";
    ref.price.className = "price bad";
    ref.price.textContent = "Data unavailable";
    ref.delta.className = "delta flat";
    ref.amt.textContent = "";
    ref.pct.textContent = "";
    paintMeta(ref.meta, "No quote from the feed");
    for (const tape of ref.tapes) {
      tape.row.dataset.dir = "flat";
      tape.px.textContent = "n/a";
      tape.chg.textContent = "";
    }
    return;
  }
  const dir = directionOf(quote.change, quote.pct);
  ref.card.dataset.dir = dir;
  ref.price.className = "price";
  ref.price.textContent = formatPrice(quote.price);
  ref.delta.className = "delta " + dir;
  ref.amt.textContent = quote.change == null ? "" : arrow(dir) + " " + formatPrice(Math.abs(quote.change));
  ref.pct.textContent = quote.pct == null ? "—" : formatPct(quote.pct);
  if (quote.name) ref.name.textContent = quote.name;
  paintMeta(ref.meta, quote.meta);
  for (const tape of ref.tapes) {
    tape.row.dataset.dir = dir;
    tape.px.textContent = formatPrice(quote.price);
    tape.chg.textContent = quote.pct == null ? "" : formatPct(quote.pct);
  }
}

function buildCard(item) {
  const card = el("article", "card");
  card.dataset.symbol = item.symbol;
  card.dataset.dir = "flat";
  const head = el("div", "card-head");
  head.append(el("p", "symbol", item.symbol), el("p", "name", item.name));
  const price = el("p", "price loading", "…");
  const delta = el("p", "delta flat");
  const amt = el("span", "amt");
  const pct = el("span", "pct");
  delta.append(amt, pct);
  const meta = el("p", "meta", "Waiting for the feed");
  card.append(head, price, delta, meta);
  return { card, name: head.querySelector(".name"), price, delta, amt, pct, meta, tapes: [] };
}

function buildTapeItem(symbol) {
  const row = el("span", "tape-item");
  row.dataset.dir = "flat";
  const px = el("span", "tape-px", "…");
  const chg = el("span", "tape-chg");
  row.append(el("span", "tape-sym", symbol), px, chg);
  return { row, px, chg };
}

function buildBoard() {
  const groups = [document.getElementById("tape-a"), document.getElementById("tape-b")];
  for (const section of SECTIONS) {
    const stockHost = document.getElementById(section.stockHost);
    const cryptoHost = document.getElementById(section.cryptoHost);
    for (const item of section.stocks) {
      const ref = buildCard(item);
      stockHost.append(ref.card);
      refs.set(item.symbol, ref);
    }
    for (const item of section.crypto) {
      const ref = buildCard(item);
      cryptoHost.append(ref.card);
      refs.set(item.symbol, ref);
    }
  }
  for (const group of groups) {
    for (const section of SECTIONS) {
      group.append(el("span", "tape-label", section.label));
      for (const item of [...section.stocks, ...section.crypto]) {
        const tape = buildTapeItem(item.symbol);
        group.append(tape.row);
        refs.get(item.symbol).tapes.push(tape);
      }
    }
  }
}

function markTapeReady() {
  if (tapeReady) return;
  tapeReady = true;
  document.getElementById("tape-track").classList.add("run");
}

function anyGood(state) {
  return Object.values(state).some((q) => q && !q.unavailable && Number.isFinite(q.price) && q.price > 0);
}

function cnbcUrl() {
  const symbols = STOCKS.map((s) => s.symbol).join("|");
  return (
    "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=" +
    symbols +
    "&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1"
  );
}

async function fetchCnbc() {
  const res = await fetch(cnbcUrl(), {
    cache: "no-store",
    credentials: "omit",
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error("CNBC HTTP " + res.status);
  const data = await res.json();
  const raw = data && data.FormattedQuoteResult && data.FormattedQuoteResult.FormattedQuote;
  const list = !raw ? [] : Array.isArray(raw) ? raw : [raw];
  if (!list.length) throw new Error("CNBC returned no quotes");
  const map = new Map();
  for (const row of list) {
    if (!row || !row.symbol) continue;
    const parsed = parseCnbcQuote(row);
    if (parsed) map.set(row.symbol, parsed);
  }
  return map;
}

async function fetchFinnhub(key, items) {
  const map = new Map();
  await Promise.all(
    items.map(async (item) => {
      try {
        const url =
          "https://finnhub.io/api/v1/quote?symbol=" +
          encodeURIComponent(item.symbol) +
          "&token=" +
          encodeURIComponent(key);
        const res = await fetch(url, {
          cache: "no-store",
          credentials: "omit",
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) return;
        const parsed = parseFinnhub(await res.json(), item.name);
        if (parsed) map.set(item.symbol, parsed);
      } catch {
        /* leave the symbol missing */
      }
    })
  );
  return map;
}

function applyStock(symbol, quote, authoritative) {
  if (!quote) {
    if (!authoritative && stockState[symbol] && !stockState[symbol].unavailable) return;
    stockState[symbol] = { unavailable: true };
  } else {
    stockState[symbol] = quote;
  }
  paintQuote(refs.get(symbol), stockState[symbol]);
  if (quote) markTapeReady();
}

async function fetchStocks() {
  if (stockInFlight) return;
  stockInFlight = true;
  try {
    let quotes = null;
    let source = "CNBC";
    let authoritative = false;
    try {
      quotes = await fetchCnbc();
      authoritative = true;
    } catch {
      quotes = null;
    }
    if (!quotes || quotes.size === 0) {
      const key = readKey();
      if (key) {
        quotes = await fetchFinnhub(key, STOCKS);
        source = "Finnhub";
        authoritative = true;
      }
    } else {
      const missing = STOCKS.filter((s) => !quotes.has(s.symbol));
      const key = readKey();
      if (missing.length && key) {
        const extra = await fetchFinnhub(key, missing);
        extra.forEach((value, symbol) => quotes.set(symbol, value));
        if ([...quotes.values()].every((q) => (q.meta || "").startsWith("Finnhub"))) source = "Finnhub";
        else if (extra.size) source = "CNBC + Finnhub";
      }
    }
    if (!quotes || quotes.size === 0) {
      if (anyGood(stockState)) {
        feed.stock.state = "stale";
        feed.stock.note = "Refresh failed";
      } else {
        feed.stock.state = "bad";
        feed.stock.note = readKey()
          ? "Data unavailable"
          : "Data unavailable. A Finnhub key in Settings is used only when the public feed fails.";
        for (const item of STOCKS) applyStock(item.symbol, null, true);
      }
      paintStatus("stock");
      return;
    }
    let live = 0;
    for (const item of STOCKS) {
      const quote = quotes.get(item.symbol) || null;
      if (quote) live += 1;
      applyStock(item.symbol, quote, authoritative);
    }
    feed.stock.updatedAt = Date.now();
    feed.stock.source = source;
    feed.stock.degraded = source !== "CNBC";
    feed.stock.state = "poll";
    feed.stock.note = live < STOCKS.length ? STOCKS.length - live + " unavailable" : "";
    paintStatus("stock");
  } finally {
    stockInFlight = false;
  }
}

function shouldApplyCrypto(symbol, feedName) {
  const prev = cryptoState[symbol];
  if (!prev || prev.unavailable) return true;
  if (feedName === "ws") return true;
  if (wsAlive && prev.feed === "ws") return false;
  if (feedName === "coingecko" && (prev.feed === "ws" || prev.feed === "coinbase-rest")) return false;
  return true;
}

function applyCrypto(symbol, quote, feedName) {
  if (!shouldApplyCrypto(symbol, feedName)) return;
  cryptoState[symbol] = { ...quote, feed: feedName, unavailable: false };
  if (feedName === "ws") {
    feed.crypto.state = "live";
    feed.crypto.degraded = false;
    feed.crypto.source = "Coinbase";
    feed.crypto.note = "";
  } else if (!wsAlive) {
    feed.crypto.state = "poll";
    feed.crypto.note = "";
    if (feedName === "coinbase-rest") {
      feed.crypto.degraded = false;
      feed.crypto.source = "Coinbase";
    } else if (feed.crypto.source !== "Coinbase") {
      feed.crypto.degraded = true;
      feed.crypto.source = "CoinGecko";
    }
  }
  feed.crypto.updatedAt = Date.now();
  paintQuote(refs.get(symbol), cryptoState[symbol]);
  paintStatus("crypto");
  markTapeReady();
}

function markCryptoUnavailable(symbol) {
  if (cryptoState[symbol] && !cryptoState[symbol].unavailable) return;
  cryptoState[symbol] = { unavailable: true };
  paintQuote(refs.get(symbol), cryptoState[symbol]);
}

async function fetchCoinbaseStats() {
  let any = false;
  await Promise.all(
    CRYPTO.map(async (coin) => {
      try {
        const res = await fetch("https://api.exchange.coinbase.com/products/" + coin.product + "/stats", {
          cache: "no-store",
          credentials: "omit",
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return;
        const quote = parseCoinbase(await res.json(), coin.name);
        if (!quote) return;
        any = true;
        applyCrypto(coin.symbol, quote, "coinbase-rest");
      } catch {
        /* try the other coins, then the fallback feed */
      }
    })
  );
  return any;
}

function missingCoins() {
  return CRYPTO.filter((coin) => {
    const quote = cryptoState[coin.symbol];
    return !quote || quote.unavailable || !(quote.price > 0);
  });
}

async function fetchCoinGecko(coins) {
  const list = coins && coins.length ? coins : CRYPTO;
  const ids = list.map((coin) => coin.id).join(",");
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
    ids +
    "&vs_currencies=usd&include_24hr_change=true";
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "omit",
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return false;
  const data = await res.json();
  let any = false;
  for (const coin of list) {
    const quote = parseCoinGeckoRow(data[coin.id], coin.name);
    if (!quote) continue;
    any = true;
    applyCrypto(coin.symbol, quote, "coingecko");
  }
  if (any) geckoAt = Date.now();
  return any;
}

async function fillCryptoGaps() {
  const missing = missingCoins();
  if (!missing.length) return false;
  if (Date.now() - geckoAt < 25000 && missing.every((coin) => cryptoState[coin.symbol]?.feed === "coingecko")) {
    return false;
  }
  return fetchCoinGecko(missing);
}

async function pollCrypto() {
  if (wsAlive) return;
  const ok = await fetchCoinbaseStats();
  if (wsAlive) return;
  const geckoOk = missingCoins().length ? await fillCryptoGaps() : false;
  if ((ok || geckoOk) && feed.crypto.state !== "bad") return;
  if (!anyGood(cryptoState)) {
    feed.crypto.state = "bad";
    feed.crypto.note = "Data unavailable";
    paintStatus("crypto");
  } else if (!ok && !geckoOk) {
    feed.crypto.state = "stale";
    feed.crypto.note = "Refresh failed";
    paintStatus("crypto");
  }
}

function startPolling() {
  if (pollTimer || wsAlive) return;
  pollCrypto();
  pollTimer = setInterval(pollCrypto, CRYPTO_POLL_MS);
}

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

function scheduleReconnect() {
  if (reconnectTimer || !wantWs) return;
  const delay = backoff;
  backoff = Math.min(backoff * 2, 20000);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWs();
  }, delay);
}

function noteWsAlive() {
  if (!wsAlive) stopPolling();
  wsAlive = true;
  backoff = 1000;
  if (connectTimer) {
    clearTimeout(connectTimer);
    connectTimer = null;
  }
}

function handleWsMessage(raw) {
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  if (!msg || msg.type === "error") {
    if (ws) ws.close();
    return;
  }
  if (msg.type !== "ticker") return;
  const coin = byProduct.get(msg.product_id);
  if (!coin) return;
  const quote = parseCoinbase({ last: msg.price, open: msg.open_24h }, coin.name);
  if (!quote) return;
  noteWsAlive();
  applyCrypto(coin.symbol, quote, "ws");
}

function connectWs() {
  if (!wantWs || document.hidden) return;
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;
  let socket;
  try {
    socket = new WebSocket("wss://ws-feed.exchange.coinbase.com");
  } catch {
    startPolling();
    scheduleReconnect();
    return;
  }
  ws = socket;
  if (connectTimer) clearTimeout(connectTimer);
  connectTimer = setTimeout(() => {
    if (!wsAlive) startPolling();
  }, 8000);
  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        type: "subscribe",
        product_ids: CRYPTO.map((coin) => coin.product),
        channels: ["ticker"],
      })
    );
  };
  socket.onmessage = (ev) => {
    try {
      handleWsMessage(ev.data);
    } catch {
      /* ignore a bad frame */
    }
  };
  socket.onerror = () => {};
  socket.onclose = () => {
    if (ws === socket) ws = null;
    wsAlive = false;
    if (connectTimer) {
      clearTimeout(connectTimer);
      connectTimer = null;
    }
    if (!wantWs || document.hidden) return;
    startPolling();
    scheduleReconnect();
  };
}

function closeWs() {
  wantWs = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (connectTimer) {
    clearTimeout(connectTimer);
    connectTimer = null;
  }
  if (ws) {
    const socket = ws;
    ws = null;
    socket.onclose = null;
    socket.close();
  }
  wsAlive = false;
}

function startStockTimer() {
  if (stockTimer) return;
  stockTimer = setInterval(fetchStocks, STOCK_MS);
}

function stopStockTimer() {
  if (stockTimer) clearInterval(stockTimer);
  stockTimer = null;
}

function armCryptoWatchdog() {
  setTimeout(async () => {
    await fillCryptoGaps();
    let good = 0;
    for (const coin of CRYPTO) {
      const quote = cryptoState[coin.symbol];
      if (quote && !quote.unavailable && Number.isFinite(quote.price)) good += 1;
      else markCryptoUnavailable(coin.symbol);
    }
    if (good === 0 && feed.crypto.state !== "live") {
      feed.crypto.state = "bad";
      feed.crypto.note = "Data unavailable";
      paintStatus("crypto");
    } else if (good < CRYPTO.length && feed.crypto.state !== "loading") {
      feed.crypto.note = CRYPTO.length - good + " unavailable";
      paintStatus("crypto");
    }
  }, 12000);
}

function syncKeyState() {
  const node = document.getElementById("key-state");
  if (!node) return;
  node.textContent = readKey()
    ? "A Finnhub key is saved in this browser. It is sent only to finnhub.io, and only if CNBC does not return a quote."
    : "No Finnhub key saved. Equities use the public CNBC feed.";
}

function closeDialog() {
  const dialog = document.getElementById("settings");
  if (typeof dialog.close === "function") dialog.close();
  dialog.removeAttribute("open");
}

function wireSettings() {
  const dialog = document.getElementById("settings");
  const input = document.getElementById("finnhub-key");
  document.getElementById("open-settings").addEventListener("click", () => {
    input.value = readKey();
    syncKeyState();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });
  document.getElementById("settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    writeKey(input.value.trim());
    syncKeyState();
    closeDialog();
    fetchStocks();
  });
  document.getElementById("clear-key").addEventListener("click", () => {
    writeKey("");
    input.value = "";
    syncKeyState();
    fetchStocks();
  });
  document.getElementById("close-settings").addEventListener("click", closeDialog);
  document.getElementById("show-key").addEventListener("change", (event) => {
    input.type = event.target.checked ? "text" : "password";
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  document.getElementById("refresh").addEventListener("click", () => {
    fetchStocks();
    if (!wsAlive) pollCrypto();
  });
}

function wireVisibility() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      closeWs();
      stopPolling();
      stopStockTimer();
      return;
    }
    wantWs = true;
    backoff = 1000;
    fetchStocks();
    startStockTimer();
    pollCrypto();
    connectWs();
  });
}

function init() {
  buildBoard();
  syncKeyState();
  const clock = document.getElementById("clock");
  const tick = () => {
    clock.textContent = formatWhen(new Date());
    paintStatus("stock");
    paintStatus("crypto");
  };
  tick();
  setInterval(tick, 1000);
  wireSettings();
  wireVisibility();
  fetchStocks();
  startStockTimer();
  fetchCoinbaseStats().then(() => fillCryptoGaps());
  connectWs();
  armCryptoWatchdog();
}

try {
  init();
} catch (err) {
  const banner = document.getElementById("boot-error");
  if (banner) banner.hidden = false;
  console.warn(err);
}
