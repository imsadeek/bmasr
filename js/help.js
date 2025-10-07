// Help & User Management
document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.requireAuth()) return;
    
    loadHelpData();
    setupHelpEventListeners();
});

function setupHelpEventListeners() {
    // User management form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUserSubmit);
    }
}

function loadHelpData() {
    loadUsersTable();
}

function loadUsersTable() {
    if (!Auth.isAdmin()) return;
    
    const users = SaneXApp.listUsers();
    const tbody = document.querySelector('#usersTable tbody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const currentUser = Auth.getCurrentUser();
        const canDelete = user.id !== currentUser.id; // Prevent deleting own account
        
        return `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}">
                        ${user.role}
                    </span>
                </td>
                <td>${SaneXApp.formatDate(user.created_at)}</td>
                <td>
                    ${canDelete ? `
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                    ` : `
                        <span class="text-muted">Current User</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

function openHelpTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show the selected tab content and activate the tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Load data for users tab if needed
    if (tabName === 'users' && Auth.isAdmin()) {
        loadUsersTable();
    }
}

function showAddUserForm() {
    if (!Auth.requireAdmin()) return;
    
    const modal = document.getElementById('addUserModal');
    modal.style.display = 'block';
}

function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    modal.style.display = 'none';
    document.getElementById('addUserForm').reset();
}

function handleAddUserSubmit(e) {
    e.preventDefault();
    
    if (!Auth.requireAdmin()) return;
    
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    
    const result = SaneXApp.addUser(username, password, role);
    
    if (result.success) {
        showMessage(result.message, 'success');
        closeAddUserModal();
        loadUsersTable(); // Refresh the table
    } else {
        showMessage(result.message, 'error');
    }
}

function deleteUser(userId) {
    if (!Auth.requireAdmin()) return;
    
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const result = SaneXApp.deleteUser(userId);
        
        if (result.success) {
            showMessage(result.message, 'success');
            loadUsersTable(); // Refresh the table
        } else {
            showMessage(result.message, 'error');
        }
    }
}