// GitHub API integration module

// GitHub API configuration
let githubConfig = {
    token: localStorage.getItem('githubToken') || '',
    username: localStorage.getItem('githubUsername') || '',
    repo: localStorage.getItem('githubRepo') || 'skill_sprint',
    isConfigured: false
};

// Check if GitHub is configured
async function checkGitHubConfig() {
    githubConfig.isConfigured = !!(githubConfig.token && githubConfig.username);
    return githubConfig.isConfigured;
}

// Get current file SHA from GitHub
async function getFileSHA() {
    try {
        const response = await fetch(`https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/index.html`, {
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.sha;
        }
        return null;
    } catch (error) {
        console.error('Error getting file SHA:', error);
        return null;
    }
}

// Update file on GitHub
async function updateGitHubFile(content, commitMessage) {
    try {
        // Get current file SHA first
        const sha = await getFileSHA();
        if (!sha) {
            throw new Error('Could not get file SHA. Check your repository name and permissions.');
        }

        // Encode content to base64
        const encodedContent = btoa(unescape(encodeURIComponent(content)));

        const response = await fetch(`https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/index.html`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: commitMessage,
                content: encodedContent,
                sha: sha
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, commit: data.commit };
        } else {
            const error = await response.json();
            console.error('GitHub API Error:', error);
            throw new Error(error.message || `GitHub API error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating GitHub file:', error);
        return { success: false, error: error.message };
    }
}

// Save and publish to GitHub
async function saveAndPublishToGitHub() {
    const publishBtn = document.getElementById('publishBtn');

    // Check if button is already in publishing state
    if (publishBtn && publishBtn.disabled) {
        console.log('Publish already in progress, resetting...');
        resetPublishButton();
        return;
    }

    if (!await checkGitHubConfig()) {
        showNotification('GitHub not configured. Please configure in settings first.', 'error');
        openGitHubConfig();
        return;
    }

    // Show loading state
    if (publishBtn) {
        publishBtn.textContent = 'Publishing...';
        publishBtn.disabled = true;
    }

    // Add timeout protection
    const timeoutId = setTimeout(() => {
        console.error('Publishing timed out after 30 seconds');
        resetPublishButton();
        showNotification('Publishing timed out. Please check your GitHub configuration.', 'error');
    }, 30000); // 30 second timeout

    try {
        console.log('Starting GitHub publish...');
        console.log('Config:', { username: githubConfig.username, repo: githubConfig.repo, hasToken: !!githubConfig.token });

        // Get current HTML content
        const currentHTML = document.documentElement.outerHTML;

        // Create commit message with timestamp
        const timestamp = new Date().toLocaleString();
        const commitMessage = `Update Skill Sprint Canvas - ${timestamp}`;

        // Update file on GitHub
        const result = await updateGitHubFile(currentHTML, commitMessage);

        clearTimeout(timeoutId);

        if (result.success) {
            showNotification('Successfully published to GitHub! Changes will be live in 1-2 minutes.');
            updateLastPublishedTime();
        } else {
            console.error('Publish failed:', result.error);
            showNotification(`Failed to publish: ${result.error}`, 'error');
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error publishing:', error);
        showNotification(`Error publishing: ${error.message}`, 'error');
    } finally {
        // Reset button state
        resetPublishButton();
    }
}

// Update last published time
function updateLastPublishedTime() {
    const timestamp = new Date().toLocaleString();
    localStorage.setItem('lastPublished', timestamp);
    const indicator = document.getElementById('lastPublished');
    if (indicator) {
        indicator.textContent = `Last published: ${timestamp}`;
    }
}

// Reset publish button state
function resetPublishButton() {
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.textContent = 'Save & Publish to GitHub';
        publishBtn.disabled = false;
    }
}

// Open GitHub configuration modal
function openGitHubConfig() {
    document.getElementById('githubUsername').value = githubConfig.username;
    document.getElementById('githubRepo').value = githubConfig.repo;
    document.getElementById('githubToken').value = githubConfig.token;
    document.getElementById('githubConfigModal').style.display = 'block';
}

// Save GitHub configuration
function saveGitHubConfig() {
    const username = document.getElementById('githubUsername').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const token = document.getElementById('githubToken').value.trim();

    if (!username || !repo || !token) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Save to localStorage
    localStorage.setItem('githubUsername', username);
    localStorage.setItem('githubRepo', repo);
    localStorage.setItem('githubToken', token);

    // Update config
    githubConfig.username = username;
    githubConfig.repo = repo;
    githubConfig.token = token;
    githubConfig.isConfigured = true;

    closeModal();
    showNotification('GitHub configuration saved successfully!');
}

// Initialize GitHub configuration
function initGitHub() {
    // Load GitHub config
    if (githubConfig.token && githubConfig.username) {
        githubConfig.isConfigured = true;
    }

    // Load last published time
    const lastPublished = localStorage.getItem('lastPublished');
    const indicator = document.getElementById('lastPublished');
    if (lastPublished && indicator) {
        indicator.textContent = `Last published: ${lastPublished}`;
    }

    // Reset publish button on page load (in case it was stuck)
    resetPublishButton();

    // Add keyboard shortcut to reset button if stuck
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'r') {
            resetPublishButton();
            showNotification('Publish button reset');
        }
    });
}
