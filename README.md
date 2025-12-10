# Omni Blogger

A clean, distraction-free **web-based blog editor** with WYSIWYG interface and one-click publish to your Hugo static site.

**Write from anywhere. Publish instantly. Own your content.**

## ✨ Features

- **Web-Based Editor** - Access from any device (Mac, iPhone, iPad)
- **WYSIWYG Editing** - Write like in Google Docs, no Markdown needed
- **Auto-save** - Drafts saved automatically to browser storage
- **One-click Publish** - Commits to GitHub, builds and deploys automatically
- **Secure** - Protected with Cloudflare Access authentication
- **Serverless** - No local server needed, fully cloud-based
- **Dark Mode** - Follows your system preference
- **Minimal Design** - Focused on writing

## 🌐 Live Demo

This project powers:
- **Editor**: https://editor.sparkler.club
- **Blog**: https://sparkler.club

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  editor.sparkler.club                   │
│  (Cloudflare Pages)                     │
│  - WYSIWYG Editor                       │
│  - Auto-save drafts                     │
│  - Protected by Cloudflare Access       │
└─────────────┬───────────────────────────┘
              │ Click "Publish"
              ▼
┌─────────────────────────────────────────┐
│  blog-publisher.workers.dev             │
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
3. Write your post
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
  apiUrl: 'https://blog-publisher.maxyay5566.workers.dev',
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
  ↓ Write post
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

## 📊 Features Overview

| Feature | Status | Notes |
|---------|--------|-------|
| WYSIWYG Editor | ✅ | Bold, italic, headings, lists, quotes, links, code |
| Auto-save Drafts | ✅ | Saved to browser localStorage |
| Web Publishing | ✅ | Via Cloudflare Worker |
| Authentication | ✅ | Cloudflare Access (email OTP) |
| Mobile Support | ✅ | Works on iPhone, iPad |
| Offline Editing | ⚠️ | Drafts work offline, publishing requires internet |
| Image Upload | ⏳ | Planned for Phase 4 |
| Edit Published Posts | ⏳ | Planned for Phase 4 |
| Google Login | ⏳ | Optional (currently email OTP) |
| PWA Features | ⏳ | Planned for Phase 4 |

## 🔮 Roadmap

**Phase 1-3: Complete ✅**
- ✅ Local editor with Hugo integration
- ✅ Deploy blog to Cloudflare Pages
- ✅ Deploy editor to web (editor.sparkler.club)
- ✅ Add Cloudflare Access authentication
- ✅ Create Cloudflare Worker for serverless publishing

**Phase 4: Polish & Features (Optional)**
- [ ] Google/GitHub login (easier than email OTP)
- [ ] Mobile-friendly UI improvements
- [ ] PWA features ("Add to Home Screen")
- [ ] Image upload support
- [ ] Edit published posts
- [ ] Custom Worker domain (api.sparkler.club)

See [ROADMAP.md](ROADMAP.md) for detailed implementation notes.

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

Write from anywhere. Publish instantly. No vendor lock-in.
