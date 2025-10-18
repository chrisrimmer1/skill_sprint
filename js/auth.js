// Authentication module for Skill Sprint CIC

// Password protection configuration
const CORRECT_PASSWORD_HASH = '1feb5334d184e393d997e5cd92951f013b1d8ceffce37e329419586b86fe400d'; // SHA-256 of "jobshapedobject"
let isAuthenticated = false;
let pendingEditAction = null;

// Hash password using SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if user is authenticated
function checkAuth() {
    return sessionStorage.getItem('skillSprintAuth') === 'true';
}

// Prompt for password
function promptPassword(editAction) {
    pendingEditAction = editAction;
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('passwordInput').focus();
    document.getElementById('passwordError').style.display = 'none';
}

// Validate password
async function validatePassword() {
    const input = document.getElementById('passwordInput').value;
    const inputHash = await hashPassword(input);

    if (inputHash === CORRECT_PASSWORD_HASH) {
        isAuthenticated = true;
        sessionStorage.setItem('skillSprintAuth', 'true');
        closePasswordModal();
        unlockEditMode();

        if (pendingEditAction) {
            pendingEditAction();
            pendingEditAction = null;
        }

        showNotification('Edit mode unlocked! You can now edit the canvas.');
    } else {
        document.getElementById('passwordError').style.display = 'block';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

// Close password modal
function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordError').style.display = 'none';
    pendingEditAction = null;
}

// Handle password input keypress
function handlePasswordKeypress(event) {
    if (event.key === 'Enter') {
        validatePassword();
    }
}

// Lock edit mode
function lockEditMode() {
    isAuthenticated = false;
    sessionStorage.removeItem('skillSprintAuth');

    // Hide all editing features
    document.querySelectorAll('.editable').forEach(el => {
        el.classList.remove('editable');
        el.style.cursor = 'default';
    });

    // Remove click handlers from header, intro, and canvas title
    document.querySelector('.header-editable').onclick = null;
    document.querySelector('.intro-editable').onclick = null;
    document.querySelector('.canvas-title-editable').onclick = null;

    // Remove click handlers from mission cards
    document.querySelectorAll('.mission-card-editable').forEach(card => {
        card.onclick = null;
    });

    // Hide sidebar and toggle
    document.querySelector('.sidebar-toggle').style.display = 'none';
    document.getElementById('sidebar').classList.add('hidden');
    document.getElementById('editModeIndicator').style.display = 'none';
    document.getElementById('viewOnlyIndicator').style.display = 'block';

    showNotification('Edit mode locked. Canvas is now read-only.');
}

// Unlock edit mode
function unlockEditMode() {
    // Show all editing features
    document.querySelectorAll('.content-item').forEach(el => {
        el.classList.add('editable');
        el.style.cursor = 'pointer';
    });

    // Restore click handlers
    document.querySelector('.header-editable').onclick = function() { if(isAuthenticated) openHeaderModal(); else promptPassword(openHeaderModal); };
    document.querySelector('.intro-editable').onclick = function() { if(isAuthenticated) openIntroModal(); else promptPassword(openIntroModal); };
    document.querySelector('.canvas-title-editable').onclick = function() { if(isAuthenticated) openCanvasTitleModal(); else promptPassword(openCanvasTitleModal); };

    // Restore mission card click handlers
    document.querySelectorAll('.mission-card-editable').forEach((card, index) => {
        card.onclick = function(event) { if(isAuthenticated) openMissionModal(index, event); else promptPassword(() => openMissionModal(index, event)); };
    });

    // Show sidebar toggle but keep sidebar closed by default
    document.querySelector('.sidebar-toggle').style.display = 'block';
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('editModeIndicator').style.display = 'block';
    document.getElementById('viewOnlyIndicator').style.display = 'none';
}

// Initialize authentication on page load
function initAuth() {
    isAuthenticated = checkAuth();
    if (isAuthenticated) {
        unlockEditMode();
    } else {
        lockEditMode();
    }
}
