/* ============================================
   Blog Editor - JavaScript
   WYSIWYG editor with Markdown export
   ============================================ */

// ============================================
// Configuration - Loaded from config.js
// CONFIG is defined globally by config.js
// ============================================
// Note: CONFIG is loaded from config.js before this script runs

// ============================================
// DOM Elements
// ============================================
const elements = {
  editor: document.getElementById('editor'),
  title: document.getElementById('post-title'),
  tags: document.getElementById('post-tags'),
  status: document.getElementById('status'),
  btnPublish: document.getElementById('btn-publish'),
  btnMenu: document.getElementById('btn-menu'),
  btnCloseMenu: document.getElementById('btn-close-menu'),
  btnDrafts: document.getElementById('btn-drafts'),
  btnCloseDrafts: document.getElementById('btn-close-drafts'),
  btnPosts: document.getElementById('btn-posts'),
  btnClosePosts: document.getElementById('btn-close-posts'),
  btnNewPost: document.getElementById('btn-new-post'),
  menuPanel: document.getElementById('menu-panel'),
  draftsPanel: document.getElementById('drafts-panel'),
  draftsList: document.getElementById('drafts-list'),
  postsPanel: document.getElementById('posts-panel'),
  postsList: document.getElementById('posts-list'),
  publishModal: document.getElementById('publish-modal'),
  deleteModal: document.getElementById('delete-modal'),
  deleteMessage: document.getElementById('delete-message'),
  btnCancelDelete: document.getElementById('btn-cancel-delete'),
  btnConfirmDelete: document.getElementById('btn-confirm-delete'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  postLink: document.getElementById('post-link')
};

// ============================================
// Editor State
// ============================================
let currentDraftId = null;
let autoSaveTimeout = null;
let isEditing = false;
let currentPostSlug = null;
let currentPostSha = null;
let postToDelete = null;

// ============================================
// Toolbar Commands
// ============================================
const toolbarCommands = {
  bold: () => document.execCommand('bold'),
  italic: () => document.execCommand('italic'),
  h2: () => {
    document.execCommand('formatBlock', false, '<h2>');
  },
  h3: () => {
    document.execCommand('formatBlock', false, '<h3>');
  },
  ul: () => document.execCommand('insertUnorderedList'),
  ol: () => document.execCommand('insertOrderedList'),
  quote: () => {
    document.execCommand('formatBlock', false, '<blockquote>');
  },
  link: () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  },
  code: () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const code = document.createElement('code');
      code.textContent = range.toString();
      range.deleteContents();
      range.insertNode(code);
    }
  }
};

// ============================================
// Initialize Toolbar
// ============================================
function initToolbar() {
  document.querySelectorAll('.toolbar button').forEach(button => {
    const command = button.dataset.command;
    if (command && toolbarCommands[command]) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        toolbarCommands[command]();
        elements.editor.focus();
      });
    }
  });
}

// ============================================
// Keyboard Shortcuts
// ============================================
function initKeyboardShortcuts() {
  elements.editor.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveDraft();
    }
    
    // Cmd/Ctrl + Enter to publish
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      publishPost();
    }
  });
  
  // Global shortcuts
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + S anywhere
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveDraft();
    }
  });
}

// ============================================
// HTML to Markdown Converter
// ============================================
function htmlToMarkdown(html) {
  // Create a temporary element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  function convertNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    const tag = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(convertNode).join('');
    
    switch (tag) {
      case 'h1':
        return `# ${children}\n\n`;
      case 'h2':
        return `## ${children}\n\n`;
      case 'h3':
        return `### ${children}\n\n`;
      case 'h4':
        return `#### ${children}\n\n`;
      case 'p':
        return `${children}\n\n`;
      case 'strong':
      case 'b':
        return `**${children}**`;
      case 'em':
      case 'i':
        return `*${children}*`;
      case 'a':
        const href = node.getAttribute('href') || '';
        return `[${children}](${href})`;
      case 'code':
        return `\`${children}\``;
      case 'pre':
        return `\`\`\`\n${children}\n\`\`\`\n\n`;
      case 'blockquote':
        return children.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
      case 'ul':
        return children + '\n';
      case 'ol':
        return children + '\n';
      case 'li':
        const parent = node.parentNode.tagName.toLowerCase();
        const prefix = parent === 'ol' 
          ? `${Array.from(node.parentNode.children).indexOf(node) + 1}. `
          : '- ';
        return `${prefix}${children.trim()}\n`;
      case 'br':
        return '\n';
      case 'hr':
        return '\n---\n\n';
      case 'div':
        return `${children}\n\n`;
      default:
        return children;
    }
  }
  
  let markdown = convertNode(temp);
  
  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
}

