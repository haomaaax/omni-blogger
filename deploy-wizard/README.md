# Omni Blogger Deploy Wizard

One-click deployment wizard for Omni Blogger. Reduces deployment time from 60 minutes to 10-15 minutes.

**🎉 NEW: Browser-based passkey registration** - Eliminates manual console extraction!

## Components

### 1. Landing Page (`index.html`)
- Hero section with "Deploy to Cloudflare" button
- Features overview
- Prerequisites checklist
- Ownership philosophy explanation

### 2. Wizard Interface (`wizard.html`)
- 5-step setup process
- Progress tracking
- OAuth authentication flows
- Configuration options
- Real-time deployment progress

### 3. Passkey Setup (`passkey-setup.html`) ⭐ NEW
- Browser-based WebAuthn credential creation
- Automatic public key extraction
- No console interaction required
- Touch ID / Face ID / Windows Hello support
- Auto-opens after deployment completes

### 4. Deployment API (`api/`)
- Cloudflare Worker that orchestrates deployment
- Creates GitHub repositories
- Deploys Cloudflare Workers and Pages
- Creates KV namespaces
- Configures secrets
- Receives and stores passkey credentials

## How It Works

### User Flow

1. **Step 1: Blog Name**
   - User enters blog name (e.g., "my-blog")
   - Real-time preview of URLs

2. **Step 2: Cloudflare Authentication**
   - User creates Cloudflare API token
   - Token verified via API
   - Account ID retrieved

3. **Step 3: GitHub Authentication**
   - User creates GitHub Personal Access Token
   - Token verified via API
   - Username retrieved

4. **Step 4: Configuration**
   - Optional: Custom domain
   - Optional: Email subscriptions (Resend)
   - Repository visibility (public/private)

5. **Step 5: Review & Deploy**
   - Summary of all configuration
   - Start deployment button
   - Real-time progress tracking

### Deployment Process

When user clicks "Start Deployment":

1. **Create GitHub Repositories** (~30 seconds)
   - `omni-blogger-editor` - Editor app code
   - `omni-blogger-worker` - Publishing API code
   - `<blogName>` - Blog content (always private)

2. **Deploy Cloudflare Worker** (~2 minutes)
   - Creates Worker for publishing API
   - Configures routes

3. **Create KV Namespaces** (~30 seconds)
   - `SUBSCRIBERS` - Store subscriber emails
   - `AUTH_CHALLENGES` - WebAuthn challenges (5-min TTL)

4. **Deploy Editor to Pages** (~3 minutes)
   - Connects `omni-blogger-editor` repo
   - Deploys to `<blogName>-editor.pages.dev`

5. **Deploy Blog to Pages** (~3 minutes)
   - Connects `<blogName>` repo
   - Deploys to `<blogName>.pages.dev`

6. **Configure Secrets** (~1 minute)
   - `JWT_SECRET` - Auto-generated
   - `GITHUB_TOKEN` - From user
   - `RESEND_API_KEY` - Optional, from user

7. **Passkey Registration** (~30 seconds) ⭐ NEW
   - Auto-opens in new tab after deployment
   - User clicks "Register Passkey"
   - Browser prompts for Touch ID / Face ID
   - Public key automatically extracted
   - Credential ID sent to API
   - No console interaction required!

**Total time: 10-15 minutes**

### Browser-Based Passkey Registration

This is the #1 feature that eliminates the biggest pain point. Previously, users had to:
- Open browser console
- Copy complex JavaScript code
- Extract public key manually
- Copy credential ID
- Use Wrangler CLI to set secrets

**Now users just:**
1. Touch their fingerprint sensor
2. Done!

The passkey setup page (`passkey-setup.html`) automatically:
- Creates WebAuthn credential using native browser API
- Extracts public key from the credential response
- Extracts credential ID
- Sends both to the deployment API
- Displays success with next steps

**Technical Implementation:**
```javascript
// Create passkey
const credential = await navigator.credentials.create({
    publicKey: options
});

// Extract public key (automatically)
const publicKeyBytes = credential.response.getPublicKey();
const publicKey = arrayBufferToBase64(publicKeyBytes);

// Extract credential ID (automatically)
const credentialId = arrayBufferToBase64(credential.rawId);

// Send to API (automatically)
await fetch('/api/passkey/register', {
    method: 'POST',
    body: JSON.stringify({ blogName, publicKey, credentialId })
});
```

**No manual steps. No console. Just touch your fingerprint.**

## Deploying the Wizard

### Option 1: Deploy to Cloudflare Pages (Recommended)

```bash
cd deploy-wizard
wrangler pages deploy . --project-name=omni-blogger-wizard
```

Your wizard will be live at: `https://omni-blogger-wizard.pages.dev`

### Option 2: Deploy API Worker

The deployment orchestration API needs to be deployed separately:

```bash
cd deploy-wizard/api
wrangler deploy
```

