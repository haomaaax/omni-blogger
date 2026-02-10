// Wizard State Management
const wizardState = {
    currentStep: 1,
    totalSteps: 5,
    config: {
        blogName: '',
        cloudflareToken: '',
        cloudflareAccountId: '',
        githubToken: '',
        githubUsername: '',
        customDomain: '',
        useCustomDomain: false,
        enableEmail: false,
        resendApiKey: '',
        fromEmail: '',
        repoVisibility: 'public'
    }
};

// Initialize wizard
document.addEventListener('DOMContentLoaded', () => {
    updateURLPreviews();
    setupEventListeners();
});

function setupEventListeners() {
    // Blog name input - update previews in real-time
    const blogNameInput = document.getElementById('blogName');
    if (blogNameInput) {
        blogNameInput.addEventListener('input', updateURLPreviews);
    }
}

// Update URL previews based on blog name
function updateURLPreviews() {
    const blogName = document.getElementById('blogName')?.value || 'my-blog';
    const sanitizedName = blogName.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Update Step 1 previews
    document.getElementById('previewEditorUrl').textContent = `${sanitizedName}-editor.pages.dev`;
    document.getElementById('previewBlogUrl').textContent = `${sanitizedName}.pages.dev`;
    document.getElementById('previewApiUrl').textContent = `${sanitizedName}-api.workers.dev`;

    // Update Step 3 repo name
    const blogRepoName = document.getElementById('blogRepoName');
    if (blogRepoName) {
        blogRepoName.textContent = sanitizedName;
    }
}

// Step Navigation
function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }

    saveCurrentStepData();

    if (wizardState.currentStep < wizardState.totalSteps) {
        goToStep(wizardState.currentStep + 1);
    }
}

function previousStep() {
    if (wizardState.currentStep > 1) {
        goToStep(wizardState.currentStep - 1);
    }
}

function goToStep(stepNumber) {
    // Hide current step
    document.getElementById(`step-${wizardState.currentStep}`).classList.remove('active');

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum < stepNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });

    // Show new step
    wizardState.currentStep = stepNumber;
    document.getElementById(`step-${stepNumber}`).classList.add('active');

    // Update review page if going to step 5
    if (stepNumber === 5) {
        updateReviewPage();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validation
function validateCurrentStep() {
    switch (wizardState.currentStep) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        case 4:
            return validateStep4();
        default:
            return true;
    }
}

function validateStep1() {
    const blogName = document.getElementById('blogName').value;

    if (!blogName) {
        alert('Please enter a blog name');
        return false;
    }

    if (!/^[a-z0-9-]+$/.test(blogName)) {
        alert('Blog name must contain only lowercase letters, numbers, and hyphens');
        return false;
    }

    return true;
}

function validateStep2() {
    // Check if Cloudflare is authenticated
    if (!wizardState.config.cloudflareToken) {
        alert('Please authenticate with Cloudflare first');
        return false;
    }
    return true;
}

function validateStep3() {
    // Check if GitHub is authenticated
    if (!wizardState.config.githubToken) {
        alert('Please authenticate with GitHub first');
        return false;
    }
    return true;
}

function validateStep4() {
    // Validate email if enabled
    if (wizardState.config.enableEmail) {
        const apiKey = document.getElementById('resendApiKey').value;
        const fromEmail = document.getElementById('fromEmail').value;

        if (!apiKey || !fromEmail) {
            alert('Please provide both Resend API key and from email address');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
            alert('Please provide a valid email address');
            return false;
        }
    }
    return true;
}

