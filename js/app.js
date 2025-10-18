// Main application logic

// Global variables for modal state
let currentEditElement = null;
let currentMissionIndex = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCanvasData();
    makeContentEditable();
    updateStats();
    initAuth();
    initGitHub();
    initDragAndDrop();
});

// Make content items editable
function makeContentEditable() {
    const contentItems = document.querySelectorAll('.content-item');
    contentItems.forEach(item => {
        item.classList.add('editable');

        // Add delete button if not already present
        if (!item.querySelector('.delete-btn')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.title = 'Delete item';
            deleteBtn.onclick = function(e) {
                e.stopPropagation();
                if (isAuthenticated) {
                    deleteItem(item);
                } else {
                    promptPassword(() => deleteItem(item));
                }
            };
            item.appendChild(deleteBtn);
        }

        // Convert description to preserve line breaks
        const descElement = item.querySelector('.item-desc');
        if (descElement && descElement.textContent) {
            // Check if already formatted (has list-item or plain-line divs)
            const hasFormatting = descElement.querySelector('.list-item, .plain-line');

            if (!hasFormatting) {
                // Only format if not already formatted
                const text = descElement.innerHTML.replace(/<br\s*\/?>/gi, '\n');
                const lines = text.split('\n').filter(line => line.trim());

                if (lines.length > 1) {
                    descElement.innerHTML = lines.map(line => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                            return `<div class="list-item">${trimmed.substring(1).trim()}</div>`;
                        } else {
                            return `<div class="plain-line">${trimmed}</div>`;
                        }
                    }).join('');
                }
            }
        }

        item.addEventListener('click', function(e) {
            // Don't open modal if clicking delete button
            if (e.target.classList.contains('delete-btn')) return;

            if (isAuthenticated) {
                openEditModal(this);
            } else {
                promptPassword(() => openEditModal(this));
            }
        });
    });

    // Add "Add Item" buttons to each section
    document.querySelectorAll('.canvas-section').forEach(section => {
        const sectionContent = section.querySelector('.section-content');
        if (sectionContent && !sectionContent.querySelector('.add-item-btn')) {
            const addBtn = document.createElement('button');
            addBtn.className = 'add-item-btn';
            addBtn.textContent = '+ Add Item';
            addBtn.onclick = function() {
                if (isAuthenticated) {
                    addItemToSection(section);
                } else {
                    promptPassword(() => addItemToSection(section));
                }
            };
            sectionContent.appendChild(addBtn);
        }
    });
}

// Add item to specific section
function addItemToSection(section) {
    const sectionContent = section.querySelector('.section-content');
    const addBtn = sectionContent.querySelector('.add-item-btn');

    const newItem = createContentItem('New Item', 'Click to edit this item');

    // Insert before the Add button
    sectionContent.insertBefore(newItem, addBtn);

    saveCanvasData();
    updateStats();
    reinitDragAndDrop();
    showNotification('New item added! Click to edit.');
}

