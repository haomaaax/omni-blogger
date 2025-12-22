# Email Subscription Setup Guide

Complete step-by-step guide to deploy the email subscription system for Sparkler.

## Overview

This adds Substack-style email subscriptions to your blog while owning all the data and logic. Readers can subscribe with their email and receive notifications when you publish new posts.

**Architecture:**
- Resend API: Email delivery (minimal vendor dependency)
- Cloudflare KV: Subscriber storage (you own the data)
- Cloudflare Worker: Subscription logic (you own the code)

**Cost:** $0/month (Resend free tier: 3,000 emails/month, 100 emails/day)

---

## Step 1: Set Up Resend Account

### 1.1 Sign Up for Resend

1. Go to https://resend.com
2. Click "Get Started"
3. Sign up with your email (no credit card required for free tier)
4. Verify your email address

### 1.2 Add and Verify Your Domain

1. In Resend dashboard, click "Domains"
2. Click "Add Domain"
3. Enter: `sparkler.club`
4. Resend will show you DNS records to add

### 1.3 Add DNS Records to Cloudflare

**Important:** You need to add these records to Cloudflare DNS (not Gandi), since Cloudflare is your DNS provider.

1. Go to Cloudflare Dashboard → select sparkler.club domain
2. Click "DNS" → "Records"
3. Add the records shown by Resend (usually 3 records):

**Example records (yours will be different):**
```
Type    Name                  Content
TXT     resend._domainkey     v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY
TXT     @                     v=spf1 include:resend.com ~all
CNAME   resend                resend.yourdomain.com
```

4. Click "Save" for each record
5. Wait 5-10 minutes for DNS propagation
6. Back in Resend, click "Verify Domain"
7. Status should change to "Verified" ✅

### 1.4 Get Your API Key

1. In Resend dashboard, click "API Keys"
2. Click "Create API Key"
3. Name: "Blog Publisher Worker"
4. Permission: "Sending access"
5. Click "Create"
6. **Copy the API key** - you won't see it again!
   - Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 2: Create Cloudflare KV Namespace

### 2.1 Create the KV Namespace

```bash
cd ~/sparkler/publish-worker
wrangler kv:namespace create SUBSCRIBERS
```

**Expected output:**
```
 ⛅️ wrangler 3.x.x
-------------------
🌀 Creating namespace with title "blog-publisher-SUBSCRIBERS"
✨ Success!
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "SUBSCRIBERS"
id = "abc123def456..."
```

### 2.2 Update wrangler.toml

Copy the `id` from the output above and update `wrangler.toml`:

```toml
# Replace YOUR_KV_NAMESPACE_ID with the actual ID
[[kv_namespaces]]
binding = "SUBSCRIBERS"
id = "abc123def456..."  # <- Use the ID from wrangler output
```

---

## Step 3: Add Secrets to Worker

### 3.1 Add Resend API Key

```bash
cd ~/sparkler/publish-worker
wrangler secret put RESEND_API_KEY
```

When prompted, paste your Resend API key (from Step 1.4):
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Press Enter. You should see:
```
✨ Success! Uploaded secret RESEND_API_KEY
```

### 3.2 Verify GitHub Token is Set

```bash
wrangler secret list
```

You should see:
```
[
  { name: "GITHUB_TOKEN", type: "secret_text" },
  { name: "RESEND_API_KEY", type: "secret_text" }
]
```

If GITHUB_TOKEN is missing, add it:
```bash
wrangler secret put GITHUB_TOKEN
```

---

## Step 4: Deploy Updated Worker

### 4.1 Deploy to Cloudflare

```bash
cd ~/sparkler/publish-worker
wrangler deploy
```

**Expected output:**
```
 ⛅️ wrangler 3.x.x
-------------------
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded blog-publisher (x.xx sec)
Published blog-publisher (x.xx sec)
  https://blog-publisher.maxyay5566.workers.dev
  https://api.sparkler.club
Current Deployment ID: xxxxx
```

### 4.2 Test the Worker

Test that the worker is running:
```bash
curl https://api.sparkler.club/posts
```

Should return your list of posts (JSON).

---

## Step 5: Add Subscription Form to Hugo Blog

Now we need to add a subscription form to your blog so readers can subscribe.

### 5.1 Locate Your Blog Repository

