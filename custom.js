let testCases = [];

function generateId() {
    return 'tc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.textContent = '☀️';
    }
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        toggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Load saved data from localStorage
function loadSavedData() {
    const savedTestCases = localStorage.getItem('manualTestCases');
    
    if (savedTestCases) {
        testCases = JSON.parse(savedTestCases);
    }
    
    // If no test cases exist, create one empty card
    if (testCases.length === 0) {
        addNewTestCase();
    } else {
        renderAllCards();
    }
    
    initDarkMode();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('manualTestCases', JSON.stringify(testCases));
}

// Create a new test case object
function createTestCase() {
    return {
        id: generateId(),
        title: '',
        scenario: '',
        expectedBehaviour: '',
        actualBehaviour: '',
        status: '' // 'pass', 'fail', or ''
    };
}

// Add a new test case
function addNewTestCase() {
    const newTestCase = createTestCase();
    testCases.push(newTestCase);
    renderAllCards();
    saveData();
    
    // Focus on the title input of the new card
    setTimeout(() => {
        const newCard = document.querySelector(`[data-id="${newTestCase.id}"] input[data-field="title"]`);
        if (newCard) newCard.focus();
    }, 100);
}

// Delete a test case
function deleteTestCase(id) {
    if (testCases.length === 1) {
        showToast('Cannot delete the last test case!', 'error');
        return;
    }
    
    testCases = testCases.filter(tc => tc.id !== id);
    renderAllCards();
    saveData();
    showToast('Test case deleted', 'success');
}

// Update a test case field
function updateTestCase(id, field, value) {
    const testCase = testCases.find(tc => tc.id === id);
    if (testCase) {
        testCase[field] = value;
        saveData();
    }
}

// Set test case status
function setStatus(id, status) {
    const testCase = testCases.find(tc => tc.id === id);
    if (testCase) {
        // Toggle off if clicking the same status
        testCase.status = testCase.status === status ? '' : status;
        renderAllCards();
        saveData();
    }
}

// Render a single card
function createCardElement(testCase, index) {
    const card = document.createElement('div');
    card.className = `test-card ${testCase.status}`;
    card.dataset.id = testCase.id;
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-number">Test Case #${index + 1}</span>
            <div class="card-actions">
                <button class="status-btn pass-btn ${testCase.status === 'pass' ? 'active' : ''}" data-status="pass">✓ Pass</button>
                <button class="status-btn fail-btn ${testCase.status === 'fail' ? 'active' : ''}" data-status="fail">✗ Fail</button>
                <button class="delete-btn" title="Delete test case">🗑️</button>
            </div>
        </div>
        
        <div class="form-group">
            <label>Title</label>
            <input type="text" data-field="title" placeholder="e.g., Login with invalid credentials" value="${escapeHtml(testCase.title)}">
        </div>
        
        <div class="form-group">
            <label>Scenario / Steps</label>
            <textarea data-field="scenario" placeholder="Describe the test scenario or steps to reproduce...">${escapeHtml(testCase.scenario)}</textarea>
        </div>
        
        <div class="form-group">
            <label>Expected Behaviour</label>
            <textarea data-field="expectedBehaviour" placeholder="What should happen...">${escapeHtml(testCase.expectedBehaviour)}</textarea>
        </div>
        
        <div class="form-group">
            <label>Actual Behaviour</label>
            <textarea data-field="actualBehaviour" placeholder="What actually happened...">${escapeHtml(testCase.actualBehaviour)}</textarea>
        </div>
    `;
    
    // Add event listeners
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTestCase(testCase.id));
    
    const statusBtns = card.querySelectorAll('.status-btn');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => setStatus(testCase.id, btn.dataset.status));
    });
    
    const inputs = card.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            updateTestCase(testCase.id, e.target.dataset.field, e.target.value);
        });
    });
    
    return card;
}

// Render all cards
function renderAllCards() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';
    
    if (testCases.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📝</div>
                <p>No test cases yet. Click "Add Test Case" to create one.</p>
            </div>
        `;
        return;
    }
    
    testCases.forEach((testCase, index) => {
        const card = createCardElement(testCase, index);
        container.appendChild(card);
    });
}

// Copy all test cases
function copyAllTestCases() {
    if (testCases.length === 0) {
        showToast('No test cases to copy!', 'error');
        return;
    }
    
    // Format test cases for copying
    const formattedCases = testCases.map((tc, index) => {
        return `TEST CASE #${index + 1}${tc.status ? ` [${tc.status.toUpperCase()}]` : ''}
─────────────────────────────────
Title: ${tc.title || 'N/A'}

Scenario:
${tc.scenario || 'N/A'}

Expected Behaviour:
${tc.expectedBehaviour || 'N/A'}

Actual Behaviour:
${tc.actualBehaviour || 'N/A'}
`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(formattedCases)
        .then(() => {
            showToast('All test cases copied to clipboard!', 'success');
        })
        .catch(() => {
            showToast('Failed to copy!', 'error');
        });
}

// Clear all test cases
function clearAllTestCases() {
    if (testCases.length === 0) {
        showToast('No test cases to clear!', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to clear all test cases? This cannot be undone.')) {
        testCases = [];
        addNewTestCase();
        showToast('All test cases cleared!', 'success');
    }
}

// Export to JSON
function exportToJson() {
    if (testCases.length === 0) {
        showToast('No test cases to export!', 'error');
        return;
    }
    
    const exportData = {
        exportedAt: new Date().toISOString(),
        totalCases: testCases.length,
        passedCases: testCases.filter(tc => tc.status === 'pass').length,
        failedCases: testCases.filter(tc => tc.status === 'fail').length,
        testCases: testCases
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-test-cases-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Test cases exported to JSON!', 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Event listeners for toolbar buttons
document.getElementById('addCardBtn').addEventListener('click', addNewTestCase);
document.getElementById('copyAllBtn').addEventListener('click', copyAllTestCases);
document.getElementById('exportJsonBtn').addEventListener('click', exportToJson);
document.getElementById('clearAllBtn').addEventListener('click', clearAllTestCases);

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadSavedData);

