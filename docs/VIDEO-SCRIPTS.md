# Video Tutorial Scripts

These scripts guide you through recording video tutorials for Omni Blogger deployment.

---

## Video 1: Complete Deployment Walkthrough (15 minutes)

**Target Audience:** First-time deployers
**Goal:** Deploy from scratch to published blog in 15 minutes

### Script Outline

**[0:00-0:30] Introduction**
```
Hi! I'm going to show you how to deploy your own Omni Blogger instance
in about 15 minutes. By the end, you'll have your own minimalist blog
where you can write and publish from any device.

What you'll get:
- Your own blog editor at editor.yourdomain.com
- Your live blog at yourdomain.com
- Full control - you own everything

Let's get started!
```

**[0:30-1:30] Prerequisites Check**
```
Before we begin, make sure you have:
1. A Cloudflare account (free) - we'll create one if you don't
2. A GitHub account (free) - we'll create one if you don't
3. A domain name (optional - we can use a free subdomain)
4. 15 minutes of time

Open your terminal and let's verify you have Node.js installed:
$ node --version

If you see a version number, great! If not, visit nodejs.org to install it.
```

**[1:30-3:00] Part 1: Cloudflare Account Setup**
```
Step 1: Create Cloudflare Account
- Visit dash.cloudflare.com
- Click "Sign Up"
- Enter your email and create a password
- Verify your email

Step 2: Get API Token
- Click on your profile → API Tokens
- Click "Create Token"
- Use "Edit Cloudflare Workers" template
- Copy the token - we'll need this soon
```

**[3:00-5:00] Part 2: GitHub Setup**
```
Step 1: Create GitHub Account (if needed)
- Visit github.com/signup
- Follow the signup flow

Step 2: Create Personal Access Token
- Go to Settings → Developer settings → Personal access tokens → Tokens (classic)
- Click "Generate new token (classic)"
- Name it "Omni Blogger"
- Check "repo" scope (full control of private repositories)
- Click "Generate token"
- IMPORTANT: Copy this token now - you won't see it again!
```

**[5:00-7:00] Part 3: Clone and Configure**
```
Now let's clone the repository and set up our configuration.

$ git clone https://github.com/haomaaax/omni-blogger.git
$ cd omni-blogger

Let's run the pre-flight checker to make sure everything is ready:

$ chmod +x scripts/preflight-check.sh
$ ./scripts/preflight-check.sh

This will verify:
- Node.js is installed
- Git is installed
- Cloudflare account is accessible
- GitHub token is valid

If everything shows green checkmarks, we're good to go!
```

**[7:00-10:00] Part 4: Automated Deployment**
```
Now for the magic part - we'll run a single script that does 90% of the work.

$ chmod +x scripts/deploy.sh
$ ./scripts/deploy.sh

The script will ask you a few questions:

1. "Blog name?" → myblog
2. "Cloudflare API token?" → [paste your token]
3. "GitHub token?" → [paste your token]
4. "Custom domain? (optional)" → [press Enter to skip, or enter your domain]

Now sit back and watch! The script will:
- Create 3 GitHub repositories
- Deploy Cloudflare Worker
- Create KV namespaces
- Deploy editor and blog to Pages
- Generate all secrets

This takes about 5-7 minutes. You'll see progress updates in real-time.
```

**[10:00-12:00] Part 5: Passkey Registration**
```
Once deployment finishes, we need to set up secure login.

The script will open your browser automatically to:
https://myblog-editor.pages.dev/setup-passkey

1. Click "Register Passkey"
2. Your device will prompt for TouchID / FaceID / Windows Hello
3. Authenticate with your fingerprint or face
4. Done! Your passkey is registered

No passwords to remember - just your fingerprint!
```

**[12:00-13:30] Part 6: First Post**
```
Let's write your first post!

1. Visit https://myblog-editor.pages.dev
2. Sign in with your passkey (TouchID/FaceID)
3. You'll see the minimalist editor
4. Type a title: "Hello World"
5. Write some content
6. Click "✨ Publish"

Wait about 2 minutes for the build to complete...

Now visit https://myblog.pages.dev - your post is live!
```

