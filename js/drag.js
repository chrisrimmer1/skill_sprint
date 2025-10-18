// Drag and drop functionality using SortableJS

let sortableInstances = [];

// Initialize drag and drop for all canvas sections
function initDragAndDrop() {
    // Clear any existing sortable instances
    sortableInstances.forEach(instance => instance.destroy());
    sortableInstances = [];

    // Initialize sortable on each section content
    document.querySelectorAll('.section-content').forEach(sectionContent => {
        const sortable = new Sortable(sectionContent, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            filter: '.add-item-btn',
            preventOnFilter: true,
            disabled: !isAuthenticated, // Disable if not authenticated
            onEnd: function(evt) {
                // Save the new order
                saveCanvasData();
                updateStats();
                showNotification('Item order updated');
            }
        });
        sortableInstances.push(sortable);
    });
}

// Enable drag and drop
function enableDragAndDrop() {
    sortableInstances.forEach(instance => {
        instance.option('disabled', false);
    });
}

// Disable drag and drop
function disableDragAndDrop() {
    sortableInstances.forEach(instance => {
        instance.option('disabled', true);
    });
}

// Re-initialize drag and drop (useful after adding/removing items)
function reinitDragAndDrop() {
    initDragAndDrop();
}
