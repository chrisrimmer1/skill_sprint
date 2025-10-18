// Canvas data management module

let canvasData = {};

// Save canvas data to localStorage
function saveCanvasData() {
    const sections = {};
    document.querySelectorAll('.canvas-section').forEach(section => {
        const sectionId = section.className.split(' ')[1];
        const items = [];
        section.querySelectorAll('.content-item').forEach(item => {
            const descElement = item.querySelector('.item-desc');
            let description = '';

            // Check if description has list items or plain lines
            const listItems = descElement.querySelectorAll('.list-item');
            const plainLines = descElement.querySelectorAll('.plain-line');

            if (listItems.length > 0 || plainLines.length > 0) {
                // Preserve the structure with line breaks and dashes
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

            items.push({
                title: item.querySelector('.item-title').textContent,
                description: description
            });
        });
        sections[sectionId] = items;
    });

    // Add header and intro data
    sections.header = {
        title: document.getElementById('headerTitle').textContent,
        subtitle: document.getElementById('headerSubtitle').textContent
    };

    sections.intro = {
        title: document.getElementById('introTitle').textContent,
        description: document.getElementById('introDescription').textContent,
        footer: document.getElementById('introFooter').textContent
    };

    sections.canvasTitle = {
        title: document.getElementById('canvasTitle').textContent,
        subtitle: document.getElementById('canvasSubtitle').textContent
    };

    // Add mission cards
    sections.missionCards = [];
    for (let i = 0; i < 4; i++) {
        sections.missionCards.push({
            title: document.getElementById(`missionTitle${i}`).textContent,
            description: document.getElementById(`missionDesc${i}`).textContent
        });
    }

    canvasData = sections;
    localStorage.setItem('skillSprintCanvas', JSON.stringify(canvasData));
}

// Load canvas data from localStorage
function loadCanvasData() {
    const saved = localStorage.getItem('skillSprintCanvas');
    if (saved) {
        canvasData = JSON.parse(saved);
        applyCanvasData();
    }
}

// Apply canvas data to the DOM
function applyCanvasData() {
    Object.keys(canvasData).forEach(sectionId => {
        if (sectionId === 'header' && canvasData.header) {
            document.getElementById('headerTitle').textContent = canvasData.header.title;
            document.getElementById('headerSubtitle').textContent = canvasData.header.subtitle;
        } else if (sectionId === 'intro' && canvasData.intro) {
            document.getElementById('introTitle').textContent = canvasData.intro.title;
            document.getElementById('introDescription').textContent = canvasData.intro.description;
            document.getElementById('introFooter').textContent = canvasData.intro.footer;
        } else if (sectionId === 'canvasTitle' && canvasData.canvasTitle) {
            document.getElementById('canvasTitle').textContent = canvasData.canvasTitle.title;
            document.getElementById('canvasSubtitle').textContent = canvasData.canvasTitle.subtitle;
        } else if (sectionId === 'missionCards' && canvasData.missionCards) {
            canvasData.missionCards.forEach((card, index) => {
                document.getElementById(`missionTitle${index}`).textContent = card.title;
                document.getElementById(`missionDesc${index}`).textContent = card.description;
            });
        } else {
            const section = document.querySelector('.' + sectionId);
            if (section) {
                const contentDiv = section.querySelector('.section-content');
                if (contentDiv) {
                    // Remove all existing content items but keep the add button
                    const addBtn = contentDiv.querySelector('.add-item-btn');
                    contentDiv.innerHTML = '';

                    canvasData[sectionId].forEach(item => {
                        const itemDiv = createContentItem(item.title, item.description);
                        contentDiv.appendChild(itemDiv);
                    });

                    // Re-add the add button
                    if (addBtn) {
                        contentDiv.appendChild(addBtn);
                    }
                }
            }
        }
    });
}

// Create a content item element
function createContentItem(title, description) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'content-item editable';
    itemDiv.style.cursor = 'pointer';

    // Create drag handle
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '⋮⋮';

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-item-content';

    // Create title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'item-title';
    titleSpan.textContent = title;

    // Create description
    const descDiv = document.createElement('div');
    descDiv.className = 'item-desc';

    // Format description with line breaks
    const lines = description.split('\n').map(s => s.trim()).filter(s => s);
    if (lines.length > 1) {
        descDiv.innerHTML = lines.map(line => {
            if (line.startsWith('-') || line.startsWith('•')) {
                const cleaned = line.replace(/^[-•]\s*/, '');
                return `<div class="list-item">${cleaned}</div>`;
            } else {
                return `<div class="plain-line">${line}</div>`;
            }
        }).join('');
    } else {
        descDiv.textContent = description;
    }

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete item';
    deleteBtn.onclick = function(e) {
        e.stopPropagation();
        if (isAuthenticated) {
            deleteItem(itemDiv);
        }
        // In view-only mode, delete button is hidden via CSS
    };

    // Assemble the item
    contentContainer.appendChild(titleSpan);
    contentContainer.appendChild(descDiv);
    itemDiv.appendChild(dragHandle);
    itemDiv.appendChild(contentContainer);
    itemDiv.appendChild(deleteBtn);

    // Add click handler for editing
    itemDiv.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) return;
        // Only allow editing if authenticated
        if (isAuthenticated) {
            openEditModal(this);
        }
        // In view-only mode, clicks do nothing
    });

    return itemDiv;
}

// Export canvas to JSON file
function exportCanvas() {
    const dataStr = JSON.stringify(canvasData, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skill-sprint-backup-${timestamp}.json`;
    link.click();
    showNotification('Backup exported successfully!');
}

// Load backup from JSON file
function loadBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    canvasData = backupData;
                    applyCanvasData();
                    saveCanvasData();
                    showNotification('Backup loaded successfully!');
                } catch (error) {
                    showNotification('Invalid backup file', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Clear all canvas data
function clearCanvas() {
    if (confirm('Are you sure you want to clear all content?')) {
        localStorage.removeItem('skillSprintCanvas');
        location.reload();
    }
}

// Reset to default content
function resetToDefault() {
    if (confirm('Are you sure you want to reset to default content?')) {
        localStorage.removeItem('skillSprintCanvas');
        location.reload();
    }
}

// Update statistics
function updateStats() {
    const totalItems = document.querySelectorAll('.content-item').length;
    const sections = document.querySelectorAll('.canvas-section').length;
    document.getElementById('stats').innerHTML = `
        Total Items: ${totalItems}<br>
        Sections: ${sections}<br>
        Last Updated: ${new Date().toLocaleTimeString()}
    `;
}
