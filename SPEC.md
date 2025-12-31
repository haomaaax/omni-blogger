# Omni Blogger - Technical Specification

**Version**: 2.0
**Last Updated**: December 31, 2025
**Status**: Production

---

## Overview

Omni Blogger is a timeless, minimalist web-based blog editor designed for pure writing without distractions. Write from anywhere, publish instantly, own your content.

### Philosophy

> "A timeless blog that focuses on pure writing, not SEO optimization. Like sitting at a classic typewriter - just you and your thoughts, no distractions, no metadata, no unnecessary features. Built to last almost forever with simplicity at its core."

### Live Deployment

- **Editor**: https://editor.sparkler.club
- **Blog**: https://sparkler.club
- **API**: https://api.sparkler.club

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────┐
│  editor.sparkler.club                   │
│  (Cloudflare Pages)                     │
│  - Minimalist WYSIWYG Editor            │
│  - Image upload with preview            │
│  - Auto-save drafts                     │
│  - Protected by Cloudflare Access       │
└─────────────┬───────────────────────────┘
              │ POST/PUT/DELETE
              ▼
┌─────────────────────────────────────────┐
│  api.sparkler.club                      │
│  (Cloudflare Worker)                    │
│  - Publishing API                       │
│  - Image upload to GitHub               │
│  - Email subscription management        │
│  - Commits via GitHub API               │
└─────────────┬───────────────────────────┘
              │ Git push triggers build
              ▼
┌─────────────────────────────────────────┐
│  GitHub: haomaaax/max-notes (PRIVATE)   │
│  - Hugo blog content                    │
│  - Markdown posts                       │
│  - Images in static/images/             │
└─────────────┬───────────────────────────┘
              │ Auto-build on push
              ▼
┌─────────────────────────────────────────┐
│  sparkler.club                          │
│  (Cloudflare Pages)                     │
│  - Hugo static site                     │
│  - Live in ~2 minutes                   │
└─────────────────────────────────────────┘
```

### Technology Stack

**Frontend**
- Vanilla JavaScript (no frameworks)
- ContentEditable API for WYSIWYG editing
- HTML to Markdown converter
- Base64 image preview
- localStorage for drafts
- Service Worker (offline caching)
- Web App Manifest (PWA installation)

**Backend**
- Cloudflare Workers (serverless API)
- GitHub API (content management)
- Cloudflare KV (subscriber storage)
- Resend API (email notifications)

**Hosting**
- Cloudflare Pages (editor + blog)
- Cloudflare Access (authentication)
- Hugo (static site generator)

---

## Core Features

### 1. Minimalist Editor

**Design Philosophy**: Just title and content. Nothing else.

**Interface**:
```
┌────────────────────────────────────────┐
│ ☰  [Status]              [✨ Publish] │
├────────────────────────────────────────┤
│                                        │
│  What's on your mind?                  │
│                                        │
│  [Content area - WYSIWYG editing]      │
│                                        │
└────────────────────────────────────────┘
```

**Features**:
- Pure text editing (no toolbar clutter)
- Auto-save every 2 seconds
- Dark/light mode toggle
- Keyboard shortcuts (⌘S save, ⌘Enter publish)

**Removed for Simplicity**:
- ❌ Tags input
- ❌ Formatting toolbar
- ❌ Manual save button
- ❌ Metadata fields

### 2. Image Upload

**User Flow**:
1. Click image upload button (📷)
2. Select image file(s)
3. Image displays immediately (base64 preview)
4. Publish → Images uploaded to GitHub
5. Markdown `![alt](/images/filename.png)` generated

**Technical Implementation**:
- Max size: 5MB per image
- Allowed types: JPG, PNG, GIF, WebP
- Filename format: `{sanitized-name}-{timestamp}-{random}.{ext}`
- Storage: `static/images/` in Hugo blog
- Preview: Base64 data URL in editor
- Conversion: `<img>` tag → markdown on publish

**Image Processing**:
```javascript
// Editor inserts preview
<img src="data:image/png;base64,..."
     alt="image-name"
     data-image-path="/images/filename.png">

