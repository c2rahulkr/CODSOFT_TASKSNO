# Vistara International School – Website

A premium, fully responsive school website built with plain **HTML5, CSS3 and vanilla JavaScript** (no build step, no dependencies except Google Fonts).

## Run it
Open `index.html` in a browser (or use the VS Code *Live Server* extension). Google Fonts need an internet connection; the site falls back to system fonts offline.

## Structure
```
vistara-school/
├── index.html          all 14 sections + inline SVG icon sprite
├── css/style.css       design tokens (:root), layout, components, responsive rules
├── js/main.js          mobile menu, scroll effects, counters, slider, lightbox, form validation
├── images/             hero, about, programs, facilities, gallery, faculty (+ favicon.svg)
└── tools/generate_images.py   regenerates the placeholder artwork
```

## IMPORTANT – placeholder content
Nothing here is real school information. No accreditation, awards, rankings or achievements are claimed.
- **Images** are illustrated SVG placeholders (real photography could not be bundled). Replace the files in `images/` with your own optimised photos (keep the names, or edit the `src` paths in `index.html`; use `.jpg`/`.webp`, ideally under 300 KB each).
- **Statistics** (2,500+, 150+, 50+, 20+) are sample figures: edit the `data-count` attributes in the stats section.
- **Faculty, testimonials, news dates, admission dates/eligibility, address, phone, email** are all marked as placeholders. Search `index.html` for "sample" and "placeholder".
- **Social links** point to `#`; add your real URLs.

## Customising
- Colours/spacing: change the variables at the top of `css/style.css` (`--navy`, `--gold`, `--bg`…).
- Google Maps: in the Contact section replace the `.map-ph` block with the `<iframe>` shown in the HTML comment (Google Maps → Share → Embed a map).
- Forms: validation is client-side and the success message is a demo – no data is sent. In `js/main.js`, find the comment `Demo only` in the submit handler and post the data to your backend or a form service (Formspree, Netlify Forms, etc.).

## Features
Sticky navbar with active-link highlighting · hamburger menu · smooth scrolling · hero entrance animations · reveal-on-scroll · animated counters · testimonial slider (buttons, dots, swipe, arrow keys, autoplay pause on hover) · gallery lightbox · admission/contact/newsletter validation with success feedback · back-to-top · semantic, SEO-friendly markup with meta tags and JSON-LD · skip link, focus styles, reduced-motion support.

## Tested
Chromium at 1440 px, 820 px and 390 px: no console errors, no horizontal overflow, forms, slider, lightbox, mobile menu and counters verified.
