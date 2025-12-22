# Omni Blogger

A timeless, distraction-free **web-based blog editor** with pure minimalist interface and one-click publish to your Hugo static site.

**Write from anywhere. Publish instantly. Own your content. Built to last forever.**

## ✨ Philosophy

This is a **timeless blog** that focuses on pure writing, not SEO optimization. Like sitting at a classic typewriter - just you and your thoughts, no distractions, no metadata, no unnecessary features. Built to last almost forever with simplicity at its core.

## 🎯 Features

- **Pure Minimalism** - Just title and content. No toolbar, no tags, no clutter
- **Web-Based Editor** - Access from any device (Mac, iPhone, iPad)
- **Auto-save** - Drafts saved automatically to browser storage
- **One-click Publish** - Commits to GitHub, builds and deploys automatically
- **Classic Aesthetic** - Ink-on-paper color palette, typewriter feel
- **Dark Mode** - Toggle in menu (sun/moon icons)
- **Secure** - Protected with Cloudflare Access authentication
- **Serverless** - No local server needed, fully cloud-based

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
│  - Protected by Cloudflare Access       │
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
2. Login with email OTP
3. Write your post (just title and content - nothing else!)
4. Click "✨ Publish"
5. Wait ~2 minutes
6. Post appears at **https://sparkler.club**

**No setup required!**

### For Self-Hosting (Developers)

See [MANUAL.md](MANUAL.md) for complete deployment guide.

**What you'll deploy:**
1. **Editor** (Cloudflare Pages) - Web UI
2. **Worker** (Cloudflare Workers) - Publishing API
3. **Blog** (Cloudflare Pages) - Hugo static site

**Cost:** ~$1.25/month (domain only, all Cloudflare services free tier)

## 📖 Documentation

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
  ↓ Login with email
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
- Cloudflare Access (authentication)

**Deployment:**
- Hugo (static site generator)
- GitHub (version control, CI/CD trigger)
- Git API (programmatic commits)

**Local Development:**
- Node.js HTTP server (optional, for testing)

## 🔐 Security

- **Authentication**: Cloudflare Access with email OTP
- **Authorization**: GitHub Personal Access Token (stored as Worker secret)
- **CORS**: Configured in Worker for cross-origin requests
- **HTTPS**: Enforced on all domains

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
| Auto-save Drafts | ✅ | Saved to browser localStorage every 2s |
| Web Publishing | ✅ | Via Cloudflare Worker |
| Edit Published Posts | ✅ | Load, edit, update existing posts |
| Delete Posts | ✅ | With confirmation dialog |
| Authentication | ✅ | Cloudflare Access (email OTP) |
| Mobile Support | ✅ | Works on iPhone, iPad |
| Dark Mode | ✅ | Toggle in menu |
| Classic Aesthetic | ✅ | Ink-on-paper, typewriter feel |
| Offline Editing | ⚠️ | Drafts work offline, publishing requires internet |

## 🔮 Future Enhancements (Optional)

The blog is production-ready as-is. These are optional:

- [ ] Google/GitHub login (easier than email OTP)
- [ ] Image upload support
- [ ] PWA features ("Add to Home Screen")
- [ ] Tags support (currently removed for simplicity)
- [ ] Custom formatting toolbar (currently removed)

**Philosophy**: Keep it simple. A timeless blog that can last almost forever.

## 💰 Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| Cloudflare Pages (editor) | Free | $0 |
| Cloudflare Pages (blog) | Free | $0 |
| Cloudflare Workers | Free (100k req/day) | $0 |
| Cloudflare Access | Free (50 users) | $0 |
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
