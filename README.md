# Adora Fashions

A premium editorial atelier website with a password-protected dashboard. Every change
made in the dashboard becomes a real commit to this GitHub repository, which in turn
triggers a fresh Netlify deploy — there is no database and nothing to sync.

- **Public site** — home, collections, about, contact
- **Dashboard** — `/admin`, writes to `/content/*.json` and `/public/images/*.webp`
- **Stack** — React 19, Vite, TypeScript, Tailwind v3, Framer Motion, Netlify Functions

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

`npm run dev` starts both halves: Vite on `http://localhost:5173` and the API on
`http://localhost:8787`, with `/api/*` proxied across. So the dashboard is fully
exercisable locally, writes included — a save is a real GitHub commit, so it needs a
`GITHUB_TOKEN` too. `.env.local` is read by the API process, which is why the
`VITE_`-less variables work there without any extra wiring.

Run the two halves separately if you prefer:

```bash
npm run dev:api                    # API only, honours API_PORT (default 8787)
npm run preview                    # static build only, no API
```

`npm run test:api` and `npm run test:netlify` need neither — they stub GitHub and
exercise the handlers directly.

## 2. Deploy to Netlify

1. Push this repository to GitHub (it is already wired to `Ashonlogist/AdoraFashions`).
2. In Netlify: **Add new site → Import an existing project** from the repository. The
   build settings are already in `netlify.toml`, so the defaults are correct.
3. Add the environment variables from `.env.example` under
   **Site configuration → Environment variables**.
4. Deploy.

`netlify.toml` sets the build command, publishes `dist`, pins Node 22, and rewrites
the client routes to `/index.html` so a hard refresh or a shared link works. It
deliberately avoids the usual `/*` catch-all: Netlify cannot exclude a path from a
splat rule, so one would swallow `/api/*` and hand the dashboard's requests to the
SPA shell instead of the function. Add a rule there when you add a page.

The handlers in `api/` are plain Node functions that return Node-style responses.
`netlify/functions/api.ts` is a thin adapter that turns them into a real Netlify
Function mounted at `/api/*`, so the same handlers still work under Vercel's native
`api/` convention if you ever need it — `vercel.json` is kept for that.

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
| `API_PORT` | local only | Port for `npm run dev:api`. Defaults to `8787` |

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
1–2 minutes"* — that is the Netlify rebuild picking up the commit, not a guess.

### Photographs

Use **Upload** for anything photographed. Upload a PNG if the subject is cut out and
needs transparency, a JPEG or WebP if it is a normal rectangular photograph; the
dashboard converts everything to WebP, keeps an alpha channel if there is one, and
names the file for you from the field it belongs to. You never type a filename.

Uploads are resized in the browser to a 2000px long edge, re-encoded as WebP, and
capped by their encoded size before they are sent — base64 inflates by a third, so
the cap is applied to what goes on the wire, not to the image. That keeps a
full-resolution camera file from hitting the platform's request limit (Netlify
refuses a function body over 6MB, the adapter over 5.5MB).

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
npm run typecheck       # tsc across app, config, api and the Netlify function
npm run test:api        # 16 handler tests, no network needed
npm run test:netlify    # 20 routing, auth and payload tests against the adapter
npm run check:site      # headless Chromium: overflow, images, h1s, reduced motion
npm run check:admin     # headless Chromium: login gate, every editor, save, logout
npm run check:breakout  # hero and about framing, measured at 4 widths
npm run check           # all of the above
```

`check:site`, `check:admin` and `check:breakout` need a server running
(`npm run preview`) and a Chromium binary. `check:admin` mocks the API in the browser,
so it works against a plain static build. `check:breakout` scans the hero cutout's
alpha channel to find where the subject actually is, rather than trusting the image
box, and fails if it collides with the viewport edge on a phone.

## 6. Housekeeping

- **Placeholder content.** Phone, email, Instagram, testimonials and the name
  "Adora" are plausible placeholders. Replace them from the dashboard.
- **The photography is real.** `public/images/*.webp` are photographs, credited in
  `public/images/CREDITS.md` — check a face before you ship, and prefer a set you
  have the rights to. `public/images/hero-main.png` is the one cutout with a
  transparent background, and it is only 440px wide, so it will look soft on a
  high-density screen; re-export it larger if that shows.
- **Palette.** Bone, cream, warm gray, charcoal, terracotta, antique gold — defined
  as CSS variables in `src/index.css` and exposed to Tailwind in
  `tailwind.config.js`. Add nothing else.
- **Motion.** Every animation is bypassed for `prefers-reduced-motion` and for
  coarse pointers, and the custom cursor only appears on fine pointers.
