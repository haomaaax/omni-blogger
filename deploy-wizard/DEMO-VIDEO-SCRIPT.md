# Demo Video Script (< 2 minutes)

**Target length:** 1:45 - 1:55
**Format:** Screen recording + voiceover
**Resolution:** 1920x1080 @ 30fps
**Tool:** QuickTime Screen Recording (Mac) or OBS Studio

---

## Script

**[0:00-0:10] HOOK (10 seconds)**

**Visual:** Show sparkler.club blog homepage, scroll through a post

**Voiceover:**
"I built a blog platform that deploys in 10 minutes. No CLI, no console extraction, just your fingerprint. Let me show you."

---

**[0:10-0:25] PROBLEM SETUP (15 seconds)**

**Visual:** Show a terminal with complex commands scrolling (pre-recorded)

**Voiceover:**
"Deploying a blog used to take 3-4 hours. Install Node, authenticate CLI tools, extract passkeys from the console. Not anymore."

---

**[0:25-0:35] WIZARD INTRO (10 seconds)**

**Visual:** Navigate to https://omni-blogger-wizard.pages.dev, show landing page

**Voiceover:**
"Here's the one-click wizard. Five steps: blog name, Cloudflare, GitHub, options, deploy. Let's go through it."

---

**[0:35-0:45] STEP 1 & 2 (10 seconds)**

**Visual:**
- Enter blog name "my-awesome-blog"
- Show real-time URL preview
- Click "Next"
- Step 2: Enter Cloudflare API token (blur the token)
- Click "Verify Token"
- Show green checkmark

**Voiceover:**
"Enter your blog name, connect Cloudflare with an API token, verify it works."

---

**[0:45-0:55] STEP 3 & 4 (10 seconds)**

**Visual:**
- Step 3: Enter GitHub token (blur token)
- Click "Verify Token"
- Show green checkmark
- Step 4: Toggle "Enable email subscriptions" off
- Keep repository private
- Click "Next"

**Voiceover:**
"Connect GitHub, configure your options. I'll skip email subscriptions for now to keep it simple."

---

**[0:55-1:05] STEP 5: DEPLOY (10 seconds)**

**Visual:**
- Step 5: Review screen showing all configuration
- Click "Start Deployment"
- Show progress bar with animated steps:
  - Creating GitHub repositories ✓
  - Deploying Worker ✓
  - Creating KV namespaces ✓
  - Deploying Editor ✓
  - Deploying Blog ✓

**Voiceover:**
"Review and deploy. Watch as it creates repositories, deploys Workers and Pages, configures everything automatically."

---

**[1:05-1:25] BREAKTHROUGH: PASSKEY SETUP (20 seconds)**

**Visual:**
- Success screen appears
- New tab auto-opens: passkey-setup.html
- Show the intro screen with device support grid
- Click "Register Passkey"
- Show Touch ID prompt (native macOS dialog)
- Touch fingerprint (screen records the dialog disappearing)
- Success screen: "Passkey Registered Successfully!"
- Show URLs: editor.my-awesome-blog.pages.dev and my-awesome-blog.pages.dev

**Voiceover:**
"Here's the magic. Passkey setup opens automatically. Click register, touch your fingerprint, done. No console, no manual extraction. The public key is extracted and configured automatically."

---

**[1:25-1:40] EDITOR DEMO (15 seconds)**

**Visual:**
- Click "Open Editor" button
- Navigate to editor.my-awesome-blog.pages.dev
- Passkey login prompt appears
- Touch fingerprint
- Editor opens: minimalist interface, just title and content
- Type title: "My First Post"
- Type content: "Testing Omni Blogger. This was incredibly easy to set up."
- Click "Publish" button (top right)
- Show "Publishing..." then "Published!" confirmation

**Voiceover:**
"The editor is minimalist. Just title and content, no distractions. Write your post, click publish, authenticate with your fingerprint, and it's live."

---

**[1:40-1:55] RESULT & CALL TO ACTION (15 seconds)**

**Visual:**
- Navigate to my-awesome-blog.pages.dev
- Show the published post
- Scroll through the clean blog design
- Show footer with "Subscribe via Email" form
- End on browser showing: https://omni-blogger-wizard.pages.dev

**Voiceover:**
"Post is live. Clean, fast, static site. From zero to published blog in under 15 minutes. Try it yourself at omni-blogger-wizard.pages.dev. You own everything: the infrastructure, the content, the subscribers."

**Text overlay:**
```
omni-blogger-wizard.pages.dev
github.com/haomaaax/omni-blogger
```

---

## Recording Tips

### Before Recording

1. **Clean up browser:**
   - Close all tabs except wizard
   - Clear bookmarks bar (⌘+Shift+B to hide)
   - Use Chrome Incognito or clean profile
   - Set zoom to 100%

2. **Prepare accounts:**
   - Have Cloudflare API token ready
   - Have GitHub token ready
   - Use tokens with limited scope (can revoke after demo)

