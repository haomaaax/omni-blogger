/* ============================================
   Blog Editor - Server
   Handles saving posts and deploying
   ============================================ */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ============================================
// CONFIGURATION - Load from config.json
// ============================================
let userConfig = {};
try {
  const configPath = path.join(__dirname, 'config.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  userConfig = JSON.parse(configFile);
} catch (error) {
  console.error('❌ Error: config.json not found!');
  console.error('Please copy config.example.json to config.json and update your settings.');
  process.exit(1);
}

const CONFIG = {
  port: 3000,
  editorPath: __dirname,
  ...userConfig
};

// ============================================
// MIME Types
// ============================================
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// ============================================
// Helper: Run Shell Command
// ============================================
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// ============================================
// Helper: Send JSON Response
// ============================================
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

// ============================================
// Helper: Serve Static File
// ============================================
function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

// ============================================
// Handle Publish Request
// ============================================
async function handlePublish(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { filename, content, images } = JSON.parse(body);

      if (!filename || !content) {
        return sendJSON(res, 400, { error: 'Missing filename or content' });
      }

      // Upload images first (if any)
      let imagesUploaded = 0;
      if (images && Array.isArray(images) && images.length > 0) {
        console.log(`📸 Uploading ${images.length} images...`);

        const imagesDir = path.join(CONFIG.blogPath, 'static', 'images');

        // Ensure images directory exists
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        for (const image of images) {
          try {
            // Decode base64 and write file
            const imageBuffer = Buffer.from(image.content, 'base64');
            const imagePath = path.join(imagesDir, image.filename);

            fs.writeFileSync(imagePath, imageBuffer);
            console.log(`✅ Saved image: ${image.filename}`);
            imagesUploaded++;
          } catch (err) {
            console.error(`❌ Failed to save image ${image.filename}:`, err);
            return sendJSON(res, 500, {
              error: `Failed to save image: ${image.filename}`,
              details: err.message
            });
          }
        }
      }

      // Save the markdown file
      const postsDir = path.join(CONFIG.blogPath, 'content', 'posts');
      const filePath = path.join(postsDir, filename);

      // Ensure posts directory exists
      if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
      }

      // Write the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Saved: ${filePath}`);

      // Build the site with Hugo
      console.log('🔨 Building site with Hugo...');
      try {
        await runCommand('hugo --minify', CONFIG.blogPath);
        console.log('✅ Hugo build complete');
      } catch (err) {
        console.error('❌ Hugo build failed:', err.stderr);
        return sendJSON(res, 500, { error: 'Hugo build failed', details: err.stderr });
      }

      // Deploy if configured
      if (CONFIG.deployCommand) {
        console.log('🚀 Deploying...');
        try {
          await runCommand(CONFIG.deployCommand, CONFIG.blogPath);
          console.log('✅ Deploy complete');
        } catch (err) {
          console.error('❌ Deploy failed:', err.stderr);
          return sendJSON(res, 500, { error: 'Deploy failed', details: err.stderr });
        }
      }

      sendJSON(res, 200, {
        success: true,
        message: 'Post published successfully',
        filename,
        imagesUploaded
      });

    } catch (err) {
      console.error('Error:', err);
      sendJSON(res, 500, { error: 'Server error', details: err.message });
    }
  });
}

// ============================================
// Handle List Drafts (from Hugo content folder)
// ============================================
function handleListPosts(res) {
  const postsDir = path.join(CONFIG.blogPath, 'content', 'posts');
  
  if (!fs.existsSync(postsDir)) {
    return sendJSON(res, 200, { posts: [] });
  }
  
  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const filePath = path.join(postsDir, f);
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract title from front matter
      const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
      const title = titleMatch ? titleMatch[1] : f.replace('.md', '');
      
      return {
        filename: f,
        title,
        modifiedAt: stat.mtime
      };
    })
    .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
  
  sendJSON(res, 200, { posts: files });
}

// ============================================
// Create HTTP Server
// ============================================
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${CONFIG.port}`);
  
  // CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }
  
  // API Routes
  if ((url.pathname === '/publish' || url.pathname === '/') && req.method === 'POST') {
    return handlePublish(req, res);
  }

  if (url.pathname === '/posts' && req.method === 'GET') {
    return handleListPosts(res);
  }

  // Serve client config
  if (url.pathname === '/config' && req.method === 'GET') {
    return sendJSON(res, 200, {
      blogUrl: CONFIG.blogUrl,
      apiUrl: CONFIG.apiUrl
    });
  }
  
  // Serve static files
  let filePath = path.join(CONFIG.editorPath, url.pathname);
  
  // Default to index.html
  if (url.pathname === '/') {
    filePath = path.join(CONFIG.editorPath, 'index.html');
  }
  
  serveStaticFile(res, filePath);
});

// ============================================
// Start Server
// ============================================
server.listen(CONFIG.port, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║       📝 Blog Editor Server            ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Open: http://localhost:${CONFIG.port}            ║`);
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Blog: ${CONFIG.blogPath.substring(0, 28).padEnd(28)} ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});
