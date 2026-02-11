# Beta Testing Guide

**Welcome, beta tester!** Thanks for helping test Omni Blogger before the public launch. This guide will walk you through the testing process.

---

## What You're Testing

**Omni Blogger** is a deployment wizard that sets up a complete blog platform in 10-15 minutes. The wizard automates:
- GitHub repository creation
- Cloudflare Worker deployment
- Cloudflare Pages deployment
- WebAuthn passkey registration (the breakthrough feature!)

**Your goal:** Test the wizard and report any issues, confusing steps, or suggestions for improvement.

---

## Prerequisites

Before you start testing, you need:

### 1. Cloudflare Account (Free)
- Sign up: https://dash.cloudflare.com/sign-up
- Verify email
- **No credit card required**

### 2. GitHub Account (Free)
- Sign up: https://github.com/signup
- Verify email
- **No credit card required**

### 3. Compatible Device
The wizard works on:
- **Mac:** Chrome, Safari, Firefox, Edge
- **iPhone/iPad:** Safari (iOS 14+)
- **Windows:** Chrome, Edge, Firefox
- **Android:** Chrome (Android 10+)

**Passkey support required** (Touch ID, Face ID, fingerprint sensor, Windows Hello, or security key)

### 4. Optional: Domain Name
- You can test with free *.pages.dev subdomains
- If you want custom domains, you'll need to buy one (~$15/year)

---

## Testing Steps

### Phase 1: Wizard Flow (30 minutes)

**Goal:** Complete the entire deployment wizard and report any issues.

#### Step 1: Access the Wizard

1. Visit: https://omni-blogger-wizard.pages.dev
2. Note your **first impression** (design, clarity, trustworthiness)
3. Click "Deploy to Cloudflare" button

#### Step 2: Blog Name Setup

1. Enter a blog name (e.g., "myblog-test-2024")
2. Check if the URL preview updates correctly
3. Try invalid names (spaces, special characters) - should show errors
4. Click "Next"

**Record:**
- Did the validation work correctly?
- Were error messages clear?
- Was the URL preview helpful?

#### Step 3: Cloudflare Authentication

1. Open new tab: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Click "Use template" for "Edit Cloudflare Workers"
4. Click "Continue to summary"
5. Click "Create Token"
6. Copy the token
7. Paste into wizard
8. Click "Verify Token"

**Record:**
- How long did this step take?
- Was the modal helpful?
- Did token verification work?
- Were instructions clear?

#### Step 4: GitHub Authentication

1. Open new tab: https://github.com/settings/tokens/new
2. Set scopes: `repo`, `workflow`
3. Click "Generate token"
4. Copy the token
5. Paste into wizard
6. Click "Verify Token"

**Record:**
- How long did this step take?
- Was the modal helpful?
- Did token verification work?
- Were the scope instructions clear?

#### Step 5: Configuration Options

1. Toggle "Enable email subscriptions" (test both on/off)
2. Toggle "Make repositories public" (test both settings)
3. Click "Next"

**Record:**
- Were the toggle switches intuitive?
- Were the descriptions clear?
- Did you understand what each option does?

#### Step 6: Review & Deploy

1. Review all configuration
2. Click "Start Deployment"
3. Watch the progress bar
4. Note how long each step takes

**Record:**
- Did all steps complete successfully?
- Were progress updates helpful?
- Did any step fail? If so, which one?
- Total deployment time:

#### Step 7: Passkey Registration (CRITICAL!)

1. Wait for deployment to complete
2. New tab should auto-open: passkey-setup.html
3. Read the intro screen
4. Click "Register Passkey"
5. Browser should show Touch ID/Face ID/Windows Hello prompt
6. Authenticate with biometrics
7. Watch for success screen

