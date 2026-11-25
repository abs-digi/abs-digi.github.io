/* Pure quote parsing. Callers may render a number only when these return one. */

const SESSION_LABEL = {
  REG_MKT: "Open",
  PRE_MKT: "Pre-market",
  POST_MKT: "After hours",
  CLOSED: "Closed",
};

export function parseSigned(raw) {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s || s === "-" || s === "—" || s === "–" || /^n\/?a$/i.test(s)) return null;
  if (/^unch/i.test(s)) return 0;
  s = s.replace(/[$,%]/g, "").replace(/−/g, "-").replace(/^\+/, "").replace(/,/g, "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function finiteOrNull(raw) {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function quoteFromParts(q, src, sessionCode, extended) {
  const price = parseSigned(src && src.last);
  if (price == null || price <= 0) return null;
  let change = parseSigned(src.change);
  let pct = parseSigned(src.change_pct);
  const prev = parseSigned(q.previous_day_closing);
  if (change == null && prev != null) change = price - prev;
  if (pct == null && change != null && prev) pct = (change / prev) * 100;
  const session = SESSION_LABEL[extended ? src.type || sessionCode : sessionCode] || "Quote";
  const bits = [q.exchange, session, src.last_timedate || q.last_timedate];
  if (String(q.realTime).toLowerCase() === "false") bits.push("Delayed");
  const vol = src.volume_alt || src.volume;
  if (vol != null && String(vol).trim() && String(vol) !== "0") bits.push("Vol " + vol);
  return {
    unavailable: false,
    name: q.name || q.shortName || "",
    price,
    change,
    pct,
    meta: bits.filter(Boolean).join(" · "),
  };
}

export function parseCnbcQuote(q) {
  if (!q || Number(q.code) !== 0) return null;
  const sessionCode = q.curmktstatus || "";
  const extended = sessionCode === "PRE_MKT" || sessionCode === "POST_MKT";
  if (extended) {
    const ext = quoteFromParts(q, q.ExtendedMktQuote, sessionCode, true);
    if (ext) return ext;
  }
  return quoteFromParts(q, q, sessionCode, false);
}

/* Coinbase stats use last/open. Ticker messages use price/open_24h. */
export function parseCoinbase(data, name) {
  if (!data) return null;
  const price = finiteOrNull(data.last != null ? data.last : data.price);
  const open = finiteOrNull(data.open_24h != null ? data.open_24h : data.open);
  if (price == null || price <= 0) return null;
  let change = null;
  let pct = null;
  if (open != null && open > 0) {
    change = price - open;
    pct = (change / open) * 100;
  }
  return {
    unavailable: false,
    name: name || "",
    price,
    change,
    pct,
    meta: "24h · Coinbase",
  };
}

export function parseCoinGeckoRow(row, name) {
  const price = finiteOrNull(row && row.usd);
  const pct = finiteOrNull(row && row.usd_24h_change);
  if (price == null || price <= 0) return null;
  return {
    unavailable: false,
    name: name || "",
    price,
    change: null,
    pct,
    meta: "24h · CoinGecko",
  };
}

export function parseFinnhub(data, name) {
  if (!data || data.error) return null;
  const price = finiteOrNull(data.c);
  if (price == null || price <= 0) return null;
  const when = Number(data.t) > 0 ? formatWhen(new Date(Number(data.t) * 1000)) : "";
  return {
    unavailable: false,
    name: name || "",
    price,
    change: finiteOrNull(data.d),
    pct: finiteOrNull(data.dp),
    meta: ["Finnhub", when].filter(Boolean).join(" · "),
  };
}

export function directionOf(change, pct) {
  const n = change != null ? change : pct;
  if (n == null || !Number.isFinite(n) || n === 0) return "flat";
  return n > 0 ? "up" : "down";
}

export function formatPrice(n) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs === 0) return "0.00";
  let max = 2;
  if (abs < 1) {
    // Four significant digits past the leading zeros, so SHIB-sized prices
    // and their tiny changes do not collapse to 0.00.
    const places = Math.ceil(-Math.log10(abs)) + 3;
    max = Math.min(12, Math.max(abs < 0.0001 ? 8 : 6, places));
  }
  return abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: max });
}

export function formatPct(n) {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const body = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return sign + body + "%";
}

export function formatWhen(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}