// ============================================
// Generate Hugo Front Matter
// ============================================
function generateFrontMatter(title, tags) {
  const date = new Date().toISOString();
  const tagArray = tags
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
  
  let frontMatter = `---
title: "${title}"
date: ${date}
draft: false`;
  
  if (tagArray.length > 0) {
    frontMatter += `\ntags: [${tagArray.map(t => `"${t}"`).join(', ')}]`;
  }
  
  frontMatter += `\n---\n\n`;
  
  return frontMatter;
}

// ============================================
// Generate Slug from Title
// ============================================
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

// ============================================
// Draft Management (localStorage)
// ============================================
function getDrafts() {
  const drafts = localStorage.getItem('blog-drafts');
  return drafts ? JSON.parse(drafts) : [];
}

function saveDrafts(drafts) {
  localStorage.setItem('blog-drafts', JSON.stringify(drafts));
}

function saveDraft() {
  const title = elements.title.value.trim() || 'Untitled';
  const tags = elements.tags.value.trim();
  const content = elements.editor.innerHTML;
  
  const drafts = getDrafts();
  const now = new Date().toISOString();
  
  if (currentDraftId) {
    // Update existing draft
    const index = drafts.findIndex(d => d.id === currentDraftId);
    if (index !== -1) {
      drafts[index] = {
        ...drafts[index],
        title,
        tags,
        content,
        updatedAt: now
      };
    }
  } else {
    // Create new draft
    currentDraftId = 'draft-' + Date.now();
    drafts.unshift({
      id: currentDraftId,
      title,
      tags,
      content,
      createdAt: now,
      updatedAt: now
    });
  }
  
  saveDrafts(drafts);
  showStatus('Saved', 'saved');
  renderDraftsList();
}

function loadDraft(draftId) {
  const drafts = getDrafts();
  const draft = drafts.find(d => d.id === draftId);
  
  if (draft) {
    currentDraftId = draft.id;
    elements.title.value = draft.title === 'Untitled' ? '' : draft.title;
    elements.tags.value = draft.tags || '';
    elements.editor.innerHTML = draft.content;
    closeDraftsPanel();
    showStatus('Draft loaded', 'saved');
  }
}

function deleteDraft(draftId) {
  if (!confirm('Delete this draft?')) return;
  
  let drafts = getDrafts();
  drafts = drafts.filter(d => d.id !== draftId);
  saveDrafts(drafts);
  
  if (currentDraftId === draftId) {
    newPost();
  }
  
  renderDraftsList();
}

function newPost() {
  currentDraftId = null;
  elements.title.value = '';
  elements.tags.value = '';
  elements.editor.innerHTML = '';
  elements.status.textContent = '';
}

