# Blog Editor Roadmap: PWA + Cloud Sync

## Vision
Build a sustainable, cross-platform blog editor that works seamlessly on Mac and iPhone for the next 5-10 years.

---

## Architecture Decision

### Chosen Approach: Progressive Web App (PWA) + Cloud Sync

**Why PWA?**
- ✅ Works on Mac and iPhone from same codebase
- ✅ No app store approval needed
- ✅ Updates instantly (no app updates)
- ✅ Can be "installed" on home screen
- ✅ Works offline with service workers
- ✅ Open web standards (future-proof)

**Why Supabase for Drafts?**
- ✅ Free tier: 500MB database, 2GB bandwidth/month
- ✅ Real-time sync across devices
- ✅ Built-in authentication
- ✅ PostgreSQL (can export data anytime)
- ✅ Simple API (REST + realtime subscriptions)

**Data Strategy:**
```
Drafts (Work in Progress)
└─> Supabase Database (synced across devices)

Published Posts (Permanent Content)
└─> Git Repository → Cloudflare Pages
```

---

## Implementation Phases

## 📱 Phase 1: Cloud-Synced Drafts (Week 1-2)

### Goal
Enable draft syncing across Mac and iPhone while maintaining current UX.

### Tasks

#### 1.1 Set Up Supabase Project (15 mins)
- [ ] Go to https://supabase.com and create free account
- [ ] Create new project: `omni-blogger-drafts`
- [ ] Note down:
  - Project URL (e.g., `https://xxx.supabase.co`)
  - Anon public key
  - Service role key (keep private!)

#### 1.2 Create Database Schema (30 mins)
```sql
-- Run in Supabase SQL Editor

-- Enable Row Level Security
create table drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  tags text,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table drafts enable row level security;

-- Policy: Users can only see their own drafts
create policy "Users can view own drafts"
  on drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert own drafts"
  on drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own drafts"
  on drafts for update
  using (auth.uid() = user_id);

create policy "Users can delete own drafts"
  on drafts for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_drafts_updated_at
  before update on drafts
  for each row
  execute function update_updated_at_column();
```

#### 1.3 Add Supabase Client Library (10 mins)
```html
<!-- Add to index.html before editor.js -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

#### 1.4 Add Authentication UI (2-3 hours)
- [ ] Create simple login modal
- [ ] Add email/password or magic link auth
- [ ] Store session in localStorage
- [ ] Show user email in header when logged in
- [ ] Add logout button

**New file:** `auth.js`
```javascript
// Initialize Supabase
const supabase = supabase.createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Check if user is logged in
async function checkAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Login with email magic link
async function loginWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
  alert('Check your email for login link!');
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  location.reload();
}
```

#### 1.5 Migrate Draft Storage (3-4 hours)
Update `editor.js` to use Supabase instead of localStorage:

**Before (localStorage):**
```javascript
function saveDraft() {
  const drafts = JSON.parse(localStorage.getItem('blog-drafts')) || [];
  drafts.push({ title, content, ... });
  localStorage.setItem('blog-drafts', JSON.stringify(drafts));
}
```

**After (Supabase):**
```javascript
async function saveDraft() {
  const user = await checkAuth();
  if (!user) {
    alert('Please log in to save drafts');
    return;
  }

  const { data, error } = await supabase
    .from('drafts')
    .upsert({
      id: currentDraftId,
      user_id: user.id,
      title: elements.title.value,
      tags: elements.tags.value,
      content: elements.editor.innerHTML,
    });

  if (error) throw error;
  showStatus('Saved to cloud', 'saved');
}
```

#### 1.6 Real-time Sync (2 hours)
```javascript
// Listen for changes from other devices
supabase
  .channel('drafts')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'drafts' },
    (payload) => {
      console.log('Draft updated on another device:', payload);
      renderDraftsList(); // Refresh drafts list
    }
  )
  .subscribe();