**[13:30-14:30] Part 7: Optional - Custom Domain**
```
Want to use your own domain instead of myblog.pages.dev?

1. In Cloudflare dashboard, add your domain
2. Update nameservers (follow Cloudflare instructions)
3. Wait 24-48 hours for DNS propagation
4. In Pages settings, add custom domain
5. Done! Your blog is now at yourdomain.com
```

**[14:30-15:00] Conclusion**
```
Congratulations! You now have:
✅ Your own blog editor
✅ Your live blog
✅ Full control over everything

What you own:
- All your content (in GitHub)
- All your infrastructure (Cloudflare)
- All your subscriber data (Cloudflare KV)

Cost: ~$1.25/month (just the domain)

Next steps:
- Check out docs/MANUAL.md for advanced features
- Set up email subscriptions (optional)
- Install as PWA app on your phone

Thanks for watching! If this helped you, please star the repo on GitHub!
```

---

## Video 2: Cloudflare Setup (5 minutes)

**Target Audience:** Users stuck on Cloudflare setup
**Goal:** Get Cloudflare account and API token

### Script Outline

**[0:00-0:30] Introduction**
```
In this video, I'll show you exactly how to set up your Cloudflare account
and get the API token needed for Omni Blogger deployment.
```

**[0:30-2:00] Create Account**
```
Step 1: Visit dash.cloudflare.com
Step 2: Click "Sign Up"
Step 3: Enter your email
Step 4: Create a strong password
Step 5: Verify your email

[Show each step on screen]
```

**[2:00-4:00] Get API Token**
```
Now we need an API token so the deployment script can configure things for you.

Step 1: Click your profile icon (top right)
Step 2: Click "API Tokens"
Step 3: Click "Create Token"
Step 4: Find "Edit Cloudflare Workers" template
Step 5: Click "Use template"
Step 6: Scroll down and click "Continue to summary"
Step 7: Click "Create Token"

IMPORTANT: Copy this token immediately!
You won't be able to see it again.

[Highlight the copy button]

Paste it somewhere safe temporarily - we'll use it in the deployment script.
```

**[4:00-4:30] Verify Access**
```
Let's verify the token works:

$ curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

If you see "status": "active", you're good to go!
```

**[4:30-5:00] Conclusion**
```
That's it! You now have:
✅ Cloudflare account
✅ API token

Keep this token safe - treat it like a password.
Ready to continue with the main deployment? Check out Video 1!
```

---

## Video 3: Passkey Registration (3 minutes)

**Target Audience:** Users confused about passkey setup
**Goal:** Demystify passkey registration process

### Script Outline

**[0:00-0:30] Introduction**
```
Passkeys are the future of authentication - no passwords to remember!
Let me show you how easy it is to set up.
```

**[0:30-1:30] What are Passkeys?**
```
Passkeys use your device's built-in security:
- TouchID on Mac
- FaceID on iPhone
- Windows Hello on PC
- Fingerprint sensor on Android

Your private key never leaves your device.
Much more secure than passwords!
```

**[1:30-2:30] Registration Process**
```
After deployment finishes, the script opens:
https://yourblog-editor.pages.dev/setup-passkey

1. Click "Register Passkey"
2. Your device shows a prompt
   - Mac: Touch the fingerprint sensor
   - iPhone: Look at the camera for FaceID
   - Windows: Use Windows Hello
3. That's it! No console, no copy-paste, just done.

[Show actual registration on screen with TouchID prompt]

Behind the scenes:
- Your device generates a key pair
- Public key sent to server
- Private key stays on your device
- No manual extraction needed!
```

**[2:30-3:00] Conclusion**
```
You're now set up! From now on, signing in is just:
1. Visit editor
2. Touch your fingerprint sensor
3. Start writing

No passwords. No 2FA codes. Just your fingerprint.

This is the future of auth, and you're using it!
```