// ============================================
// Auto-save
// ============================================
function initAutoSave() {
  const triggerAutoSave = () => {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      if (elements.title.value.trim() || elements.editor.textContent.trim()) {
        saveDraft();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  };
  
  elements.editor.addEventListener('input', triggerAutoSave);
  elements.title.addEventListener('input', triggerAutoSave);
  elements.tags.addEventListener('input', triggerAutoSave);
}

// ============================================
// Drafts Panel
// ============================================
function renderDraftsList() {
  const drafts = getDrafts();

  if (drafts.length === 0) {
    elements.draftsList.innerHTML = '<p class="no-drafts">No drafts yet</p>';
    return;
  }

  elements.draftsList.innerHTML = drafts.map(draft => {
    const date = new Date(draft.updatedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Extract preview text
    const temp = document.createElement('div');
    temp.innerHTML = draft.content;
    const preview = temp.textContent.substring(0, 80) + '...';

    return `
      <div class="draft-item">
        <div class="draft-item-content" data-id="${draft.id}">
          <h3>${draft.title}</h3>
          <p>${preview}</p>
          <time>${date}</time>
        </div>
        <div class="draft-item-actions">
          <button class="btn-delete-draft" data-id="${draft.id}" data-title="${draft.title}" title="Delete draft">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Add click handlers for loading drafts
  elements.draftsList.querySelectorAll('.draft-item-content').forEach(item => {
    item.addEventListener('click', () => {
      loadDraft(item.dataset.id);
    });
  });

  // Add click handlers for deleting drafts
  elements.draftsList.querySelectorAll('.btn-delete-draft').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteDraft(btn.dataset.id, btn.dataset.title);
    });
  });
}

function deleteDraft(draftId, title) {
  if (!confirm(`Delete draft "${title}"?`)) {
    return;
  }

  let drafts = getDrafts();
  drafts = drafts.filter(d => d.id !== draftId);
  saveDrafts(drafts);

  // If we're currently editing this draft, clear the editor
  if (currentDraftId === draftId) {
    newPost();
  }

  // Refresh the drafts list
  renderDraftsList();
  showStatus('Draft deleted', 'success');
}

// ============================================
// Status Display
// ============================================
function showStatus(message, type = '') {
  elements.status.textContent = message;
  elements.status.className = 'status ' + type;
  
  // Clear after 3 seconds
  setTimeout(() => {
    elements.status.textContent = '';
    elements.status.className = 'status';
  }, 3000);
}

// ============================================
// Publish Post
// ============================================
async function publishPost() {
  const title = elements.title.value.trim();
  const tags = elements.tags.value.trim();
  const htmlContent = elements.editor.innerHTML;

  // Validation
  if (!title) {
    alert('Please enter a title');
    elements.title.focus();
    return;
  }

  if (!htmlContent.trim()) {
    alert('Please write some content');
    elements.editor.focus();
    return;
  }

  // Convert to Markdown
  const markdown = htmlToMarkdown(htmlContent);
  const frontMatter = generateFrontMatter(title, tags);
  const fullContent = frontMatter + markdown;
  const slug = generateSlug(title);
  const filename = `${slug}.md`;

  showStatus(isEditing ? 'Updating...' : 'Publishing...', '');

  try {
    let response;

    if (isEditing && currentPostSlug && currentPostSha) {
      // Update existing post
      response = await fetch(`${CONFIG.apiUrl}/posts/${currentPostSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: fullContent,
          sha: currentPostSha
        })
      });
    } else {
      // Create new post (backwards compatible endpoint)
      response = await fetch(`${CONFIG.apiUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename,
          content: fullContent
        })
      });
    }

    if (!response.ok) {
      throw new Error(isEditing ? 'Failed to update post' : 'Failed to publish');
    }

    const result = await response.json();

    // Show success modal
    elements.postLink.href = `${CONFIG.blogUrl}/posts/${slug}/`;
    elements.publishModal.classList.remove('hidden');

    // Clear the draft from localStorage
    if (currentDraftId) {
      let drafts = getDrafts();
      drafts = drafts.filter(d => d.id !== currentDraftId);
      saveDrafts(drafts);
    }

    // Reset editor and edit mode
    startNewPost();

  } catch (error) {
    console.error('Publish error:', error);

    // Fallback: Download the markdown file
    downloadMarkdownFile(filename, fullContent);
    showStatus('Downloaded (server offline)', '');
  }
}

// ============================================
// Fallback: Download Markdown File
// ============================================
function downloadMarkdownFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  
  alert(`Server not running. File downloaded as "${filename}"\n\nTo publish manually:\n1. Move file to myblog/content/posts/\n2. Run: hugo && ./deploy.sh`);
}

// ============================================
// Modal
// ============================================
function closeModal() {
  elements.publishModal.classList.add('hidden');
}

// ============================================
// Posts Management
// ============================================

async function loadPosts() {
  try {
    const response = await fetch(`${CONFIG.apiUrl}/posts`);
    if (!response.ok) {
      throw new Error('Failed to load posts');
    }
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error loading posts:', error);
    showStatus('Failed to load posts', 'error');
    return [];
  }
}

async function renderPostsList() {
  elements.postsList.innerHTML = '<div class="loading">Loading posts...</div>';

  const posts = await loadPosts();

  if (posts.length === 0) {
    elements.postsList.innerHTML = '<p class="no-posts">No posts yet. Start writing!</p>';
    return;
  }

  elements.postsList.innerHTML = posts.map(post => {
    const date = new Date(post.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const tagsHtml = post.tags && post.tags.length > 0
      ? `<div class="post-tags-preview">${post.tags.slice(0, 3).join(', ')}</div>`
      : '';

    return `
      <div class="post-item" data-slug="${post.slug}">
        <div class="post-item-content">
          <h3>${post.title}</h3>
          <p class="post-excerpt">${post.excerpt || ''}</p>
          ${tagsHtml}
          <time>${date}</time>
        </div>
        <div class="post-item-actions">
          <button class="btn-edit" data-slug="${post.slug}" title="Edit post">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button class="btn-delete" data-slug="${post.slug}" data-title="${post.title}" title="Delete post">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners
  elements.postsList.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      loadPostForEditing(btn.dataset.slug);
    });
  });

  elements.postsList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDelete(btn.dataset.slug, btn.dataset.title);
    });
  });
}

