# Omni Blogger - User Manual

**Version**: 2.0
**Last Updated**: December 31, 2025

A minimalist web-based blog editor for pure writing. No distractions, just you and your thoughts.

---

## Quick Start

### Using the Web Editor

1. **Visit the editor**: https://editor.sparkler.club
2. **Login** with email OTP (one-time code sent to your inbox)
3. **Write your post**:
   - Enter title: "What's on your mind?"
   - Write content in the editor area
   - Upload images (optional): Click 📷 button
4. **Publish**: Click "✨ Publish"
5. **Wait ~2 minutes** for site to build
6. **View** at https://sparkler.club

That's it! No setup, no local server, no technical knowledge required.

---

## Features

### Pure Minimalist Interface

The editor has just three elements:

```
┌────────────────────────────────────────┐
│ ☰  [Status]              [✨ Publish] │
├────────────────────────────────────────┤
│                                        │
│  What's on your mind?                  │
│                                        │
│  [Write here - no toolbar, no clutter] │
│                                        │
└────────────────────────────────────────┘
```

**What you see:**
- Hamburger menu (☰) - Access posts, drafts, theme toggle
- Status indicator - Shows auto-save status
- Publish button (✨) - One-click publish

**What you don't see:**
- ❌ No formatting toolbar
- ❌ No tags input
- ❌ No metadata fields
- ❌ No save button (auto-saves every 2 seconds)

### Writing

**Just start typing:**
1. Click in the editor
2. Type your title
3. Press Enter
4. Write your content
5. Done!

**Auto-formatting:**
- Browser's native formatting works (bold, italic, etc.)
- Converted to Markdown automatically on publish
- No need to learn Markdown syntax

**Auto-save:**
- Saves every 2 seconds automatically
- Drafts stored in browser localStorage
- Works offline

### Image Upload

**Upload images:**
1. Click the image upload button (📷)
2. Select one or more images
3. Images appear in editor immediately
4. Continue writing
5. Click Publish - images upload to GitHub

**Supported formats:**
- JPG, PNG, GIF, WebP
- Max size: 5MB per image
- Images display at full quality

**Image preview:**
- See actual image in editor while writing
- Images scale to fit editor width
- No broken image icons

### Publishing

**Click "✨ Publish":**
1. Post converts to Markdown
2. Images upload to GitHub
3. Post saves to GitHub repository
4. Site rebuilds automatically
5. Live at sparkler.club in ~2 minutes

**What gets generated automatically:**
```yaml
---
title: "Your Title"              # From editor
date: 2025-12-31T07:30:00.000Z   # Current time
draft: false                      # Always published
description: "First 150 chars..." # From content
summary: "First 150 chars..."     # From content
keywords: ["auto", "extracted"]   # From title+content
author: "Max Chen"                # Configured
slug: "your-title"                # From title
---
```

You write title and content. Everything else is automatic.

### Managing Posts

**My Posts** (Fountain pen icon):
- Click ☰ → My Posts
- See all published posts
- Click Edit (✏️) to edit
- Click Delete (×) to remove

**Drafts** (Scroll icon):
- Click ☰ → Drafts
- See all saved drafts
- Click to load and continue writing
- Auto-saved every 2 seconds

