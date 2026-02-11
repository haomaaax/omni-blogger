/**
 * Progress Persistence
 * Saves deployment progress to localStorage for resume capability
 */

const STORAGE_KEY = 'omni-blogger-deployment';
const STORAGE_VERSION = '1.0';

/**
 * Progress Manager
 * Handles saving and loading deployment progress
 */
class ProgressManager {
    constructor() {
        this.load();
    }

    /**
     * Save current progress
     */
    save(wizardState) {
        const progress = {
            version: STORAGE_VERSION,
            timestamp: Date.now(),
            currentStep: wizardState.currentStep,
            config: wizardState.config,
            completedSteps: this.getCompletedSteps(),
            failedSteps: this.getFailedSteps(),
            deploymentStarted: wizardState.deploymentStarted || false
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
            console.log('Progress saved:', progress);
            return true;
        } catch (error) {
            console.error('Failed to save progress:', error);
            return false;
        }
    }

    /**
     * Load saved progress
     */
    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                return null;
            }

            const progress = JSON.parse(saved);

            // Check version compatibility
            if (progress.version !== STORAGE_VERSION) {
                console.warn('Incompatible progress version, clearing...');
                this.clear();
                return null;
            }

            // Check age (expire after 24 hours)
            const age = Date.now() - progress.timestamp;
            if (age > 24 * 60 * 60 * 1000) {
                console.warn('Progress expired, clearing...');
                this.clear();
                return null;
            }

            console.log('Progress loaded:', progress);
            return progress;
        } catch (error) {
            console.error('Failed to load progress:', error);
            return null;
        }
    }

    /**
     * Clear saved progress
     */
    clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Progress cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear progress:', error);
            return false;
        }
    }

    /**
     * Check if there is saved progress
     */
    hasSavedProgress() {
        return this.load() !== null;
    }

    /**
     * Get completed steps from DOM
     */
    getCompletedSteps() {
        const completed = [];
        document.querySelectorAll('.progress-item.completed').forEach(item => {
            const id = item.id.replace('progress-', '');
            completed.push(id);
        });
        return completed;
    }

    /**
     * Get failed steps from DOM
     */
    getFailedSteps() {
        const failed = [];
        document.querySelectorAll('.progress-item.error').forEach(item => {
            const id = item.id.replace('progress-', '');
            failed.push(id);
        });
        return failed;
    }

    /**
     * Restore wizard state from saved progress
     */
    restore(wizardState) {
        const progress = this.load();
        if (!progress) {
            return false;
        }

        // Restore wizard state
        wizardState.currentStep = progress.currentStep;
        wizardState.config = progress.config;
        wizardState.deploymentStarted = progress.deploymentStarted;

        // Restore UI state
        if (progress.deploymentStarted) {
            // Go to deployment step
            document.getElementById('step-5').style.display = 'none';
            document.getElementById('step-deployment').style.display = 'block';

            // Restore completed steps
            progress.completedSteps.forEach(stepId => {
                const item = document.getElementById(`progress-${stepId}`);
                if (item) {
                    item.classList.add('completed');
                    const icon = item.querySelector('.progress-icon');
                    const status = item.querySelector('.progress-status');
                    icon.textContent = '✓';
                    status.textContent = 'Completed';
                }
            });

            // Restore failed steps
            progress.failedSteps.forEach(stepId => {
                const item = document.getElementById(`progress-${stepId}`);
                if (item) {
                    item.classList.add('error');
                    const icon = item.querySelector('.progress-icon');
                    const status = item.querySelector('.progress-status');
                    icon.textContent = '✗';
                    status.textContent = 'Failed';
                }
            });
        } else {
            // Restore wizard step
            goToStep(progress.currentStep);

            // Restore form values
            this.restoreFormValues(progress.config);
        }

        console.log('Wizard state restored from progress');
        return true;
    }

    /**
     * Restore form values
     */
    restoreFormValues(config) {
        if (config.blogName) {
            const blogNameInput = document.getElementById('blogName');
            if (blogNameInput) {
                blogNameInput.value = config.blogName;
                updateURLPreviews();
            }
        }

        if (config.useCustomDomain) {
            const customDomainCheckbox = document.getElementById('useCustomDomain');
            if (customDomainCheckbox) {
                customDomainCheckbox.checked = true;
                toggleCustomDomain();
            }

            if (config.customDomain) {
                const customDomainInput = document.getElementById('customDomain');
                if (customDomainInput) {
                    customDomainInput.value = config.customDomain;
                }
            }
        }

        if (config.enableEmail) {
            const emailCheckbox = document.getElementById('enableEmail');
            if (emailCheckbox) {
                emailCheckbox.checked = true;
                toggleEmail();
            }

            if (config.resendApiKey) {
                const apiKeyInput = document.getElementById('resendApiKey');
                if (apiKeyInput) {
                    apiKeyInput.value = config.resendApiKey;
                }
            }

            if (config.fromEmail) {
                const fromEmailInput = document.getElementById('fromEmail');
                if (fromEmailInput) {
                    fromEmailInput.value = config.fromEmail;
                }
            }
        }

        if (config.repoVisibility) {
            const radioButton = document.querySelector(`input[name="repoVisibility"][value="${config.repoVisibility}"]`);
            if (radioButton) {
                radioButton.checked = true;
            }
        }
    }

    /**
     * Export progress as shareable link
     */
    exportAsLink() {
        const progress = this.load();
        if (!progress) {
            return null;
        }

        const url = new URL(window.location.href);
        url.searchParams.set('resume', btoa(JSON.stringify(progress)));

        return url.toString();
    }

    /**
     * Import progress from link
     */
    importFromLink() {
        const urlParams = new URLSearchParams(window.location.search);
        const resumeData = urlParams.get('resume');

        if (!resumeData) {
            return null;
        }

        try {
            const progress = JSON.parse(atob(resumeData));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
            console.log('Progress imported from link');
            return progress;
        } catch (error) {
            console.error('Failed to import progress from link:', error);
            return null;
        }
    }
}

