# Omni Blogger

A timeless, distraction-free **web-based blog editor** with pure minimalist interface and one-click publish to your Hugo static site.

**Write from anywhere. Publish instantly. Own your content. Built to last forever.**

## ✨ Philosophy

This is a **timeless blog** that focuses on pure writing, not SEO optimization. Like sitting at a classic typewriter - just you and your thoughts, no distractions, no metadata, no unnecessary features. Built to last almost forever with simplicity at its core.

## 🎯 Features

- **Pure Minimalism** - Just title and content. No toolbar, no tags, no clutter
- **Image Upload** - Upload images with instant preview, auto-upload to GitHub
- **Progressive Web App** - Install as native app on iOS, Android, and desktop
- **Offline Support** - Service Worker caches app for instant loads and offline drafting
- **Web-Based Editor** - Access from any device (Mac, iPhone, iPad)
- **Auto-save** - Drafts saved automatically to browser storage
- **One-click Publish** - Commits to GitHub, builds and deploys automatically
- **Email Subscriptions** - Readers can subscribe and get notified of new posts
- **Classic Aesthetic** - Ink-on-paper color palette, typewriter feel
- **Dark Mode** - Toggle in menu (sun/moon icons)
- **Secure** - Protected with WebAuthn passkey authentication (Touch ID, Face ID)
- **Serverless** - No local server needed, fully cloud-based
- **Private Repository** - Blog content stored in private GitHub repo
- **Data Ownership** - Own your subscribers, logic, and content

## 🌐 Live Demo

This project powers:
- **Editor**: https://editor.sparkler.club
- **Blog**: https://sparkler.club

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  editor.sparkler.club                   │
│  (Cloudflare Pages)                     │
│  - Minimalist WYSIWYG Editor            │
│  - Auto-save drafts                     │
│  - Protected by Passkey Auth            │
└─────────────┬───────────────────────────┘
              │ Click "Publish"
              ▼
┌─────────────────────────────────────────┐
│  api.sparkler.club                      │
│  (Cloudflare Worker)                    │
│  - Receives post content                │
│  - Commits to GitHub via API            │
└─────────────┬───────────────────────────┘
              │ Git push triggers build
              ▼
┌─────────────────────────────────────────┐
│  GitHub Repository (max-notes)          │
│  - Stores Hugo blog content             │
│  - Triggers Cloudflare Pages build      │
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

## 🚀 Quick Start

### For Using the Editor (End Users)

1. Visit **https://editor.sparkler.club**
2. Login with passkey (Touch ID, Face ID, or Windows Hello)
3. Write your post (just title and content - nothing else!)
4. Click "✨ Publish"
5. Wait ~2 minutes
6. Post appears at **https://sparkler.club**

**No setup required!**

### For Self-Hosting (Developers)

**New to deployment?** Start with [QUICK-START.md](docs/QUICK-START.md) - deploy in under 60 minutes using automated tools.

**Want full details?** See [MANUAL.md](MANUAL.md) for complete deployment guide.

**What you'll deploy:**
1. **Editor** (Cloudflare Pages) - Web UI
2. **Worker** (Cloudflare Workers) - Publishing API
3. **Blog** (Cloudflare Pages) - Hugo static site

**Cost:** ~$1.25/month (domain only, all Cloudflare services free tier)

## 📖 Documentation

- **[QUICK-START.md](docs/QUICK-START.md)** - Deploy in under 60 minutes (recommended for first-time users)
- **[MANUAL.md](MANUAL.md)** - Complete deployment and usage guide
- **[ROADMAP.md](ROADMAP.md)** - Implementation history and future enhancements
- **[todo.md](todo.md)** - Deployment checklist (track your progress)

## 🔧 Configuration

### For Web Deployment

The editor uses `config.js` (committed to git):

```javascript
const CONFIG = {
  blogUrl: 'https://sparkler.club',
  apiUrl: 'https://api.sparkler.club',
  publishEndpoint: ''
};
```

### For Local Development

Use `config.json` (gitignored):

```json
{
  "blogPath": "/path/to/your/hugo-blog",
  "blogUrl": "https://yourdomain.com",
  "apiUrl": "http://localhost:3000",
  "deployCommand": "cd /path/to/blog && git add -A && git commit -m \"New post\" && git push"
}
```

## 🎯 Workflow

### Web Editor (Production)
```
Visit editor.sparkler.club
  ↓ Login with passkey (Touch ID/Face ID)
  ↓ Write: "What's on your mind?"
  ↓ Just title + content (no tags, no toolbar)
  ↓ Auto-saves every 2 seconds
  ↓ Click "Publish"
  ↓ Cloudflare Worker commits to GitHub
  ↓ Cloudflare Pages builds blog
  ↓ Live at sparkler.club in ~2 minutes
```

