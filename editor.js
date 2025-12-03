/* ============================================
   Blog Editor - JavaScript
   WYSIWYG editor with Markdown export
   ============================================ */

// ============================================
// Configuration - Loaded from server
// ============================================
let CONFIG = {
  blogUrl: 'http://localhost:1313', // Default fallback
  apiUrl: 'http://localhost:3000'
};

// Load config from server
async function loadConfig() {
  try {
    const response = await fetch('http://localhost:3000/config');
    const serverConfig = await response.json();
    CONFIG = { ...CONFIG, ...serverConfig };
    console.log('✅ Config loaded from server');
  } catch (error) {
    console.warn('⚠️ Could not load config from server, using defaults');
  }
}

// ============================================
// DOM Elements
// ============================================
const elements = {
  editor: document.getElementById('editor'),
  title: document.getElementById('post-title'),
  tags: document.getElementById('post-tags'),
  status: document.getElementById('status'),
  btnSave: document.getElementById('btn-save'),
  btnPublish: document.getElementById('btn-publish'),
  btnDrafts: document.getElementById('btn-drafts'),
  btnCloseDrafts: document.getElementById('btn-close-drafts'),
  draftsPanel: document.getElementById('drafts-panel'),
  draftsList: document.getElementById('drafts-list'),
  publishModal: document.getElementById('publish-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  postLink: document.getElementById('post-link')
};

// ============================================
// Editor State
// ============================================
let currentDraftId = null;
let autoSaveTimeout = null;

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
      <div class="draft-item" data-id="${draft.id}">
        <h3>${draft.title}</h3>
        <p>${preview}</p>
        <time>${date}</time>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  elements.draftsList.querySelectorAll('.draft-item').forEach(item => {
    item.addEventListener('click', () => {
      loadDraft(item.dataset.id);
    });
  });
}

function openDraftsPanel() {
  renderDraftsList();
  elements.draftsPanel.classList.remove('hidden');
}

function closeDraftsPanel() {
  elements.draftsPanel.classList.add('hidden');
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
  
  showStatus('Publishing...', '');
  
  try {
    const response = await fetch(`${CONFIG.apiUrl}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename,
        content: fullContent
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to publish');
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
    
    // Reset editor
    newPost();
    
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
// Initialize App
// ============================================
async function init() {
  // Load config from server first
  await loadConfig();

  initToolbar();
  initKeyboardShortcuts();
  initAutoSave();

  // Event listeners
  elements.btnSave.addEventListener('click', saveDraft);
  elements.btnPublish.addEventListener('click', publishPost);
  elements.btnDrafts.addEventListener('click', openDraftsPanel);
  elements.btnCloseDrafts.addEventListener('click', closeDraftsPanel);
  elements.btnCloseModal.addEventListener('click', closeModal);

  // Close modal on background click
  elements.publishModal.addEventListener('click', (e) => {
    if (e.target === elements.publishModal) {
      closeModal();
    }
  });

  // Close drafts panel on outside click
  document.addEventListener('click', (e) => {
    if (!elements.draftsPanel.contains(e.target) &&
        !elements.btnDrafts.contains(e.target) &&
        !elements.draftsPanel.classList.contains('hidden')) {
      closeDraftsPanel();
    }
  });

  // Focus editor
  elements.editor.focus();

  console.log('Blog Editor initialized');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
