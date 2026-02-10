# Omni Blogger - Quick Start Guide

**Goal:** Deploy your own blog in under 60 minutes using automated tools.

**Before You Begin:** This guide assumes you have basic command line familiarity. If you prefer a completely automated solution, check back in 2-3 weeks for our one-click deploy button!

---

## Prerequisites

You'll need:
- **Cloudflare Account** (free) - [Sign up](https://dash.cloudflare.com/sign-up)
- **GitHub Account** (free) - [Sign up](https://github.com/signup)
- **Domain** (optional) - Can use free `*.pages.dev` subdomain
- **15-60 minutes** of time

---

## Step 1: Pre-flight Check (2 minutes)

Before starting, let's verify your system is ready.

```bash
cd omni-blogger
chmod +x scripts/preflight-check.sh
./scripts/preflight-check.sh
```

This checks:
- ✓ Node.js installed
- ✓ Git installed
- ✓ Internet connection
- ✓ API access to Cloudflare & GitHub

**If you see any ❌ errors, follow the instructions to fix them before continuing.**

---

## Step 2: Generate Configuration Files (5 minutes)

Instead of manually editing config files, use our web-based generator.

```bash
# Open the config generator in your browser
open tools/config-generator.html
# Or on Linux: xdg-open tools/config-generator.html
```

Fill out the form:
1. **Blog Name**: `my-blog` (lowercase, hyphens allowed)
2. **Blog Path**: Full path to your Hugo blog
3. **GitHub Username**: Your GitHub username
4. **Custom Domain**: Optional - can use free subdomain
5. Click **"Generate Configs"**

Copy each generated file to its location:
- `config.json` → Root of omni-blogger directory
- `public/config.js` → public/ directory
- `wrangler.toml` → publish-worker directory

---

## Step 3: Set Up Secrets (10 minutes)

This script automates secret generation and setup.

```bash
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

The script will:
1. ✅ **Auto-generate JWT_SECRET** (for session management)
2. 🔗 **Guide you to create GitHub token** (opens browser)
3. 📧 **Optionally set up email** (can skip)
4. ℹ️  **Explain passkey setup** (happens after deployment)

**What you'll need:**
- GitHub Personal Access Token (script helps you create it)
- Resend API Key (optional, only if you want email subscriptions)

---

## Step 4: Create KV Namespaces (3 minutes)

Create storage for subscribers and auth challenges.

```bash
cd ~/sparkler/publish-worker

# Create namespaces
wrangler kv:namespace create SUBSCRIBERS
wrangler kv:namespace create AUTH_CHALLENGES
```

Copy the IDs from the output and update your `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SUBSCRIBERS"
id = "abc123..."  # ← Paste your ID here

[[kv_namespaces]]
binding = "AUTH_CHALLENGES"
id = "def456..."  # ← Paste your ID here
```

---

## Step 5: Deploy Cloudflare Worker (5 minutes)

Deploy the publishing API.

```bash
cd ~/sparkler/publish-worker
wrangler deploy
```

You'll see:
```
✨ Deployed blog-publisher
  https://blog-publisher.YOUR_ID.workers.dev
```

Copy this URL - you'll need it!

---

## Step 6: Deploy Editor to Cloudflare Pages (10 minutes)

### Option A: Via Dashboard (Easier)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Click "Create a project"
3. Connect to GitHub
4. Select your `omni-blogger` repository
5. Build settings:
   - Build command: (leave empty)
   - Build output directory: `public`
6. Click "Save and Deploy"

### Option B: Via Wrangler CLI

```bash
cd ~/sparkler/omni-blogger
wrangler pages deploy public --project-name=my-blog-editor
```

Your editor will be live at: `https://my-blog-editor.pages.dev`

---

## Step 7: Deploy Blog to Cloudflare Pages (10 minutes)

Same process for your Hugo blog.

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Select your blog repository (e.g., `my-blog`)
4. Build settings:
   - Build command: `hugo --minify`
   - Build output directory: `public`
5. Click "Save and Deploy"

Your blog will be live at: `https://my-blog.pages.dev`

---

## Step 8: Register Passkey (2 minutes)

Now set up secure authentication.

1. Visit your editor: `https://my-blog-editor.pages.dev`
2. You'll see a setup screen
3. Click "Register Passkey"
4. Your device will prompt for Touch ID / Face ID / Windows Hello
5. Authenticate
6. Done! Your passkey is registered

**Behind the scenes:** The public key is automatically extracted and stored in Worker secrets. No console interaction needed!

---

## Step 9: Write Your First Post (5 minutes)

1. Visit your editor
2. Sign in with your passkey (touch your fingerprint)
3. Type a title: "Hello World"
4. Write some content
5. Click "✨ Publish"
6. Wait ~2 minutes for build
7. Visit your blog - your post is live!

---

## Step 10: Optional - Custom Domain (15 minutes)

Want to use `yourdomain.com` instead of `*.pages.dev`?

### Add Domain to Cloudflare

1. Cloudflare Dashboard → Add Site
2. Enter your domain
3. Choose Free plan
4. Copy the nameservers

### Update Registrar

1. Log in to your domain registrar (Gandi, GoDaddy, etc.)
2. Find DNS/Nameserver settings
3. Replace nameservers with Cloudflare's
4. Wait 24-48 hours for propagation

### Configure Custom Domains in Pages

1. Go to your Pages project → Custom domains
2. Click "Set up a custom domain"
3. Enter: `yourdomain.com` (for blog)
4. Repeat for `editor.yourdomain.com` (for editor)
5. DNS records are auto-configured!

---

## Troubleshooting

### "wrangler command not found"
```bash
npm install -g wrangler
```

### "Authentication failed"
```bash
wrangler login
```

### "GitHub token invalid"
- Make sure you checked "repo" scope when creating token
- Regenerate token if needed: https://github.com/settings/tokens

### "Images not uploading"
- Max size: 5MB per image
- Supported: JPG, PNG, GIF, WebP
- Compress large images: https://tinypng.com

### "DNS not propagating"
- Can take 24-48 hours
- Check status: https://dnschecker.org
- Use `*.pages.dev` subdomain in the meantime

---

## What's Next?

### Recommended Actions

1. **Install as PWA** (2 min)
   - On iPhone: Share → Add to Home Screen
   - On Android: Menu → Install app
   - On Desktop: Install icon in address bar

2. **Set Up Email Subscriptions** (15 min)
   - See: [docs/EMAIL-SETUP.md](EMAIL-SETUP.md)
   - Optional but recommended

3. **Explore Features** (5 min)
   - Upload images (📷 button)
   - Dark mode toggle (☰ menu)
   - Edit published posts (☰ → My Posts)

### Video Tutorials

For visual learners, watch these videos:
- [Complete Deployment Walkthrough](../docs/VIDEO-SCRIPTS.md) (15 min)
- [Cloudflare Setup](../docs/VIDEO-SCRIPTS.md) (5 min)
- [Passkey Registration](../docs/VIDEO-SCRIPTS.md) (3 min)

_(Video links will be added once recorded)_

---

## Summary: What You Deployed

✅ **Editor**: Your writing interface at `editor.yourdomain.com`
✅ **Blog**: Your live blog at `yourdomain.com`
✅ **API**: Cloudflare Worker for publishing
✅ **Storage**: KV namespaces for subscribers and auth

**What You Own:**
- All content (in GitHub)
- All infrastructure (Cloudflare account)
- All subscriber data (KV storage)
- Complete control & portability

**Cost:** ~$1.25/month (domain only, if using custom domain)

---

## Getting Help

### Documentation

- **[MANUAL.md](MANUAL.md)** - Complete user guide
- **[EMAIL-SETUP.md](EMAIL-SETUP.md)** - Email subscription setup
- **[ROADMAP.md](ROADMAP.md)** - Project history and features
- **[VIDEO-SCRIPTS.md](VIDEO-SCRIPTS.md)** - Video tutorial outlines

### Tools

- **[Config Generator](../tools/config-generator.html)** - Generate config files
- **[Pre-flight Check](../scripts/preflight-check.sh)** - System validation
- **[Setup Secrets](../scripts/setup-secrets.sh)** - Automated secret setup

### Common Commands

```bash
# Check system requirements
./scripts/preflight-check.sh

# Set up secrets
./scripts/setup-secrets.sh

# Deploy Worker
cd ~/sparkler/publish-worker && wrangler deploy

# Check Worker logs
wrangler tail --format pretty

# List secrets
wrangler secret list

# Create KV namespace
wrangler kv:namespace create NAMESPACE_NAME
```

---

## Success!

You now have a fully functional blog that you can write on from anywhere!

**Next time you want to write:**
1. Visit your editor
2. Touch your fingerprint (passkey login)
3. Start typing
4. Publish

No CLI needed. No local server. Just pure writing.

---

**Questions?** Open an issue on GitHub: https://github.com/haomaaax/omni-blogger/issues

**Found this helpful?** ⭐ Star the repo and share with others!
