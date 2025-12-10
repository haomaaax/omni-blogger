# Blog Editor Roadmap: Single-User Web Editor

## Vision
Transform the local blog editor into a web-based application accessible from any device, without requiring a local server.

**Primary Goal:** Enable writing and publishing from anywhere (Mac, iPhone, any browser) without running `node server.js`.

**Secondary Goal:** Make it easy to demo/share with non-technical people.

---

## Current State vs. Future State

### ✅ Current (Local Editor)
```
Your Mac (localhost:3000)
  ↓ Run: node server.js
  ↓ Write post
  ↓ Click Publish
  ↓ Auto-commits to GitHub
  ↓ Cloudflare Pages builds
  ↓ Live at sparkler.club
```

**Limitations:**
- ❌ Must be at your Mac
- ❌ Must run local server
- ❌ Can't access from iPhone
- ❌ Hard to demo to non-technical people

### 🎯 Future (Web Editor)
```
Any Device (sparkler.club/editor)
  ↓ Visit URL, login with passkey
  ↓ Write post
  ↓ Click Publish
  ↓ Cloudflare Worker commits to GitHub
  ↓ Cloudflare Pages builds
  ↓ Live at sparkler.club
```

**Benefits:**
- ✅ Access from any device (Mac, iPhone, iPad)
- ✅ No local server needed
- ✅ Easy to demo (just share URL)
- ✅ Write from anywhere
- ✅ Single-user (you), but shareable UI

---

## Implementation Phases

## 🌐 Phase 1: Deploy Editor to Web (Week 1)

### Goal
Make the editor accessible at `sparkler.club/editor` without local server.

### 1.1 Set Up Cloudflare Pages for Editor (1 hour)

**Option A: Same Project, Different Path**
- [ ] Add `editor/` folder to your blog repo
- [ ] Copy editor files to `editor/` folder
- [ ] Configure Cloudflare Pages to serve from root
- [ ] Hugo ignores `/editor` path
- [ ] Access at: `sparkler.club/editor/`

**Option B: Separate Project (Recommended)**
- [ ] Create new Cloudflare Pages project for editor
- [ ] Deploy omni-blogger repo to Cloudflare Pages
- [ ] Configure custom domain: `editor.sparkler.club`
- [ ] Access at: `editor.sparkler.club`

**Commands:**
```bash
# Push omni-blogger to GitHub (already done)
cd ~/sparkler/omni-blogger
git push

# In Cloudflare Dashboard:
# Pages → Create → Connect to Git
# Select omni-blogger repo
# Build settings: NONE (static files only)
# Deploy
```

### 1.2 Update Editor for Web Deployment (2 hours)

Currently the editor expects `config.json` from local filesystem. For web deployment:

**Create `config.js` for client-side:**
```javascript
// config.js - Client-side config (committed to git)
const CONFIG = {
  blogUrl: 'https://sparkler.club',
  apiUrl: 'https://api.sparkler.club', // or Cloudflare Worker URL
  publishEndpoint: '/publish' // Cloudflare Worker endpoint
};
```

**Update index.html:**
- [ ] Change `<script src="editor.js">` to load after config
- [ ] Remove dependency on `/config` endpoint
- [ ] Use client-side config

**Update editor.js:**
- [ ] Remove `loadConfig()` function (no server to fetch from)
- [ ] Use CONFIG directly from `config.js`
- [ ] Update publish URL to Worker endpoint

### 1.3 Test Deployment (30 mins)
- [ ] Visit `editor.sparkler.club` (or `sparkler.club/editor`)
- [ ] Verify editor loads
- [ ] Verify WYSIWYG works
- [ ] Verify drafts save to localStorage
- [ ] Note: Publishing won't work yet (needs Phase 2)

---

## 🔐 Phase 2: Add Passkey Authentication (Week 2)

### Goal
Secure the editor so only you (and invited people) can access it.

### 2.1 Choose Auth Strategy

**Option A: Cloudflare Access (Easiest)**
- [ ] Enable Cloudflare Access on `editor.sparkler.club`
- [ ] Configure allowed emails (just yours)
- [ ] One-click passkey/Google login
- [ ] Free tier: 50 users
- [ ] **Pros:** No code needed, managed by Cloudflare
- [ ] **Cons:** Requires Cloudflare Zero Trust setup