### Local Development
```
Run: node server.js
  ↓ Open http://localhost:3000
  ↓ Write post
  ↓ Click "Publish"
  ↓ Server saves to local Hugo folder
  ↓ Builds with hugo --minify
  ↓ Pushes to GitHub (if deployCommand set)
```

## 🛠️ Tech Stack

**Frontend:**
- Vanilla JavaScript
- ContentEditable API (WYSIWYG)
- HTML to Markdown converter
- Classic Macintosh aesthetic

**Backend:**
- Cloudflare Workers (serverless API)
- Cloudflare Pages (hosting)
- WebAuthn (passkey authentication)

**Deployment:**
- Hugo (static site generator)
- GitHub (version control, CI/CD trigger)
- Git API (programmatic commits)

**Local Development:**
- Node.js HTTP server (optional, for testing)

## 🔐 Security

- **Authentication**: WebAuthn passkey with Touch ID/Face ID/Windows Hello
- **Session Management**: JWT tokens with 7-day expiration
- **Authorization**: GitHub Personal Access Token (stored as Worker secret)
- **CORS**: Configured in Worker for cross-origin requests with proper Authorization header support
- **HTTPS**: Enforced on all domains
- **No Passwords**: Passkeys stored in device secure enclave

## 🎨 Design Philosophy

### Classic Typewriter Aesthetic
- **Ink-on-paper colors**: Muted blue-black (#1C3A52) instead of bright digital blue
- **Timeless icons**: Fountain pen (My Posts), Scroll (Drafts)
- **Minimal interface**: Just what you need to write and publish
- **No distractions**: No tags, no toolbar, no SEO optimization
- **Simple placeholder**: "What's on your mind?" - inviting and conversational

### Pure Minimalism
- Header: Hamburger menu + Status + Publish button
- Editor: Title + Content area (nothing else!)
- Auto-save: Works silently in background (every 2 seconds)
- Theme toggle: Hidden in menu (sun/moon icons)

## 📊 Features Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Minimalist Editor | ✅ | Just title + content, no clutter |
| Image Upload | ✅ | Instant preview, auto-upload to GitHub |
| Auto-save Drafts | ✅ | Saved to browser localStorage every 2s |
| Web Publishing | ✅ | Via Cloudflare Worker |
| Edit Published Posts | ✅ | Load, edit, update existing posts |
| Delete Posts | ✅ | With confirmation dialog |
| Email Subscriptions | ✅ | Double opt-in, auto-notify on new posts |
| Passkey Authentication | ✅ | Touch ID, Face ID, Windows Hello |
| Mobile Support | ✅ | Works on iPhone, iPad |
| Dark Mode | ✅ | Toggle in menu |
| Classic Aesthetic | ✅ | Ink-on-paper, typewriter feel |
| Private Repository | ✅ | Blog content stored privately on GitHub |
| Data Ownership | ✅ | Own all subscriber data in Cloudflare KV |
| Offline Editing | ⚠️ | Drafts work offline, publishing requires internet |

## 📧 Email Subscriptions

Readers can subscribe to your blog and receive email notifications when you publish new posts - Substack-style, but you own everything.

**How it works:**
1. Reader enters email on sparkler.club
2. Receives confirmation email (double opt-in)
3. Clicks to confirm subscription
4. Gets notified when you publish new posts
5. Can unsubscribe anytime with one click

**What you own:**
- ✅ All subscriber email addresses (stored in Cloudflare KV)
- ✅ All subscription logic (in your Cloudflare Worker)
- ✅ Complete control over email content
- ✅ Can export and move to different service anytime

**Cost:** $0/month (Resend free tier: 3,000 emails/month)

**Setup:** See [EMAIL-SETUP.md](EMAIL-SETUP.md) for deployment guide

## 🔮 Future Enhancements (Optional)

The blog is production-ready as-is. These are optional:

- [x] ~~Google/GitHub login~~ → Passkey authentication implemented! ✅
- [x] ~~PWA features~~ → Progressive Web App complete! ✅
- [ ] Drag & drop image upload
- [ ] Image optimization/resizing
- [ ] Post scheduling
- [ ] Tags support (currently removed for simplicity)
- [ ] Custom formatting toolbar (currently removed)

**Philosophy**: Keep it simple. A timeless blog that can last almost forever.

## 💰 Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| Cloudflare Pages (editor) | Free | $0 |
| Cloudflare Pages (blog) | Free | $0 |
| Cloudflare Workers | Free (100k req/day) | $0 |
| Cloudflare KV (auth) | Free | $0 |
| Domain (Gandi) | Paid | ~$1.25/month |
| **Total** | | **~$1.25/month** |

All Cloudflare services stay within free tier limits!

## 🤝 Contributing

This is a personal project, but feel free to:
- Fork and customize for your own use
- Submit bug reports or feature suggestions
- Share your own deployment stories

## 📄 License

MIT

---

**Built for writers who want to own their content.**

Write from anywhere. Publish instantly. No vendor lock-in. Built to last forever.
