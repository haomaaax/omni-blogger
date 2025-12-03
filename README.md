# Omni Blogger

A clean, distraction-free blog editor with WYSIWYG interface and one-click publish to your Hugo static site.

## ✨ Features

- **WYSIWYG Editor** - Write like in Google Docs, no Markdown needed
- **Auto-save** - Drafts saved automatically to browser storage
- **One-click Publish** - Saves to Hugo, builds site, and deploys
- **Dark Mode** - Follows your system preference
- **Minimal Design** - Focused on writing

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v14+)
- Hugo (for static site generation)
- A Hugo blog set up

### 2. Setup

```bash
# Clone this repo
git clone <your-repo-url> omni-blogger
cd omni-blogger

# Copy config template
cp config.example.json config.json

# Edit config.json with your settings
# Update: blogPath, blogUrl, deployCommand
```

### 3. Configure

Edit `config.json`:

```json
{
  "blogPath": "/path/to/your/hugo-blog",
  "blogUrl": "https://yourdomain.com",
  "apiUrl": "http://localhost:3000",
  "deployCommand": null
}
```

See [MANUAL.md](MANUAL.md) for detailed configuration options.

### 4. Run

```bash
# Start the editor server
node server.js

# Open in browser
# http://localhost:3000
```

## 📖 Documentation

- **[MANUAL.md](MANUAL.md)** - Complete setup and usage guide
- **[ROADMAP.md](ROADMAP.md)** - Future enhancements (PWA, Supabase sync)
- **[todo.md](todo.md)** - Deployment checklist for Cloudflare Pages

## 🔧 Configuration

All personal settings are in `config.json` (not committed to git).

**Required settings:**
- `blogPath` - Absolute path to your Hugo blog
- `blogUrl` - Your blog's public URL
- `deployCommand` - Command to deploy (or `null` for manual)

Example deployment commands:
```json
// Auto-push to GitHub (triggers Cloudflare Pages)
"deployCommand": "cd /path/to/blog && git add -A && git commit -m \"New post\" && git push"

// Custom script
"deployCommand": "./deploy.sh"

// No auto-deploy
"deployCommand": null
```

## 🎯 Workflow

```
Write in Editor → Click Publish → Auto-deploy → Live in ~2 minutes
```

1. Write post in WYSIWYG editor (http://localhost:3000)
2. Click "✨ Publish"
3. Post saves to Hugo blog as Markdown
4. Hugo builds the site
5. (Optional) Auto-commits and pushes to GitHub
6. Blog auto-deploys via Cloudflare Pages/GitHub Pages

## 🏗️ Architecture

- **Frontend**: Vanilla JavaScript with ContentEditable WYSIWYG
- **Backend**: Node.js HTTP server
- **Storage**: Browser localStorage (drafts), Git (published posts)
- **Deployment**: Hugo → GitHub → Cloudflare Pages

## 📝 Why config.json?

- ✅ Keeps personal paths private (not in git)
- ✅ Easy setup for new users (copy example, fill values)
- ✅ Standard practice for local configuration
- ✅ One file to manage all settings

The `config.example.json` is committed to git with placeholder values. Your actual `config.json` is gitignored and stays private.

## 🛠️ Tech Stack

- Node.js (server)
- Vanilla JavaScript (client)
- Hugo (static site generator)
- Cloudflare Pages (hosting)
- Git (version control)

## 🔮 Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features:
- Progressive Web App (PWA) for iPhone support
- Supabase for cross-device draft syncing
- Serverless publishing via Cloudflare Workers
- Image upload support

## 📄 License

MIT

---

Built for writers who want to own their content.