**Option B: Custom Passkey Auth (More Control)**
- [ ] Use WebAuthn API for passkey
- [ ] Store authenticated session in localStorage
- [ ] Challenge/response with Cloudflare Worker
- [ ] **Pros:** Full control, learn passkey tech
- [ ] **Cons:** More code to write

**Recommendation:** Start with Cloudflare Access (Option A)

### 2.2 Implement Cloudflare Access (1-2 hours)

**Steps:**
1. [ ] Go to Cloudflare Dashboard → Zero Trust
2. [ ] Access → Applications → Add Application
3. [ ] Select "Self-hosted"
4. [ ] Application domain: `editor.sparkler.club`
5. [ ] Add policy: Allow emails → your@email.com
6. [ ] Configure identity provider (Google, GitHub, or Email OTP)
7. [ ] Save

**Test:**
- [ ] Visit `editor.sparkler.club`
- [ ] See Cloudflare Access login screen
- [ ] Login with your email
- [ ] Access granted → Editor loads

### 2.3 Optional: Add More Users (5 mins each)
- [ ] Add friend's email to allowed list
- [ ] They login with their email
- [ ] They can use YOUR editor to publish to YOUR blog
- [ ] (Multi-tenant comes later if you want)

---

## ⚡ Phase 3: Serverless Publishing (Week 3)

### Goal
Enable publishing from web editor using Cloudflare Workers (no local server).

### 3.1 Create Cloudflare Worker for Publishing (3-4 hours)

**What it does:**
- Receives post from editor
- Commits to your GitHub repo
- Triggers Cloudflare Pages rebuild

