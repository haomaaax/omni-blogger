# Blog Editor Manual

A clean, distraction-free **web-based and local** blog editor with WYSIWYG interface and one-click publish to your Hugo static site.

**Write from anywhere. Publish instantly. Own your content.**

---

## Table of Contents

1. [Quick Start (Web Editor)](#quick-start-web-editor) - **Start here if you just want to write!**
2. [Overview](#overview)
3. [File Structure](#file-structure)
4. [Setup Instructions (Local Development)](#setup-instructions)
5. [Using the Editor](#using-the-editor)
6. [Configuration](#configuration)
7. [How It Works](#how-it-works)
8. [Customization Guide](#customization-guide)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)
11. [Deployment Guide (Self-Hosting)](#deployment-guide)

---

## Quick Start (Web Editor)

**For end users who just want to write - no setup required!**

### Using the Live Web Editor

1. **Visit the editor:**
   ```
   https://editor.sparkler.club
   ```

2. **Login:**
   - Enter your email address
   - Check your inbox for the one-time code
   - Enter the code to login
   - Your session lasts 24 hours

3. **Write your post:**
   - Enter a title
   - Add tags (optional, comma-separated)
   - Write your content using the toolbar for formatting

4. **Publish:**
   - Click the **"✨ Publish"** button
   - Wait ~2 minutes for the site to build
   - Visit https://sparkler.club to see your post live!

**That's it!** No local server, no terminal commands, no technical setup required.

### What You Can Do

- ✅ Write and format posts (bold, italic, headings, lists, quotes, links, code)
- ✅ Save drafts automatically (stored in your browser)
- ✅ Publish to the blog with one click
- ✅ Access from any device (Mac, iPhone, iPad, any browser)
- ✅ Work offline (drafts save locally, publish when online)

### What Gets Saved Where

- **Drafts**: Saved in your browser's localStorage
  - Per-device (not synced across devices yet)
  - Cleared if you clear browser data
  - Available in "Drafts" menu

- **Published Posts**: Saved to GitHub repository
  - Converted to Markdown automatically
  - Triggers site rebuild (takes ~2 minutes)
  - Appears at https://sparkler.club

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘S` | Save draft |
| `⌘Enter` | Publish |
| `⌘B` | Bold |
| `⌘I` | Italic |

---

**Need more control?** Continue reading for local development setup.

---

## Overview

This is a local web application that provides:

- **WYSIWYG Editor**: Write like in Google Docs—no Markdown knowledge needed
- **Auto-save**: Drafts saved to browser storage automatically
- **One-click Publish**: Saves to Hugo, builds site, and deploys
- **Dark Mode**: Follows your system preference
- **Minimal Design**: Inspired by Freewrite—focused on writing

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (localhost:3000)              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  index.html + style.css + editor.js               │  │
│  │  (WYSIWYG Editor with formatting toolbar)         │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          │ POST /publish                 │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  server.js (Node.js)                              │  │
│  │  - Receives post content                          │  │
│  │  - Saves .md file to Hugo content/posts/          │  │
│  │  - Runs: hugo --minify                            │  │
│  │  - Runs: deploy command (rsync/etc)               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Your Hugo Blog       │
              │  myblog/content/posts │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Your Live Website    │
              │  yourdomain.com       │
              └───────────────────────┘
```

---

## File Structure

### Recommended Setup (Separate Folders)

```
~/projects/                 # Or any parent directory of your choice
├── omni-blogger/           # Editor application
│   ├── index.html          # Main HTML file (editor UI)
│   ├── style.css           # Styles (dark/light mode, typography)
│   ├── editor.js           # Client-side JavaScript (WYSIWYG, HTML→Markdown)
│   ├── server.js           # Node.js server (file saving, Hugo build, deploy)
│   └── MANUAL.md           # This documentation
│
└── my-blog/                # Your Hugo blog (separate repo)
    ├── content/
    │   └── posts/          # Published posts go here
    ├── themes/
    │   └── PaperMod/       # Theme files
    ├── public/             # Built site (generated by Hugo)
    └── hugo.toml           # Hugo configuration
```

This separation allows you to:
- Version control the editor and blog separately
- Share the editor tool without exposing your content
- Use one editor for multiple blogs

---

## Setup Instructions

### Prerequisites

1. **Node.js** installed on your Mac
   ```bash
   # Check if installed
   node --version

   # Install via Homebrew if needed
   brew install node
   ```

2. **Hugo** installed
   ```bash
   # Check if installed
   hugo version

   # Install via Homebrew if needed
   brew install hugo
   ```

3. **Git** (for theme installation)
   ```bash
   git --version
   ```

### Step 1: Clone or Download the Editor

Clone this repository or download it to your preferred location:
```bash
# Choose your preferred parent directory
cd ~/projects  # or ~/Documents, ~/code, etc.

git clone <your-repo-url> omni-blogger
cd omni-blogger
```

### Step 2: Create Your Hugo Blog

**Important**: Keep your blog content separate from the editor tool. This allows you to:
- Version control them separately
- Use the same editor for multiple blogs
- Share the editor tool without sharing your content

Create a new Hugo blog as a sibling folder to the editor:

```bash
# Navigate to parent directory
cd ~/projects  # Use the same parent directory where you put omni-blogger

# Create new Hugo site
hugo new site my-blog

# Initialize git and install a theme (example: PaperMod)
cd my-blog
git init
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
echo "theme = 'PaperMod'" >> hugo.toml
```

**Recommended folder structure:**
```
~/projects/           # Your chosen parent directory
├── omni-blogger/     # This editor tool
└── my-blog/          # Your Hugo blog content
```

**Other popular themes:**
- Browse themes at https://themes.gohugo.io/
- PaperMod: `https://github.com/adityatelange/hugo-PaperMod.git`
- Ananke: `https://github.com/theNewDynamic/gohugo-theme-ananke.git`

### Step 3: Create Configuration File

The editor uses a `config.json` file for personal settings (not committed to git).

1. **Copy the example config**:
   ```bash
   cd ~/projects/omni-blogger
   cp config.example.json config.json
   ```

2. **Edit `config.json`** with your settings:
   ```json
   {
     "blogPath": "/Users/YOUR_USERNAME/projects/my-blog",
     "blogUrl": "http://localhost:1313",
     "apiUrl": "http://localhost:3000",
     "deployCommand": null
   }
   ```

3. **Update the values**:
   - **blogPath**: Absolute path to your Hugo blog folder
   - **blogUrl**: Your blog URL (use `http://localhost:1313` for local preview, or `https://yourdomain.com` when deployed)
   - **apiUrl**: Editor server URL (usually `http://localhost:3000`)
   - **deployCommand**:
     - Set to `null` for manual deployment
     - Or set to a command that commits and pushes to GitHub:
       ```json
       "deployCommand": "cd /Users/YOUR_USERNAME/projects/my-blog && git add -A && git commit -m \"New post\" && git push"
       ```

**Why config.json?**
- ✅ Keeps personal paths private (not in git)
- ✅ Easy to set up (copy example, fill in values)
- ✅ Standard practice for local configuration
- ✅ One file to update all settings

### Step 4: Start the Editor Server

```bash
cd ~/projects/omni-blogger  # Adjust path to where you installed it
node server.js
```

You should see:
```
╔════════════════════════════════════════╗
║       📝 Blog Editor Server            ║
╠════════════════════════════════════════╣
║  Open: http://localhost:3000            ║
╚════════════════════════════════════════╝
```

If you see an error about `config.json not found`, make sure you completed Step 3.

### Step 5: (Optional) Start Hugo Preview Server

In a **second terminal**, start Hugo's development server to preview your blog:

```bash
cd ~/projects/my-blog  # Adjust to your Hugo blog location
hugo server
```

Your blog preview will be available at **http://localhost:1313**

### Step 6: Start Writing!

Open your browser and go to:
```
http://localhost:3000
```

You're ready to write! When you click **"✨ Publish"**, your posts will automatically:
- Save to `your-blog/content/posts/`
- Trigger a Hugo rebuild with `hugo --minify`
- Appear at http://localhost:1313 (if Hugo server is running)

---

## Using the Editor

### Writing a Post

1. **Enter a title** in the title field
2. **Add tags** (optional) - comma separated like: `thoughts, running, qa`
3. **Write your content** in the main editor area
4. Use the **toolbar** to format text:

| Button | Action |
|--------|--------|
| **B** | Bold text |
| *I* | Italic text |
| H2 | Heading 2 |
| H3 | Heading 3 |
| • | Bullet list |
| 1. | Numbered list |
| " | Block quote |
| 🔗 | Insert link |
| </> | Inline code |

### Saving Drafts

- **Auto-save**: Drafts are saved automatically after 2 seconds of inactivity
- **Manual save**: Click "Save Draft" or press `⌘S`
- **View drafts**: Click "Drafts" button to see all saved drafts

Drafts are stored in your browser's localStorage (not in files).

### Publishing

1. Click the **✨ Publish** button (or press `⌘Enter`)
2. The editor will:
   - Convert your content to Markdown
   - Save to `myblog/content/posts/your-post-title.md`
   - Run `hugo --minify` to build the site
   - Run your deploy command (if configured)
3. A success modal appears with a link to your post

### Offline Mode

If the server isn't running when you click Publish:
- The editor will download the Markdown file
- You can manually move it to your Hugo blog and deploy

---

## Configuration

### Using config.json (Recommended)

All configuration is managed through `config.json` (not committed to git). This keeps your personal settings private.

**Configuration file**: `config.json`

```json
{
  "blogPath": "/Users/YOUR_USERNAME/projects/my-blog",
  "blogUrl": "https://yourdomain.com",
  "apiUrl": "http://localhost:3000",
  "deployCommand": null
}
```

**Settings:**

| Setting | Description | Example |
|---------|-------------|---------|
| `blogPath` | Absolute path to your Hugo blog | `/Users/max/projects/my-blog` |
| `blogUrl` | Your blog's public URL | `https://yourdomain.com` or `http://localhost:1313` |
| `apiUrl` | Editor server URL | `http://localhost:3000` |
| `deployCommand` | Command to run after Hugo build | See examples below |

**Deploy Command Examples:**

```json
// No deployment (manual)
"deployCommand": null

// Auto-commit and push to GitHub
"deployCommand": "cd /Users/YOUR_USERNAME/projects/my-blog && git add -A && git commit -m \"New post\" && git push"

// Custom deploy script
"deployCommand": "./deploy.sh"

// Rsync to server
"deployCommand": "rsync -avz --delete public/ user@server:~/www/"

// Firebase
"deployCommand": "firebase deploy"
```

**Note:** The server (`server.js`) and client (`editor.js`) both read from `config.json`. The server loads it at startup, and the client fetches it via the `/config` API endpoint.

---

## How It Works

### HTML to Markdown Conversion

The editor uses `contenteditable` for WYSIWYG editing. When you publish, the `htmlToMarkdown()` function converts HTML to Markdown:

| HTML | Markdown |
|------|----------|
| `<strong>text</strong>` | `**text**` |
| `<em>text</em>` | `*text*` |
| `<h2>Heading</h2>` | `## Heading` |
| `<ul><li>item</li></ul>` | `- item` |
| `<blockquote>text</blockquote>` | `> text` |
| `<a href="url">text</a>` | `[text](url)` |
| `<code>code</code>` | `` `code` `` |

### Front Matter Generation

The editor automatically generates Hugo front matter:

```yaml
---
title: "Your Post Title"
date: 2024-01-20T15:30:00.000Z
draft: false
tags: ["tag1", "tag2"]
---
```

### Slug Generation

Post filenames are generated from the title:
- "My First Blog Post" → `my-first-blog-post.md`
- Special characters are removed
- Spaces become hyphens
- Limited to 60 characters

---

## Customization Guide

### Changing Colors (style.css)

Find the CSS variables at the top of `style.css`:

```css
:root {
  /* Light theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --accent-color: #007bff;
  
  /* Change these to customize your theme */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark theme */
    --bg-primary: #1a1a1a;
    --text-primary: #e9ecef;
  }
}
```

### Changing Fonts (style.css)

```css
:root {
  /* System fonts */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
  --font-mono: "SF Mono", Menlo, Monaco, monospace;
}
```

To use custom fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

:root {
  --font-sans: 'Inter', sans-serif;
}
```

### Changing Editor Width (style.css)

```css
:root {
  --editor-max-width: 720px;  /* Change this */
}
```

### Adding Custom Toolbar Buttons (editor.js)

1. Add button to HTML in `index.html`:
```html
<button type="button" data-command="strikethrough" title="Strikethrough">S̶</button>
```

2. Add command handler in `editor.js`:
```javascript
const toolbarCommands = {
  // ... existing commands ...
  strikethrough: () => document.execCommand('strikethrough'),
};
```

3. Update `htmlToMarkdown()` to handle the new format:
```javascript
case 's':
case 'strike':
  return `~~${children}~~`;
```

### Changing Auto-save Delay (editor.js)

```javascript
function initAutoSave() {
  // ...
  autoSaveTimeout = setTimeout(() => {
    // ...
  }, 2000);  // Change this value (milliseconds)
}
```

### Adding Image Support

This requires additional work:
1. Add file upload input to HTML
2. Handle file upload in server.js
3. Save images to `myblog/static/images/`
4. Insert Markdown image syntax

Example implementation available in Future Enhancements section.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘B` | Bold |
| `⌘I` | Italic |
| `⌘S` | Save draft |
| `⌘Enter` | Publish |

Browser defaults also work:
| Shortcut | Action |
|----------|--------|
| `⌘Z` | Undo |
| `⌘Shift+Z` | Redo |
| `⌘A` | Select all |

---

## Troubleshooting

### "Server not running" when publishing

**Symptom**: File downloads instead of publishing

**Solution**: Start the server
```bash
cd ~/projects/omni-blogger  # Adjust to your editor location
node server.js
```

### Hugo build fails

**Symptom**: Error message about Hugo

**Check**:
1. Hugo is installed: `hugo version`
2. Blog path is correct in `server.js` (should point to your Hugo blog folder)
3. Your Hugo blog works: `cd ~/projects/my-blog && hugo`
4. A theme is installed: check `hugo.toml` has a `theme` entry

### Post not appearing on site

**Check**:
1. Post has `draft: false` in front matter
2. Hugo build completed successfully
3. Deploy command ran (check server console)
4. Clear browser cache

### Drafts disappeared

Drafts are stored in browser localStorage. They may be lost if you:
- Clear browser data
- Use a different browser
- Use incognito mode

**Future improvement**: Store drafts as files

### CORS errors in console

Make sure you're accessing the editor via:
```
http://localhost:3000
```
Not by opening the HTML file directly.

---

## Future Enhancements

Ideas for extending the editor:

### 1. Image Upload Support

```javascript
// Add to server.js
async function handleImageUpload(req, res) {
  // Save to myblog/static/images/
  // Return the image path
}
```

### 2. Preview Panel

Split view showing Markdown preview alongside editor.

### 3. File-based Drafts

Save drafts as files instead of localStorage:
```javascript
// Save to myblog/content/drafts/
```

### 4. Edit Existing Posts

Load posts from Hugo for editing:
```javascript
// GET /posts/:filename
// Returns the markdown content
```

### 5. Convert to Electron App

Package as a standalone Mac app:
```bash
npm install electron
# Create main.js for Electron
```

### 6. AI Summarization

Add button to summarize/polish content using Claude API.

### 7. Sync with Freewrite

Import entries from Freewrite app for editing/publishing.

---

## Quick Reference

### Start the Editor
```bash
cd ~/projects/omni-blogger && node server.js
# Open http://localhost:3000
```

### Start Hugo Preview (optional)
```bash
cd ~/projects/my-blog && hugo server
# Open http://localhost:1313
```

### File Locations

| What | Where |
|------|-------|
| Editor files | Where you installed omni-blogger |
| Blog posts | `<your-blog-path>/content/posts/` |
| Built site | `<your-blog-path>/public/` |
| Drafts | Browser localStorage |

### Workflow

```
Write in Editor → Click Publish → Hugo builds → Preview at localhost:1313
```

---

## Deployment Guide

**Want to deploy your own instance? Follow these steps.**

### Prerequisites

- Cloudflare account (free tier)
- GitHub account
- Your Hugo blog repository
- Domain (optional, can use *.pages.dev subdomain)

### Step 1: Deploy Blog to Cloudflare Pages

If not already done:

1. Push your Hugo blog to GitHub
2. Go to Cloudflare Dashboard → Pages → Create project
3. Connect to your blog repository
4. Build settings:
   - Framework: Hugo
   - Build command: `hugo --minify`
   - Build output: `public`
5. Deploy
6. (Optional) Add custom domain

See [todo.md](todo.md) Phase 1 for detailed steps.

### Step 2: Deploy Editor to Cloudflare Pages

1. Push this repository (omni-blogger) to GitHub
2. Go to Cloudflare Dashboard → Pages → Create project
3. Connect to omni-blogger repository
4. Build settings:
   - Framework: None
   - Build command: (leave empty)
   - Build output: `/` or leave empty
5. Deploy
6. Add custom domain (e.g., `editor.yourdomain.com`)

### Step 3: Add Authentication (Cloudflare Access)

1. Go to Cloudflare Dashboard → Zero Trust
2. Access → Applications → Add Application
3. Select "Self-hosted"
4. Configure:
   - Application name: Blog Editor
   - Domain: editor.yourdomain.com
5. Add Access Policy:
   - Allow: Emails
   - Enter your email(s)
6. Save

### Step 4: Create Cloudflare Worker

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Create Worker project:
   ```bash
   mkdir publish-worker
   cd publish-worker
   ```

3. Create `wrangler.toml`:
   ```toml
   name = "blog-publisher"
   main = "src/index.js"
   compatibility_date = "2024-12-10"
   ```

4. Create `src/index.js`:
   - See [ROADMAP.md](ROADMAP.md) Phase 3 for the Worker code
   - Update the `repo` variable to your blog repository

5. Deploy:
   ```bash
   wrangler deploy
   ```

6. Add GitHub token as secret:
   ```bash
   wrangler secret put GITHUB_TOKEN
   # Paste your GitHub Personal Access Token (with 'repo' scope)
   ```

### Step 5: Connect Editor to Worker

1. Create `config.js` in your omni-blogger repository:
   ```javascript
   const CONFIG = {
     blogUrl: 'https://yourdomain.com',
     apiUrl: 'https://blog-publisher.your-subdomain.workers.dev',
     publishEndpoint: ''
   };
   ```

2. Update `index.html` to load config.js:
   ```html
   <script src="config.js"></script>
   <script src="editor.js"></script>
   ```

3. Commit and push to GitHub
4. Cloudflare Pages will auto-deploy

### Step 6: Test

1. Visit your editor URL (e.g., `editor.yourdomain.com`)
2. Login with authentication
3. Write a test post
4. Click "Publish"
5. Wait ~2 minutes
6. Check your blog - post should appear!

### Costs

| Service | Usage | Cost |
|---------|-------|------|
| Cloudflare Pages (blog) | Free tier | $0 |
| Cloudflare Pages (editor) | Free tier | $0 |
| Cloudflare Workers | Free tier (100k req/day) | $0 |
| Cloudflare Access | Free tier (50 users) | $0 |
| Domain (optional) | Varies | ~$10-15/year |

**Total**: $0-15/year (domain only if you want custom domain)

---

## Support

This is a personal tool you own and control. For issues:

1. Check the Troubleshooting section
2. Check the browser console for errors
3. Check the server console for errors (if using local)
4. Check Cloudflare Worker logs (if using web)
5. Modify the code to fix issues—it's yours!

**Resources:**
- [README.md](README.md) - Project overview
- [ROADMAP.md](ROADMAP.md) - Implementation details and learnings
- [todo.md](todo.md) - Detailed deployment checklist

---

*Built for writers who want to own their content.*
