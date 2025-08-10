// Configuration
const API_BASE_URL = 'http://localhost:8000';
const REFRESH_INTERVAL = 30000; // 30 seconds

// Global state
let machines = [];
let filteredMachines = [];
let sortColumn = 'timestamp';
let sortDirection = 'desc';
let isCardView = false;
let refreshInterval;

// DOM elements
const elements = {
    // Stats
    totalMachines: document.getElementById('totalMachines'),
    issueCount: document.getElementById('issueCount'),
    healthyCount: document.getElementById('healthyCount'),
    lastUpdate: document.getElementById('lastUpdate'),
    
    // Filters
    osFilter: document.getElementById('osFilter'),
    issueFilter: document.getElementById('issueFilter'),
    searchFilter: document.getElementById('searchFilter'),
    clearFilters: document.getElementById('clearFilters'),
    
    // Table/Cards
    machineCount: document.getElementById('machineCount'),
    machinesTableBody: document.getElementById('machinesTableBody'),
    tableView: document.getElementById('tableView'),
    cardView: document.getElementById('cardView'),
    toggleView: document.getElementById('toggleView'),
    
    // Controls
    refreshBtn: document.getElementById('refreshBtn'),
    exportJson: document.getElementById('exportJson'),
    exportCsv: document.getElementById('exportCsv'),
    
    // UI states
    loadingIndicator: document.getElementById('loadingIndicator'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    retryBtn: document.getElementById('retryBtn'),
    
    // Modal
    machineModal: document.getElementById('machineModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    closeModal: document.getElementById('closeModal')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadMachines();
    startAutoRefresh();
});

// Event listeners
function setupEventListeners() {
    // Refresh button
    elements.refreshBtn.addEventListener('click', () => {
        loadMachines();
    });
    
    // Export buttons
    elements.exportJson.addEventListener('click', (e) => {
        e.preventDefault();
        exportData('json');
    });
    
    elements.exportCsv.addEventListener('click', (e) => {
        e.preventDefault();
        exportData('csv');
    });
    
    // Filters
    elements.osFilter.addEventListener('change', applyFilters);
    elements.issueFilter.addEventListener('change', applyFilters);
    elements.searchFilter.addEventListener('input', debounce(applyFilters, 300));
    elements.clearFilters.addEventListener('click', clearFilters);
    
    // View toggle
    elements.toggleView.addEventListener('click', toggleView);
    
    // Sort buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.sort-btn')) {
            const sortBtn = e.target.closest('.sort-btn');
            const column = sortBtn.dataset.sort;
            handleSort(column);
        }
    });
    
    // Modal
    elements.closeModal.addEventListener('click', closeModal);
    elements.machineModal.addEventListener('click', (e) => {
        if (e.target === elements.machineModal) {
            closeModal();
        }
    });
    
    // Retry button
    elements.retryBtn.addEventListener('click', loadMachines);
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// API functions
async function fetchMachines(filters = {}) {
    const params = new URLSearchParams();
    if (filters.os) params.append('os', filters.os);
    if (filters.issue) params.append('issue', filters.issue);
    
    const url = `${API_BASE_URL}/machines${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

async function fetchMachineDetails(machineId) {
    const response = await fetch(`${API_BASE_URL}/machine/${machineId}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

// Data loading
async function loadMachines() {
    try {
        showLoading();
        hideError();
        
        const data = await fetchMachines();
        machines = data || [];
        
        updateStats();
        applyFilters();
        hideLoading();
        
    } catch (error) {
        console.error('Error loading machines:', error);
        showError(`Failed to load machine data: ${error.message}`);
        hideLoading();
    }
}

// UI update functions
function updateStats() {
    const total = machines.length;
    const healthy = machines.filter(m => getMachineStatus(m) === 'healthy').length;
    const withIssues = total - healthy;
    const lastUpdate = machines.length > 0 ? 
        Math.max(...machines.map(m => new Date(m.timestamp).getTime())) : null;
    
    elements.totalMachines.textContent = total;
    elements.issueCount.textContent = withIssues;
    elements.healthyCount.textContent = healthy;
    elements.lastUpdate.textContent = lastUpdate ? 
        formatRelativeTime(new Date(lastUpdate)) : '--';
}

function applyFilters() {
    const osFilter = elements.osFilter.value;
    const issueFilter = elements.issueFilter.value;
    const searchFilter = elements.searchFilter.value.toLowerCase();
    
    filteredMachines = machines.filter(machine => {
        // OS filter
        if (osFilter && machine.os !== osFilter) return false;
        
        // Issue filter
        if (issueFilter && !hasIssue(machine, issueFilter)) return false;
        
        // Search filter
        if (searchFilter && !machine.machine_id.toLowerCase().includes(searchFilter)) return false;
        
        return true;
    });
    
    sortMachines();
    renderMachines();
    updateMachineCount();
}

function sortMachines() {
    filteredMachines.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        
        // Handle nested objects
        if (sortColumn === 'status') {
            aVal = getMachineStatus(a);
            bVal = getMachineStatus(b);
        } else if (sortColumn === 'timestamp') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        // Convert to string for comparison if needed
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        let result = 0;
        if (aVal < bVal) result = -1;
        else if (aVal > bVal) result = 1;
        
        return sortDirection === 'desc' ? -result : result;
    });
}

