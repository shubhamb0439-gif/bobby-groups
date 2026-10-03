# Bobby Group website

A one-page, scroll-driven marketing site for Bobby Group. It's built with Next.js 16 (App Router), Tailwind CSS 4, GSAP ScrollTrigger and Lenis.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Node 20.9 or newer is required.

**Testing on your phone:** run `npm run dev -- -H 0.0.0.0`, then open `http://<your-PC-IP>:3000` on a phone on the same Wi-Fi. Local network IPs are already allowed in `next.config.ts` (`allowedDevOrigins`).

## Project layout

```
scripts/convert-frames.mjs   raw image sequence → WebP sets + src/config/sequence.json
scripts/prepare-logo.mjs     logo PNG → transparent wordmark + favicons
scripts/make-decor.mjs       spice cursors (assets/cursors/*.svg → public/cursors) + grain texture
src/config/                  sequence.json (generated), scroll.ts, content.ts (all copy), site.ts (contact, nav, socials)
src/components/              Header, Preloader, ScrollSequence, StoryOverlays, MouseTrail, CustomCursor, …
src/sections/                About, Spices, Certifications, WhyUs, Contact, EnquiryForm
src/lib/                     frame loader, canvas drawing, validation, rate limiter
src/app/api/enquiry/         enquiry email route (Resend)
public/frames/               generated frames (desktop/, mobile/, poster.webp)
public/spices/               product photos (+ CREDITS.md)
public/textures/             grain.png, spice-pattern.svg (section backgrounds)
public/cursors/              cardamom / chilli cursor PNGs
public/certifications/       certification logos (optional)
```

## Replacing the video frames

1. Export the video as a numbered image sequence (JPG or PNG, zero-padded, e.g. `frame_00001.jpg`).
2. Run:
   ```bash
   npm run frames -- --src "C:/path/to/sequence"
   # optional: --budget 40   (desktop size target in MB, default 40)
   ```
   You can also set the `FRAMES_SRC` environment variable instead of passing `--src`. The default source is `../jpeg/Comp 1`.
3. The script:
   - writes `public/frames/desktop` (max 1920px) and `public/frames/mobile` (max 960px, every 2nd frame);
   - steps the desktop quality down (75 → 60), then drops to every 2nd frame, until the set fits the budget;
   - samples the edge colors of the first and last frames;
   - writes `src/config/sequence.json`.

   Your `scenes` and `posterAt` values in `sequence.json` are kept when you re-run it.

Current output: 749 source frames (1920×1080, 476 MB). Desktop has 375 frames at q70 (22.6 MB); mobile has 375 frames at q70 (10.7 MB). Every desktop frame at q60 would have been about 40.5 MB, so the script kept every 2nd frame.

## Tuning the scroll story

**Scene ranges** are in `src/config/sequence.json` → `scenes`. They are fractions (0–1) of the whole sequence:

```json
"fill": [0, 0.17], "zoomOutTruck": [0.17, 0.27], "crane": [0.27, 0.37],
"shipLoad": [0.37, 0.5], "shipDepart": [0.5, 0.63], "whiteToOcean": [0.63, 0.77], "drone": [0.77, 1]
```

The text panels and the white-to-ocean background blend follow these ranges automatically.

**Feel** is set in `src/config/scroll.ts`:

| Setting | What it does |
| --- | --- |
| `pinVh.desktop` / `pinVh.mobile` | Scroll length of the video section in viewport heights (800 / 600) |
| `lerp` | Playhead smoothing. Lower is silkier, higher is snappier. |
| `preloadFrames` | Frames that must load before the preloader exits (40) |
| `maxDecodedFrames` | Frames kept decoded around the playhead (desktop 20 / mobile 16). The rest stay compressed. Keep this small: decoding every frame uses hundreds of MB and makes phones crash the tab. |
| `portraitFill` | How a 16:9 frame fills a phone screen. `1` = pure cover (crops the sides), `0` = whole frame. The default `0.6` zooms part-way and feathers the top and bottom edges into the background. |

**Poster frame** (reduced motion and the Open Graph image): set `posterAt` (0–1) in `sequence.json`, then re-run `npm run frames`.