```

#### 1.7 Migration Tool for Existing Drafts (1 hour)
```javascript
// One-time: migrate localStorage drafts to Supabase
async function migrateLocalDrafts() {
  const localDrafts = JSON.parse(localStorage.getItem('blog-drafts')) || [];
  const user = await checkAuth();

  for (const draft of localDrafts) {
    await supabase.from('drafts').insert({
      user_id: user.id,
      title: draft.title,
      tags: draft.tags,
      content: draft.content,
    });
  }

  console.log('Migrated', localDrafts.length, 'drafts');
}
```

### Phase 1 Testing Checklist
- [ ] Create draft on Mac → See it on iPhone
- [ ] Edit draft on iPhone → See changes on Mac
- [ ] Delete draft on Mac → Disappears on iPhone
- [ ] Works while offline (queues changes)
- [ ] Login/logout works correctly

---

## 🌐 Phase 2: Progressive Web App (Week 3-4)

### Goal
Make editor installable on iPhone home screen and work offline.

### Tasks

#### 2.1 Create PWA Manifest (30 mins)

**New file:** `manifest.json`
```json
{
  "name": "Blog Editor",
  "short_name": "Editor",
  "description": "Personal blog writing app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007bff",
  "orientation": "any",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#007bff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

#### 2.2 Create App Icons (1 hour)
- [ ] Design 512x512px icon
- [ ] Generate 192x192px version
- [ ] Create Apple touch icon (180x180px)
- [ ] Add to project root

#### 2.3 Add Service Worker for Offline (2-3 hours)

**New file:** `sw.js`
```javascript
const CACHE_NAME = 'blog-editor-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/editor.js',
  '/auth.js',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

Register in `index.html`:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

#### 2.4 Make Responsive for iPhone (3-4 hours)

Update `style.css`:
```css
/* Mobile-first adjustments */
@media (max-width: 768px) {
  .editor-container {
    padding: 1rem;
  }

  .title-input {
    font-size: 1.5rem;
  }

  .toolbar {
    position: sticky;
    top: 0;
    background: var(--bg-primary);
    z-index: 10;
  }

  .toolbar button {
    padding: 0.75rem; /* Larger touch targets */
    font-size: 1rem;
  }

  .header-right {
    flex-direction: column;
    gap: 0.5rem;
  }

  .drafts-panel {
    width: 100%;
  }
}

/* Improve touch interactions */
.editor {
  -webkit-overflow-scrolling: touch;
}

button {
  -webkit-tap-highlight-color: transparent;
}
```

#### 2.5 Deploy PWA to Cloudflare Pages (1-2 hours)

**Option A: Subdomain** (editor.yourdomain.com)
- [ ] Create new Cloudflare Pages project
- [ ] Point to omni-blogger repo
- [ ] Set custom domain: `editor.yourdomain.com`
- [ ] Configure DNS CNAME

**Option B: Same domain, different path** (yourdomain.com/editor)
- [ ] Add to existing blog deployment
- [ ] Configure Hugo to ignore /editor path
- [ ] Deploy editor to /editor subfolder

#### 2.6 Add "Install App" Prompt (1 hour)
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install button
  const installBtn = document.getElementById('install-btn');
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install outcome:', outcome);
    deferredPrompt = null;
  });
});
```

### Phase 2 Testing Checklist
- [ ] Open editor.yourdomain.com on iPhone Safari
- [ ] See "Add to Home Screen" option
- [ ] Install to home screen
- [ ] Open from home screen (standalone mode)
- [ ] Works offline (airplane mode)
- [ ] Syncs when back online
- [ ] Toolbar usable on mobile
- [ ] Keyboard doesn't cover editor

---

## 🚀 Phase 3: Serverless Publishing (Week 5-6)

### Goal
Publish directly from iPhone without local server running.

### Tasks

#### 3.1 Create Cloudflare Worker for Publishing (3-4 hours)

**New file:** `worker.js` (in separate repo or same)
```javascript
export default {
  async fetch(request, env) {
    // Only allow POST to /publish
    if (request.method !== 'POST' || !request.url.endsWith('/publish')) {
      return new Response('Not found', { status: 404 });
    }

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    // TODO: Verify Supabase JWT token

    // Get post data
    const { filename, content } = await request.json();

    // Commit to GitHub via API
    const githubToken = env.GITHUB_TOKEN; // From Cloudflare Workers secret
    const repo = 'your-username/my-blog';
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
      return new Response('GitHub API error', { status: 500 });
    }

    return new Response('Published!', { status: 200 });
  }
};
```

#### 3.2 Set Up GitHub Personal Access Token
- [ ] Go to GitHub Settings → Developer settings → Personal access tokens
- [ ] Create token with `repo` scope
- [ ] Add to Cloudflare Workers secrets as `GITHUB_TOKEN`

#### 3.3 Update editor.js Publish Function (2 hours)
```javascript
async function publishPost() {
  // ... validation ...

  const user = await checkAuth();
  if (!user) {
    alert('Please log in to publish');
    return;
  }

  // Get Supabase session token
  const { data: { session } } = await supabase.auth.getSession();

  try {
    const response = await fetch('https://publish-worker.your-username.workers.dev/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        filename,
        content: fullContent,
      }),
    });

    if (!response.ok) throw new Error('Publish failed');

    // Show success
    showSuccessModal();

    // Delete draft from Supabase
    await supabase.from('drafts').delete().eq('id', currentDraftId);

  } catch (error) {
    console.error(error);
    // Fall back to download
    downloadMarkdownFile(filename, fullContent);
  }
}
```

#### 3.4 Add Cloudflare Pages Build Webhook (30 mins)
- [ ] Get Cloudflare Pages deploy hook URL
- [ ] Add to GitHub Actions or trigger from Worker
- [ ] Auto-deploy on new commits

### Phase 3 Testing Checklist
- [ ] Publish from iPhone
- [ ] GitHub commit appears automatically
- [ ] Cloudflare Pages deploys
- [ ] Post live in ~2 minutes
- [ ] Draft deleted from Supabase
- [ ] Works without local server running

---

## ✨ Phase 4: Polish & Long-term Features (Week 7-8)

### Goal
Make it delightful to use for 5-10 years.

### Tasks

#### 4.1 Mobile UX Enhancements (3-4 hours)
- [ ] Swipe to delete draft
- [ ] Pull to refresh drafts list
- [ ] Haptic feedback on actions
- [ ] Better keyboard handling
- [ ] Paste image from clipboard

#### 4.2 Image Upload Support (4-5 hours)
- [ ] Add image button to toolbar
- [ ] Upload to Cloudflare R2 or Hugo static folder
- [ ] Insert markdown image syntax
- [ ] Image compression/resizing
- [ ] Support paste from clipboard

#### 4.3 Draft Search & Organization (2-3 hours)
- [ ] Search drafts by title/content
- [ ] Sort by date, title, modified
- [ ] Archive completed drafts
- [ ] Export all drafts as JSON backup

#### 4.4 Analytics & Monitoring (1-2 hours)
- [ ] Track active users (Cloudflare Analytics)
- [ ] Monitor errors (Sentry free tier)
- [ ] Uptime monitoring (UptimeRobot)

#### 4.5 Documentation & Handoff (2-3 hours)
- [ ] Update MANUAL.md for PWA setup
- [ ] Document Supabase schema
- [ ] Document Cloudflare Worker deployment
- [ ] Create backup/export scripts
- [ ] Add troubleshooting guide

---

## Tech Stack Summary

### Frontend
- **HTML/CSS/JavaScript** - Core web technologies
- **ContentEditable API** - WYSIWYG editing
- **Service Workers** - Offline capability
- **PWA APIs** - Install to home screen

### Backend/Services
- **Supabase** - Database + Auth (free tier)
- **Cloudflare Pages** - PWA hosting (free)
- **Cloudflare Workers** - Serverless publish API (free tier: 100k req/day)
- **GitHub** - Content versioning (free)

### Cost Breakdown (Monthly)
- Supabase: $0 (free tier)
- Cloudflare Pages: $0 (free)
- Cloudflare Workers: $0 (within free limits)
- GitHub: $0 (public repo)
- Domain (Gandi): ~$15/year
- **Total: ~$1.25/month** 🎉

---

## Migration Path from Current System

### Safe Migration Strategy
1. **Don't break existing workflow** - Keep current editor working
2. **Add Supabase in parallel** - Both localStorage and Supabase work
3. **Add migration button** - User chooses when to migrate
4. **Test on one device first** - Verify Mac works before iPhone
5. **Gradual rollout** - PWA features added incrementally

### Rollback Plan
- localStorage code stays in codebase (commented)
- Can switch back with config flag
- Export Supabase data to JSON anytime
- Git history preserves all published posts

---

## Success Metrics

### Phase 1 Success
- [ ] Login from Mac
- [ ] Create draft on Mac
- [ ] See same draft on iPhone browser
- [ ] Edit on iPhone, see on Mac
- [ ] Zero data loss for 1 week

### Phase 2 Success
- [ ] Install PWA on iPhone
- [ ] Works offline (airplane mode test)
- [ ] Syncs when back online
- [ ] Comfortable mobile writing experience

### Phase 3 Success
- [ ] Publish from iPhone
- [ ] Post live without touching Mac
- [ ] Publish from coffee shop wifi
- [ ] Works without local server

### Final Success (5-10 year vision)
- [ ] Use daily for 1 month straight
- [ ] Zero data loss
- [ ] Under 3 seconds from idea to draft saved
- [ ] Under 2 minutes from publish to live
- [ ] Works anywhere, any device
- [ ] No vendor lock-in (can export everything)
- [ ] Minimal maintenance needed

---

## Resources

### Documentation
- Supabase: https://supabase.com/docs
- PWA: https://web.dev/progressive-web-apps/
- Service Workers: https://developers.google.com/web/fundamentals/primers/service-workers
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- GitHub API: https://docs.github.com/en/rest

### Tools
- PWA Builder: https://www.pwabuilder.com/
- Icon Generator: https://realfavicongenerator.net/
- Lighthouse (PWA testing): Chrome DevTools → Lighthouse tab

### Similar Projects (inspiration)
- Bear Notes (Apple) - Clean, synced notes
- Notion Web - PWA done right
- Obsidian Publish - Local-first, synced

---

**Last Updated:** 2025-12-03
**Status:** Ready to implement
**Next Action:** Phase 1.1 - Create Supabase account