---

## Video 4: Troubleshooting Common Issues (5 minutes)

**Target Audience:** Users hitting deployment errors
**Goal:** Fix the top 5 most common issues

### Script Outline

**[0:00-0:30] Introduction**
```
Running into issues? Let's fix the most common problems.
```

**[0:30-1:30] Issue 1: "wrangler command not found"**
```
Problem: Wrangler CLI not installed

Solution:
$ npm install -g wrangler

Verify:
$ wrangler --version

If you still get an error, you might need to restart your terminal.
```

**[1:30-2:30] Issue 2: "Authentication failed"**
```
Problem: Cloudflare API token is invalid or expired

Solution:
1. Go to dash.cloudflare.com
2. Profile → API Tokens
3. Find your token
4. Click "Roll" to regenerate
5. Copy the new token
6. Run the deploy script again with new token

Common mistake: Make sure you're using an API TOKEN, not an API KEY.
```

**[2:30-3:30] Issue 3: "GitHub token missing 'repo' scope"**
```
Problem: GitHub token doesn't have enough permissions

Solution:
1. Go to github.com/settings/tokens
2. Find your "Omni Blogger" token
3. Click "Edit"
4. Check the "repo" scope box
5. Scroll down and click "Update token"
6. The token string stays the same, just has more permissions now
```

**[3:30-4:30] Issue 4: "DNS propagation taking too long"**
```
Problem: Custom domain not working yet

This is normal! DNS can take 24-48 hours.

Check propagation status:
1. Visit dnschecker.org
2. Enter your domain
3. Select "A" record type
4. See where it's propagated

Green checkmarks = live
Red X = still propagating

In the meantime, use your myblog.pages.dev subdomain.
```

**[4:30-5:00] Issue 5: "Images not uploading"**
```
Problem: Image size too large or wrong format

Solution:
- Max size: 5MB per image
- Supported: JPG, PNG, GIF, WebP
- Resize large images before uploading

Use online tools like tinypng.com to compress images.
```

---

## Video 5: Quick Demo (2 minutes)

**Target Audience:** Social media (Twitter, HN)
**Goal:** Show deployment in real-time

### Script Outline

**[0:00-0:10] Hook**
```
Watch me deploy a blog in 10 minutes. No joke.
```

**[0:10-1:30] Timelapse**
```
[Speed up the deployment process]
- Clone repo (3 seconds)
- Run deploy script (20 seconds)
- Show progress logs (20 seconds)
- Passkey registration (5 seconds)
- Write first post (10 seconds)
- Publish and show live (10 seconds)
```

**[1:30-2:00] Result**
```
Total time: 10 minutes
Cost: $0 (free tier)
What I own: Everything

No vendor lock-in. No subscriptions. Just my blog.

Try it yourself: github.com/haomaaax/omni-blogger

⭐ Star the repo if you found this useful!
```

---

## Recording Tips

1. **Use a good microphone** - Built-in laptop mic is usually fine
2. **Record in 1080p** - Clear screen captures are important
3. **Show your terminal** - Use a nice terminal theme
4. **Use large fonts** - Viewers need to see code clearly
5. **Pause between steps** - Give viewers time to follow along
6. **Edit out mistakes** - Keep it professional
7. **Add timestamps** - In YouTube description
8. **Include links** - Repo, docs, tools mentioned

## Publishing Checklist

- [ ] Upload to YouTube with descriptive titles
- [ ] Add timestamps in description
- [ ] Link to repo in description
- [ ] Add to playlist "Omni Blogger Tutorials"
- [ ] Embed in docs/MANUAL.md
- [ ] Share on Twitter with screenshots
- [ ] Post on relevant subreddits
- [ ] Pin introduction video to repo

---

**Note:** These are scripts/outlines. Record them naturally in your own style. The key is showing the process clearly and making it feel achievable.
