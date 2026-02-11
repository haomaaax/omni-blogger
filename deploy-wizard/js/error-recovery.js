/**
 * Error Recovery and Retry Mechanisms
 * Handles deployment failures gracefully with automatic retries
 */

// Retry configuration
const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
    backoffMultiplier: 2, // Exponential backoff
    retryableErrors: [
        'NetworkError',
        'TimeoutError',
        'rate_limit',
        'temporary_failure',
        'ECONNRESET',
        'ETIMEDOUT'
    ]
};

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, context = '', attempt = 1) {
    try {
        return await fn();
    } catch (error) {
        console.error(`Attempt ${attempt} failed for ${context}:`, error);

        // Check if error is retryable
        if (!isRetryableError(error) || attempt >= RETRY_CONFIG.maxRetries) {
            throw error;
        }

        // Calculate delay with exponential backoff
        const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);

        console.log(`Retrying ${context} in ${delay}ms... (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`);

        // Wait before retrying
        await sleep(delay);

        // Retry
        return retryWithBackoff(fn, context, attempt + 1);
    }
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error) {
    const errorMessage = error.message || error.toString();

    return RETRY_CONFIG.retryableErrors.some(retryableError =>
        errorMessage.toLowerCase().includes(retryableError.toLowerCase())
    );
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Error Recovery Manager
 */
class ErrorRecoveryManager {
    constructor() {
        this.failedSteps = new Set();
        this.recoveryAttempts = new Map();
    }

    /**
     * Mark a step as failed
     */
    markFailed(stepId, error) {
        this.failedSteps.add(stepId);
        const attempts = this.recoveryAttempts.get(stepId) || 0;
        this.recoveryAttempts.set(stepId, attempts + 1);

        console.error(`Step ${stepId} failed (attempt ${attempts + 1}):`, error);
    }

    /**
     * Mark a step as recovered
     */
    markRecovered(stepId) {
        this.failedSteps.delete(stepId);
        console.log(`Step ${stepId} recovered successfully`);
    }

    /**
     * Check if a step has failed
     */
    hasFailed(stepId) {
        return this.failedSteps.has(stepId);
    }

    /**
     * Get number of recovery attempts for a step
     */
    getAttempts(stepId) {
        return this.recoveryAttempts.get(stepId) || 0;
    }

    /**
     * Check if we should give up on a step
     */
    shouldGiveUp(stepId) {
        return this.getAttempts(stepId) >= RETRY_CONFIG.maxRetries;
    }

    /**
     * Get all failed steps
     */
    getFailedSteps() {
        return Array.from(this.failedSteps);
    }

    /**
     * Reset recovery state
     */
    reset() {
        this.failedSteps.clear();
        this.recoveryAttempts.clear();
    }
}

/**
 * Enhanced deployment task with retry logic
 */
async function deploymentTaskWithRetry(id, title, taskFunction, errorManager) {
    const item = document.getElementById(`progress-${id}`);
    const icon = item.querySelector('.progress-icon');
    const status = item.querySelector('.progress-status');

    try {
        // Mark as in progress
        item.classList.remove('error');
        item.classList.add('in-progress');
        icon.textContent = '⏳';
        status.textContent = 'In progress...';

        // Execute with retry
        await retryWithBackoff(taskFunction, title);

        // Mark as completed
        item.classList.remove('in-progress');
        item.classList.add('completed');
        icon.textContent = '✓';
        status.textContent = 'Completed';

        errorManager.markRecovered(id);

    } catch (error) {
        // Mark as error
        item.classList.remove('in-progress');
        item.classList.add('error');
        icon.textContent = '✗';

        errorManager.markFailed(id, error);

        // Update status with retry info
        const attempts = errorManager.getAttempts(id);
        if (errorManager.shouldGiveUp(id)) {
            status.textContent = `Failed after ${attempts} attempts`;
            throw error;
        } else {
            status.textContent = `Failed (attempt ${attempts}/${RETRY_CONFIG.maxRetries})`;
            throw error;
        }
    }
}

/**
 * Partial deployment recovery
 * Resumes deployment from last successful step
 */
async function resumeDeployment(wizardState, errorManager) {
    const failedSteps = errorManager.getFailedSteps();

    if (failedSteps.length === 0) {
        console.log('No failed steps to recover');
        return;
    }

    console.log('Resuming deployment from failed steps:', failedSteps);

    // Map step IDs to functions
    const stepFunctions = {
        'repos': createGitHubRepos,
        'worker': deployWorker,
        'kv': createKVNamespaces,
        'editor': deployEditor,
        'blog': deployBlog,
        'secrets': configureSecrets
    };

    // Retry failed steps
    for (const stepId of failedSteps) {
        const stepFunction = stepFunctions[stepId];
        if (stepFunction) {
            try {
                await deploymentTaskWithRetry(
                    stepId,
                    `Retrying ${stepId}`,
                    stepFunction,
                    errorManager
                );
            } catch (error) {
                console.error(`Failed to recover step ${stepId}:`, error);
                // Continue to next step instead of stopping
            }
        }
    }

    // Check if all steps recovered
    if (errorManager.getFailedSteps().length === 0) {
        console.log('All steps recovered successfully!');
        showDeploymentSuccess();
    } else {
        console.error('Some steps still failed:', errorManager.getFailedSteps());
        showPartialRecovery(errorManager);
    }
}

/**
 * Show partial recovery UI
 */
function showPartialRecovery(errorManager) {
    const failedSteps = errorManager.getFailedSteps();

    const recoveryHtml = `
        <div class="recovery-notice">
            <h3>⚠️ Partial Deployment</h3>
            <p>Some steps completed successfully, but ${failedSteps.length} step(s) failed:</p>
            <ul>
                ${failedSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
            <div class="recovery-actions">
                <button class="btn btn-primary" onclick="retryFailedSteps()">
                    Retry Failed Steps
                </button>
                <button class="btn btn-secondary" onclick="continueAnyway()">
                    Continue Anyway
                </button>
                <button class="btn btn-secondary" onclick="showManualInstructions()">
                    Manual Instructions
                </button>
            </div>
        </div>
    `;

    document.getElementById('deploymentComplete').innerHTML = recoveryHtml;
    document.getElementById('deploymentComplete').style.display = 'block';
}

/**
 * Network health check
 */
async function checkNetworkHealth() {
    const endpoints = [
        { name: 'Cloudflare API', url: 'https://api.cloudflare.com' },
        { name: 'GitHub API', url: 'https://api.github.com' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
        try {
            const start = Date.now();
            const response = await fetch(endpoint.url, { method: 'HEAD' });
            const duration = Date.now() - start;

            results.push({
                name: endpoint.name,
                status: response.ok ? 'OK' : 'ERROR',
                responseTime: duration,
                statusCode: response.status
            });
        } catch (error) {
            results.push({
                name: endpoint.name,
                status: 'UNREACHABLE',
                error: error.message
            });
        }
    }

    return results;
}

/**
 * Pre-deployment health check
 */
async function preDeploymentCheck() {
    console.log('Running pre-deployment health check...');

    const health = await checkNetworkHealth();

    const allHealthy = health.every(h => h.status === 'OK');

    if (!allHealthy) {
        console.warn('Some services are unhealthy:', health);
        return {
            healthy: false,
            issues: health.filter(h => h.status !== 'OK')
        };
    }

    console.log('All systems healthy');
    return { healthy: true };
}

/**
 * Error classification
 */
function classifyError(error) {
    const errorMessage = error.message || error.toString();

    if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        return {
            type: 'NETWORK',
            severity: 'HIGH',
            retryable: true,
            suggestion: 'Check your internet connection and try again'
        };
    }

    if (errorMessage.includes('401') || errorMessage.includes('403')) {
        return {
            type: 'AUTHENTICATION',
            severity: 'CRITICAL',
            retryable: false,
            suggestion: 'Check your API tokens and permissions'
        };
    }

    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        return {
            type: 'RATE_LIMIT',
            severity: 'MEDIUM',
            retryable: true,
            suggestion: 'Wait a few minutes before retrying'
        };
    }

    if (errorMessage.includes('timeout')) {
        return {
            type: 'TIMEOUT',
            severity: 'MEDIUM',
            retryable: true,
            suggestion: 'The operation took too long. Try again.'
        };
    }

    return {
        type: 'UNKNOWN',
        severity: 'HIGH',
        retryable: true,
        suggestion: 'An unexpected error occurred. Check the console for details.'
    };
}

/**
 * Show error details with recovery options
 */
function showErrorDetails(error, stepId) {
    const classification = classifyError(error);

    return `
        <div class="error-detail">
            <h4>Error Type: ${classification.type}</h4>
            <p><strong>Severity:</strong> ${classification.severity}</p>
            <p><strong>Retryable:</strong> ${classification.retryable ? 'Yes' : 'No'}</p>
            <p><strong>Suggestion:</strong> ${classification.suggestion}</p>
            <details>
                <summary>Technical Details</summary>
                <pre>${error.stack || error.message || error}</pre>
            </details>
        </div>
    `;
}

// Export for use in wizard
window.errorRecovery = {
    retryWithBackoff,
    ErrorRecoveryManager,
    deploymentTaskWithRetry,
    resumeDeployment,
    preDeploymentCheck,
    checkNetworkHealth,
    classifyError,
    showErrorDetails
};