/**
 * Auto-save hook
 * Automatically saves progress at key points
 */
function setupAutoSave(wizardState, progressManager) {
    // Save when changing steps
    const originalNextStep = window.nextStep;
    window.nextStep = function() {
        originalNextStep();
        progressManager.save(wizardState);
    };

    const originalPreviousStep = window.previousStep;
    window.previousStep = function() {
        originalPreviousStep();
        progressManager.save(wizardState);
    };

    // Save during deployment
    const originalDeploymentTask = window.deploymentTask;
    window.deploymentTask = async function(id, title, taskFunction) {
        await originalDeploymentTask(id, title, taskFunction);
        progressManager.save(wizardState);
    };

    // Save on page unload
    window.addEventListener('beforeunload', () => {
        progressManager.save(wizardState);
    });

    // Save periodically (every 30 seconds)
    setInterval(() => {
        if (wizardState.deploymentStarted) {
            progressManager.save(wizardState);
        }
    }, 30000);
}

/**
 * Show resume prompt
 */
function showResumePrompt(progressManager, wizardState) {
    const progress = progressManager.load();
    if (!progress) {
        return;
    }

    const age = Date.now() - progress.timestamp;
    const ageMinutes = Math.floor(age / 60000);

    const modal = `
        <div id="resumeModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000;">
            <div style="background: white; padding: 40px; border-radius: 16px; max-width: 500px; width: 90%;">
                <h3 style="color: #1C3A52; margin-bottom: 20px;">Resume Deployment?</h3>
                <p style="margin-bottom: 20px;">
                    You have an in-progress deployment from ${ageMinutes} minute(s) ago.
                </p>
                <p style="margin-bottom: 30px; color: #666;">
                    <strong>Step:</strong> ${progress.currentStep} of ${wizardState.totalSteps}<br>
                    <strong>Blog Name:</strong> ${progress.config.blogName || 'Not set'}<br>
                    ${progress.deploymentStarted ? `<strong>Deployment:</strong> In progress<br><strong>Completed:</strong> ${progress.completedSteps.length} steps<br><strong>Failed:</strong> ${progress.failedSteps.length} steps` : ''}
                </p>
                <div style="display: flex; gap: 15px;">
                    <button onclick="resumeFromProgress()" style="flex: 1; padding: 12px; background: #1C3A52; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Resume
                    </button>
                    <button onclick="startFresh()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Start Fresh
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

/**
 * Resume from saved progress
 */
function resumeFromProgress() {
    const modal = document.getElementById('resumeModal');
    if (modal) {
        modal.remove();
    }

    const progressManager = new ProgressManager();
    progressManager.restore(wizardState);

    // If deployment was in progress, offer to continue
    if (wizardState.deploymentStarted) {
        const failedSteps = progressManager.getFailedSteps();
        if (failedSteps.length > 0) {
            console.log('Found failed steps, offering recovery...');
            // Error recovery will handle this
        }
    }
}

/**
 * Start fresh (clear progress)
 */
function startFresh() {
    const modal = document.getElementById('resumeModal');
    if (modal) {
        modal.remove();
    }

    const progressManager = new ProgressManager();
    progressManager.clear();

    console.log('Starting fresh deployment');
}

/**
 * Share progress link
 */
function shareProgressLink(progressManager) {
    const link = progressManager.exportAsLink();
    if (!link) {
        alert('No progress to share');
        return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(link).then(() => {
        alert('Progress link copied to clipboard!\n\nYou can resume from another device or browser by pasting this link.');
    }).catch(err => {
        console.error('Failed to copy link:', err);
        // Fallback: show link in modal
        const modal = `
            <div id="shareLinkModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 2000;">
                <div style="background: white; padding: 40px; border-radius: 16px; max-width: 600px; width: 90%;">
                    <h3 style="color: #1C3A52; margin-bottom: 20px;">Share Progress Link</h3>
                    <p style="margin-bottom: 15px;">Copy this link to resume from another device:</p>
                    <input type="text" value="${link}" readonly style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px; font-family: monospace; font-size: 12px;">
                    <button onclick="document.getElementById('shareLinkModal').remove()" style="padding: 12px 24px; background: #1C3A52; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modal);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const progressManager = new ProgressManager();

    // Check for resume link in URL
    progressManager.importFromLink();

    // Show resume prompt if there's saved progress
    if (progressManager.hasSavedProgress() && !document.getElementById('resumeModal')) {
        setTimeout(() => {
            showResumePrompt(progressManager, wizardState);
        }, 1000);
    }

    // Setup auto-save
    if (typeof wizardState !== 'undefined') {
        setupAutoSave(wizardState, progressManager);
    }
});

// Export for use in wizard
window.progressPersistence = {
    ProgressManager,
    setupAutoSave,
    showResumePrompt,
    shareProgressLink
};