```bash
cd ~/sparkler/my-blog  # or wherever your Hugo blog is
```

### 5.2 Find Your Theme's Footer Template

PaperMod theme footer is usually at:
```bash
themes/PaperMod/layouts/partials/footer.html
```

To customize it without modifying the theme:
```bash
mkdir -p layouts/partials
cp themes/PaperMod/layouts/partials/footer.html layouts/partials/footer.html
```

### 5.3 Add Subscription Form

Edit `layouts/partials/footer.html` and add this before the closing `</footer>` tag:

```html
<!-- Email Subscription -->
<div class="subscribe-section" style="max-width: 500px; margin: 40px auto; padding: 30px 20px; text-align: center; border-top: 1px solid var(--border);">
  <h3 style="margin-bottom: 10px; font-size: 20px;">Subscribe for Updates</h3>
  <p style="margin-bottom: 20px; color: var(--secondary); font-size: 14px;">Get notified when new posts are published</p>

  <form id="subscribe-form" style="display: flex; gap: 10px; max-width: 400px; margin: 0 auto;">
    <input
      type="email"
      id="subscribe-email"
      placeholder="your@email.com"
      required
      style="flex: 1; padding: 10px 15px; border: 1px solid var(--border); border-radius: 4px; font-size: 14px;"
    >
    <button
      type="submit"
      style="padding: 10px 20px; background: #1C3A52; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;"
    >
      Subscribe
    </button>
  </form>

  <div id="subscribe-message" style="margin-top: 15px; font-size: 14px;"></div>
</div>

<script>
document.getElementById('subscribe-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('subscribe-email').value;
  const messageDiv = document.getElementById('subscribe-message');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Disable button during submission
  submitBtn.disabled = true;
  submitBtn.textContent = 'Subscribing...';

  try {
    const response = await fetch('https://api.sparkler.club/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.success || data.message) {
      messageDiv.style.color = '#2e7d32';
      messageDiv.textContent = data.message || 'Check your email to confirm!';
      e.target.reset();
    } else if (data.error) {
      messageDiv.style.color = '#d32f2f';
      messageDiv.textContent = data.error;
    }
  } catch (error) {
    messageDiv.style.color = '#d32f2f';
    messageDiv.textContent = 'Something went wrong. Please try again.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Subscribe';
  }
});
</script>
```

### 5.4 Test Locally

```bash
hugo server
```

Visit http://localhost:1313 and check that the subscription form appears at the bottom of the page.

### 5.5 Deploy to Production

```bash
git add layouts/partials/footer.html
git commit -m "Add email subscription form"
git push
```

Cloudflare Pages will auto-deploy in ~2 minutes.

---

## Step 6: Test the Complete Flow

### 6.1 Test Subscription

1. Visit https://sparkler.club
2. Scroll to bottom and find the subscription form
3. Enter your email address
4. Click "Subscribe"
5. You should see: "Check your email to confirm!"

### 6.2 Test Confirmation Email

1. Check your email inbox
2. You should receive an email from "Sparkler <noreply@sparkler.club>"
3. Subject: "Confirm your subscription to Sparkler"
4. Click the "Confirm Subscription" button
5. You should see a confirmation page: "✅ Subscription Confirmed!"

### 6.3 Test New Post Notification

1. Go to https://editor.sparkler.club
2. Write a test post
3. Click "✨ Publish"
4. Wait ~2 minutes for the blog to rebuild
5. Check your email - you should receive:
   - Subject: "[Your Post Title] - Sparkler"
   - Contains the post title and a link to read it
   - Has an unsubscribe link at the bottom

### 6.4 Test Unsubscribe

1. In the notification email, click the "Unsubscribe" link
2. You should see: "✅ Unsubscribed"
3. You won't receive future notifications

---

## Step 7: Monitor and Manage

### 7.1 View Subscriber Count

You can check how many subscribers you have via Wrangler:

```bash
cd ~/sparkler/publish-worker
wrangler kv:key list --namespace-id YOUR_KV_NAMESPACE_ID --prefix subscribers:
```

### 7.2 View Pending Confirmations

```bash
wrangler kv:key list --namespace-id YOUR_KV_NAMESPACE_ID --prefix pending:
```

### 7.3 Manually Add/Remove Subscribers

