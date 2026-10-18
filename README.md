# Laravel Backend Developer — Portfolio (plain HTML/CSS/JS)

A single-page developer portfolio built with **HTML5, CSS3 and vanilla JavaScript only**.
No framework, no package manager, no build step — it is deployed as-is.

> **Everything between `[square brackets]` is a placeholder.**
> No name, email, biography, skill, project, metric or social account in this
> repository is real. Replace them before you publish. The page itself also
> says so, in a small note under the hero, so you cannot accidentally ship
> invented content.

---

## 1. File structure

```
.
├── index.html          # markup + SEO / Open Graph / Twitter meta tags
├── css/
│   └── styles.css      # design tokens, themes, layout, components
├── js/
│   ├── data.js         # ← ALL of your content lives here
│   └── main.js         # rendering, filters, dialog, theme, menu, form
├── assets/
│   ├── favicon.svg     # placeholder icon
│   ├── me.jpg          # ← your photo goes here (not included: add it yourself)
│   └── README.md       # image sizes, formats, alt text
└── README.md
```

Keep this shape. `index.html` references everything with **relative paths**, so
the site works both at a domain root and under a GitHub Pages project path
(`https://<user>.github.io/<repo>/`).

---

## 2. Editing your content

Open [`js/data.js`](js/data.js). It is one object, `window.PORTFOLIO`, split into
five commented blocks. You should not need to touch any other file for content.

### 2.1 Site strings (`site`)

| Key | Where it appears |
| --- | --- |
| `heroIntro` | paragraph under your name in the hero |
| `aboutSummary` | one-line summary under the **About** heading |
| `aboutBio` | array of biography paragraphs — add or delete entries freely |
| `projectsSummary` | line above the project cards |
| `contactSummary` | line above the contact form |
| `footerTagline` | footer line — set to `""` to remove it entirely |
| `markSamplesAsPlaceholders` | while `true`, sample projects show a "Placeholder sample" badge |

### 2.2 Who you are (`profile`)

```js
profile: {
  name: '[Your Name]',
  role: 'Laravel Backend Developer',
  roleShort: 'Laravel Developer',
  email: '[your.email@example.com]',   // needed by the contact form
  phone: '',                            // "" hides it
  location: '[City, Country]',          // "" hides it
  availability: '[Your status]',        // bracketed so nothing is claimed for you
  photo: '',                            // e.g. 'assets/me.jpg' — see §2.3
  photoAlt: '',                         // describe the photo for screen readers
  links: [ { kind: 'github', label: 'GitHub', url: '' }, … ],
  focus: [ '…' ],        // bullet list in About
  principles: [ '…' ],   // "How I build" panel
  timeline: [],          // experience / education / certifications
}
```

`name`, `roleShort` and the availability line are written into the header, hero,
footer and `<title>`-adjacent places automatically.

**`profile.timeline` starts empty on purpose.** Work history, education and
certifications are not invented for you. Fill it in and the "Experience,
education & certifications" block in the About section appears by itself; leave
it empty and the block stays hidden. Each entry:

```js
{
  type: 'Work',            // 'Work' | 'Education' | 'Certification'
  title: 'Backend Developer',
  org: 'Company name',
  period: 'Jan 2024 – Present',
  description: 'What you actually did.'
}
```

### 2.3 Your photo

The frame at the top right of the hero is your portrait slot. It is deliberately
empty — no stock photo, no silhouette of somebody else — until you add a file.

1. Export a **square** photo, 480 × 480 to 900 × 900 px, JPG or WebP, under
   about 200 KB.
2. Save it in `assets/` as `me.jpg`.
3. In `js/data.js` set:

   ```js
   photo: 'assets/me.jpg',
   photoAlt: 'Head-and-shoulders photo of a developer at a desk',
   ```

What you get in each state:

| State | What the page shows |
| --- | --- |
| `photo: ''` | dashed frame + "Your photo goes here" + the exact steps to fix it |
| path set, file missing | dashed frame + "Photo not found" with the path it tried (case matters on GitHub Pages) |
| path set, file present | your image, cropped with `object-fit: cover`, with your `photoAlt` as the alt text |