// htmlToMarkdown converts to
![image-name](/images/filename.png)
```

### 3. Post Management

**List Posts**:
- GET `/posts` → Array of posts with metadata
- Displays: Title, date, excerpt
- Actions: Edit, Delete

**Edit Post**:
- GET `/posts/:slug` → Post content + metadata
- Load into editor
- PUT `/posts/:slug` → Update existing post
- SHA-based conflict detection

**Delete Post**:
- Confirmation dialog
- DELETE `/posts/:slug` → Remove from GitHub
- Triggers site rebuild

**Create Post**:
- POST `/` → New post
- Auto-generates slug from title
- Sets `draft: false`, current timestamp

### 4. Auto-Generated Metadata

All metadata is generated automatically - user only provides title and content:

```yaml
---
title: "User-Provided Title"
date: 2025-12-31T07:30:00.000Z    # Auto: Current timestamp
draft: false                        # Auto: Always false
description: "First 150 chars..."   # Auto: Content excerpt
summary: "First 150 chars..."       # Auto: Same as description
keywords: ["extracted", "words"]    # Auto: From title + content
author: "Max Chen"                  # Auto: Configured value
slug: "user-provided-title"         # Auto: From title
---
```

**Keyword Extraction Algorithm**:
1. Extract words from title and content
2. Remove stopwords (the, is, at, which, on, etc.)
3. Filter: 3-15 characters, alphanumeric only
4. Include all words from title (if valid)
5. Add content words until 8 total keywords
6. Deduplicate and lowercase

### 5. Email Subscriptions

**Subscriber Flow**:
1. Reader enters email on blog
2. Receives confirmation email (double opt-in)
3. Clicks confirm link
4. Subscribed! Gets notified of new posts

**Publisher Flow**:
- Publish new post
- Worker detects new post
- Sends email to all subscribers
- Unsubscribe link in every email

**Data Ownership**:
- All subscribers stored in Cloudflare KV
- You own the data
- Can export anytime
- No vendor lock-in

**Cost**: Free (Resend: 3,000 emails/month)

### 6. Progressive Web App (PWA)

**Installation**:
- Installable as native-like app on mobile and desktop
- Custom "Install App" button in menu
- Browser install prompt support (Chrome, Edge, Safari)
- Pen nib app icon with dark theme (#1A1A1A)

**Offline Capabilities**:
- Service Worker caches static assets (HTML, CSS, JS, icons)
- Cache-first strategy for instant loads
- Works offline after first visit
- Auto-updates on new deployments
- Prevents publish attempts when offline

**Service Worker Features**:
```javascript
// Cache version management
const CACHE_VERSION = 'omni-v4';

// Cached files
- / (root)
- /index.html
- /style.css
- /editor.js
- /config.js
- /manifest.json
- /icons/*.png

// Strategy: Cache-first for static assets
// API requests always go to network
```

**App Manifest**:
- Name: "Omni Blogger"
- Short name: "Omni"
- Display mode: Standalone (fullscreen, no browser UI)
- Theme color: #1C3A52 (ink blue)
- Background: #1A1A1A (dark)
- Icons: 512x512, 192x192, 180x180, 32x32

**Benefits**:
- **Faster loads**: Subsequent visits load instantly from cache
- **Offline writing**: Draft locally even without internet
- **Native feel**: Full-screen app experience
- **Home screen access**: One tap to open
- **Reduced data usage**: Assets cached locally

**Browser Support**:
- ✅ Chrome/Edge on Android (full PWA support)
- ✅ Safari on iOS (Add to Home Screen)
- ✅ Desktop Chrome/Edge (installable)
- ⚠️ Firefox (service worker but no install prompt)

---

## API Specification

### Base URL
```
https://api.sparkler.club
```

### Authentication
- GitHub Personal Access Token (stored as Worker secret)
- Cloudflare Access for editor UI

### Endpoints

#### Create Post
```http
POST /
Content-Type: application/json

{
  "filename": "my-post.md",
  "content": "---\ntitle: My Post\n---\nContent",
  "images": [
    {
      "filename": "image-123.jpg",
      "content": "base64-encoded-data",
      "mimeType": "image/jpeg"
    }
  ]
}

Response:
{
  "success": true,
  "commit": "abc123...",
  "message": "Post published successfully!",
  "imagesUploaded": 1
}
```

#### List Posts
```http
GET /posts

Response:
{
  "posts": [
    {
      "slug": "my-post.md",
      "title": "My Post",
      "date": "2025-12-31T07:30:00.000Z",
      "tags": ["tag1"],
      "excerpt": "First 150 characters..."
    }
  ]
}
```

#### Get Post
```http
GET /posts/:slug

Response:
{
  "content": "Full markdown content",
  "frontmatter": {
    "title": "My Post",
    "date": "2025-12-31T07:30:00.000Z",
    "tags": ["tag1"]
  },
  "sha": "github-file-sha"
}
```

#### Update Post
```http
PUT /posts/:slug
Content-Type: application/json

{
  "content": "Updated markdown",
  "sha": "github-file-sha",
  "images": [ /* optional */ ]
}
```

#### Delete Post
```http
DELETE /posts/:slug
Content-Type: application/json

