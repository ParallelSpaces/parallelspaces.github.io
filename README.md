# Parallel Spaces — Website

Marketing site for **Parallel Spaces**, the macOS app that runs multiple,
fully isolated copies of any Mac app.

Static HTML/CSS/JS — no build step, no dependencies. Hosted on GitHub Pages.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Homepage — hero, features, how it works, web apps, privacy |
| `whats-new.html` | Release notes, pulled live from the Mac App Store |
| `faq.html` | Technical FAQ + honest limitations |
| `privacy.html` | Privacy policy |

## Structure

```
.
├── index.html  whats-new.html  faq.html  privacy.html
├── assets/
│   ├── css/styles.css      design system (light + dark)
│   ├── js/main.js          What's New — fetches App Store release notes
│   └── img/icon.svg        app icon
├── robots.txt  sitemap.xml
└── .nojekyll               serve files as-is (no Jekyll)
```

## Preview locally

It's plain static files — open `index.html`, or:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)

1. Push to the `main` branch.
2. GitHub → repo **Settings → Pages**.
3. Source: **Deploy from a branch** → branch `main` → folder `/ (root)`.
4. Live at `https://parallelspaces.github.io/parallelspaces/`.

`.nojekyll` makes Pages serve the files directly.

### Custom domain

Add a `CNAME` file containing the domain, point DNS at GitHub Pages, then
update the absolute URLs in `sitemap.xml`, `robots.txt` and the `og:`/
`canonical` tags in each HTML file.

## Updating content

- **What's New** updates itself — `main.js` fetches the latest version and
  release notes from the App Store (app ID `6772172563`). Nothing to edit.
- **Screenshots / video** — replace the placeholders in `index.html` and
  drop real images into `assets/img/`.
- **App icon** — swap `assets/img/icon.svg`.
- **App Store badge** — the inline SVG badge is a stand-in; replace it with
  Apple's official "Download on the App Store" asset before launch.

## Contact

29satnam@gmail.com