## Editing copy

All text is in `src/config/content.ts`: hero, story panels, About, Spices, Certifications, Why Us and Contact. Contact details, navigation and social links are in `src/config/site.ts`. A social link with an empty `href` shows as a "coming soon" placeholder.

Each story panel declares the `scenes` it belongs to, a `hold` window (0–1 within those scenes), a `tone` (`dark` text for white frames, `light` for ocean frames) and an `align`.

## Images

- **Spice photos:** the current images are temporary public-domain (CC0) stock photos; sources are listed in `public/spices/CREDITS.md`. To use your own, replace `public/spices/<slug>.webp` (or add a `.jpg`, which takes priority if you delete the `.webp`). The slugs are `turmeric`, `cardamom`, `teja-s17-red-chilli`, `cinnamon`, `cloves`, `black-pepper`, `star-anise`, `cumin-seeds`, `robusta-coffee`. Spices without a photo show a colored gradient.
- **Certification logos:** add `public/certifications/<slug>.svg` (or .png/.webp). The slugs are `dgft`, `fssai`, `spices-board`, `apeda`, `mca`, `gst`, `coffee-board`. Logos without a file show a text badge.
- **Logo:** replace `assets/logo/bobby-logo.png` (white on black), then run `npm run logo`.
- **Cursors:** edit `assets/cursors/cardamom.svg` (default) or `chilli.svg` (over links and buttons), then run `npm run decor`. They're native CSS cursors, set in `src/app/globals.css`, and only apply on mouse/trackpad devices.
- **Section textures:** `src/components/SectionBackdrop.tsx` layers warm glows, a faint linen weave, the spice line-art (`public/textures/spice-pattern.svg`) and film grain. Adjust the opacities there.

Images are detected at build time, so restart the dev server or redeploy after adding them.

## Enquiry email (Resend)

1. Create an API key at https://resend.com/api-keys.
2. Verify your sending domain in Resend (Domains). For a quick test before verifying, you can use `onboarding@resend.dev` as the sender.
3. Copy `.env.example` to `.env.local` and fill in:
   ```
   RESEND_API_KEY=re_…
   ENQUIRY_TO_EMAIL=you@yourdomain        # comma-separate for several recipients
   ENQUIRY_FROM_EMAIL="Bobby Group Website <enquiries@yourdomain>"
   NEXT_PUBLIC_SITE_URL=https://bobbygroup.in
   ```

How `/api/enquiry` handles requests:

- It validates input with the same zod schema as the form (`src/lib/validation.ts`).
- If the honeypot field is filled, it returns success silently.
- It rate-limits to 5 requests per 10 minutes per IP. The counter is in memory per serverless instance; use Upstash/Vercel KV for a strict global limit.
- Replies go straight to the customer through `replyTo`.
- If any of the env vars are missing, it logs `[enquiry] Email is not configured…` on the server and the visitor sees a friendly message.

## Deploy to Vercel

1. Push the repo to GitHub, GitLab or Bitbucket.
2. In Vercel, use **Add New → Project**, import the repo, and keep the framework preset **Next.js**.
3. Add the four environment variables above under **Settings → Environment Variables** (Production and Preview).
4. Deploy, then add the custom domain under **Settings → Domains**.

The generated frames in `public/frames` (about 35 MB) are committed and served from Vercel's CDN. You don't need to re-run the frame script on Vercel.

Caching (set in `next.config.ts`):
- `/frames/*` is cached for a year as immutable. Frame URLs carry `?v=<version>` from `sequence.json`, and `npm run frames` writes a new version, so visitors get new frames right after you redeploy.
- `/textures`, `/cursors` and `/brand` are cached for a week.

No `vercel.json` is needed. The enquiry route runs as a Node.js serverless function.

## Accessibility and motion

- With `prefers-reduced-motion`, the site shows a static poster hero with no scrubbing or smooth scrolling.
- The spice cursors apply only on fine pointers (mouse or trackpad). Touch devices keep native behaviour.
- The site includes a skip link, keyboard-operable menu (Esc closes it, focus stays inside), visible focus rings and labelled form errors.
