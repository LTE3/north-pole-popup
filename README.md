# North Pole Pop-Up website (static rebuild, Nov 2026)

Plain HTML/CSS/JS. No build step. Upload the whole folder to any static host
(Netlify drop, Vercel, GitHub Pages, Cloudflare Pages, or Replit static).

## Fill in before going live (all in `main.js`, top `SITE` block)
1. `openingDate` / `closingDate`: PLACEHOLDERS (Nov 27 2026 / Jan 17 2027).
   The status bar counts down, flips to "Open now", then "That's a wrap" by itself.
2. `hours`: PLACEHOLDER, copied from the 2025 season.
3. `packageCheckoutUrl`: paste a Stripe Payment Link. Empty = button emails you.
4. Package price lives in `index.html` (`data-package-price`), still $19.99.

## Also worth doing
- `assets/og-image.png` still says "2025". Replace for link previews.
- Most venue photos look AI-rendered (ice bar etc.). Swap in real photos from
  the space when you have them: same filenames in `assets/img/`, WebP, ~1200px wide.
- `assets/originals/` holds the full-size source images; not used by the page.

## What's wired
- Table reservation button opens the Resy booking popup (venue 84382).
- Groups of 10+ -> northpolepopupbar@gmail.com. Footer -> contact@northpolepopup.com.
- `/home` redirects to `/` (old link kept working).
- Not rebuilt: old /checkout (Stripe+Resy form), /admin, /cupid pages, "View Menu".