function renderMachines() {
    if (isCardView) {
        renderCardView();
    } else {
        renderTableView();
    }
}

function renderTableView() {
    const tbody = elements.machinesTableBody;
    tbody.innerHTML = '';
    
    if (filteredMachines.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center" style="padding: 40px; color: #718096;">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    No machines found matching your criteria
                </td>
            </tr>
        `;
        return;
    }
    
    filteredMachines.forEach(machine => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="text-truncate" style="max-width: 120px; display: inline-block;" 
                      title="${machine.machine_id}">
                    ${machine.machine_id}
                </span>
            </td>
            <td>
                <span class="os-tag">${getOSIcon(machine.os)} ${machine.os || 'Unknown'}</span>
            </td>
            <td>${getStatusBadge(machine)}</td>
            <td>${getCheckStatus(machine.disk_encryption, 'encrypted')}</td>
            <td>${getCheckStatus(machine.os_update, 'up_to_date')}</td>
            <td>${getCheckStatus(machine.antivirus, 'antivirus_present')}</td>
            <td>${getCheckStatus(machine.sleep_settings, 'compliant')}</td>
            <td>
                <span title="${formatDateTime(machine.timestamp)}">
                    ${formatRelativeTime(new Date(machine.timestamp))}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="showMachineDetails('${machine.machine_id}')">
                    <i class="fas fa-eye"></i> Details
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderCardView() {
    const container = elements.cardView;
    container.innerHTML = '';
    
    if (filteredMachines.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #718096;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; display: block;"></i>
                <h3>No machines found</h3>
                <p>No machines match your current filter criteria</p>
            </div>
        `;
        return;
    }
    
    filteredMachines.forEach(machine => {
        const status = getMachineStatus(machine);
        const card = document.createElement('div');
        card.className = `machine-card ${status}`;
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 title="${machine.machine_id}">${machine.machine_id.substring(0, 20)}${machine.machine_id.length > 20 ? '...' : ''}</h3>
                    <span class="os-tag">${getOSIcon(machine.os)} ${machine.os || 'Unknown'}</span>
                </div>
                ${getStatusBadge(machine)}
            </div>
            <div class="card-checks">
                <div class="check-item">
                    ${getCheckIcon(machine.disk_encryption, 'encrypted')}
                    <span>Disk Encryption</span>
                </div>
                <div class="check-item">
                    ${getCheckIcon(machine.os_update, 'up_to_date')}
                    <span>OS Updates</span>
                </div>
                <div class="check-item">
                    ${getCheckIcon(machine.antivirus, 'antivirus_present')}
                    <span>Antivirus</span>
                </div>
                <div class="check-item">
                    ${getCheckIcon(machine.sleep_settings, 'compliant')}
                    <span>Sleep Settings</span>
                </div>
            </div>
            <div class="card-footer">
                <span>Last seen: ${formatRelativeTime(new Date(machine.timestamp))}</span>
                <button class="btn btn-secondary btn-sm" onclick="showMachineDetails('${machine.machine_id}')">
                    <i class="fas fa-eye"></i> Details
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Helper functions for rendering
function getMachineStatus(machine) {
    const checks = [
        machine.disk_encryption?.encrypted,
        machine.os_update?.up_to_date,
        machine.antivirus?.antivirus_present,
        machine.sleep_settings?.compliant
    ];
    
    const failedChecks = checks.filter(check => check === false).length;
    const unknownChecks = checks.filter(check => check === null || check === undefined).length;
    
    if (failedChecks > 0) return 'critical';
    if (unknownChecks > 0) return 'warning';
    return 'healthy';
}

function getStatusBadge(machine) {
    const status = getMachineStatus(machine);
    const statusConfig = {
        healthy: { icon: 'fas fa-check-circle', text: 'Healthy', class: 'status-healthy' },
        warning: { icon: 'fas fa-exclamation-triangle', text: 'Warning', class: 'status-warning' },
        critical: { icon: 'fas fa-times-circle', text: 'Issues', class: 'status-critical' }
    };
    
    const config = statusConfig[status];
    return `<span class="status-badge ${config.class}"><i class="${config.icon}"></i> ${config.text}</span>`;
}

function getCheckStatus(check, property) {
    if (check === null || check === undefined) {
        return '<span class="status-badge status-unknown"><i class="fas fa-question-circle"></i> Unknown</span>';
    }
    
    const value = check[property];
    if (value === true) {
        return '<span class="status-badge status-healthy"><i class="fas fa-check"></i> Pass</span>';
    } else if (value === false) {
        return '<span class="status-badge status-critical"><i class="fas fa-times"></i> Fail</span>';
    } else {
        return '<span class="status-badge status-unknown"><i class="fas fa-question-circle"></i> Unknown</span>';
    }
}

function getCheckIcon(check, property) {
    if (check === null || check === undefined) {
        return '<i class="fas fa-question-circle check-unknown"></i>';
    }
    
    const value = check[property];
    if (value === true) {
        return '<i class="fas fa-check check-pass"></i>';
    } else if (value === false) {
        return '<i class="fas fa-times check-fail"></i>';
    } else {
        return '<i class="fas fa-question-circle check-unknown"></i>';
    }
}

function getOSIcon(os) {
    const icons = {
        'Windows': '<i class="fab fa-windows"></i>',
        'Linux': '<i class="fab fa-linux"></i>',
        'Darwin': '<i class="fab fa-apple"></i>'
    };
    return icons[os] || '<i class="fas fa-desktop"></i>';
}

function hasIssue(machine, issueType) {
    switch (issueType) {
        case 'unencrypted_disk':
            return machine.disk_encryption?.encrypted === false;
        case 'outdated_os':
            return machine.os_update?.up_to_date === false;
        case 'no_antivirus':
            return machine.antivirus?.antivirus_present === false;
        case 'sleep_noncompliant':
            return machine.sleep_settings?.compliant === false;
        default:
            return false;
    }
}

// Utility functions
function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event handlers
function handleSort(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'desc';
    }
    
    // Update sort indicators
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
        const icon = btn.querySelector('i');
        icon.className = 'fas fa-sort';
    });
    
    const activeBtn = document.querySelector(`[data-sort="${column}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        const icon = activeBtn.querySelector('i');
        icon.className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    
    sortMachines();
    renderMachines();
}

function toggleView() {
    isCardView = !isCardView;
    
    if (isCardView) {
        elements.tableView.style.display = 'none';
        elements.cardView.style.display = 'grid';
        elements.toggleView.innerHTML = '<i class="fas fa-table"></i> Table View';
    } else {
        elements.tableView.style.display = 'block';
        elements.cardView.style.display = 'none';
        elements.toggleView.innerHTML = '<i class="fas fa-th"></i> Card View';
    }
    
    renderMachines();
}

function clearFilters() {
    elements.osFilter.value = '';
    elements.issueFilter.value = '';
    elements.searchFilter.value = '';
    applyFilters();
}

function updateMachineCount() {
    const count = filteredMachines.length;
    elements.machineCount.textContent = `${count} machine${count !== 1 ? 's' : ''}`;
}

// Modal functions
async function showMachineDetails(machineId) {
    try {
        elements.modalTitle.textContent = `Machine Details - ${machineId}`;
        elements.modalBody.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading details...</div>';
        elements.machineModal.style.display = 'block';
        
        const machine = await fetchMachineDetails(machineId);
        renderMachineDetails(machine);
        
    } catch (error) {
        console.error('Error loading machine details:', error);
        elements.modalBody.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Failed to load machine details: ${error.message}
            </div>
        `;
    }
}

