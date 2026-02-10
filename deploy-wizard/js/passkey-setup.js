// Passkey Setup Logic
// This eliminates the need for manual console extraction

// Get configuration from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const config = {
    editorUrl: urlParams.get('editorUrl') || '',
    blogUrl: urlParams.get('blogUrl') || '',
    apiUrl: urlParams.get('apiUrl') || '',
    blogName: urlParams.get('blogName') || 'my-blog'
};

// Update links
document.addEventListener('DOMContentLoaded', () => {
    if (config.editorUrl) {
        document.getElementById('editorLink').href = config.editorUrl;
        document.getElementById('blogLink').href = config.blogUrl;
        document.getElementById('manualEditorUrl').textContent = config.editorUrl;
    }
});

// Check WebAuthn support
function checkWebAuthnSupport() {
    if (!window.PublicKeyCredential) {
        return {
            supported: false,
            error: 'WebAuthn is not supported in this browser. Please use Chrome, Safari, Edge, or Firefox.'
        };
    }

    if (!navigator.credentials) {
        return {
            supported: false,
            error: 'Credentials API not available.'
        };
    }

    return { supported: true };
}

// Start passkey registration
async function startPasskeyRegistration() {
    // Check support
    const support = checkWebAuthnSupport();
    if (!support.supported) {
        showError(support.error);
        return;
    }

    // Show registering step
    showStep('step-registering');

    // Update instruction based on platform
    updateAuthInstruction();

    try {
        // Create passkey
        const credential = await createPasskey();

        // Extract public key and credential ID
        const publicKey = await extractPublicKey(credential);
        const credentialId = arrayBufferToBase64(credential.rawId);

        debug('Credential created', { credentialId, publicKey });

        // Send to API to configure Worker
        await storePasskeyInWorker(publicKey, credentialId);

        // Show success
        showStep('step-success');

    } catch (error) {
        console.error('Passkey registration error:', error);
        showError(error.message || 'Failed to create passkey. Please try again.');
    }
}

// Update authentication instruction based on platform
function updateAuthInstruction() {
    const ua = navigator.userAgent;
    let instruction = 'Follow your device\'s prompt';

    if (/Mac/i.test(ua)) {
        instruction = 'Touch the Touch ID sensor on your keyboard or trackpad';
    } else if (/iPhone|iPad/i.test(ua)) {
        instruction = 'Look at your camera for Face ID or use Touch ID';
    } else if (/Windows/i.test(ua)) {
        instruction = 'Use Windows Hello (fingerprint, face, or PIN)';
    } else if (/Android/i.test(ua)) {
        instruction = 'Use your fingerprint sensor or face unlock';
    }

    document.getElementById('authInstructionText').textContent = instruction;
}

// Create passkey using WebAuthn
async function createPasskey() {
    // Generate challenge (random bytes)
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // User information
    const user = {
        id: new Uint8Array(16),
        name: `${config.blogName}-admin`,
        displayName: `${config.blogName} Administrator`
    };
    crypto.getRandomValues(user.id);

    // Relying party (your domain)
    const rpName = 'Omni Blogger';
    const rpId = window.location.hostname;

    // Create credential options
    const publicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
            name: rpName,
            id: rpId === 'localhost' ? undefined : rpId // Don't set rpId for localhost
        },
        user: user,
        pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
            authenticatorAttachment: "platform", // Built-in authenticator
            userVerification: "required",
            requireResidentKey: false
        },
        timeout: 60000,
        attestation: "none"
    };

    debug('Creating credential with options', publicKeyCredentialCreationOptions);

    // Create the credential
    const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
    });

    return credential;
}

// Extract public key from credential
async function extractPublicKey(credential) {
    // The response contains the attestation object
    const response = credential.response;

    // Decode the attestation object
    const attestationObject = response.attestationObject;

    // Parse CBOR to get public key
    // For simplicity, we'll extract the credential public key from the response
    const publicKeyBytes = new Uint8Array(response.getPublicKey());

    // Convert to base64
    const publicKeyBase64 = arrayBufferToBase64(publicKeyBytes);

    return publicKeyBase64;
}

// Store passkey credentials in Cloudflare Worker
async function storePasskeyInWorker(publicKey, credentialId) {
    const apiUrl = config.apiUrl || 'https://omni-blogger-deploy-api.workers.dev';

    debug('Storing passkey in Worker', { apiUrl, publicKey, credentialId });

    const response = await fetch(`${apiUrl}/api/passkey/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            blogName: config.blogName,
            publicKey: publicKey,
            credentialId: credentialId
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to store passkey: ${error}`);
    }

    const result = await response.json();
    debug('Passkey stored successfully', result);

    return result;
}

// Utility: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Utility: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// Step Navigation
function showStep(stepId) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(stepId).classList.add('active');
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showStep('step-error');
}

function showManualSetup() {
    showStep('step-manual');
}

function backToIntro() {
    showStep('step-intro');
}

// Debug logging
function debug(message, data) {
    console.log(`[Passkey Setup] ${message}`, data);

    // Show debug info if in development
    if (window.location.hostname === 'localhost' || urlParams.get('debug')) {
        const debugInfo = document.getElementById('debugInfo');
        const debugOutput = document.getElementById('debugOutput');

        debugInfo.style.display = 'block';
        debugOutput.textContent += `\n${message}\n${JSON.stringify(data, null, 2)}\n`;
    }
}

// Test passkey authentication (optional, for verification)
async function testPasskeyAuth() {
    try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const publicKeyCredentialRequestOptions = {
            challenge: challenge,
            timeout: 60000,
            userVerification: "required"
        };

        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
        });

        debug('Passkey authentication test successful', assertion);
        return true;

    } catch (error) {
        console.error('Passkey authentication test failed:', error);
        return false;
    }
}

// Export for use in wizard
window.passkeySetup = {
    start: startPasskeyRegistration,
    test: testPasskeyAuth
};