This creates a Worker at: `https://omni-blogger-deploy-api.YOUR_ID.workers.dev`

Update `wizard.js` to point to your API:

```javascript
const DEPLOY_API_URL = 'https://omni-blogger-deploy-api.YOUR_ID.workers.dev';
```

### Option 3: Embed in Main README

Add a deploy button to the main README:

```markdown
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://omni-blogger-wizard.pages.dev)
```

## File Structure

```
deploy-wizard/
├── index.html              # Landing page
├── wizard.html             # 5-step wizard interface
├── css/
│   ├── landing.css         # Landing page styles
│   └── wizard.css          # Wizard styles
├── js/
│   └── wizard.js           # Wizard logic, OAuth, deployment
├── api/
│   ├── index.js            # Deployment orchestration Worker
│   └── wrangler.toml       # Worker configuration
└── README.md               # This file
```

## Development

### Local Testing

1. **Serve the wizard locally:**
   ```bash
   cd deploy-wizard
   python3 -m http.server 8000
   # Or use any local server
   ```

2. **Visit:** http://localhost:8000

3. **Test API locally:**
   ```bash
   cd api
   wrangler dev
   ```

### Testing the Flow

The wizard includes built-in validation:

- **Step 1:** Blog name must be lowercase, alphanumeric, hyphens only
- **Step 2:** Cloudflare token verified against API
- **Step 3:** GitHub token verified against API
- **Step 4:** Email validation if subscriptions enabled
- **Step 5:** Review all settings before deploy

## Current Limitations

### API Token vs OAuth

Currently, the wizard uses API tokens instead of full OAuth flows because:

1. **Cloudflare:** Doesn't have OAuth for Workers API access
   - Users must create API token via dashboard
   - Token has same capabilities as OAuth would

2. **GitHub:** Could use OAuth but tokens are simpler
   - OAuth requires app registration
   - Tokens work immediately

### Workarounds in API

Some operations can't be done purely via API:

1. **Worker Deployment:** Requires uploading script bundle
   - Solution: Guide user to connect repo in dashboard
   - Alternative: Use Wrangler CLI in GitHub Actions

2. **Secret Configuration:** Not directly available via API
   - Solution: Generate values, guide user through dashboard
   - Alternative: Use Wrangler CLI

3. **Pages GitHub Connection:** Requires GitHub App installation
   - Solution: User must connect repo manually
   - Alternative: Build GitHub App for OAuth

## Future Enhancements

### Week 3-4 Improvements

1. **Browser-Based Passkey Registration**
   - After deployment, auto-open passkey setup
   - Extract public key in browser
   - Send to API to configure Worker

2. **GitHub Actions Automation**
   - Create `.github/workflows/deploy.yml` in repos
   - Automate Worker + Pages deployment
   - No manual dashboard interaction

3. **Better Error Handling**
   - Retry failed steps
   - Clear error messages
   - Recovery options

4. **Progress Persistence**
   - Save state to localStorage
   - Resume interrupted deployments
   - Share progress link

## Architecture Decisions

### Why Separate API Worker?

The deployment orchestration is a separate Worker because:

1. **CORS:** Can't call Cloudflare/GitHub APIs from browser directly
2. **Security:** Tokens stay in memory, not persisted
3. **Retry Logic:** API can handle timeouts/retries
4. **Rate Limiting:** Centralized throttling

### Why Not Wrangler CLI?

The wizard is browser-based to:

1. **Lower barrier:** No Node.js/CLI installation
2. **Cross-platform:** Works on any device
3. **Visual feedback:** Progress bars, status updates
4. **Accessibility:** Non-technical users

### Why API Tokens Instead of OAuth?

Using tokens because:

1. **Cloudflare limitation:** No OAuth for Workers API
2. **Simpler flow:** No callback handling
3. **One-time use:** Tokens used once, not stored
4. **Same permissions:** Tokens ≈ OAuth scopes

## Security Considerations

1. **Token Handling:**
   - Tokens never stored in localStorage
   - Sent to API over HTTPS only
   - API doesn't log tokens
   - Used once and discarded

2. **Deployment API:**
   - Validates all inputs
   - Rate limiting (to add)
   - No token persistence

3. **User Ownership:**
   - All resources created in user's accounts
   - User can revoke tokens anytime
   - User can delete repos/workers anytime

## Contributing

If improving the wizard:

1. **Test the full flow** before committing
2. **Validate all user inputs** client-side
3. **Handle API errors gracefully**
4. **Update progress UI** for all steps
5. **Keep it simple** - don't add unnecessary options

## Questions?

See the main project documentation:
- [QUICK-START.md](../docs/QUICK-START.md) - Manual deployment guide
- [MANUAL.md](../MANUAL.md) - Complete documentation
- [ROADMAP.md](../docs/ROADMAP.md) - Project history

---

**This wizard makes Omni Blogger accessible to everyone, while maintaining the ownership philosophy.**