**Record (this is the most important part!):**
- Did the page open automatically?
- Was the UI clear and professional?
- Did the biometric prompt appear?
- Did passkey registration succeed?
- Did you see the public key (should NOT see it, it's automatic)?
- Did success screen show correct URLs?
- **This is the breakthrough feature - note everything!**

---

### Phase 2: Editor Testing (15 minutes)

**Goal:** Test the blog editor and publishing flow.

#### Step 1: Open Editor

1. Click "Open Editor" from passkey success screen
2. Or navigate to: `https://<your-blog-name>-editor.pages.dev`
3. Authenticate with passkey (Touch ID/Face ID)

**Record:**
- Did passkey login work?
- How long did login take?
- First impression of editor design?

#### Step 2: Create a Post

1. Click title area, type: "My First Post"
2. Click content area, type a few paragraphs
3. Try formatting:
   - Bold: Select text, press Cmd/Ctrl+B
   - Italic: Select text, press Cmd/Ctrl+I
   - Add a link: Type a URL, should auto-link
4. Watch for "Saving..." indicator (should appear every 2 seconds)

**Record:**
- Did auto-save work?
- Was the editor responsive?
- Did formatting work?
- Any UI issues?

#### Step 3: Upload an Image

1. Click the image upload area (or drag & drop)
2. Select an image
3. Wait for upload
4. Check if image appears in editor

**Record:**
- Did image upload work?
- How long did upload take?
- Did preview appear correctly?

#### Step 4: Publish Post

1. Click "Publish" button (top right)
2. Authenticate with passkey if prompted
3. Wait for "Published!" confirmation
4. Note the time

**Record:**
- How long did publish take?
- Was confirmation clear?
- Any errors?

#### Step 5: View Published Post

1. Click "View on Blog" or navigate to: `https://<your-blog-name>.pages.dev`
2. Verify post appears
3. Check formatting is correct
4. Check image displays

**Record:**
- Did post appear correctly?
- Was formatting preserved?
- Did images work?
- Site design thoughts?

---

### Phase 3: Error Testing (10 minutes)

**Goal:** Test error handling and recovery.

#### Test 1: Invalid Tokens

1. Start wizard again (new blog name)
2. Enter invalid Cloudflare token
3. Click "Verify Token"

**Record:**
- Did it show an error?
- Was error message helpful?
- Could you recover and continue?

#### Test 2: Resume Progress

1. Start wizard (new blog name)
2. Complete steps 1-3
3. Close the tab
4. Reopen wizard
5. Check if resume prompt appears

**Record:**
- Did it offer to resume?
- Did resume work correctly?
- Was data preserved?

#### Test 3: Deployment Failure (if possible)

1. Start wizard with invalid configuration
2. Watch deployment fail
3. Check error recovery

**Record:**
- Did retry logic work?
- Were error messages helpful?
- Could you recover?

---

### Phase 4: Mobile Testing (Optional, 10 minutes)

**Goal:** Test on mobile devices.

#### iPhone/iPad Testing

1. Open wizard on Safari (iOS)
2. Complete deployment flow
3. Test passkey with Face ID/Touch ID
4. Test editor on mobile
5. Try writing/publishing a post

**Record:**
- Did wizard work on mobile?
- Was UI responsive?
- Did Face ID work?
- Was editor usable on small screen?

#### Android Testing

1. Open wizard on Chrome (Android)
2. Complete deployment flow
3. Test passkey with fingerprint sensor
4. Test editor on mobile

**Record:**
- Did wizard work on Android?
- Did fingerprint sensor work?
- Any layout issues?

---

## Feedback Form

Please answer these questions after testing:

### Overall Experience

1. **How long did the entire process take?**
   - [ ] < 10 minutes
   - [ ] 10-15 minutes
   - [ ] 15-30 minutes
   - [ ] > 30 minutes

2. **How difficult was the setup? (1-5, 1=very easy, 5=very hard)**
   - Rating: ___

3. **Which step was most confusing?**
   - [ ] Blog name setup
   - [ ] Cloudflare authentication
   - [ ] GitHub authentication
   - [ ] Configuration options
   - [ ] Deployment progress
   - [ ] Passkey registration
   - [ ] None, everything was clear

4. **Did you complete the setup successfully?**
   - [ ] Yes, fully working
   - [ ] Partial (some steps failed)
   - [ ] No (failed completely)

### Passkey Registration (CRITICAL)

5. **Did the passkey setup page open automatically after deployment?**
   - [ ] Yes
   - [ ] No, I had to click a link
   - [ ] No, didn't open at all

6. **Did passkey registration work on first try?**
   - [ ] Yes, perfect
   - [ ] Had to retry
   - [ ] Failed completely

7. **What device/browser did you use for passkey?**
   - Device: _______________
   - Browser: _______________
   - Biometric type: _______________

8. **Was the passkey setup UI clear and professional?**
   - [ ] Yes, very clear
   - [ ] Mostly clear
   - [ ] Confusing
   - [ ] Comments: _______________

### Editor Experience

9. **How would you rate the editor design? (1-5)**
   - Rating: ___
   - Comments: _______________

10. **Did auto-save work correctly?**
    - [ ] Yes
    - [ ] Didn't notice
    - [ ] No/buggy

11. **Did image upload work?**
    - [ ] Yes, smooth
    - [ ] Yes, but slow
    - [ ] Failed
    - [ ] Didn't test

12. **Did publishing work?**
    - [ ] Yes, post appeared
    - [ ] Yes, but slow
    - [ ] Failed
    - [ ] Didn't test

### Bugs & Issues

13. **List any bugs you encountered:**
    ```
    - Bug 1: _______________
    - Bug 2: _______________
    - Bug 3: _______________
    ```

14. **Which error messages did you see?**
    ```
    - Error 1: _______________
    - Error 2: _______________
    ```

15. **Were error messages helpful?**
    - [ ] Yes, knew how to fix
    - [ ] Somewhat helpful
    - [ ] Confusing
    - [ ] No error messages shown

### Feature Requests

16. **What features are missing?**
    ```
    - Feature 1: _______________
    - Feature 2: _______________
    ```

17. **What would you change about the wizard?**
    ```
    _______________
    ```

### Final Questions

18. **Would you recommend this to a friend?**
    - [ ] Yes, definitely
    - [ ] Maybe
    - [ ] No
    - Why? _______________

19. **Would you use this for your own blog?**
    - [ ] Yes, will deploy
    - [ ] Maybe in the future
    - [ ] No, prefer alternatives
    - Why? _______________

20. **How does this compare to other platforms? (Ghost, Substack, WordPress)**
    ```
    _______________
    ```

---

## How to Submit Feedback

### Option 1: GitHub Issues (Preferred)

1. Go to: https://github.com/haomaaax/omni-blogger/issues
2. Click "New Issue"
3. Title: "[BETA] Your feedback summary"
4. Paste answers from feedback form
5. Add screenshots if relevant
6. Submit

### Option 2: Email

Send feedback to: [your-email@example.com]
- Subject: "Omni Blogger Beta Feedback"
- Attach screenshots if helpful

### Option 3: Google Form

Fill out: [Google Form URL]

---

## What to Include in Your Report

**Screenshots are super helpful!**
- Wizard steps (especially any error screens)
- Passkey setup flow (all 5 states if you see them)
- Editor interface
- Published blog
- Any bugs/issues

**Videos are even better!**
- Record the entire flow (use QuickTime Screen Recording on Mac)
- Show the passkey setup in action
- Upload to YouTube (unlisted) and share link

---

## Bug Reporting Tips

**Good bug report:**
```
Title: Passkey registration fails on Windows Chrome

Steps to reproduce:
1. Complete wizard deployment
2. Passkey setup opens
3. Click "Register Passkey"
4. Windows Hello prompt appears
5. Authenticate successfully
6. Page shows "Error: Failed to extract public key"

Expected: Should show success screen
Actual: Shows error

Device: Windows 11, Chrome 120
Screenshot: [attached]
```

**Bad bug report:**
```
"It doesn't work"
```

---

## Thank You!

Your feedback is invaluable. Beta testing helps catch issues before public launch. You're helping make Omni Blogger better for everyone.

**Perks for beta testers:**
- Recognition in README (if you want)
- Early access to new features
- Invitation to private Discord/Slack
- Free support for any deployment issues

---

## Beta Tester Coordination

**Join the beta tester group:**
- Slack: [invite-link]
- Discord: [invite-link]
- Email list: [sign-up-link]

**Beta testing timeline:**
- Week 5: Beta invites sent (5-10 testers)
- Week 5-6: Testing period (3-5 days)
- Week 6: Fix critical issues
- Week 6: Public launch

**Questions?** Reach out anytime:
- GitHub: [@haomaaax](https://github.com/haomaaax)
- Email: [your-email]
- Twitter: [@your-handle]

---

## After Beta Testing

If you successfully deployed and want to keep your blog:
- ✅ Your blog is fully functional
- ✅ You can start publishing real content
- ✅ All costs are covered by Cloudflare free tier
- ✅ You own everything (repos, infrastructure, subscribers)

If you want to delete your test deployment:
1. Delete GitHub repos: omni-blogger-editor, omni-blogger-worker, [blog-name]
2. Delete Cloudflare Pages projects
3. Delete Cloudflare Worker
4. Delete KV namespaces

---

**Happy testing! Let's make this amazing together. 🚀**