// Delete item
function deleteItem(item) {
    if (confirm('Are you sure you want to delete this item?')) {
        item.remove();
        saveCanvasData();
        updateStats();
        showNotification('Item deleted successfully!');
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Open edit modal for content items
function openEditModal(element) {
    currentEditElement = element;
    const contentContainer = element.querySelector('.content-item-content');
    const title = contentContainer.querySelector('.item-title').textContent;
    const descElement = contentContainer.querySelector('.item-desc');

    // Check if description has been converted to list items or plain lines
    const listItems = descElement.querySelectorAll('.list-item');
    const plainLines = descElement.querySelectorAll('.plain-line');
    let description;

    if (listItems.length > 0 || plainLines.length > 0) {
        // Join all children preserving bullets where appropriate
        const allLines = Array.from(descElement.children);
        description = allLines.map(child => {
            if (child.classList.contains('list-item')) {
                return '- ' + child.textContent.trim();
            } else {
                return child.textContent.trim();
            }
        }).join('\n');
    } else {
        description = descElement.textContent;
    }

    document.getElementById('editTitle').value = title;
    document.getElementById('editDescription').value = description;
    document.getElementById('editModal').style.display = 'block';
}

// Close all modals
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('headerModal').style.display = 'none';
    document.getElementById('introModal').style.display = 'none';
    document.getElementById('missionModal').style.display = 'none';
    document.getElementById('canvasTitleModal').style.display = 'none';
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('githubConfigModal').style.display = 'none';
    currentEditElement = null;
    currentMissionIndex = null;
}

// Save edit for content items
function saveEdit() {
    if (currentEditElement) {
        const title = document.getElementById('editTitle').value;
        const description = document.getElementById('editDescription').value;

        const contentContainer = currentEditElement.querySelector('.content-item-content');
        contentContainer.querySelector('.item-title').textContent = title;
        const descElement = contentContainer.querySelector('.item-desc');

        // Split description by line breaks
        const lines = description.split('\n').map(s => s.trim()).filter(s => s);

        if (lines.length > 1) {
            // Convert each line - add bullet only if it starts with -
            descElement.innerHTML = lines.map(line => {
                if (line.startsWith('-') || line.startsWith('•')) {
                    const cleaned = line.replace(/^[-•]\s*/, '');
                    return `<div class="list-item">${cleaned}</div>`;
                } else {
                    return `<div class="plain-line">${line}</div>`;
                }
            }).join('');
        } else {
            descElement.textContent = description;
        }

        saveCanvasData();
        showNotification('Changes saved successfully!');
        closeModal();
    }
}

// Header editing functions
function openHeaderModal() {
    const title = document.getElementById('headerTitle').textContent;
    const subtitle = document.getElementById('headerSubtitle').textContent;

    document.getElementById('headerEditTitle').value = title;
    document.getElementById('headerEditSubtitle').value = subtitle;
    document.getElementById('headerModal').style.display = 'block';
}

function saveHeaderEdit() {
    const title = document.getElementById('headerEditTitle').value;
    const subtitle = document.getElementById('headerEditSubtitle').value;

    document.getElementById('headerTitle').textContent = title;
    document.getElementById('headerSubtitle').textContent = subtitle;

    saveCanvasData();
    showNotification('Header updated successfully!');
    closeModal();
}

// Intro editing functions
function openIntroModal() {
    const title = document.getElementById('introTitle').textContent;
    const description = document.getElementById('introDescription').textContent;
    const footer = document.getElementById('introFooter').textContent;

    document.getElementById('introEditTitle').value = title;
    document.getElementById('introEditDescription').value = description;
    document.getElementById('introEditFooter').value = footer;
    document.getElementById('introModal').style.display = 'block';
}

function saveIntroEdit() {
    const title = document.getElementById('introEditTitle').value;
    const description = document.getElementById('introEditDescription').value;
    const footer = document.getElementById('introEditFooter').value;

    document.getElementById('introTitle').textContent = title;
    document.getElementById('introDescription').textContent = description;
    document.getElementById('introFooter').textContent = footer;

    saveCanvasData();
    showNotification('Introduction updated successfully!');
    closeModal();
}

// Mission card editing functions
function openMissionModal(index, event) {
    event.stopPropagation(); // Prevent intro modal from opening
    currentMissionIndex = index;

    const title = document.getElementById(`missionTitle${index}`).textContent;
    const description = document.getElementById(`missionDesc${index}`).textContent;

    document.getElementById('missionEditTitle').value = title;
    document.getElementById('missionEditDescription').value = description;
    document.getElementById('missionModal').style.display = 'block';
}

function saveMissionEdit() {
    if (currentMissionIndex !== null) {
        const title = document.getElementById('missionEditTitle').value;
        const description = document.getElementById('missionEditDescription').value;

        document.getElementById(`missionTitle${currentMissionIndex}`).textContent = title;
        document.getElementById(`missionDesc${currentMissionIndex}`).textContent = description;

        saveCanvasData();
        showNotification('Mission card updated successfully!');
        closeModal();
    }
}

// Canvas title editing functions
function openCanvasTitleModal() {
    const title = document.getElementById('canvasTitle').textContent;
    const subtitle = document.getElementById('canvasSubtitle').textContent;

    document.getElementById('canvasEditTitle').value = title;
    document.getElementById('canvasEditSubtitle').value = subtitle;
    document.getElementById('canvasTitleModal').style.display = 'block';
}

function saveCanvasTitleEdit() {
    const title = document.getElementById('canvasEditTitle').value;
    const subtitle = document.getElementById('canvasEditSubtitle').value;

    document.getElementById('canvasTitle').textContent = title;
    document.getElementById('canvasSubtitle').textContent = subtitle;

    saveCanvasData();
    showNotification('Canvas title updated successfully!');
    closeModal();
}

// Search content
function searchContent(query) {
    const items = document.querySelectorAll('.content-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query.toLowerCase()) || query === '') {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Export functions (placeholders)
function exportToPDF() {
    showNotification('PDF export feature coming soon!');
}

function exportToImage() {
    showNotification('Image export feature coming soon!');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveCanvasData();
        showNotification('Canvas saved to browser storage!');
    }
    if (e.key === 'Escape') {
        closeModal();
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = ['editModal', 'headerModal', 'introModal', 'missionModal', 'canvasTitleModal', 'passwordModal', 'githubConfigModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            closeModal();
        }
    });
}
