# Adora Fashions

A premium editorial atelier website with a password-protected dashboard. Every change
made in the dashboard becomes a real commit to this GitHub repository, which in turn
triggers a fresh Vercel deploy — there is no database and nothing to sync.

- **Public site** — home, collections, about, contact
- **Dashboard** — `/admin`, writes to `/content/*.json` and `/public/images/*.png`
- **Stack** — React 19, Vite, TypeScript, Tailwind v3, Framer Motion, Vercel serverless functions

---

## 1. Run it locally

```bash
npm install
cp .env.example .env.local     # then fill in what you need
npm run dev                    # http://localhost:5173
```

The public site works with no environment variables at all. The dashboard needs a
password, so locally you only need:

```
ADMIN_PASSWORD=anything-you-like
SESSION_SECRET=anything-long-enough
```

`npm run dev` does not serve the API — those are Vercel functions. To exercise them
locally, use `vercel dev` (needs the Vercel CLI and a linked project), or run the
handler tests, which need nothing:

```bash
npm run test:api
```

## 2. Deploy to Vercel

1. Push this repository to GitHub (it is already wired to `Ashonlogist/AdoraFashions`).
2. In Vercel: **Add New → Project → Import** the repository. The framework preset is
   detected as Vite; build command `npm run build`, output `dist`.
3. Add the environment variables from `.env.example` under
   **Settings → Environment Variables** (mark all of them as needed for Production,
   Preview and Development).
4. Deploy.

`vercel.json` handles the SPA fallback so `/collections` works on a hard refresh,
keeps `/api/*` out of that rewrite, and marks `/admin` as `noindex`.

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | server | The only password that opens `/admin` |
| `SESSION_SECRET` | server | Signs the session cookie. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `GITHUB_TOKEN` | server | Fine-grained token, `contents: read & write` on **this repository only** |
| `GITHUB_OWNER` | server | `Ashonlogist` |
| `GITHUB_REPO` | server | `AdoraFashions` |
| `GITHUB_BRANCH` | server | `main` |
| `VITE_FORMSPREE_ID` | browser | Your Formspree form id. Blank = the contact form opens the visitor's mail app |

> The GitHub token never reaches the browser. Only variables prefixed `VITE_` are
> compiled into the client bundle, which is why the token must not have that prefix.
> Rotating `SESSION_SECRET` signs everyone out.

## 3. Editing the site

Go to `/admin` and sign in. Six editors mirror the six JSON files:

| Editor | File | What it covers |
| --- | --- | --- |
| Hero | `content/hero.json` | Label, headline, subheadline, button, hero image |
| About | `content/about.json` | Portrait, story, pull quote, principles, signature, stats |
| Collections | `content/collections.json` | Pieces, categories, captions, fabric notes, images |
| Testimonials | `content/testimonials.json` | Quotes, names, details |
| Contact info | `content/contact.json` | Phone, WhatsApp, email, Instagram, address, hours, map |
| Site settings | `content/settings.json` | Accent colour, statement, marquee, footer |

Each section saves independently and confirms with *"Saved — live in about
1–2 minutes"* — that is the Vercel rebuild, not a guess.

### Photographs

Use **Upload** for anything photographed, and export a **transparent PNG** (Canva's
Background Remover or remove.bg, then Save as PNG). The dashboard converts whatever
you upload to a normalised PNG, names it for you from the field it belongs to, and
hands back the path. You never type a filename.

Use **Paste link** only for an image that is already hosted somewhere stable.

### Categories

Categories double as the filter buttons on `/collections`. Add one from the
Collections editor, or from a piece's dropdown. A category cannot be deleted while
pieces still use it.

## 4. The API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/admin/session` | `GET` | Is this request signed in? Reports misconfiguration |
| `/api/admin/login` | `POST` | Exchanges the password for an httpOnly cookie |
| `/api/admin/logout` | `POST` | Clears the cookie |
| `/api/admin/content` | `GET` | Every section, read live from GitHub |
| `/api/admin/content/[section]` | `GET` `PUT` | One section, with its current SHA |
| `/api/admin/image` | `POST` | Converts and commits one image, returns its path |
| `/api/admin/images` | `GET` | Lists what is already in `/public/images` |

Guards worth knowing about: every route except `login` and `session` requires the
session cookie; passwords are compared in constant time; eight wrong passwords from
one address earn a fifteen minute cool-off; section names and image slots are
allow-listed so no request can write outside `content/` and `public/images/`.

## 5. Checks

```bash
npm run typecheck     # tsc across app, config and api
npm run test:api      # 16 handler tests, no network needed
npm run check:site    # headless Chromium: overflow, images, h1s, reduced motion
npm run check:admin   # headless Chromium: login gate, every editor, save, logout
npm run check         # all of the above
```

`check:site` and `check:admin` need a server running (`npm run preview`) and a
Chromium binary. `check:admin` mocks the API in the browser, so it works against a
plain static build.

## 6. Housekeeping

- **Placeholder content.** Phone, email, Instagram, testimonials and the name
  "Adora" are plausible placeholders. Replace them from the dashboard.
- **Placeholder photography.** `public/images/*.png` are generated vector
  illustrations, not photographs. Replace them from the dashboard.
- **Regenerating the artwork.** `npm run art` rebuilds them. Not needed if you are
  uploading real photography.
- **Palette.** Bone, cream, warm gray, charcoal, terracotta, antique gold — defined
  as CSS variables in `src/index.css` and exposed to Tailwind in
  `tailwind.config.js`. Add nothing else.
- **Motion.** Every animation is bypassed for `prefers-reduced-motion` and for
  coarse pointers, and the custom cursor only appears on fine pointers.
