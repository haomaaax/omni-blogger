# Blog Editor Manual

A clean, distraction-free blog editor with WYSIWYG interface and one-click publish to your Hugo static site.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Setup Instructions](#setup-instructions)
4. [Using the Editor](#using-the-editor)
5. [Configuration](#configuration)
6. [How It Works](#how-it-works)
7. [Customization Guide](#customization-guide)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Troubleshooting](#troubleshooting)
10. [Future Enhancements](#future-enhancements)

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

```
blog-editor/
├── index.html      # Main HTML file (editor UI)
├── style.css       # Styles (dark/light mode, typography)
├── editor.js       # Client-side JavaScript (WYSIWYG, HTML→Markdown)
├── server.js       # Node.js server (file saving, Hugo build, deploy)
├── MANUAL.md       # This documentation
├── package.json    # Node.js dependencies (if needed)
└── start.sh        # Quick start script
```

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

2. **Hugo** installed and a blog already set up
   ```bash
   # Check if installed
   hugo version
   ```

3. **Your Hugo blog path** (e.g., `/Users/max/myblog`)

### Step 1: Download the Editor Files

Copy the `blog-editor` folder to your preferred location, e.g.:
```bash
mv blog-editor ~/blog-editor
cd ~/blog-editor
```

### Step 2: Configure the Server

Edit `server.js` and update the CONFIG section (around line 15):

```javascript
const CONFIG = {
  port: 3000,
  
  // ⚠️ UPDATE THIS to your Hugo blog folder
  blogPath: '/Users/YOUR_USERNAME/myblog',
  
  editorPath: __dirname,
  
  // ⚠️ UPDATE THIS for auto-deploy (or set to null)
  deployCommand: './deploy.sh',
};
```

### Step 3: Configure the Client

Edit `editor.js` and update the CONFIG section (around line 8):

```javascript
const CONFIG = {
  // ⚠️ UPDATE THIS to your Hugo blog path
  blogPath: '/Users/YOUR_USERNAME/myblog',
  
  // ⚠️ UPDATE THIS to your blog URL
  blogUrl: 'https://yourdomain.com',
  
  apiUrl: 'http://localhost:3000'
};
```

### Step 4: Start the Server

```bash
cd ~/blog-editor
node server.js
```

You should see:
```
╔════════════════════════════════════════╗
║       📝 Blog Editor Server            ║
╠════════════════════════════════════════╣
║  Open: http://localhost:3000           ║
╚════════════════════════════════════════╝
```

### Step 5: Open the Editor

Open your browser and go to:
```
http://localhost:3000
```

You're ready to write!

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

### Server Configuration (server.js)

```javascript
const CONFIG = {
  // Server port
  port: 3000,
  
  // Path to your Hugo blog
  blogPath: '/Users/max/myblog',
  
  // Path to editor files (usually __dirname)
  editorPath: __dirname,
  
  // Deploy command - runs after Hugo build
  // Examples:
  deployCommand: './deploy.sh',
  // deployCommand: 'rsync -avz --delete public/ user@server:~/www/',
  // deployCommand: null,  // Skip deployment
};
```

### Client Configuration (editor.js)

```javascript
const CONFIG = {
  // Your Hugo blog path (for reference only on client)
  blogPath: '/Users/max/myblog',
  
  // Your blog URL (for the "View Post" link after publishing)
  blogUrl: 'https://yourdomain.com',
  
  // API endpoint (should match server port)
  apiUrl: 'http://localhost:3000'
};
```

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
cd ~/blog-editor
node server.js
```

### Hugo build fails

**Symptom**: Error message about Hugo

**Check**:
1. Hugo is installed: `hugo version`
2. Blog path is correct in `server.js`
3. Your Hugo blog works: `cd ~/myblog && hugo`

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
cd ~/blog-editor && node server.js
# Open http://localhost:3000
```

### File Locations

| What | Where |
|------|-------|
| Editor files | `~/blog-editor/` |
| Blog posts | `~/myblog/content/posts/` |
| Built site | `~/myblog/public/` |
| Drafts | Browser localStorage |

### Workflow

```
Write in Editor → Click Publish → Live on your blog
```

---

## Support

This is a personal tool you own and control. For issues:

1. Check the Troubleshooting section
2. Check the browser console for errors
3. Check the server console for errors
4. Modify the code to fix issues—it's yours!

---

*Built for writers who want to own their content.*