async function loadPostForEditing(slug) {
  try {
    showStatus('Loading post...', '');

    const response = await fetch(`${CONFIG.apiUrl}/posts/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to load post');
    }

    const post = await response.json();

    // Set edit mode
    isEditing = true;
    currentPostSlug = slug;
    currentPostSha = post.sha;

    // Populate editor
    elements.title.value = post.frontmatter.title || '';
    elements.tags.value = Array.isArray(post.frontmatter.tags)
      ? post.frontmatter.tags.join(', ')
      : '';

    // Convert markdown to HTML for the editor
    elements.editor.innerHTML = markdownToHtml(post.content);

    // Update UI
    elements.btnPublish.textContent = '✨ Update Post';
    elements.btnNewPost.classList.remove('hidden');

    // Close posts panel
    closePostsPanel();

    showStatus('Loaded for editing', 'success');

  } catch (error) {
    console.error('Error loading post:', error);
    showStatus('Failed to load post', 'error');
  }
}

// Simple markdown to HTML converter (basic implementation)
function markdownToHtml(markdown) {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

function confirmDelete(slug, title) {
  postToDelete = slug;
  elements.deleteMessage.textContent = `Are you sure you want to delete "${title}"? This cannot be undone.`;
  elements.deleteModal.classList.remove('hidden');
}

async function deletePost() {
  if (!postToDelete) return;

  try {
    showStatus('Deleting post...', '');

    // Get the post to retrieve its SHA
    const getResponse = await fetch(`${CONFIG.apiUrl}/posts/${postToDelete}`);
    if (!getResponse.ok) {
      throw new Error('Failed to get post details');
    }
    const postData = await getResponse.json();

    // Delete the post
    const deleteResponse = await fetch(`${CONFIG.apiUrl}/posts/${postToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sha: postData.sha
      })
    });

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete post');
    }

    showStatus('Post deleted!', 'success');

    // Close delete modal
    elements.deleteModal.classList.add('hidden');
    postToDelete = null;

    // Refresh posts list
    renderPostsList();

  } catch (error) {
    console.error('Error deleting post:', error);
    showStatus('Failed to delete post', 'error');
  }
}

function cancelDelete() {
  postToDelete = null;
  elements.deleteModal.classList.add('hidden');
}

function openMenu() {
  elements.menuPanel.classList.remove('hidden');
}

function closeMenu() {
  elements.menuPanel.classList.add('hidden');
}

function openPostsPanel() {
  closeMenu();
  renderPostsList();
  elements.postsPanel.classList.remove('hidden');
}

function closePostsPanel() {
  elements.postsPanel.classList.add('hidden');
}

function openDraftsPanel() {
  closeMenu();
  renderDraftsList();
  elements.draftsPanel.classList.remove('hidden');
}

function closeDraftsPanel() {
  elements.draftsPanel.classList.add('hidden');
}

function startNewPost() {
  // Reset edit mode
  isEditing = false;
  currentPostSlug = null;
  currentPostSha = null;

  // Clear editor
  newPost();

  // Update UI
  elements.btnPublish.textContent = '✨ Publish';
  elements.btnNewPost.classList.add('hidden');

  showStatus('Ready for new post', 'success');
}