{
  "sha": "github-file-sha"
}
```

#### Subscribe
```http
POST /subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Confirm Subscription
```http
GET /confirm?email={email}&token={token}
```

#### Unsubscribe
```http
GET /unsubscribe?email={email}&token={token}
```

---

## File Structure

### Editor Repository (`omni-blogger`)

```
omni-blogger/
├── index.html           # Main HTML (editor UI)
├── editor.js           # Client-side JavaScript
├── style.css           # Styles (dark/light mode)
├── config.js           # Client config (committed)
├── server.js           # Local dev server (optional)
├── config.json         # Local dev config (gitignored)
├── README.md           # Project overview
├── MANUAL.md           # User guide
├── SPEC.md             # Technical spec (this file)
├── ROADMAP.md          # Implementation history
└── todo.md             # Deployment checklist
```

### Worker Repository (`publish-worker`)

```
publish-worker/
├── src/
│   └── index.js        # Worker code
├── wrangler.toml       # Worker config
└── package.json        # Dependencies
```

### Blog Repository (`max-notes` - PRIVATE)

```
max-notes/
├── content/
│   └── posts/          # Published markdown posts
├── static/
│   └── images/         # Uploaded images
├── themes/
│   └── PaperMod/       # Hugo theme
├── public/             # Built site (generated)
└── hugo.toml           # Hugo config
```

---

## Configuration

### Client Configuration (`config.js`)

Committed to git, used by browser:

```javascript
const CONFIG = {
  blogUrl: 'https://sparkler.club',
  apiUrl: 'https://api.sparkler.club',
  publishEndpoint: ''
};
```

### Worker Configuration (`wrangler.toml`)

```toml
name = "blog-publisher"
main = "src/index.js"
compatibility_date = "2024-12-10"

[[kv_namespaces]]
binding = "SUBSCRIBERS"
id = "de7174c61599465291afcaddbaae671d"
```

### Worker Secrets

```bash
# GitHub Personal Access Token (with 'repo' scope for private repos)
wrangler secret put GITHUB_TOKEN

# Resend API Key (for email notifications)
wrangler secret put RESEND_API_KEY
```

### Hugo Configuration

```toml
baseURL = "https://sparkler.club"
title = "Sparkler"
theme = "PaperMod"
publishDir = "public"
```

---

## Security

### Authentication
- **Editor Access**: Cloudflare Access with email OTP
- **GitHub Access**: Personal Access Token with `repo` scope
- **Private Repository**: Blog content is private until published

### Data Protection
- GitHub token stored as Worker secret (never exposed to browser)
- CORS restricted to `editor.sparkler.club`
- HTTPS enforced on all domains
- Email addresses encrypted in Cloudflare KV

### Input Validation
- Slug validation (prevent path traversal)
- Image validation (size, type, filename)
- Email validation (double opt-in)
- SHA verification (prevent conflicts)

---

## Deployment

### Prerequisites
- Cloudflare account (free tier)
- GitHub account
- Domain name (optional, can use *.pages.dev)
- GitHub Personal Access Token

### Deploy Editor

1. Push to GitHub:
```bash
git push origin main
```

2. Create Cloudflare Pages project:
   - Connect to `omni-blogger` repo
   - Build settings: None (static files)
   - Deploy

3. Add custom domain:
   - `editor.yourdomain.com`

4. Configure Cloudflare Access:
   - Protect `editor.yourdomain.com`
   - Allow your email

### Deploy Worker

1. Install Wrangler:
```bash
npm install -g wrangler
wrangler login
```

2. Deploy:
```bash
cd publish-worker
wrangler deploy
```

3. Add secrets:
```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put RESEND_API_KEY
```

4. Add custom domain:
   - `api.yourdomain.com`

### Deploy Blog

1. Push to GitHub (private repo)
2. Create Cloudflare Pages project
3. Build settings:
   - Framework: Hugo
   - Build command: `hugo --minify`
   - Build output: `public`
4. Add custom domain

---

## Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| Cloudflare Pages (editor) | Free | $0 |
| Cloudflare Pages (blog) | Free | $0 |
| Cloudflare Workers | Free (100k req/day) | $0 |
| Cloudflare Access | Free (50 users) | $0 |
| Cloudflare KV | Free (1GB) | $0 |
| Resend (email) | Free (3k emails/month) | $0 |
| Domain (Gandi) | Paid | ~$1.25/month |
| **Total** | | **~$1.25/month** |