// Save current step data
function saveCurrentStepData() {
    switch (wizardState.currentStep) {
        case 1:
            wizardState.config.blogName = document.getElementById('blogName').value;
            break;
        case 4:
            wizardState.config.useCustomDomain = document.getElementById('useCustomDomain').checked;
            wizardState.config.customDomain = document.getElementById('customDomain')?.value || '';
            wizardState.config.enableEmail = document.getElementById('enableEmail').checked;
            wizardState.config.resendApiKey = document.getElementById('resendApiKey')?.value || '';
            wizardState.config.fromEmail = document.getElementById('fromEmail')?.value || '';

            const repoVisibility = document.querySelector('input[name="repoVisibility"]:checked');
            wizardState.config.repoVisibility = repoVisibility?.value || 'public';
            break;
    }
}

// OAuth Authentication Flows
function authenticateCloudflare() {
    // In a real implementation, this would:
    // 1. Redirect to Cloudflare OAuth page
    // 2. Handle callback with access token
    // 3. Fetch account ID

    // For now, we'll simulate the OAuth flow
    // NOTE: Cloudflare doesn't currently have OAuth for API access
    // Real implementation would use API tokens created via dashboard

    showCloudflareAuthModal();
}

function showCloudflareAuthModal() {
    // Show modal asking user to create API token
    const modal = `
        <div id="authModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 40px; border-radius: 16px; max-width: 600px; width: 90%;">
                <h3 style="color: #1C3A52; margin-bottom: 20px;">Cloudflare API Token</h3>
                <p style="margin-bottom: 20px;">We need an API token to deploy your infrastructure.</p>
                <ol style="margin-bottom: 20px; padding-left: 20px;">
                    <li>Click the button below to open Cloudflare dashboard</li>
                    <li>Create a token with "Edit Cloudflare Workers" permissions</li>
                    <li>Copy the token and paste it below</li>
                </ol>
                <button onclick="window.open('https://dash.cloudflare.com/profile/api-tokens', '_blank')" style="display: block; width: 100%; padding: 12px; background: #F38020; color: white; border: none; border-radius: 8px; font-weight: 600; margin-bottom: 20px; cursor: pointer;">
                    Open Cloudflare Dashboard
                </button>
                <input type="text" id="cloudflareTokenInput" placeholder="Paste your API token here" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; gap: 10px;">
                    <button onclick="closeAuthModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Cancel
                    </button>
                    <button onclick="submitCloudflareToken()" style="flex: 1; padding: 12px; background: #1C3A52; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Verify Token
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

async function submitCloudflareToken() {
    const token = document.getElementById('cloudflareTokenInput').value;

    if (!token) {
        alert('Please paste your API token');
        return;
    }

    // Verify token by calling Cloudflare API
    try {
        const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            // Fetch account ID
            const accountsResponse = await fetch('https://api.cloudflare.com/client/v4/accounts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const accountsData = await accountsResponse.json();

            if (accountsData.success && accountsData.result.length > 0) {
                wizardState.config.cloudflareToken = token;
                wizardState.config.cloudflareAccountId = accountsData.result[0].id;

                // Update UI
                const statusDiv = document.getElementById('cloudflareStatus');
                statusDiv.className = 'auth-status connected';
                statusDiv.innerHTML = `
                    <div class="status-icon">✓</div>
                    <p><strong>Connected to Cloudflare</strong><br>Account: ${accountsData.result[0].name}</p>
                `;

                document.getElementById('cloudflareNextBtn').disabled = false;
                closeAuthModal();
            }
        } else {
            alert('Invalid API token. Please check and try again.');
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        alert('Error verifying token. Please try again.');
    }
}

function authenticateGitHub() {
    showGitHubAuthModal();
}

function showGitHubAuthModal() {
    const modal = `
        <div id="authModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; padding: 40px; border-radius: 16px; max-width: 600px; width: 90%;">
                <h3 style="color: #1C3A52; margin-bottom: 20px;">GitHub Personal Access Token</h3>
                <p style="margin-bottom: 20px;">We need a Personal Access Token to create repositories.</p>
                <ol style="margin-bottom: 20px; padding-left: 20px;">
                    <li>Click the button below to open GitHub token page</li>
                    <li>Select "repo" scope (full control)</li>
                    <li>Generate the token and copy it</li>
                    <li>Paste it below</li>
                </ol>
                <button onclick="window.open('https://github.com/settings/tokens/new?scopes=repo&description=Omni%20Blogger%20Deploy', '_blank')" style="display: block; width: 100%; padding: 12px; background: #24292e; color: white; border: none; border-radius: 8px; font-weight: 600; margin-bottom: 20px; cursor: pointer;">
                    Open GitHub Settings
                </button>
                <input type="text" id="githubTokenInput" placeholder="Paste your token here" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; gap: 10px;">
                    <button onclick="closeAuthModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Cancel
                    </button>
                    <button onclick="submitGitHubToken()" style="flex: 1; padding: 12px; background: #1C3A52; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Verify Token
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

async function submitGitHubToken() {
    const token = document.getElementById('githubTokenInput').value;

    if (!token) {
        alert('Please paste your token');
        return;
    }

    // Verify token by calling GitHub API
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const userData = await response.json();

            wizardState.config.githubToken = token;
            wizardState.config.githubUsername = userData.login;

            // Update UI
            const statusDiv = document.getElementById('githubStatus');
            statusDiv.className = 'auth-status connected';
            statusDiv.innerHTML = `
                <div class="status-icon">✓</div>
                <p><strong>Connected to GitHub</strong><br>User: @${userData.login}</p>
            `;

            document.getElementById('githubNextBtn').disabled = false;
            closeAuthModal();
        } else {
            alert('Invalid token. Please check and try again.');
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        alert('Error verifying token. Please try again.');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.remove();
    }
}