**The "Preview a photo from this device" button is not an upload.** There is no
server. It reads the file with `FileReader`, shows it in the frame, and keeps it
in this browser under the `localStorage` key `portfolio-portrait-preview` (files
over ~0.7 MB preview for the visit only, they are not remembered). A yellow
"Local preview only — not uploaded" ribbon is always shown while that preview is
on screen, and **no visitor can ever see it**. "Remove preview" forgets it.
Publishing a photo means committing the file, step 2 above.

### 2.4 Links that are not filled in yet

For `profile.links` (and project links), **leave `url` as an empty string** and
the site renders a clearly-labelled non-link: `GitHub — [add your URL in
js/data.js]`. It is deliberately not an `<a href>`, so you never publish a dead
or guessed URL. As soon as you paste a real `https://…` address it becomes a
proper link with `rel="noopener noreferrer"`, `target="_blank"` and a screen-reader
note that it opens a new tab.

### 2.5 Skills (`skillCategories`)

Four suggested categories ship with the template — Backend, Databases, Tools &
workflow, Frontend basics — each as a card of chips. They are **suggestions, not
verified claims about you**: delete any chip you cannot back up, rename
categories, or add your own. Each item optionally carries a `level`
(`{ name: 'Laravel', level: 'Advanced' }`); leave it `""` to show the name alone.

### 2.6 Projects (`projects`)

Three **sample placeholders** are included so the layout is visible. Replace or
delete them — nothing about them is real (no client, no user count, no repository).

```js
{
  id: 'my-real-project',          // unique, used for #project-<id> deep links
  title: 'Order API for a bakery chain',
  subtitle: 'Multi-tenant Laravel REST API',
  summary: 'One or two sentences for the card.',
  categories: ['Laravel', 'API'], // ← these strings generate the filter buttons
  tags: ['Laravel', 'MySQL', 'Sanctum'],
  year: '2025',
  status: 'Live',
  role: 'Backend developer',
  overview: 'What the application does and why it exists.',
  problem:  'What was broken, slow or missing before it.',
  solution: 'Your architecture, models, endpoints.',
  features: ['Token authentication', 'Queued notifications', '…'],
  results:  'Only numbers you can actually prove — or delete this field.',
  highlights: [],                 // optional chips in the dialog; leave empty unless real
  links: { demo: '', repo: '', caseStudy: '' },
  sample: false                   // true = shows the "Placeholder sample" badge
}
```

Rules the renderer follows:

- Empty or `[bracketed]` fields print as `[not provided — add project.xyz in js/data.js]`.
- **Filters are built from the `categories` values across your projects.** An
  "All" button is always present, then Laravel / API / Other in that preferred
  order, then any extra category you invented, alphabetically. Each button shows
  a live count. Pick one category name and use it consistently — `API` and `api`
  become two filters.
- A filter with no matches shows an empty state with a **Show all projects** button.
- `id` must be unique and URL-safe (letters, digits, dashes).

---

## 3. Editing the page metadata (SEO and sharing)

All in the `<head>` of [`index.html`](index.html):

1. `<title>` — e.g. `Jane Doe — Laravel Backend Developer` (use your own name).
2. `<meta name="description">` — one sentence, ideally ≤ 160 characters.
3. `<meta name="author">`.
4. `<link rel="canonical">` and `og:url` — set to your published address, e.g.
   `https://your-username.github.io/your-repo/`.
5. `og:title`, `og:description`, `og:image`, `og:image:alt`, `twitter:*` — the
   image is what shows in a LinkedIn/X/Slack preview.
6. `twitter:site` — delete the tag if you have no X account; do not publish a
   handle that is not yours.

There is **no JSON-LD structured data** in this template on purpose: it would
require stating personal facts (name, job history, social profiles) that you have
not provided. Add schema.org markup yourself once those details are real.

### Social preview image

Create a 1200 × 630 image (PNG or JPG), save it as `assets/og-image.png`, and
update `og:image` / `twitter:image` to the **full absolute URL** — social
crawlers do not accept relative paths.

### Favicon

Replace [`assets/favicon.svg`](assets/favicon.svg) with your own icon and keep
the filename, or point both `<link rel="icon">` and
`<link rel="apple-touch-icon">` in `index.html` at your file. If you use a PNG,
change the `type` attribute to `image/png`.

---

## 4. The contact form (and the GitHub Pages limitation)

