/* North Pole Pop-Up
   Everything you need to edit each season lives in SITE below. */

const SITE = {
  // TODO PLACEHOLDER: real 2026 opening and closing times. Keep the -05:00 offset (Philadelphia, winter).
  openingDate: "2026-11-27T17:00:00-05:00",
  closingDate: "2027-01-17T22:00:00-05:00",

  // TODO PLACEHOLDER: 2026 hours (copied from the 2025 season). day: 0 = Sunday ... 6 = Saturday.
  hours: [
    { day: 1, name: "Mon", time: null },
    { day: 2, name: "Tue", time: null },
    { day: 3, name: "Wed", time: "5p - 10p" },
    { day: 4, name: "Thu", time: "5p - 11p", note: "Karaoke night" },
    { day: 5, name: "Fri", time: "5p - 2a" },
    { day: 6, name: "Sat", time: "5p - 2a" },
    { day: 0, name: "Sun", time: "12p - 5p", note: "Brunch" },
  ],

  // Paste a Stripe Payment Link here (https://buy.stripe.com/...). Empty = button emails you instead.
  packageCheckoutUrl: "",

  resy: { venueId: 84382, apiKey: "WwayZ5wlmJqQONf5HNN3dc8YdUwyGYDv" },
  email: "northpolepopupbar@gmail.com",
  instagram: "@northpolepopup",
};

const TZ = "America/New_York";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

const fmtDate = (d) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(d);
const isoDay = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

/* ---------- status band: countdown -> open now -> season over ---------- */
function initStatus() {
  const open = new Date(SITE.openingDate);
  const close = new Date(SITE.closingDate);
  const label = $("[data-status-label]");
  const date = $("[data-status-date]");
  const cd = $("[data-countdown]");
  const link = $("[data-status-link]");
  const cells = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  let timer;

  const set = (el, v) => {
    const t = String(v).padStart(2, "0");
    if (el.textContent === t) return;
    el.textContent = t;
    if (!reduceMotion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
  };

  function render() {
    const now = Date.now();
    if (now < open.getTime()) {
      label.textContent = "Doors open";
      date.textContent = fmtDate(open);
      cd.hidden = false; link.hidden = true;
      let s = Math.floor((open.getTime() - now) / 1000);
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      set(cells.d, d); set(cells.h, h); set(cells.m, m); set(cells.s, s);
    } else if (now < close.getTime()) {
      label.textContent = "Open now";
      date.textContent = `Through ${fmtDate(close)}`;
      cd.hidden = true; link.hidden = false;
      clearInterval(timer);
    } else {
      label.textContent = "That's a wrap";
      date.textContent = `See you next winter. Follow ${SITE.instagram} for dates.`;
      cd.hidden = true; link.hidden = true;
      clearInterval(timer);
    }
  }
  render();
  timer = setInterval(render, 1000);
}

/* ---------- hours ---------- */
function initHours() {
  const list = $("[data-week]");
  const today = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(new Date());
  list.innerHTML = SITE.hours.map((h) => `
    <li class="day${h.time ? "" : " is-closed"}${h.name === today ? " is-today" : ""}">
      <span class="day__name">${h.name}</span>
      <span class="day__time">${h.time ?? "Closed"}</span>
      ${h.note ? `<span class="day__note">${h.note}</span>` : ""}
    </li>`).join("");
}

/* ---------- reservations ---------- */
function initReserve() {
  const pkg = $("[data-package-btn]");
  pkg.href = SITE.packageCheckoutUrl ||
    `mailto:${SITE.email}?subject=${encodeURIComponent("North Pole Package reservation")}`;

  // Resy's widget swaps in its own orange button. We keep that one hidden and
  // forward clicks from our styled button to it, which opens the Resy booking popup.
  const btn = $("[data-resy-btn]");
  const host = document.createElement("span");
  host.hidden = true;
  btn.after(host);
  const target = document.createElement("a");
  host.append(target);
  let bound = false;
  btn.addEventListener("click", () => {
    const resyEl = bound && host.querySelector("[role=button], a, button");
    if (resyEl) resyEl.click();
    else location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("Table reservation")}`;
  });

  const load = () => {
    const s = document.createElement("script");
    s.src = "https://widgets.resy.com/embed.js";
    s.async = true;
    s.onload = () => {
      if (!window.resyWidget) return;
      const now = new Date(), open = new Date(SITE.openingDate);
      window.resyWidget.addButton(target, {
        venueId: SITE.resy.venueId,
        apiKey: SITE.resy.apiKey,
        replace: true,
        defaultDate: isoDay(now > open ? now : open),
      });
      bound = true;
    };
    document.head.appendChild(s);
  };
  ("requestIdleCallback" in window) ? requestIdleCallback(load, { timeout: 3000 }) : setTimeout(load, 1500);
}

/* ---------- nav state, reveals, mobile bar ---------- */
function initObservers() {
  const nav = $("[data-nav]");
  const hero = $(".hero");
  const bar = $("[data-mobile-cta]");
  const reserve = $("#reserve");
  let heroGone = false, reserveVisible = false;
  const syncBar = () => bar.classList.toggle("is-visible", heroGone && !reserveVisible);

  new IntersectionObserver(([e]) => {
    nav.classList.toggle("is-scrolled", e.intersectionRatio < 0.92);
    heroGone = !e.isIntersecting; syncBar();
  }, { threshold: [0, 0.92] }).observe(hero);

  new IntersectionObserver(([e]) => { reserveVisible = e.isIntersecting; syncBar(); }).observe(reserve);

  const items = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

/* ---------- hero snow (paused off-screen, off for reduced motion) ---------- */
function initSnow() {
  const c = $("[data-snow]");
  if (!c || reduceMotion) return;
  const ctx = c.getContext("2d");
  let w, h, dpr, flakes = [], running = false, raf;

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, (w * h) / 14000));
    flakes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4, v: Math.random() * 0.45 + 0.15,
      drift: Math.random() * 0.6 - 0.3, a: Math.random() * 0.5 + 0.25,
    }));
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.v; f.x += f.drift;
      if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
      if (f.x > w + 4) f.x = -4; else if (f.x < -4) f.x = w + 4;
      ctx.globalAlpha = f.a; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fillStyle = "#eef3fb"; ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  size();
  new ResizeObserver(size).observe(c);
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; frame(); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }).observe(c);
}

$("[data-year]").textContent = new Date().getFullYear();
initStatus();
initHours();
initReserve();
initObservers();
initSnow();