**File: `publish-worker.js`**
```javascript
export default {
  async fetch(request, env) {
    // Only allow POST to /publish
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get post data
    const { filename, content } = await request.json();

    // Validate
    if (!filename || !content) {
      return new Response('Missing data', { status: 400 });
    }

    // Commit to GitHub via API
    const githubToken = env.GITHUB_TOKEN;
    const repo = 'haomaaax/my-blog'; // Your blog repo
    const path = `content/posts/${filename}`;

    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add post: ${filename}`,
          content: btoa(content), // Base64 encode
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return new Response(`GitHub API error: ${error}`, { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### 3.2 Deploy Cloudflare Worker (1 hour)

**Setup:**
```bash
# Install Wrangler (Cloudflare CLI)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create worker project
mkdir publish-worker
cd publish-worker
wrangler init

# Copy publish-worker.js to src/index.js

# Deploy
wrangler deploy
```

**Configure:**
- [ ] Add GitHub Personal Access Token as secret:
  ```bash
  wrangler secret put GITHUB_TOKEN
  # Paste your GitHub token (with repo scope)
  ```
- [ ] Note your Worker URL: `https://publish-worker.YOUR_SUBDOMAIN.workers.dev`

### 3.3 Update Editor to Use Worker (30 mins)

**Update `config.js`:**
```javascript
const CONFIG = {
  blogUrl: 'https://sparkler.club',
  apiUrl: 'https://publish-worker.YOUR_SUBDOMAIN.workers.dev',
  publishEndpoint: '/publish'
};
```

**No changes needed to `editor.js`** - it already posts to `${CONFIG.apiUrl}/publish`!

### 3.4 Test End-to-End Publishing (15 mins)
- [ ] Visit `editor.sparkler.club`
- [ ] Login with passkey
- [ ] Write test post
- [ ] Click "✨ Publish"
- [ ] Wait ~2 minutes
- [ ] Check https://sparkler.club → Post appears!

---

## ✨ Phase 4: Polish & Features (Week 4)

### Goal
Improve UX and add quality-of-life features.

### 4.1 Mobile-Friendly UI (3-4 hours)
- [ ] Test on iPhone Safari
- [ ] Adjust toolbar for touch (bigger buttons)
- [ ] Fix keyboard covering editor
- [ ] Add viewport meta tag
- [ ] Test landscape/portrait modes

### 4.2 Better Feedback (2 hours)
- [ ] Add loading spinner during publish
- [ ] Show "Publishing... please wait ~2 min" message
- [ ] Add countdown timer (2 minutes)
- [ ] Success modal with "View Post" link
- [ ] Error handling (show what went wrong)

### 4.3 Draft Persistence (2 hours)

**Current:** Drafts in localStorage (browser-specific)

**Options:**
- [ ] **Option A:** Keep localStorage (simple, works)
- [ ] **Option B:** Add Supabase for cloud drafts (original Phase 1)
- [ ] **Option C:** Save drafts as GitHub commits in `/drafts` folder

**Recommendation:** Keep localStorage for now, add Supabase later if needed.

### 4.4 Share with Friends (1 hour)
- [ ] Add friend's email to Cloudflare Access
- [ ] Send them link: `editor.sparkler.club`
- [ ] They login and can publish to YOUR blog
- [ ] (Their posts appear under your name for now)

### 4.5 Optional: PWA Features (2-3 hours)
- [ ] Add `manifest.json` for "Add to Home Screen"
- [ ] Add service worker for offline editing
- [ ] Create app icon (512x512)
- [ ] Test installation on iPhone

---

## 📊 Success Metrics

### Phase 1 Success
- [ ] Editor accessible at `editor.sparkler.club`
- [ ] Loads on Mac, iPhone, any browser
- [ ] WYSIWYG editing works
- [ ] Drafts save to localStorage

### Phase 2 Success
- [ ] Login required to access editor
- [ ] Only you (and invited friends) can access
- [ ] Passkey/email login works smoothly

### Phase 3 Success
- [ ] Publish button works from web editor
- [ ] Post appears on sparkler.club within 2 minutes
- [ ] No local server needed
- [ ] Works from iPhone

### Phase 4 Success
- [ ] Comfortable to use on mobile
- [ ] Shared with at least one friend successfully
- [ ] No major bugs or UX issues

---

## Alternative: Quick Wins First

If you want to see results faster, here's a condensed plan:

### Week 1: Deploy & Test
- [ ] Deploy editor to Cloudflare Pages
- [ ] Add Cloudflare Access (email auth)
- [ ] Test basic editing from web

### Week 2: Publishing
- [ ] Create Cloudflare Worker
- [ ] Connect to GitHub API
- [ ] Test end-to-end publish

### Week 3: Polish
- [ ] Mobile UX improvements
- [ ] Share with one friend
- [ ] Bug fixes

---

## Future: Multi-Tenant (Optional)

If you later want `sparkler.club/alice` for other people's blogs:

### Phase 5: Multi-Tenant Architecture
- [ ] Add user management (Supabase Auth)
- [ ] Each user gets `/username` path
- [ ] Separate Hugo builds per user
- [ ] User-specific GitHub repos or database storage
- [ ] Billing/limits system

**Timeline:** 2-3 months additional work

**Complexity:** High (basically building a SaaS platform)

---

## Cost Breakdown

### Current Costs (Monthly)
- Cloudflare Pages: $0 (free tier)
- Domain (sparkler.club): ~$1.25/month
- **Total: $1.25/month**

### After Web Editor (Monthly)
- Cloudflare Pages (blog): $0
- Cloudflare Pages (editor): $0
- Cloudflare Workers: $0 (free tier: 100k req/day)
- Cloudflare Access: $0 (free tier: 50 users)
- Domain: ~$1.25/month
- **Total: $1.25/month** 🎉

**No cost increase!** Everything uses free tiers.

---

## Resources

### Cloudflare
- Workers: https://developers.cloudflare.com/workers/
- Access: https://developers.cloudflare.com/cloudflare-one/applications/
- Pages: https://developers.cloudflare.com/pages/

### Authentication
- Cloudflare Access Docs: https://developers.cloudflare.com/cloudflare-one/
- WebAuthn (Passkey): https://webauthn.guide/

### GitHub API
- Contents API: https://docs.github.com/en/rest/repos/contents
- Personal Access Tokens: https://github.com/settings/tokens

---

**Last Updated:** 2025-12-03
**Status:** Ready to implement - Phase 1
**Next Action:** Deploy editor to Cloudflare Pages