function renderMachineDetails(machine) {
    elements.modalBody.innerHTML = `
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> General Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <h4>Machine ID</h4>
                    <p>${machine.machine_id}</p>
                </div>
                <div class="detail-item">
                    <h4>Operating System</h4>
                    <p>${getOSIcon(machine.os)} ${machine.os || 'Unknown'}</p>
                </div>
                <div class="detail-item">
                    <h4>Overall Status</h4>
                    <p>${getStatusBadge(machine)}</p>
                </div>
                <div class="detail-item">
                    <h4>Last Check-in</h4>
                    <p>${formatDateTime(machine.timestamp)}</p>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-shield-alt"></i> Security Checks</h3>
            <div class="detail-grid">
                ${renderDetailCheck('Disk Encryption', machine.disk_encryption, 'encrypted')}
                ${renderDetailCheck('Antivirus', machine.antivirus, 'antivirus_present')}
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-cogs"></i> System Checks</h3>
            <div class="detail-grid">
                ${renderDetailCheck('OS Updates', machine.os_update, 'up_to_date')}
                ${renderDetailCheck('Sleep Settings', machine.sleep_settings, 'compliant')}
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-code"></i> Raw Data</h3>
            <div class="detail-raw">${JSON.stringify(machine, null, 2)}</div>
        </div>
    `;
}