All Cloudflare services stay within free tier limits.

---

## Performance

### Editor Load Time
- First load: ~500ms (includes CSS, JS)
- Cached: ~100ms
- Works offline (drafts in localStorage)

### Publishing Speed
- Upload time: ~1-2 seconds (API + GitHub)
- Hugo build: ~30 seconds
- Total to live: ~2 minutes

### Image Upload
- Single image: ~2-3 seconds
- Multiple images: Sequential upload
- Max total payload: ~20MB (Worker limit)

---

## Browser Support

### Desktop
- ✅ Chrome 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Edge 90+

### Mobile
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+
- ⚠️  Mobile Firefox (basic support)

### Required Features
- contenteditable API
- FileReader API (for images)
- localStorage
- Fetch API
- ES6+ JavaScript

---

## Limitations & Known Issues

### Current Limitations
- Single user only (no multi-tenant)
- Drafts are device-specific (localStorage)
- Image uploads sequential (not parallel)
- No image optimization/resizing
- No post scheduling
- No collaborative editing

### Known Issues
- None currently

### Future Considerations
- PWA features (Add to Home Screen)
- Offline image queue
- Draft sync across devices
- Image optimization
- Drag & drop upload

---

## Development

### Local Development

1. Start editor server:
```bash
cd omni-blogger
node server.js
```

2. Start Hugo preview:
```bash
cd ../my-blog
hugo server
```

3. Open editor: http://localhost:3000
4. Preview blog: http://localhost:1313

### Local Configuration

Create `config.json` (gitignored):

```json
{
  "blogPath": "/path/to/my-blog",
  "blogUrl": "http://localhost:1313",
  "apiUrl": "http://localhost:3000",
  "deployCommand": null
}
```

### Testing Worker Locally

```bash
cd publish-worker
wrangler dev
```

---

## Monitoring

### Cloudflare Analytics
- Pages requests/bandwidth
- Worker execution time
- Error rates
- Geographic distribution

### GitHub
- Commit history
- Build logs
- Repository size

### Resend Dashboard
- Email delivery rate
- Bounce rate
- Subscriber count

---

## Backup & Recovery

### Data Backup
- **Posts**: All in GitHub (version controlled)
- **Images**: All in GitHub static/images/
- **Subscribers**: Export from Cloudflare KV
- **Code**: All in GitHub repositories

### Disaster Recovery
1. Fork all GitHub repositories
2. Export Cloudflare KV data
3. Export Cloudflare Access rules
4. Save Worker secrets externally
5. Document DNS configuration

### Migration Path
- Can export all content as Markdown
- Can switch to any Hugo hosting
- Can replace Cloudflare Worker with any API
- No vendor lock-in

---

## Changelog

### v2.0 (December 31, 2025)
- ✨ Added image upload with preview
- ✨ Made blog repository private
- ✨ Added Progressive Web App (PWA) support
- ✨ Service Worker for offline caching
- ✨ Installable as native app (iOS, Android, desktop)
- ✨ Custom install button in menu
- ✨ Pen nib app icon with dark theme
- 🐛 Fixed image markdown rendering
- 🐛 Fixed scrollbar issues with large images
- 🐛 Fixed app icon truncation on mobile
- 🔒 Updated GitHub token scope for private repo

### v1.5 (December 22, 2025)
- 🎨 Minimalist refactor (removed tags, toolbar)
- 🎨 Classic typewriter aesthetic
- 🎨 Ink-on-paper color palette
- ✨ Auto-generated metadata
- ✨ AI-friendly keyword extraction

### v1.0 (December 19, 2025)
- ✨ Initial production release
- ✨ Web-based editor
- ✨ Cloudflare Worker publishing
- ✨ Email subscriptions
- ✨ Edit/delete posts
- ✨ Cloudflare Access authentication

---

## Support & Resources

### Documentation
- [README.md](README.md) - Project overview
- [MANUAL.md](MANUAL.md) - User guide
- [ROADMAP.md](ROADMAP.md) - Implementation history
- [todo.md](todo.md) - Deployment checklist

### External Resources
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Hugo Documentation](https://gohugo.io/documentation/)
- [GitHub API](https://docs.github.com/en/rest)
- [Resend API](https://resend.com/docs)

---

**Built for writers who want to own their content.**

Write from anywhere. Publish instantly. No vendor lock-in. Built to last forever.