**Dark Mode**:
- Click ☰ → Light Mode / Dark Mode
- Toggle between themes
- Preference saved automatically

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘S` or `Ctrl+S` | Save draft manually |
| `⌘Enter` or `Ctrl+Enter` | Publish post |
| `Esc` | Close menu/modals |

Browser defaults also work:
- `⌘Z` / `Ctrl+Z` - Undo
- `⌘B` / `Ctrl+B` - Bold
- `⌘I` / `Ctrl+I` - Italic

---

## Mobile Usage

### iPhone / iPad

The editor works perfectly on mobile:

1. **Open Safari**: Visit editor.sparkler.club
2. **Login**: Enter email, get code, login
3. **Write**: Tap editor, keyboard appears
4. **Upload images**: Tap 📷, choose from Photos
5. **Publish**: Tap ✨ Publish

**Mobile tips:**
- Use Safari for best experience
- Landscape mode gives more space
- Images scale automatically
- Auto-save works offline

### Add to Home Screen (Optional)

For app-like experience:
1. Open editor.sparkler.club in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Editor now appears as app icon

---

## Understanding Auto-Save

### How It Works

**Every 2 seconds:**
1. Editor checks if content changed
2. If yes, saves to browser localStorage
3. Shows "Saved" in status indicator

**What gets saved:**
- Title
- Content (as HTML)
- Images (as base64 preview)
- Timestamp

**What doesn't get saved:**
- Drafts are device-specific
- Clearing browser data removes drafts
- Incognito mode doesn't save drafts

### Finding Your Drafts

1. Click ☰ menu
2. Click "Drafts" (scroll icon)
3. See all saved drafts
4. Click any draft to load it
5. Continue writing or publish

---

## Email Subscriptions

### For Blog Readers

Your blog has email subscriptions enabled:

1. **Reader visits** sparkler.club
2. **Enters email** in subscription form
3. **Receives confirmation email**
4. **Clicks confirm link**
5. **Subscribed!** Gets notified of new posts

### For You (Author)

When you publish a new post:
1. Cloudflare Worker detects new post
2. Sends email to all subscribers
3. Email includes post excerpt + link
4. Unsubscribe link in every email

**You own the data:**
- All emails stored in Cloudflare KV
- Can export subscriber list anytime
- No vendor lock-in
- Free up to 3,000 emails/month

---

## Troubleshooting

### "Publish button not working"

**Check:**
1. Are you logged in?
2. Do you have a title?
3. Check browser console for errors
4. Try refreshing the page

**Solution:**
- Logout and login again
- Clear browser cache
- Try different browser

### "Images not displaying after publish"

**Wait time:**
- Site takes ~2 minutes to rebuild
- Check again after waiting
- Hard refresh browser (Cmd+Shift+R)

**Check:**
- Visit GitHub repo to verify image uploaded
- Check image is in `static/images/` folder
- Verify markdown syntax is correct

### "Drafts disappeared"

Drafts are stored in browser localStorage:

**Common causes:**
- Cleared browser data
- Used different browser
- Used incognito mode
- Different device

**Prevention:**
- Publish important posts (backed up in GitHub)
- Don't rely on drafts for long-term storage
- Use same browser consistently

### "Can't login"

**Email OTP not arriving:**
- Check spam folder
- Wait 1-2 minutes
- Try again
- Use different email provider

**Access denied:**
- Check if your email is authorized
- Contact admin to add your email

---

## Best Practices

### Writing Workflow

**Recommended:**
1. Open editor
2. Start typing title
3. Let auto-save work (every 2 seconds)
4. Write content naturally
5. Add images if needed
6. Click Publish when done
7. Wait 2 minutes
8. Check live site

**Tips:**
- Write freely, don't worry about formatting
- Auto-save handles drafts
- Publish often (you can edit later)
- Keep it simple

### Image Best Practices

**Before uploading:**
- Resize large images (< 2MB recommended)
- Use descriptive filenames
- Choose appropriate format:
  - Photos: JPG
  - Graphics: PNG
  - Animations: GIF

**In editor:**
- Upload images as you write
- Images stay in preview until publish
- Remove unused images before publishing

### Post Management

**Editing published posts:**
1. Click ☰ → My Posts
2. Click Edit (✏️) on any post
3. Make changes
4. Click "Update Post"
5. Site rebuilds automatically

**Deleting posts:**
1. Click ☰ → My Posts
2. Click Delete (×)
3. Confirm deletion
4. Post removed from GitHub + site

---

## Privacy & Security

### Your Data

**What's stored where:**
- **Drafts**: Browser localStorage (device-only)
- **Published posts**: GitHub (private repository)
- **Images**: GitHub static/images/ folder
- **Subscribers**: Cloudflare KV (encrypted)

**Who can access:**
- ✅ You (blog owner)
- ✅ Cloudflare (infrastructure)
- ✅ GitHub (code hosting)
- ❌ Not public (repository is private)
- ❌ Not searchable until published to blog

### Authentication

**Cloudflare Access:**
- Email-based authentication
- One-time passcode (OTP)
- Session lasts 24 hours
- Only authorized emails can login

**Data in Transit:**
- All connections use HTTPS
- End-to-end encryption
- Secure API endpoints

---

## Cost & Limits

### Free Tier Limits

| Service | Limit | Your Usage |
|---------|-------|------------|
| Cloudflare Pages | Unlimited | ✅ Well within |
| Cloudflare Workers | 100k req/day | ✅ ~10-100/day |
| Cloudflare Access | 50 users | ✅ 1 user |
| Cloudflare KV | 1GB storage | ✅ <1MB |
| Resend Email | 3k emails/month | ✅ Depends on subscribers |

### Actual Costs

**Monthly:**
- Domain (sparkler.club): ~$1.25/month
- Everything else: $0

**Total: ~$1.25/month**

---

## Advanced Usage

### Markdown in Posts

While the editor is WYSIWYG, published posts are Markdown:

```markdown
# Heading 1
## Heading 2

**Bold text**
*Italic text*

- Bullet list
1. Numbered list

> Block quote

[Link text](https://example.com)

![Image](images/photo.jpg)
```

The editor handles this conversion automatically.

### Local Development

For developers who want to run locally:

1. **Clone repository:**
```bash
git clone https://github.com/haomaaax/omni-blogger.git
cd omni-blogger
```

2. **Create config.json:**
```json
{
  "blogPath": "/path/to/your/hugo-blog",
  "blogUrl": "http://localhost:1313",
  "apiUrl": "http://localhost:3000",
  "deployCommand": null
}
```

3. **Start server:**
```bash
node server.js
```

4. **Open editor**: http://localhost:3000

See [SPEC.md](SPEC.md) for technical details.

---

## FAQ

**Q: Can I use this for multiple blogs?**
A: Currently single-blog only. Would need Worker modifications for multi-blog.

**Q: Can I share the editor with friends?**
A: Yes! Add their email to Cloudflare Access. They publish to your blog.

**Q: Are my drafts synced across devices?**
A: No, drafts are device-specific (localStorage). Publish to save permanently.

**Q: Can I schedule posts?**
A: Not currently. All posts publish immediately.

**Q: Can I customize the blog theme?**
A: Yes, edit Hugo theme in your blog repository.

**Q: What happens if I delete my Cloudflare account?**
A: All code and content in GitHub. Re-deploy to new host anytime.

**Q: Can I export all my content?**
A: Yes! All posts are Markdown in GitHub. Standard format.

**Q: How do I backup everything?**
A: GitHub auto-backs up your content. Fork repos for extra safety.

---

## Getting Help

### Documentation

- [README.md](README.md) - Project overview
- [SPEC.md](SPEC.md) - Technical specification
- [ROADMAP.md](ROADMAP.md) - Implementation history

### Common Issues

Check SPEC.md "Limitations & Known Issues" section.

### Need More Help?

1. Check browser console for errors
2. Check Cloudflare Worker logs
3. Check GitHub Actions build logs
4. Review this manual's Troubleshooting section

---

**Philosophy**: A timeless blog built to last almost forever. Keep it simple. Own your content. Write freely.

---

*Last updated: December 31, 2025*
