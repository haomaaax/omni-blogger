# Blog Setup TODO List

## ✅ Completed
- [x] Install Node.js and Hugo
- [x] Create Hugo blog in separate folder (`~/sparkler/my-blog`)
- [x] Install PaperMod theme
- [x] Configure server.js with blog path
- [x] Configure editor.js with blog path
- [x] Test editor locally (http://localhost:3000)
- [x] Test Hugo preview locally (http://localhost:1313)
- [x] Update MANUAL.md documentation
- [x] Commit documentation changes to git

---

## 🚀 Next Steps: Cloudflare Pages Deployment

### 1. Create Required Accounts

#### 1.1 GitHub Account (Code Repository)
- [x] Go to https://github.com/signup
- [x] Create a free account (if you don't have one)
- [x] Verify your email address
- [x] Complete GitHub profile setup

#### 1.2 Cloudflare Account (Hosting Platform)
- [x] Go to https://dash.cloudflare.com/sign-up
- [x] Create a free account
- [x] Verify your email address
- [x] Log into Cloudflare dashboard

#### 1.3 Gandi Domain (Already Have!)
- [x] Domain registered on Gandi.net
- [x] Log into Gandi dashboard: https://admin.gandi.net
- [x] Locate your domain
- [x] Note down your domain name

---

### 2. Prepare Hugo Blog for GitHub

#### 2.1 Initialize Git Repository in Blog Folder
```bash
cd ~/sparkler/my-blog
git init
```

#### 2.2 Create .gitignore File
- [ ] Create `.gitignore` in blog root with these contents:
  ```
  public/
  resources/_gen/
  .hugo_build.lock
  .DS_Store
  ```

#### 2.3 Update Hugo Configuration
- [x] Edit `hugo.toml`:
  - [x] Set `baseURL = "https://yourdomain.com"` (use your actual domain)
  - [x] Verify `title` is set correctly
  - [x] Add `publishDir = "public"`

#### 2.4 Test Build Locally
- [x] Run: `hugo --minify`
- [x] Verify `public/` folder is created
- [x] Check for any build errors

---

### 3. Push Blog to GitHub

#### 3.1 Create GitHub Repository
- [x] Go to https://github.com/new
- [x] Repository name: `my-blog` (or any name you prefer)
- [x] Set to **Public** (required for Cloudflare Pages free tier)
- [x] Do NOT initialize with README (we already have files)
- [x] Click "Create repository"

#### 3.2 Push Code to GitHub
```bash
cd ~/sparkler/my-blog
git add .
git commit -m "Initial blog setup with PaperMod theme"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/my-blog.git
git push -u origin main
```
- [x] Run the commands above (replace YOUR-USERNAME)
- [x] Verify code appears on GitHub
- [x] Check that themes/PaperMod appears (as submodule)

---

### 4. Deploy to Cloudflare Pages

#### 4.1 Connect GitHub to Cloudflare
- [x] Log into Cloudflare dashboard: https://dash.cloudflare.com
- [x] Click "Pages" in the left sidebar
- [x] Click "Create a project"
- [x] Click "Connect to Git"
- [x] Select "GitHub"
- [x] Authorize Cloudflare to access GitHub
- [x] Select your blog repository (`my-blog`)

#### 4.2 Configure Build Settings
- [x] Project name: `my-blog` (or preferred name)
- [x] Production branch: `main`
- [x] Framework preset: Select **"Hugo"**
- [x] Build command: `hugo --minify`
- [x] Build output directory: `public`
- [x] Click "Save and Deploy"

#### 4.3 Wait for First Deployment
- [x] Watch build logs (takes 1-3 minutes)
- [x] Verify build succeeds
- [x] Note your Cloudflare Pages URL: `your-project.pages.dev`
- [x] Test the site at that URL

---

### 5. Set Up Custom Domain

#### 5.1 Add Domain to Cloudflare Pages
- [x] In Cloudflare Pages project, click "Custom domains"
- [x] Click "Set up a custom domain"
- [x] Enter your domain: `yourdomain.com`
- [x] Click "Continue"
- [x] Cloudflare will show you DNS records to add

#### 5.2 Option A: Transfer DNS to Cloudflare (Recommended)
**Easiest and fastest option**

- [x] In Cloudflare dashboard, click "Add site"
- [x] Enter your domain name
- [x] Select "Free" plan
- [x] Cloudflare will scan your existing DNS records
- [x] Review DNS records, click "Continue"
- [x] Cloudflare provides nameservers (e.g., `chad.ns.cloudflare.com`)
- [x] Copy the two nameserver addresses

**Update Nameservers at Gandi:**
- [x] Log into Gandi: https://admin.gandi.net
- [x] Go to your domain → "Nameservers"
- [x] Click "Change nameservers"
- [x] Select "External nameservers"
- [x] Paste Cloudflare nameservers
- [x] Save changes
- [x] Wait for propagation (15 mins - 48 hours, usually < 1 hour)

#### 5.2 Option B: Keep DNS at Gandi (Manual Setup)
**If you prefer to keep Gandi DNS** >>> SKIP

- [ ] Log into Gandi dashboard
- [ ] Go to your domain → DNS Records
- [ ] Delete any existing A/AAAA/CNAME records for `@` and `www`
- [ ] Add new CNAME record:
  - **Type:** CNAME
  - **Name:** `@` (or your domain)
  - **Value:** `your-project.pages.dev`
  - **TTL:** 300 (5 minutes)
- [ ] Add CNAME for www:
  - **Type:** CNAME
  - **Name:** `www`
  - **Value:** `your-project.pages.dev`
  - **TTL:** 300
- [ ] Save changes
- [ ] Wait for DNS propagation

---

### 6. Verify Deployment

#### 6.1 Check DNS Propagation
- [x] Go to https://dnschecker.org
- [x] Enter your domain
- [x] Verify records point to Cloudflare
- [x] Check both `yourdomain.com` and `www.yourdomain.com`

#### 6.2 Test Your Live Site
- [x] Open `https://yourdomain.com` in browser
- [x] Verify site loads correctly
- [x] Test `https://www.yourdomain.com`
- [x] Verify HTTPS is working (padlock icon)
- [x] Test on mobile device
- [x] Check all pages work

#### 6.3 Verify Auto-Deployment
- [x] Make a small change to your blog locally
- [x] Commit and push to GitHub:
  ```bash
  cd ~/sparkler/my-blog
  git add .
  git commit -m "Test auto-deployment"
  git push
  ```
- [x] Watch Cloudflare Pages dashboard
- [x] Verify new deployment starts automatically
- [x] Check live site updates after build completes

---

### 7. Update Editor Configuration

#### 7.1 Update editor.js
- [x] Open `~/sparkler/omni-blogger/editor.js`
- [x] Change `blogUrl` from `http://localhost:1313` to `https://yourdomain.com`
- [x] Save file

#### 7.2 Update server.js (Optional - Auto-deploy)
If you want "Publish" button to auto-push to GitHub:
- [x] Open `~/sparkler/omni-blogger/server.js`
- [x] Update `deployCommand`:
  ```javascript
  deployCommand: 'cd /Users/YOUR_USERNAME/sparkler/my-blog && git add -A && git commit -m "New post" && git push'
  ```
- [x] Replace YOUR_USERNAME with your actual username
- [x] Save file
- [x] Restart editor server: `node server.js`

#### 7.3 Test Publishing from Editor
- [x] Open editor: http://localhost:3000
- [x] Write a test post
- [x] Click "Publish"
- [x] Check Cloudflare Pages dashboard for new deployment
- [x] Verify post appears on live site

---

### 8. Optional Enhancements
- [ ] Set up automated backups
- [ ] Configure CDN for faster loading
- [ ] Add comments system (Disqus, utterances, etc.)
- [ ] Set up RSS feed verification
- [ ] Add social media meta tags
- [ ] Create custom 404 page
- [ ] Add search functionality

---

## 📝 Notes

### Account Links
- **GitHub**: https://github.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Gandi Dashboard**: https://admin.gandi.net
- **DNS Checker**: https://dnschecker.org

### DNS Setup - If Keeping Gandi DNS
```
Type    Name    Value                           TTL
CNAME   @       your-project.pages.dev         300
CNAME   www     your-project.pages.dev         300
```

### DNS Setup - If Using Cloudflare DNS (Recommended)
Cloudflare automatically configures DNS when you add a custom domain to Pages.

### Useful Commands
```bash
# Navigate to blog folder
cd ~/sparkler/my-blog

# Build Hugo site locally
hugo --minify

# Test Hugo site locally
hugo server

# Check for errors
hugo --minify --verbose

# Git workflow - Add changes
git status
git add .
git commit -m "Your commit message"
git push

# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com

# View git remote
git remote -v

# Check Hugo version
hugo version
```

### Cloudflare Pages Advantages
- ✅ Unlimited bandwidth (no limits!)
- ✅ Global CDN (fast worldwide)
- ✅ Automatic HTTPS
- ✅ Free SSL certificates
- ✅ Automatic deployments from GitHub
- ✅ Preview deployments for branches
- ✅ Build caching (faster builds)
- ✅ Analytics included

### Workflow After Setup
1. Write post in editor (http://localhost:3000)
2. Click "Publish" → Saves to Hugo, builds locally
3. Changes auto-commit and push to GitHub (if deployCommand set)
4. Cloudflare Pages detects push and deploys automatically
5. Site live in 1-2 minutes!

### Resources
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Hugo Documentation: https://gohugo.io/documentation/
- PaperMod Theme Docs: https://github.com/adityatelange/hugo-PaperMod/wiki
- Gandi DNS Documentation: https://docs.gandi.net/en/domain_names/common_operations/dns_records.html
- GitHub Git Guide: https://docs.github.com/en/get-started/using-git

---

## 🌐 Phase 2: Web Editor Deployment (Single-User)

**Goal:** Deploy editor to the web so you (and friends) can access it from any device without running a local server.

**Target URL:** `editor.sparkler.club` or `sparkler.club/editor`

See [ROADMAP.md](ROADMAP.md) for detailed implementation guide.

### 1. Deploy Editor to Cloudflare Pages

#### 1.1 Choose Deployment Method
- [x] **Option A:** Separate subdomain (`editor.sparkler.club`) - Recommended ✅
- [ ] **Option B:** Same domain, different path (`sparkler.club/editor`)

#### 1.2 Deploy to Cloudflare Pages
- [x] Go to Cloudflare Dashboard → Pages
- [x] Click "Create a project"
- [x] Connect to Git → Select `omni-blogger` repo
- [x] Build settings: None (static files)
- [x] Deploy
- [x] Note your pages.dev URL

#### 1.3 Configure Custom Domain
- [x] In Cloudflare Pages project → Custom domains
- [x] Add custom domain: `editor.sparkler.club`
- [x] Wait for DNS to propagate (~5-15 mins)

#### 1.4 Test Web Editor
- [x] Visit `editor.sparkler.club`
- [x] Verify editor loads
- [x] Test WYSIWYG editing
- [x] Test draft save to localStorage
- [x] Note: Publishing won't work yet (needs Cloudflare Worker)

---

### 2. Add Authentication (Cloudflare Access)

#### 2.1 Set Up Cloudflare Zero Trust
- [x] Go to Cloudflare Dashboard → Zero Trust
- [x] Access → Applications → Add Application
- [x] Select "Self-hosted" application
- [x] Application domain: `editor.sparkler.club`

#### 2.2 Configure Access Policy
- [x] Add policy: Allow specific emails
- [x] Enter your email address
- [x] Choose identity provider (Google, GitHub, or Email OTP)
- [x] Save and deploy

#### 2.3 Test Authentication
- [x] Visit `editor.sparkler.club`
- [x] See Cloudflare Access login screen
- [x] Login with your email
- [x] Access granted → Editor loads

#### 2.4 Add Friends (Optional)
- [ ] Add friend's email to allowed list
- [ ] They can login and use YOUR editor
- [ ] Posts publish to YOUR blog (sparkler.club)

---

### 3. Create Cloudflare Worker for Publishing

#### 3.1 Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```
- [x] Installed Wrangler v4.53.0
- [x] Logged in successfully

#### 3.2 Create Worker Project
```bash
mkdir publish-worker
cd publish-worker
wrangler init
```
- [x] Created Worker project at `~/sparkler/publish-worker`
- [x] Created `wrangler.toml` configuration
- [x] Created `src/index.js` with publishing logic
- [x] Updated repo name to `haomaaax/max-notes`

#### 3.3 Configure GitHub Token
- [x] Go to GitHub → Settings → Developer settings → Personal access tokens
- [x] Create token with `repo` scope
- [x] Copy the token
- [x] Run: `wrangler secret put GITHUB_TOKEN`
- [x] Paste token when prompted

#### 3.4 Deploy Worker
```bash
wrangler deploy
```
- [x] Worker deployed successfully! ✅
- [x] Worker URL: `https://blog-publisher.maxyay5566.workers.dev`

---

### 4. Connect Editor to Worker

#### 4.1 Create config.js for Web
- [x] Create `config.js` in omni-blogger repo
- [x] Add Worker URL as `apiUrl`: `https://blog-publisher.maxyay5566.workers.dev`
- [x] Commit and push to GitHub

#### 4.2 Update index.html
- [x] Load `config.js` before `editor.js`
- [x] Update `<script>` tags order

#### 4.3 Update editor.js
- [x] Remove `loadConfig()` function
- [x] Use CONFIG directly from config.js
- [x] Commit and push changes

#### 4.4 Redeploy Editor
- [x] Cloudflare Pages auto-deploys from GitHub
- [x] Wait ~2 minutes for deploy
- [x] Verify at `editor.sparkler.club`

---

### 5. Test End-to-End Publishing

#### 5.1 Write Test Post from Web
- [x] Visit `editor.sparkler.club`
- [x] Login with authentication
- [x] Write a test post
- [x] Click "✨ Publish"

#### 5.2 Verify Publishing
- [x] Check GitHub repo for new commit
- [x] Wait ~2 minutes for Cloudflare Pages build
- [x] Visit `https://sparkler.club`
- [x] Verify post appears!

#### 5.3 Test from iPhone
- [ ] Open Safari on iPhone
- [ ] Visit `editor.sparkler.club`
- [ ] Login
- [ ] Write quick post
- [ ] Publish successfully

---

### 6. Optional: PWA Features

#### 6.1 Add manifest.json
- [ ] Create app manifest with metadata
- [ ] Add app icons (512x512, 192x192)
- [ ] Link in index.html

#### 6.2 Test "Add to Home Screen"
- [ ] Open editor on iPhone Safari
- [ ] Tap Share → Add to Home Screen
- [ ] Open from home screen (standalone mode)

#### 6.3 Add Service Worker (Optional)
- [ ] Create service worker for offline editing
- [ ] Cache editor files
- [ ] Enable offline mode

---

## 🎉 Success Criteria

### Phase 2 Complete When:
- ✅ Editor accessible from web (editor.sparkler.club)
- ✅ Authentication working (only you can access)
- ✅ Publishing works from web (no local server)
- ✅ Works on Mac, iPhone, any browser
- ✅ Can demo to friends by adding their email
- ✅ Total cost still ~$1.25/month (all free tiers!)

---

## 📚 Additional Resources
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Cloudflare Access: https://developers.cloudflare.com/cloudflare-one/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- GitHub API: https://docs.github.com/en/rest/repos/contents
- WebAuthn/Passkey: https://webauthn.guide/

---

**Last Updated:** 2025-12-19

## 🎉 Phase 2 Status: COMPLETE!

All core functionality is now working:
- ✅ Web editor live at editor.sparkler.club
- ✅ Authentication with Cloudflare Access
- ✅ Publishing via Cloudflare Worker
- ✅ End-to-end tested and verified
- ✅ iPhone testing complete - Success!
- ✅ Custom Worker domain: api.sparkler.club
- ✅ Classic Macintosh aesthetic applied

---

## 🚀 Phase 3: Edit & Delete Posts Feature

**Goal:** Add ability to list, edit, and delete existing posts from the web editor.

**Implementation:** Option B (Extend Cloudflare Worker)
- Keeps GitHub token server-side (more secure)
- Centralized API logic
- Clean separation of concerns

---

### Phase 3.1: Extend Cloudflare Worker (Backend)

#### GitHub API Integration
- [ ] Add GitHub API helper functions
  - [ ] `getFile(path)` - Get single file content
  - [ ] `listFiles(path)` - List files in directory
  - [ ] `updateFile(path, content, sha)` - Update existing file
  - [ ] `deleteFile(path, sha)` - Delete file
- [ ] Add error handling for GitHub API responses
  - [ ] Handle 404 (file not found)
  - [ ] Handle 409 (conflict/outdated SHA)
  - [ ] Handle rate limits
- [ ] Test GitHub API authentication

#### New API Endpoints
- [ ] Add `GET /posts` - List all posts with metadata
  - [ ] Return array: `[{slug, title, date, tags, excerpt}]`
  - [ ] Sort by date (newest first)
  - [ ] Handle empty posts directory
- [ ] Add `GET /posts/:slug` - Get single post
  - [ ] Return: `{content, frontmatter: {title, date, tags}, sha}`
  - [ ] Return 404 if not found
- [ ] Add `PUT /posts/:slug` - Update existing post
  - [ ] Require SHA for conflict detection
  - [ ] Return updated post data
  - [ ] Trigger GitHub rebuild
- [ ] Add `DELETE /posts/:slug` - Delete post
  - [ ] Require SHA for safety
  - [ ] Return success/error
  - [ ] Trigger GitHub rebuild
- [ ] Add CORS headers to all new endpoints
- [ ] Update existing POST endpoint to handle both create and update

#### Utilities
- [ ] Add frontmatter parser
  - [ ] Extract title, date, tags from markdown
  - [ ] Validate frontmatter format
  - [ ] Handle malformed frontmatter
- [ ] Add slug generator/validator
  - [ ] Generate slug from title
  - [ ] Validate slug format (no special chars, no path traversal)
  - [ ] Handle duplicate slugs
- [ ] Add markdown excerpt generator
  - [ ] Extract first 150 chars of content
  - [ ] Strip HTML/markdown syntax
  - [ ] Add "..." if truncated

---

### Phase 3.2: Update Editor (Frontend)

#### Posts List UI (Classic Mac File Browser Style)
- [ ] Create posts list modal/sidebar
  - [ ] Add "📂 My Posts" button to header
  - [ ] Create modal overlay (classic Mac window style)
  - [ ] Add close button (×) in top-right
- [ ] Fetch and display posts from `GET /posts`
  - [ ] Show loading state (spinning indicator)
  - [ ] Display posts in clean list
  - [ ] Each row: title, date, actions
- [ ] Design list item layout
  ```
  ┌─────────────────────────────────────────┐
  │ Testing new API URL                     │
  │ December 12, 2025           [Edit]  [×] │
  └─────────────────────────────────────────┘
  ```
- [ ] Add empty state
  - [ ] Show when no posts exist
  - [ ] "No posts yet. Start writing!"
- [ ] Style to match classic Mac aesthetic
  - [ ] Paper white background
  - [ ] Clean borders
  - [ ] SF Pro Display font
  - [ ] Subtle hover effects

#### Edit Functionality
- [ ] Add Edit button (pencil icon) for each post
- [ ] Load post content on Edit click
  - [ ] Call `GET /posts/:slug`
  - [ ] Parse frontmatter
  - [ ] Populate title field
  - [ ] Populate tags field
  - [ ] Load content into WYSIWYG editor
  - [ ] Store original SHA (for conflict detection)
- [ ] Track edit mode in state
  - [ ] Add `isEditing` flag
  - [ ] Add `currentPostSlug` field
  - [ ] Add `currentPostSha` field
- [ ] Update publish button
  - [ ] Show "Update Post" when editing
  - [ ] Show "Publish Post" when creating new
- [ ] Modify publish logic
  - [ ] If editing: call `PUT /posts/:slug`
  - [ ] If creating: call `POST /`
  - [ ] Pass SHA when updating
  - [ ] Handle conflicts (show error if SHA mismatch)

#### Delete Functionality
- [ ] Add Delete button (× icon) for each post
- [ ] Create confirmation dialog
  - [ ] Classic Mac alert style
  - [ ] Show post title in message
  - [ ] "Delete 'Post Title'? This cannot be undone."
  - [ ] Cancel / Delete buttons
- [ ] Call DELETE endpoint on confirmation
  - [ ] Pass post slug and SHA
  - [ ] Show loading state
- [ ] Remove deleted post from list
  - [ ] Update state
  - [ ] Animate removal
- [ ] Show success/error message
  - [ ] Toast notification
  - [ ] "Post deleted successfully"
  - [ ] Auto-dismiss after 3s

#### UI Polish & Navigation
- [ ] Add "New Post" button
  - [ ] Clear all fields
  - [ ] Reset to create mode
  - [ ] Close posts list
- [ ] Add keyboard shortcuts
  - [ ] `Esc` - Close posts list
  - [ ] `Cmd+N` / `Ctrl+N` - New post
  - [ ] `Cmd+P` / `Ctrl+P` - Open posts list
- [ ] Add smooth transitions
  - [ ] Modal fade in/out
  - [ ] List item hover effects
  - [ ] Button state changes
- [ ] Handle mobile responsive layout
  - [ ] Full-screen modal on mobile
  - [ ] Touch-friendly buttons
  - [ ] Swipe to close (optional)
- [ ] Add loading states
  - [ ] Spinner when fetching posts
  - [ ] Disabled buttons during operations
  - [ ] Progress indicators

---

### Phase 3.3: Testing & Deployment

#### Local Testing (publish-worker)
- [ ] Test `GET /posts` endpoint
  - [ ] Empty posts directory
  - [ ] Single post
  - [ ] Multiple posts
  - [ ] Verify sorting
- [ ] Test `GET /posts/:slug` endpoint
  - [ ] Valid slug
  - [ ] Invalid slug (404)
  - [ ] Verify frontmatter parsing
- [ ] Test `PUT /posts/:slug` endpoint
  - [ ] Valid update
  - [ ] Conflict (outdated SHA)
  - [ ] Invalid slug
- [ ] Test `DELETE /posts/:slug` endpoint
  - [ ] Valid delete
  - [ ] Invalid slug
  - [ ] Missing SHA
- [ ] Test error cases
  - [ ] Network failures
  - [ ] GitHub API errors
  - [ ] Malformed requests

#### Local Testing (editor)
- [ ] Test opening posts list
  - [ ] Verify posts load correctly
  - [ ] Check empty state
  - [ ] Verify sorting
- [ ] Test loading post into editor
  - [ ] All fields populate correctly
  - [ ] WYSIWYG content renders
  - [ ] Edit mode indicator shows
- [ ] Test updating existing post
  - [ ] Make changes
  - [ ] Click "Update Post"
  - [ ] Verify GitHub commit
  - [ ] Check blog rebuilds
- [ ] Test deleting post
  - [ ] Confirmation dialog appears
  - [ ] Delete succeeds
  - [ ] Post removed from list
  - [ ] Verify GitHub commit
- [ ] Test switching modes
  - [ ] Edit → New post (clear fields)
  - [ ] New → Edit → New
  - [ ] Multiple edits
- [ ] Test error handling
  - [ ] Network offline
  - [ ] Invalid data
  - [ ] Conflict errors

#### Production Deployment
- [ ] Deploy Worker to api.sparkler.club
  ```bash
  cd ~/sparkler/publish-worker
  wrangler deploy
  ```
- [ ] Deploy editor to editor.sparkler.club
  ```bash
  cd ~/sparkler/omni-blogger
  git add .
  git commit -m "Add edit/delete posts feature"
  git push
  ```
- [ ] Wait for Cloudflare Pages build (~2 mins)
- [ ] Test end-to-end in production
  - [ ] List posts
  - [ ] Edit post
  - [ ] Delete post
  - [ ] Create new post
- [ ] Test on iPhone
  - [ ] All features work
  - [ ] Touch interactions smooth
  - [ ] No layout issues

#### Documentation
- [ ] Update MANUAL.md with new features
  - [ ] How to edit posts
  - [ ] How to delete posts
  - [ ] Keyboard shortcuts
- [ ] Update README.md
  - [ ] Add edit/delete to features list
  - [ ] Update screenshots (optional)
- [ ] Commit documentation changes

---

## 🎨 UI Design Notes

### Classic Mac File Browser Aesthetic
- **Window:** Paper white, subtle shadow, rounded corners (6px)
- **Title Bar:** SF Pro Display, 14px, centered
- **List Items:** 1px border, hover: blue accent
- **Icons:** Simple, monochrome (pencil for edit, × for delete)
- **Buttons:** Minimal, 4px border-radius, smooth transitions
- **Empty State:** Centered text, muted color

### Color Palette
```css
--mac-white: #FAFAFA
--mac-paper: #F5F5F0
--mac-blue: #0000FF
--mac-gray: #C0C0C0
--mac-black: #1A1A1A
```

---

## 🔒 Security Considerations

- ✅ GitHub token stays in Worker environment (never exposed to browser)
- ✅ Validate slug format (prevent path traversal: `../../../etc/passwd`)
- ✅ Use SHA for conflict detection (prevent accidental overwrites)
- ✅ CORS restricted to editor.sparkler.club
- ✅ Rate limiting (if needed)
- ✅ Authentication still via Cloudflare Access

---

## 📦 Keep It Simple Philosophy

**What we're adding:**
- List posts
- Edit posts
- Delete posts
- Better publish flow

**What we're NOT adding:**
- Drafts system
- Version history
- Collaborative editing
- Rich media management
- Categories/taxonomies
- Post scheduling
- Analytics dashboard

The goal: Stay minimal. Keep it maintainable for years.

---

## ✅ Success Criteria

### Phase 3 Complete When:
- [ ] Can view list of all posts
- [ ] Can edit any post from the list
- [ ] Can delete any post with confirmation
- [ ] Can switch between create/edit modes
- [ ] All features work on iPhone
- [ ] Classic Mac aesthetic maintained
- [ ] No regressions in existing features
- [ ] Total time investment: <1 day

---

**Phase 3 Start Date:** 2025-12-19