// ============================================
// Theme Toggle
// ============================================
function initTheme() {
  const theme = localStorage.getItem('theme') || 'auto';
  applyTheme(theme);
}

function applyTheme(theme) {
  console.log('applyTheme called with:', theme);
  const html = document.documentElement;
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  const themeLabel = document.getElementById('theme-label');

  console.log('Found icons:', { sunIcon: !!sunIcon, moonIcon: !!moonIcon });

  if (theme === 'dark') {
    html.classList.remove('light');
    html.classList.add('dark');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
    if (themeLabel) themeLabel.textContent = 'Light Mode';
  } else if (theme === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
    if (themeLabel) themeLabel.textContent = 'Dark Mode';
  } else {
    // Auto mode - use system preference
    html.classList.remove('light', 'dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      html.classList.add('dark');
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
      if (themeLabel) themeLabel.textContent = 'Light Mode';
    } else {
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
      if (themeLabel) themeLabel.textContent = 'Dark Mode';
    }
  }

  localStorage.setItem('theme', theme);
  console.log('Theme applied:', theme, 'HTML classes:', html.className);
}

function toggleTheme() {
  console.log('toggleTheme called');
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');

  console.log('Current mode:', isDark ? 'dark' : 'light');

  // Simple toggle: light ↔ dark
  if (isDark) {
    console.log('Switching to light mode');
    applyTheme('light');
  } else {
    console.log('Switching to dark mode');
    applyTheme('dark');
  }
}

// ============================================
// Initialize App
// ============================================
function init() {
  // CONFIG is already loaded from config.js
  console.log('✅ Blog Editor initialized');
  console.log('📡 API URL:', CONFIG.apiUrl);
  console.log('🌐 Blog URL:', CONFIG.blogUrl);

  initTheme();
  initToolbar();
  initKeyboardShortcuts();
  initAutoSave();

  // Event listeners
  elements.btnPublish.addEventListener('click', publishPost);
  elements.btnMenu.addEventListener('click', openMenu);
  elements.btnCloseMenu.addEventListener('click', closeMenu);
  elements.btnDrafts.addEventListener('click', openDraftsPanel);
  elements.btnCloseDrafts.addEventListener('click', closeDraftsPanel);
  elements.btnPosts.addEventListener('click', openPostsPanel);
  elements.btnClosePosts.addEventListener('click', closePostsPanel);
  elements.btnNewPost.addEventListener('click', startNewPost);
  elements.btnCloseModal.addEventListener('click', closeModal);
  elements.btnCancelDelete.addEventListener('click', cancelDelete);
  elements.btnConfirmDelete.addEventListener('click', deletePost);

  // Theme toggle
  const themeToggleBtn = document.getElementById('theme-toggle');
  console.log('Theme toggle button:', themeToggleBtn);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
    console.log('Theme toggle event listener added');
  } else {
    console.error('Theme toggle button not found!');
  }

  // Close modal on background click
  elements.publishModal.addEventListener('click', (e) => {
    if (e.target === elements.publishModal) {
      closeModal();
    }
  });

  // Close delete modal on background click
  elements.deleteModal.addEventListener('click', (e) => {
    if (e.target === elements.deleteModal) {
      cancelDelete();
    }
  });

  // Close panels on outside click
  document.addEventListener('click', (e) => {
    // Close menu panel
    if (!elements.menuPanel.contains(e.target) &&
        !elements.btnMenu.contains(e.target) &&
        !elements.menuPanel.classList.contains('hidden')) {
      closeMenu();
    }

    // Close drafts panel
    if (!elements.draftsPanel.contains(e.target) &&
        !elements.btnDrafts.contains(e.target) &&
        !elements.draftsPanel.classList.contains('hidden')) {
      closeDraftsPanel();
    }

    // Close posts panel
    if (!elements.postsPanel.contains(e.target) &&
        !elements.btnPosts.contains(e.target) &&
        !elements.postsPanel.classList.contains('hidden')) {
      closePostsPanel();
    }
  });

  // Focus editor
  elements.editor.focus();

  console.log('Blog Editor initialized');
}

// Initialize theme immediately (before DOM loads to avoid flash)
if (document.documentElement) {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  if (savedTheme === 'dark') {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  } else {
    // Auto - use system preference
    document.documentElement.classList.remove('light', 'dark');
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
