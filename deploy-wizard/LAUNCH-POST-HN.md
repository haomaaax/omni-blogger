# Hacker News Launch Post

**Title:** Show HN: Deploy your own blog in 10 minutes with just your fingerprint

**URL:** https://omni-blogger-wizard.pages.dev

---

## Body

I built Omni Blogger because I got tired of:
- Paying $35/month for Substack/Ghost when I barely write
- Spending 3-4 hours deploying static site generators
- Giving up ownership of my content and subscriber list

So I built a minimalist blog editor that deploys to Cloudflare in 10 minutes. The twist: you authenticate with Touch ID/Face ID using WebAuthn, and the public key is automatically extracted - no console, no manual steps, just touch your fingerprint and you're done.

## What makes this different

**The #1 pain point I solved:** Passkey setup used to require opening the browser console, copying complex JavaScript, extracting the public key manually, and using CLI tools to configure secrets. I automated all of that. Now you just touch your fingerprint sensor and it's configured.

**Tech stack:**
- Frontend: Vanilla JS, ContentEditable API (WYSIWYG editor)
- Backend: Cloudflare Workers + Pages + KV (serverless, $0/month)
- Auth: WebAuthn passkeys (Touch ID, Face ID, Windows Hello)
- Publishing: Hugo static site generator
- Storage: GitHub (private repos for content)

**What you own:**
- Your infrastructure (Cloudflare account)
- Your content (GitHub repos)
- Your subscribers (Cloudflare KV)
- Everything. You can export and migrate anytime.

**Cost:** $0-1.25/month (domain optional, all Cloudflare services free tier)

## The deployment wizard

I built a 5-step browser-based wizard that:
1. Guides you through Cloudflare API token creation
2. Guides you through GitHub token creation
3. Automatically deploys Worker + Pages
4. Creates KV namespaces
5. Opens passkey setup (automatic key extraction)

Total time: 10-15 minutes. No CLI required.

## Technical innovations

1. **Browser-based passkey registration**: Uses `navigator.credentials.create()` and `credential.response.getPublicKey()` to extract keys automatically. No console interaction.

2. **Error recovery**: Exponential backoff with retry (2s, 4s, 8s). If deployment fails at step 3/5, resume from step 3.

3. **Progress persistence**: localStorage-based state management. Close the tab, come back tomorrow, pick up where you left off.

4. **GitHub Actions orchestration**: Single workflow deploys Worker, Pages, KV, and configures all secrets.

## Why I built this

I wanted a timeless blog - like sitting at a typewriter. No toolbar, no tags, no SEO optimization. Just title and content. Write from anywhere (iPhone, iPad, Mac), publish instantly, own everything, built to last forever.

## Try it

Live demo:
- Editor: https://editor.sparkler.club (login with passkey)
- Blog: https://sparkler.club

Deploy your own:
- Wizard: https://omni-blogger-wizard.pages.dev
- GitHub: https://github.com/haomaaax/omni-blogger

The repo includes:
- Complete documentation (QUICK-START.md, MANUAL.md)
- Automated test suite
- Launch checklist
- Week-by-week implementation log (ROADMAP.md)

## What I learned

Building the passkey extraction was the hardest part. WebAuthn returns an ArrayBuffer, which needs to be converted to base64, then sent to the Worker API to configure as a secret. The breakthrough was realizing I could do this entirely in the browser without CLI tools.

The deployment orchestration was also tricky - Cloudflare's API doesn't support direct Worker script deployment, so I used GitHub Actions as the orchestrator. This turned out to be better because it creates a reproducible deployment pipeline.

## Feedback welcome

This is my first Show HN. I'd love feedback on:
- Is the wizard intuitive?
- Did the passkey setup work on your device?
- What deployment step was confusing?
- Would you actually use this for your blog?

Happy to answer questions about the architecture, WebAuthn implementation, or Cloudflare deployment patterns.

---

**Tags:** webauthn, passkeys, cloudflare, hugo, static-site-generator, blogging, self-hosted

**Best time to post:** Tuesday-Thursday, 9-11am PT (12-2pm ET) for maximum HN traffic

---

## Alternative Shorter Version (if 4000 char limit)

**Title:** Show HN: Deploy your own blog in 10 minutes with just your fingerprint

I built a blog platform that deploys to Cloudflare in 10-15 minutes with zero CLI interaction. The breakthrough: automatic passkey registration using WebAuthn - you just touch your fingerprint and the public key is extracted and configured automatically.

Previously, this required opening browser console, copying JavaScript, extracting keys manually, and using Wrangler CLI. Now it's one touch.

**What you get:**
- Minimalist WYSIWYG editor (works on iPhone/iPad/Mac)
- Touch ID/Face ID authentication
- One-click publish to Hugo static site
- Email subscriptions (double opt-in)
- $0-1.25/month cost (Cloudflare free tier)

**What you own:**
- Your Cloudflare account (infrastructure)
- Your GitHub repos (content)
- Your subscribers (Cloudflare KV)
- Everything. No vendor lock-in.