// Toggle Options
function toggleCustomDomain() {
    const enabled = document.getElementById('useCustomDomain').checked;
    const fields = document.getElementById('customDomainFields');
    fields.style.display = enabled ? 'block' : 'none';
}

function toggleEmail() {
    const enabled = document.getElementById('enableEmail').checked;
    const fields = document.getElementById('emailFields');
    fields.style.display = enabled ? 'block' : 'none';
}

// Update Review Page
function updateReviewPage() {
    const config = wizardState.config;
    const blogName = config.blogName;

    document.getElementById('reviewBlogName').textContent = blogName;
    document.getElementById('reviewEditorUrl').textContent = `${blogName}-editor.pages.dev`;
    document.getElementById('reviewBlogUrl').textContent = `${blogName}.pages.dev`;
    document.getElementById('reviewApiUrl').textContent = `${blogName}-api.workers.dev`;

    if (config.useCustomDomain && config.customDomain) {
        document.getElementById('reviewCustomDomain').textContent = config.customDomain;
    } else {
        document.getElementById('reviewCustomDomain').textContent = 'Not configured';
    }

    if (config.enableEmail) {
        document.getElementById('reviewEmail').textContent = `✓ Enabled (${config.fromEmail})`;
    } else {
        document.getElementById('reviewEmail').textContent = 'Not configured';
    }
}

// Deployment
async function startDeployment() {
    // Hide step 5, show deployment progress
    document.getElementById('step-5').style.display = 'none';
    const deploymentStep = document.getElementById('step-deployment');
    deploymentStep.style.display = 'block';

    try {
        // Step 1: Create GitHub Repositories
        await deploymentTask('repos', 'Creating GitHub Repositories', createGitHubRepos);

        // Step 2: Deploy Cloudflare Worker
        await deploymentTask('worker', 'Deploying Cloudflare Worker', deployWorker);

        // Step 3: Create KV Namespaces
        await deploymentTask('kv', 'Creating KV Namespaces', createKVNamespaces);

        // Step 4: Deploy Editor
        await deploymentTask('editor', 'Deploying Editor', deployEditor);

        // Step 5: Deploy Blog
        await deploymentTask('blog', 'Deploying Blog', deployBlog);

        // Step 6: Configure Secrets
        await deploymentTask('secrets', 'Configuring Secrets', configureSecrets);

        // Show success
        showDeploymentSuccess();

    } catch (error) {
        console.error('Deployment error:', error);
        showDeploymentError(error.message);
    }
}