function renderDetailCheck(title, check, property) {
    if (!check) {
        return `
            <div class="detail-item">
                <h4>${title}</h4>
                <p>No data available</p>
            </div>
        `;
    }
    
    const value = check[property];
    let className = '';
    let status = '';
    
    if (value === true) {
        className = 'success';
        status = '✓ Pass';
    } else if (value === false) {
        className = 'error';
        status = '✗ Fail';
    } else {
        className = 'warning';
        status = '? Unknown';
    }
    
    const details = check.details || check.status || 'No additional details';
    
    return `
        <div class="detail-item ${className}">
            <h4>${title}</h4>
            <p><strong>${status}</strong></p>
            <p class="text-small">${details}</p>
        </div>
    `;
}

function closeModal() {
    elements.machineModal.style.display = 'none';
}

// Export functions
function exportData(format) {
    const url = `${API_BASE_URL}/export/${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `machines_data.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Auto-refresh
function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        loadMachines();
    }, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// UI state management
function showLoading() {
    elements.loadingIndicator.style.display = 'block';
}

function hideLoading() {
    elements.loadingIndicator.style.display = 'none';
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.style.display = 'flex';
}

function hideError() {
    elements.errorMessage.style.display = 'none';
}

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
        loadMachines(); // Refresh when page becomes visible
    }
});
