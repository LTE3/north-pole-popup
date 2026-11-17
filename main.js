/* North Pole Pop-Up
   Everything you need to edit each season lives in SITE below. */

const SITE = {
  // Opening: Dec 1 2026, 5pm (time is a guess). Closing date is still a PLACEHOLDER. Keep the -05:00 offset (Philadelphia, winter).
  openingDate: "2026-12-01T17:00:00-05:00",
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

/* ---------- falling snow: soft flakes at three depths, slow shared wind ---------- */
function initSnow() {
  if (reduceMotion) return;
  const [back, front] = $$("canvas[data-snow]");
  if (!back || !front) return;

  // one soft-edged flake, drawn once and stamped for every flake
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const sg = sprite.getContext("2d");
  const grad = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(240,248,255,.85)");
  grad.addColorStop(0.6, "rgba(200,225,255,.22)");
  grad.addColorStop(1, "rgba(200,225,255,0)");
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 64, 64);

  // depth: far = many, tiny, slow. near = few, large, fast, out of focus.
  const DEPTHS = [
    { front: false, per: 9000,  max: 150, size: [2, 4.5], speed: [14, 30],  alpha: [0.35, 0.8], sway: 8 },
    { front: false, per: 22000, max: 60,  size: [5, 9],   speed: [32, 58],  alpha: [0.5, 0.95], sway: 16 },
    { front: true,  per: 70000, max: 16,  size: [14, 30], speed: [60, 105], alpha: [0.1, 0.28], sway: 26 },
  ];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ctxs = [back, front].map((c) => c.getContext("2d"));
  let w = 0, h = 0, flakes = [], raf = 0, last = 0, t = 0;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const widthChanged = innerWidth !== w;
    w = innerWidth; h = innerHeight;
    [back, front].forEach((c, i) => {
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + "px"; c.style.height = h + "px";
      ctxs[i].setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    if (!widthChanged) return;          // phone address bar sliding: keep the flakes
    flakes = DEPTHS.flatMap((d) =>
      Array.from({ length: Math.min(d.max, Math.round((w * h) / d.per)) }, () => ({
        ctx: ctxs[d.front ? 1 : 0],
        x: rnd(0, w), y: rnd(0, h),
        s: rnd(...d.size), v: rnd(...d.speed), a: rnd(...d.alpha),
        sway: d.sway * rnd(0.5, 1), phase: rnd(0, 6.28), rate: rnd(0.4, 1.1),
      })));
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now; t += dt;
    const wind = Math.sin(t * 0.13) * 14 + Math.sin(t * 0.41) * 5;   // px/s, drifts left and right
    ctxs.forEach((c) => c.clearRect(0, 0, w, h));
    for (const f of flakes) {
      f.y += f.v * dt;
      f.x += (wind * (f.v / 60) + Math.cos(t * f.rate + f.phase) * f.sway) * dt;
      if (f.y > h + f.s) { f.y = -f.s; f.x = rnd(0, w); }
      if (f.x > w + f.s) f.x = -f.s; else if (f.x < -f.s) f.x = w + f.s;
      f.ctx.globalAlpha = f.a * (0.82 + 0.18 * Math.sin(t * f.rate * 2 + f.phase));
      f.ctx.drawImage(sprite, f.x - f.s / 2, f.y - f.s / 2, f.s, f.s);
    }
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  size();
  addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  start();
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
