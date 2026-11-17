# North Pole Pop-Up website

Same look as the original Replit site (splash page, then the main page), rebuilt
as plain HTML/CSS/JS. No build step. Works on any static host; currently on
GitHub Pages at https://lte3.github.io/north-pole-popup/

- `index.html`: splash page (flyer background, countdown, PHILADELPHIA button)
- `home/index.html`: main page (about, reservations, hours, location)
- `styles.css`: the original site's stylesheet
- `main.js`: countdown, snow, menu, booking buttons

## Fill in before going live (top of `main.js`, `SITE` block)
1. `openingDate` / `closingDate`: opening is Dec 1 2026 5pm (time assumed); closing Jan 17 2027 is a PLACEHOLDER.
   The countdown runs to opening, then flips to "Now Open", then "See You Next Winter".
2. `packageCheckoutUrl`: paste a Stripe Payment Link. Empty = the Premium Package button emails you.
3. `banner`: text for the blue strip under the menu bar (hidden while empty).

Hours, the $19.99 package and all other wording are plain text in `home/index.html`
(still the 2025 values).

## Still 2025
- The splash flyer (`assets/img/splash-bg.webp`) has "November 29th" printed in the artwork.
- `assets/og-image.png` (link preview image) says 2025.

## What's wired
- "Book Now" opens the Resy booking popup (venue 84382).
- "Email to Inquire" and footer "Contact" go to northpolepopupbar@gmail.com.
- "View Menu" scrolls to What to Expect (there is no menu page).
- Not rebuilt: old /checkout, /admin and /cupid pages.
- `assets/originals/` holds full-size source images; kept out of git.