GitHub Pages serves **static files only** — no PHP, no Laravel, no mail transport.
So this form never claims to send anything. What it actually does:

1. Validates name, email and message in the browser, with a visible label
   association, `aria-invalid`, an inline message per field, and a summary in an
   `role="alert"` region. Focus jumps to the first invalid field.
2. If validation passes **and** `profile.email` is a real address, it builds a
   `mailto:` link pre-filled with the subject and body and opens the visitor's
   mail app. The success message says, in plain words, that nothing has been sent
   yet and they still have to press Send.
3. If `profile.email` is still a placeholder, the form refuses politely and tells
   *you* what to fix — it will not fabricate a destination.
4. A direct `mailto:` link is always present below the form ("Fallback if your
   email app does not open") so the address works even when browsers block the
   automatic jump.

### Optional: make submissions actually arrive

Sign up with a static-form service, then set `form.endpoint` in `js/data.js`:

```js
form: {
  endpoint: 'https://formspree.io/f/your-form-id',
  …
}
```

When `endpoint` is a real URL, `main.js` `POST`s `FormData` with the fields
`name`, `email`, `subject`, `message` instead of using `mailto:`, shows "Sending…",
and reports success or failure. Follow your provider's own setup page (some
require an `Accept: application/json` header — already sent here — or a hidden
honeypot field). Note that these services are third parties: read their terms,
and expect your form to be publicly reachable at that address.

---

## 5. Previewing locally

You can just double-click `index.html`. For a truer test (matches how Pages
serves it, and avoids `file://` quirks with fetch), run any static server:

```bash
# Python 3
python -m http.server 8000

# or PHP (you are a Laravel developer, you have this)
php -S 8000

# or Node, no install needed
npx serve .
```

Then open <http://localhost:8000/>. Reload after editing `js/data.js`.

---

## 6. Publishing with GitHub Pages

1. **Create the repository** — e.g. `your-username/portfolio`, or
   `your-username.github.io` for a domain-root site.
2. **Upload these files** at the repository root (not inside a subfolder):

   ```bash
   git init
   git add index.html css js assets README.md
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

3. **Turn Pages on**: repository **Settings** → left sidebar **Pages** →
   *Build and deployment* → **Source: Deploy from a branch** →
   **Branch: `main`** → **Folder: `/ (root)`** → **Save**.
   (If you put the site in a `/docs` folder instead, select `/docs` here.)
4. Wait ~1 minute; the same panel shows **Your site is live at
   `https://your-username.github.io/your-repo/`**.
5. **Update the metadata** in `index.html` to that URL: `rel="canonical"`,
   `og:url`, `og:image`, `twitter:image`. Push again.