**Add a subscriber:**
```bash
wrangler kv:key put --namespace-id YOUR_KV_NAMESPACE_ID "subscribers:friend@example.com" '{"email":"friend@example.com","subscribedAt":"2025-12-22T00:00:00.000Z","unsubscribeToken":"manual-token-123"}'
```

**Remove a subscriber:**
```bash
wrangler kv:key delete --namespace-id YOUR_KV_NAMESPACE_ID "subscribers:friend@example.com"
```

### 7.4 Check Worker Logs

View real-time logs to see email sending activity:

```bash
wrangler tail
```

Then publish a post and watch the logs show email sending.

---

## Troubleshooting

### Emails Not Sending

1. **Check Resend domain verification:**
   - Go to Resend dashboard → Domains
   - Status should be "Verified"
   - If not, check DNS records in Cloudflare

2. **Check Worker secrets:**
   ```bash
   wrangler secret list
   ```
   Should show both GITHUB_TOKEN and RESEND_API_KEY

3. **Check Worker logs:**
   ```bash
   wrangler tail
   ```
   Look for errors when publishing

### Subscription Form Not Working

1. **Check CORS:** Worker allows all origins (`*`) by default
2. **Check browser console** for errors (F12 → Console)
3. **Test API directly:**
   ```bash
   curl -X POST https://api.sparkler.club/subscribe \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

### Confirmation Link Not Working

1. **Check the link format:** Should be `https://api.sparkler.club/confirm/{token}`
2. **Check KV storage:**
   ```bash
   wrangler kv:key list --namespace-id YOUR_KV_NAMESPACE_ID --prefix pending:
   ```
3. **Remember:** Confirmation links expire after 24 hours

---

## Usage Limits

### Resend Free Tier
- ✅ 3,000 emails per month
- ✅ 100 emails per day
- ✅ No credit card required
- ⚠️  After limits: emails will fail (won't charge you)

**Example:** If you have 50 subscribers and publish daily:
- Daily emails: 50
- Monthly emails: ~1,500
- ✅ Well within free tier!

### Cloudflare KV Free Tier
- ✅ 100,000 reads per day
- ✅ 1,000 writes per day
- ✅ 1 GB storage
- ⚠️  After limits: operations will fail

**Example:** 1,000 subscribers = ~100 KB storage
- ✅ Can handle 10,000+ subscribers on free tier!

---

## Security & Privacy

### GDPR Compliance
✅ **Double opt-in**: Requires email confirmation before subscribing
✅ **Easy unsubscribe**: One-click unsubscribe in every email
✅ **Data ownership**: All subscriber data stored in your Cloudflare KV
✅ **No tracking**: Simple email with just title + link

### Data Storage
- **Subscriber emails**: Stored in Cloudflare KV (encrypted at rest)
- **Tokens**: Random 64-character hex strings (cryptographically secure)
- **Expiration**: Confirmation links expire after 24 hours
- **Export**: Can export all data via Wrangler CLI anytime

---

## Next Steps

### Optional Enhancements

1. **Add subscription count to blog:**
   - Display "Join X subscribers" on the form

2. **Welcome email:**
   - Send a welcome email after confirmation

3. **Email analytics:**
   - Track open rates via Resend dashboard

4. **RSS to Email:**
   - Convert RSS feed to email digest

5. **Subscriber management page:**
   - Let subscribers update preferences

---

## Uninstall/Rollback

If you want to remove the email subscription feature:

1. **Remove from Hugo blog:**
   ```bash
   git rm layouts/partials/footer.html
   git commit -m "Remove subscription form"
   git push
   ```

2. **Revert Worker code:**
   ```bash
   git revert HEAD  # Revert to previous version
   wrangler deploy
   ```

3. **Delete KV namespace:**
   ```bash
   wrangler kv:namespace delete --namespace-id YOUR_KV_NAMESPACE_ID
   ```

4. **Delete Resend domain:**
   - Go to Resend dashboard → Domains → Delete

---

## Support

If you run into issues:

1. Check Worker logs: `wrangler tail`
2. Check Resend logs: https://resend.com/logs
3. Test endpoints directly with `curl`
4. Review this guide step-by-step

Remember: All subscriber data is yours. You can export it anytime and move to a different service if needed.

---

**Last Updated:** December 22, 2025
