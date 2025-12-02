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
- [ ] Go to https://github.com/signup
- [ ] Create a free account (if you don't have one)
- [ ] Verify your email address
- [ ] Complete GitHub profile setup

#### 1.2 Cloudflare Account (Hosting Platform)
- [ ] Go to https://dash.cloudflare.com/sign-up
- [ ] Create a free account
- [ ] Verify your email address
- [ ] Log into Cloudflare dashboard

#### 1.3 Gandi Domain (Already Have!)
- [x] Domain registered on Gandi.net
- [ ] Log into Gandi dashboard: https://admin.gandi.net
- [ ] Locate your domain
- [ ] Note down your domain name

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
- [ ] Edit `hugo.toml`:
  - [ ] Set `baseURL = "https://yourdomain.com"` (use your actual domain)
  - [ ] Verify `title` is set correctly
  - [ ] Add `publishDir = "public"`

#### 2.4 Test Build Locally
- [ ] Run: `hugo --minify`
- [ ] Verify `public/` folder is created
- [ ] Check for any build errors

---

### 3. Push Blog to GitHub

#### 3.1 Create GitHub Repository
- [ ] Go to https://github.com/new
- [ ] Repository name: `my-blog` (or any name you prefer)
- [ ] Set to **Public** (required for Cloudflare Pages free tier)
- [ ] Do NOT initialize with README (we already have files)
- [ ] Click "Create repository"

#### 3.2 Push Code to GitHub
```bash
cd ~/sparkler/my-blog
git add .
git commit -m "Initial blog setup with PaperMod theme"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/my-blog.git
git push -u origin main
```
- [ ] Run the commands above (replace YOUR-USERNAME)
- [ ] Verify code appears on GitHub
- [ ] Check that themes/PaperMod appears (as submodule)

---

### 4. Deploy to Cloudflare Pages

#### 4.1 Connect GitHub to Cloudflare
- [ ] Log into Cloudflare dashboard: https://dash.cloudflare.com
- [ ] Click "Pages" in the left sidebar
- [ ] Click "Create a project"
- [ ] Click "Connect to Git"
- [ ] Select "GitHub"
- [ ] Authorize Cloudflare to access GitHub
- [ ] Select your blog repository (`my-blog`)

#### 4.2 Configure Build Settings
- [ ] Project name: `my-blog` (or preferred name)
- [ ] Production branch: `main`
- [ ] Framework preset: Select **"Hugo"**
- [ ] Build command: `hugo --minify`
- [ ] Build output directory: `public`
- [ ] Click "Save and Deploy"

#### 4.3 Wait for First Deployment
- [ ] Watch build logs (takes 1-3 minutes)
- [ ] Verify build succeeds
- [ ] Note your Cloudflare Pages URL: `your-project.pages.dev`
- [ ] Test the site at that URL

---

### 5. Set Up Custom Domain

#### 5.1 Add Domain to Cloudflare Pages
- [ ] In Cloudflare Pages project, click "Custom domains"
- [ ] Click "Set up a custom domain"
- [ ] Enter your domain: `yourdomain.com`
- [ ] Click "Continue"
- [ ] Cloudflare will show you DNS records to add

#### 5.2 Option A: Transfer DNS to Cloudflare (Recommended)
**Easiest and fastest option**

- [ ] In Cloudflare dashboard, click "Add site"
- [ ] Enter your domain name
- [ ] Select "Free" plan
- [ ] Cloudflare will scan your existing DNS records
- [ ] Review DNS records, click "Continue"
- [ ] Cloudflare provides nameservers (e.g., `chad.ns.cloudflare.com`)
- [ ] Copy the two nameserver addresses

**Update Nameservers at Gandi:**
- [ ] Log into Gandi: https://admin.gandi.net
- [ ] Go to your domain → "Nameservers"
- [ ] Click "Change nameservers"
- [ ] Select "External nameservers"
- [ ] Paste Cloudflare nameservers
- [ ] Save changes
- [ ] Wait for propagation (15 mins - 48 hours, usually < 1 hour)

#### 5.2 Option B: Keep DNS at Gandi (Manual Setup)
**If you prefer to keep Gandi DNS**

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
- [ ] Go to https://dnschecker.org
- [ ] Enter your domain
- [ ] Verify records point to Cloudflare
- [ ] Check both `yourdomain.com` and `www.yourdomain.com`

#### 6.2 Test Your Live Site
- [ ] Open `https://yourdomain.com` in browser
- [ ] Verify site loads correctly
- [ ] Test `https://www.yourdomain.com`
- [ ] Verify HTTPS is working (padlock icon)
- [ ] Test on mobile device
- [ ] Check all pages work

#### 6.3 Verify Auto-Deployment
- [ ] Make a small change to your blog locally
- [ ] Commit and push to GitHub:
  ```bash
  cd ~/sparkler/my-blog
  git add .
  git commit -m "Test auto-deployment"
  git push
  ```
- [ ] Watch Cloudflare Pages dashboard
- [ ] Verify new deployment starts automatically
- [ ] Check live site updates after build completes

---

### 7. Update Editor Configuration

#### 7.1 Update editor.js
- [ ] Open `~/sparkler/omni-blogger/editor.js`
- [ ] Change `blogUrl` from `http://localhost:1313` to `https://yourdomain.com`
- [ ] Save file

#### 7.2 Update server.js (Optional - Auto-deploy)
If you want "Publish" button to auto-push to GitHub:
- [ ] Open `~/sparkler/omni-blogger/server.js`
- [ ] Update `deployCommand`:
  ```javascript
  deployCommand: 'cd /Users/YOUR_USERNAME/sparkler/my-blog && git add -A && git commit -m "New post" && git push'
  ```
- [ ] Replace YOUR_USERNAME with your actual username
- [ ] Save file
- [ ] Restart editor server: `node server.js`

#### 7.3 Test Publishing from Editor
- [ ] Open editor: http://localhost:3000
- [ ] Write a test post
- [ ] Click "Publish"
- [ ] Check Cloudflare Pages dashboard for new deployment
- [ ] Verify post appears on live site

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

**Last Updated:** 2025-12-02