6. Check the result in the [LinkedIn Post Checker](https://www.linkedin.com/post-inspector/)
   or by re-pushing after clearing caches — social crawlers cache previews hard.
7. Leave **Enhanced Security** on (default) and skip "Custom domain" unless you
   have bought one; a custom domain needs a `CNAME` file plus DNS work at your
   registrar and a certificate (Pages issues one automatically once the DNS
   record is correct).

Pages builds from a branch here are pure static file copies — there is no Jekyll
processing needed and no `_config.yml` in this project. (If GitHub ever ignores
files beginning with an underscore, that is the Jekyll rule; this site has none.)

---

## 7. Features worth knowing about

- **Theme toggle** — dark by default, follows your OS on first visit, and your
  choice is saved in `localStorage` under `portfolio-theme` for later visits.
  An inline script in `<head>` applies it before first paint, so there is no
  flash of the wrong colours. Storage being blocked (private mode) is caught and
  simply falls back to the default.
- **Project detail dialog** — a real `role="dialog" aria-modal="true"` panel:
  focus moves inside when opened, `Tab`/`Shift+Tab` are trapped within it,
  `Escape` and the backdrop close it, and focus returns to the exact card you
  opened. Body scrolling is locked while it is open.
- **Deep links** — opening a project puts `#project-<id>` in the URL, and
  visiting that URL directly opens the dialog for you, so you can send someone
  straight to one project.
- **Mobile menu** — a `<button>` with `aria-expanded`/`aria-controls`, closable
  by `Escape`, by clicking outside, or by choosing a link; focus lands on the
  destination section instead of vanishing.
- **Scroll spy** — the nav item for the section you are reading gets
  `aria-current="true"` plus a sliding underline, so the current position is not
  communicated by colour alone.
- **Portrait slot** — see §2.3. Real image when `assets/me.jpg` (or whatever you
  point `profile.photo` at) exists; a labelled empty frame, never a fake person.
- **Motion** — all of it is CSS keyframes plus two small JS touches, with no
  library and no image assets:
  - the hero copy and the portrait/code panel arrive in one quiet staggered
    fade (`fade-up` / `slide-in`, pure CSS, so they never wait for JS);
  - sections lift in on scroll through `IntersectionObserver`, staggered by
    `--reveal-i`; a 4 s timer plus a scroll/resize fallback guarantees nothing
    stays invisible if the observer is throttled or missing;
  - a section heading draws its accent rule as it enters;
  - changing a project filter re-arrives the cards in a wave
    (`#project-grid.is-filtering`), and counts/`role="status"` still announce
    the result for screen readers;
  - project cards get a soft cursor spotlight (`--px`/`--py` on a
    `radial-gradient`) — only on `(hover: hover) and (pointer: fine)` devices;
  - a hairline reading-progress bar under the sticky header, plus a blinking
    editor caret and a 9 s drift on the decorative code panel;
  - hover/focus micro-moves on buttons, the "View details" arrow, nav underlines,
    the footer's back-to-top arrow and the theme icon.
- **Reduced motion** — with `prefers-reduced-motion: reduce` the scroll reveals
  are never installed, every animation/transition collapses to ~0 ms with zero
  delay, the cursor spotlight and code-panel drift are switched off, and hover
  lifts stop moving. Everything remains fully usable — motion is decoration, not
  information.
```
`main.js` also honours it with `prefersReducedMotion()` before installing the
spotlight, so the JS-driven motion is never even wired up.

- **Forced-colours mode** (Windows high contrast) has explicit borders.
- Fonts: **system stack only**. No Google Fonts, no icon CDN — zero external
  requests, no layout shift, and it works offline.

---

## 8. Known limitations

- The form cannot deliver mail on its own (see §4). `mailto:` needs a mail app on
  the visitor's device; a form service is the alternative.
- `localStorage` theme memory does not sync between devices or browsers.
- Search engines will index only what is rendered client-side for projects and
  skills. GitHub Pages has no SSR here. If SEO for individual projects matters,
  duplicate the project markup into static HTML cards and let `main.js` enhance
  it.
- Placeholder `[bracketed]` text is styled with a highlighted monospace chip on
  purpose. Once your content is real, that styling disappears automatically —
  it is generated from the text, not hard-coded, so it doubles as a checklist.
  The two reminder notes (under the hero and in the footer) hide themselves once
  nothing on the page is left un-edited.
- Analytics are not included (a snippet from a third party would be an external
  dependency and a privacy consideration). Add one deliberately if you want it.

---

## 9. Before you publish — checklist

- [ ] `profile.name`, `profile.role`, `profile.roleShort` are real.
- [ ] `profile.email` is a working address (or the form is pointed at a service).
- [ ] Every `profile.links[].url` is a real `https://` URL, or left `""` so it
      renders as an honest "not set yet".
- [ ] `site.heroIntro`, `site.aboutBio` describe what you have actually done.
- [ ] The three sample projects are deleted or replaced; `results`/`highlights`
      contain only numbers you can prove.
- [ ] `skillCategories` has nothing you cannot discuss in an interview.
- [ ] `profile.photo` points at a file that is actually in `assets/`, and
      `profile.photoAlt` describes that photo. (Or leave `photo` empty and the
      frame stays honestly empty.)
- [ ] Any local photo preview is removed before you judge the published look —
      previews live in your browser, not in the repository.
- [ ] `index.html`: title, description, canonical, `og:url`, `og:image` updated.
- [ ] `assets/favicon.svg` is your icon; no `[YN]` placeholder left in the tab.
- [ ] Nothing on the page still shows the highlighted placeholder chip styling.
- [ ] Tested: mobile menu, filters, project dialog (keyboard + `Escape`), theme
      toggle reload memory, form validation + `mailto:` fallback.
- [ ] Browser console is clean.