3. **Test run:**
   - Run through wizard once to ensure smooth flow
   - Note timing for each step
   - Identify any slow loading screens

4. **Screen setup:**
   - Close all apps except browser
   - Turn on Do Not Disturb
   - Hide desktop icons (Cmd+J → uncheck "Show items")
   - Set solid color desktop background

### During Recording

1. **Cursor movement:**
   - Move cursor smoothly, not too fast
   - Pause briefly before clicks
   - Highlight important areas by hovering

2. **Typing:**
   - Type at normal speed (not too fast)
   - Don't show typos/corrections
   - Use autocomplete if available

3. **Pacing:**
   - Match voiceover timing
   - Leave 1-2 second pauses between sections
   - Don't rush through success screens

4. **Token blurring:**
   - Use video editing to blur tokens
   - Or use fake demo tokens
   - Never show real tokens in video

### After Recording

1. **Edit with iMovie/Final Cut/DaVinci Resolve:**
   - Trim dead time
   - Add blur over tokens
   - Add text overlays for URLs
   - Speed up slow sections (1.25x max)
   - Add subtle transitions between sections

2. **Audio:**
   - Record voiceover separately (better quality)
   - Use USB microphone (Blue Yeti, Audio-Technica ATR2100)
   - Record in quiet room
   - Normalize audio levels

3. **Export settings:**
   - Format: MP4 (H.264)
   - Resolution: 1920x1080
   - Frame rate: 30fps
   - Bitrate: 8-10 Mbps
   - Audio: AAC, 128 kbps

---

## Alternative: Animated GIF Version (for Twitter/README)

**Length:** 10-15 seconds
**Format:** GIF (< 5MB for Twitter)

**Content:**
1. Show wizard step 1-2 (fast forward)
2. Show passkey Touch ID prompt
3. Show success screen
4. Show published blog
5. Text overlay: "10 minutes. No CLI. You own everything."

**Tools:**
- Record with QuickTime
- Convert with Gifski (https://gif.ski) - best quality
- Or use GIPHY Capture

---

## Video Hosting

**YouTube:**
- Upload as unlisted first (test embed)
- Public when ready to launch
- Title: "Deploy Your Own Blog in 10 Minutes with Omni Blogger"
- Description: Include wizard link, GitHub link, timestamps
- Tags: webauthn, cloudflare, static site, blogging, self-hosted, hugo, passkeys, touch id

**Vimeo:**
- Better quality for demos
- Cleaner embed (no YouTube clutter)
- Pro account for custom player colors

**Direct embed on landing page:**
- Use HTML5 video tag
- Autoplay muted on landing page
- Add play/pause controls

---

## Thumbnail Design

**YouTube thumbnail should show:**
1. Large text: "10 MINUTES"
2. Screenshot of Touch ID prompt
3. Arrow pointing to "No Console!"
4. Your face (optional, increases CTR)
5. Bright colors: Blue (#1C3A52) + Orange (#FF6B35)

**Tool:** Canva (use YouTube thumbnail template)

---

## Distribution Checklist

- [ ] Upload to YouTube (unlisted first)
- [ ] Test embed on wizard landing page
- [ ] Create GIF version for Twitter
- [ ] Upload GIF to GIPHY (for easy sharing)
- [ ] Add video to README (embed YouTube)
- [ ] Add video to Hacker News post (link in comments)
- [ ] Share on Twitter with GIF
- [ ] Add to Product Hunt submission

---

## Sample Voiceover Script (Copy-Paste)

"I built a blog platform that deploys in 10 minutes. No CLI, no console extraction, just your fingerprint. Let me show you.

Deploying a blog used to take 3-4 hours. Install Node, authenticate CLI tools, extract passkeys from the console. Not anymore.

Here's the one-click wizard. Five steps: blog name, Cloudflare, GitHub, options, deploy. Let's go through it.

Enter your blog name, connect Cloudflare with an API token, verify it works.

Connect GitHub, configure your options. I'll skip email subscriptions for now to keep it simple.

Review and deploy. Watch as it creates repositories, deploys Workers and Pages, configures everything automatically.

Here's the magic. Passkey setup opens automatically. Click register, touch your fingerprint, done. No console, no manual extraction. The public key is extracted and configured automatically.

The editor is minimalist. Just title and content, no distractions. Write your post, click publish, authenticate with your fingerprint, and it's live.

Post is live. Clean, fast, static site. From zero to published blog in under 15 minutes. Try it yourself at omni-blogger-wizard.pages.dev. You own everything: the infrastructure, the content, the subscribers."

**Word count:** 193 words
**Speaking pace:** 120-130 words/minute
**Estimated time:** 1:30 - 1:40 (perfect!)

---

## Ready to Record

All prep materials are ready. Follow this script and you'll have a compelling demo video that showcases the key breakthrough: zero-friction passkey setup.

Good luck with the recording!
