/* North Pole Pop-Up
   Everything you need to edit each season lives in SITE below. */

const SITE = {
  // TODO PLACEHOLDER: real 2026 opening and closing times. Keep the -05:00 offset (Philadelphia, winter).
  openingDate: "2026-11-27T17:00:00-05:00",
  closingDate: "2027-01-17T22:00:00-05:00",

  // Blue strip under the menu bar. Leave empty to hide it.
  // Example: "Extended by Popular Demand! Now open through Sunday, January 17th"
  banner: "",

  // Paste a Stripe Payment Link here (https://buy.stripe.com/...). Empty = button emails you instead.
  packageCheckoutUrl: "",

  resy: { venueId: 84382, apiKey: "WwayZ5wlmJqQONf5HNN3dc8YdUwyGYDv" },
  email: "northpolepopupbar@gmail.com",
};

const TZ = "America/New_York";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const tid = (id) => $(`[data-testid="${id}"]`);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isHome = document.body.dataset.page === "home";

const fmtDate = (d) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "long", day: "numeric", year: "numeric" }).format(d);
const isoDay = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

/* ---------- countdown -> open now -> season over ---------- */
function initCountdown() {
  const open = new Date(SITE.openingDate);
  const close = new Date(SITE.closingDate);
  const cells = ["days", "hours", "minutes", "seconds"].map((k) => tid(`countdown-${k}`));
  const title = tid(isHome ? "text-grand-opening-title" : "text-grand-opening");
  const dateEl = tid("text-opening-date");            // home page only
  const grid = $("[data-countdown]") || tid("countdown-timer");
  const pad = (n) => (isHome ? String(n) : String(n).padStart(2, "0"));
  const say = (t) => { title.textContent = isHome ? t : t.toUpperCase(); };
  let timer;

  function render() {
    const now = Date.now();
    if (now < open.getTime()) {
      if (dateEl) dateEl.textContent = fmtDate(open);
      let s = Math.floor((open.getTime() - now) / 1000);
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      [d, h, m, s].forEach((v, i) => { cells[i].textContent = pad(v); });
      return;
    }
    clearInterval(timer);
    grid.hidden = true;
    if (now < close.getTime()) {
      say("Now Open");
      if (dateEl) dateEl.textContent = `Through ${fmtDate(close)}`;
    } else {
      say("See You Next Winter");
      if (dateEl) dateEl.textContent = "Follow @northpolepopup for next season's dates.";
    }
  }
  render();
  timer = setInterval(render, 1000);
}

/* ---------- falling snow, two layers like the original ---------- */
function initSnow() {
  if (reduceMotion) return;
  const layers = $$("canvas[data-snow]").map((c, i) => ({
    c, ctx: c.getContext("2d"), flakes: [],
    big: i === 1, count: i === 1 ? 45 : 90,
  }));
  if (!layers.length) return;
  let w, h;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    for (const L of layers) {
      L.c.width = w * dpr; L.c.height = h * dpr;
      L.c.style.width = w + "px"; L.c.style.height = h + "px";
      L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(L.count * Math.min(1, w / 900 + 0.35));
      L.flakes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: L.big ? Math.random() * 2 + 1.2 : Math.random() * 1.3 + 0.4,
        v: L.big ? Math.random() * 0.9 + 0.6 : Math.random() * 0.5 + 0.2,
        sway: Math.random() * Math.PI * 2, a: Math.random() * 0.5 + 0.4,
      }));
    }
  }
  function frame() {
    for (const L of layers) {
      L.ctx.clearRect(0, 0, w, h);
      L.ctx.fillStyle = "#fff";
      for (const f of L.flakes) {
        f.y += f.v; f.sway += 0.01; f.x += Math.sin(f.sway) * 0.35;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        L.ctx.globalAlpha = f.a;
        L.ctx.beginPath(); L.ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); L.ctx.fill();
      }
    }
    if (!document.hidden) requestAnimationFrame(frame);
  }
  size();
  addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) requestAnimationFrame(frame); });
  requestAnimationFrame(frame);
}

/* ---------- main page: banner, menu bar, buttons ---------- */
function initHome() {
  const banner = $("[data-banner]");
  if (SITE.banner) { banner.firstElementChild.textContent = SITE.banner; banner.hidden = false; }

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  const links = {
    "link-home": "hero", "link-about": "about", "link-hours": "hours", "link-location": "location",
    "button-reserve": "reserve", "button-reserve-table": "reserve", "button-view-menu": "about", "button-inquire": "reserve",
  };
  for (const [id, target] of Object.entries(links)) tid(id).addEventListener("click", () => go(target));

  // phone menu (same panel as the original)
  const burger = tid("button-mobile-menu");
  const ICON_MENU = burger.innerHTML;
  const ICON_X = ICON_MENU.replace(/<line.*<\/line>/s, '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>');
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]";
  const panel = document.createElement("nav");
  panel.className = "fixed top-[60px] right-0 w-[280px] h-[calc(100vh-60px)] z-[56] p-6";
  panel.style.cssText = "background:linear-gradient(180deg,rgba(6,18,34,.95),rgba(6,18,34,.9));border-left:1px solid rgba(190,220,255,.22)";
  panel.innerHTML = `<div class="flex flex-col gap-2">${["about", "reserve", "hours", "location"].map((id) =>
    `<button data-go="${id}" class="text-left text-foreground font-semibold py-3 px-4 rounded-md hover-elevate active-elevate-2">${id.toUpperCase()}</button>`).join("")}</div>`;
  overlay.hidden = panel.hidden = true;
  burger.parentElement.append(overlay, panel);
  burger.setAttribute("aria-label", "Menu");
  const setOpen = (on) => {
    overlay.hidden = panel.hidden = !on;
    burger.innerHTML = on ? ICON_X : ICON_MENU;
    burger.setAttribute("aria-expanded", on);
  };
  burger.addEventListener("click", () => setOpen(panel.hidden));
  overlay.addEventListener("click", () => setOpen(false));
  panel.addEventListener("click", (e) => {
    const id = e.target.closest("[data-go]")?.dataset.go;
    if (id) { setOpen(false); go(id); }
  });

  // Premium Package: Stripe Payment Link when set, otherwise an email
  tid("button-package-reserve").addEventListener("click", () => {
    location.href = SITE.packageCheckoutUrl ||
      `mailto:${SITE.email}?subject=${encodeURIComponent("Premium Package Reservation")}`;
  });

  // Regular Reservation: Resy's widget draws its own orange button. We keep that one
  // hidden and forward clicks from the site's button to it, which opens the Resy popup.
  const btn = tid("button-regular-reserve");
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

initCountdown();
initSnow();
if (isHome) initHome();