**Tech:** Vanilla JS + Cloudflare Workers/Pages + WebAuthn + Hugo + GitHub

**Try it:**
- Demo: https://editor.sparkler.club (login with passkey)
- Deploy: https://omni-blogger-wizard.pages.dev
- GitHub: https://github.com/haomaaax/omni-blogger

The wizard is browser-based with 5 steps: blog name → Cloudflare → GitHub → config → deploy. Includes error recovery (exponential backoff) and progress persistence (resume anytime).

Built for writers who want to own their content. Write from anywhere, publish instantly, no $35/month subscriptions.

Feedback welcome, especially on the passkey setup flow!

---

## Engagement Strategy

**If someone asks "Why not just use X?":**
- Ghost/Substack: "Those cost $25-35/month and you don't own your subscriber list. This costs $0-1.25/month and you own everything."
- Jekyll/Hugo: "Those take 3-4 hours to deploy manually. This takes 10-15 minutes with a wizard."
- WordPress: "That requires server maintenance and security updates. This is serverless."

**If someone asks about the passkey implementation:**
Share the technical details:
```javascript
// The key breakthrough
const credential = await navigator.credentials.create({ publicKey: options });
const publicKeyBytes = credential.response.getPublicKey();
const publicKey = arrayBufferToBase64(publicKeyBytes);
await storeInWorker(publicKey); // No CLI needed!
```

**If deployment fails for someone:**
"Sorry about that! Can you share which step failed? The wizard has error recovery but I'm still working out edge cases. You can resume from where you left off using the localStorage-based progress persistence."

**If someone wants to contribute:**
"Absolutely! The repo has TODO.md with potential enhancements. PRs welcome for: drag-and-drop image upload, post scheduling, custom formatting toolbar. The codebase is intentionally simple - vanilla JS, no framework."

---

## Expected Questions & Answers

**Q: How is this different from GitHub Pages?**
A: GitHub Pages doesn't have dynamic features like email subscriptions or authentication. Omni Blogger includes a Cloudflare Worker for the publishing API, passkey auth, and subscriber management with Cloudflare KV.

**Q: Why Cloudflare instead of Vercel/Netlify?**
A: Cloudflare's free tier is more generous (100k Worker requests/day vs 100 functions/day on Vercel free). Also, Cloudflare KV is perfect for subscriber storage without needing a database.

**Q: Can I migrate away if I want to?**
A: Yes! You own the GitHub repos (export your content), the Cloudflare KV (export subscribers), and all the infrastructure is in your account. The wizard just automates setup.

**Q: What if I want custom domains?**
A: The wizard supports custom domains in step 4. You'll need to buy a domain (~$15/year from Gandi) and point it to Cloudflare. But you can start with *.pages.dev subdomains for free.

**Q: Is this production-ready?**
A: Yes! I've been using it for sparkler.club for months. The wizard is new (just built it), but the core platform is stable. All automated tests passing: https://github.com/haomaaax/omni-blogger/blob/main/deploy-wizard/TEST-RESULTS.md

**Q: What about SEO?**
A: Hugo generates static HTML with full SEO support (meta tags, Open Graph, sitemaps). But the philosophy here is "timeless blog" - focus on writing, not optimization. Like a typewriter.

**Q: Mobile support?**
A: Yes! Works on iPhone/iPad with the editor as a PWA (Progressive Web App). Face ID authentication. You can write and publish from your phone.

**Q: Can I use this for a team blog?**
A: Currently single-user (one passkey). Multi-user support would require adding more passkeys to the Worker. Feature request welcome!

---

## Post-Launch Monitoring

**Metrics to track:**
- Upvotes on HN (target: 100+ for front page)
- Comments (target: 50+)
- GitHub stars (current: ~10, target: 500+)
- Wizard deployments (track via Cloudflare analytics)
- Issues opened (indicates engagement)

**When to respond:**
- Within 1 hour of posting (critical for engagement)
- Every 30 minutes for first 4 hours
- Be helpful, technical, humble
- Share code snippets when relevant
- Thank people for feedback

**Red flags:**
- "This already exists" → Acknowledge, differentiate (passkey auto-extraction)
- "Too complex" → Offer to help, ask which step
- "Security concern" → Address seriously, explain WebAuthn security model
- "Not production ready" → Share sparkler.club as proof

---

## Success Criteria

**Minimum Success:**
- 50+ upvotes
- 20+ comments
- 10+ GitHub stars
- 3+ wizard deployments

**Good Success:**
- 100+ upvotes (front page)
- 50+ comments
- 100+ GitHub stars
- 20+ wizard deployments

**Great Success:**
- 200+ upvotes (top 3)
- 100+ comments
- 500+ GitHub stars
- 50+ wizard deployments
- Blog post mentions from tech bloggers

**Viral Success:**
- 500+ upvotes
- Trending on Twitter
- Mentioned in newsletters (TLDR, Hacker Newsletter)
- Fork projects emerge
- 1000+ GitHub stars

---

**Ready to post when you are. Good luck!**