async function deploymentTask(id, title, taskFunction) {
    const item = document.getElementById(`progress-${id}`);
    const icon = item.querySelector('.progress-icon');
    const status = item.querySelector('.progress-status');

    // Mark as in progress
    item.classList.add('in-progress');
    icon.textContent = '⏳';
    status.textContent = 'In progress...';

    try {
        await taskFunction();

        // Mark as completed
        item.classList.remove('in-progress');
        item.classList.add('completed');
        icon.textContent = '✓';
        status.textContent = 'Completed';
    } catch (error) {
        // Mark as error
        item.classList.remove('in-progress');
        item.classList.add('error');
        icon.textContent = '✗';
        status.textContent = `Error: ${error.message}`;
        throw error;
    }
}

// Deployment Functions (these will call your orchestration API)
async function createGitHubRepos() {
    // TODO: Implement GitHub repo creation via API
    // For now, simulate with delay
    await new Promise(resolve => setTimeout(resolve, 2000));
}

async function deployWorker() {
    // TODO: Implement Worker deployment via Cloudflare API
    await new Promise(resolve => setTimeout(resolve, 3000));
}

async function createKVNamespaces() {
    // TODO: Implement KV namespace creation via Cloudflare API
    await new Promise(resolve => setTimeout(resolve, 2000));
}

async function deployEditor() {
    // TODO: Implement Pages deployment via Cloudflare API
    await new Promise(resolve => setTimeout(resolve, 4000));
}

async function deployBlog() {
    // TODO: Implement Pages deployment via Cloudflare API
    await new Promise(resolve => setTimeout(resolve, 4000));
}

async function configureSecrets() {
    // TODO: Implement secret configuration via Cloudflare API
    await new Promise(resolve => setTimeout(resolve, 2000));
}

function showDeploymentSuccess() {
    const config = wizardState.config;
    const editorUrl = `https://${config.blogName}-editor.pages.dev`;
    const blogUrl = `https://${config.blogName}.pages.dev`;
    const apiUrl = `https://${config.blogName}-api.workers.dev`;

    document.getElementById('resultEditorUrl').href = editorUrl;
    document.getElementById('resultEditorUrl').textContent = editorUrl;
    document.getElementById('resultBlogUrl').href = blogUrl;
    document.getElementById('resultBlogUrl').textContent = blogUrl;

    document.getElementById('deploymentComplete').style.display = 'block';

    // Auto-open passkey setup after 2 seconds
    setTimeout(() => {
        openPasskeySetup(editorUrl, blogUrl, apiUrl, config.blogName);
    }, 2000);
}

function openPasskeySetup(editorUrl, blogUrl, apiUrl, blogName) {
    // Build passkey setup URL with parameters
    const passkeyUrl = new URL('passkey-setup.html', window.location.origin);
    passkeyUrl.searchParams.set('editorUrl', editorUrl);
    passkeyUrl.searchParams.set('blogUrl', blogUrl);
    passkeyUrl.searchParams.set('apiUrl', apiUrl);
    passkeyUrl.searchParams.set('blogName', blogName);

    // Open in new tab
    window.open(passkeyUrl.toString(), '_blank');

    // Also add a manual button
    const openButton = document.querySelector('.btn-primary.btn-large');
    if (openButton) {
        const passkeyButton = document.createElement('button');
        passkeyButton.className = 'btn btn-secondary btn-large';
        passkeyButton.textContent = '🔐 Setup Passkey';
        passkeyButton.style.marginTop = '15px';
        passkeyButton.onclick = () => {
            window.open(passkeyUrl.toString(), '_blank');
        };
        openButton.parentNode.insertBefore(passkeyButton, openButton.nextSibling);
    }
}

function showDeploymentError(message) {
    alert(`Deployment failed: ${message}\n\nPlease try again or contact support.`);
}
