// Masters Management
let currentEditingId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.requireAuth()) return;
    
    loadMastersData();
    setupMastersEventListeners();
});

function setupMastersEventListeners() {
    // Form submission
    const addForm = document.getElementById('addForm');
    if (addForm) {
        addForm.addEventListener('submit', handleFormSubmit);
    }
}

function loadMastersData() {
    loadOperators();
    loadParties();
    loadMachines();
    loadItems();
}

function loadOperators() {
    const operators = SaneXApp.listMaster('operators');
    const tbody = document.querySelector('#operatorsTable tbody');
    
    if (operators.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No operators found</td></tr>';
        return;
    }
    
    tbody.innerHTML = operators.map(operator => `
        <tr>
            <td>${operator.id}</td>
            <td>${operator.name}</td>
            <td>${operator.mobile || '-'}</td>
            <td>${operator.address || '-'}</td>
            <td>${SaneXApp.formatDate(operator.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteMaster('operators', ${operator.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function loadParties() {
    const parties = SaneXApp.listMaster('parties');
    const tbody = document.querySelector('#partiesTable tbody');
    
    if (parties.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No parties found</td></tr>';
        return;
    }
    
    tbody.innerHTML = parties.map(party => `
        <tr>
            <td>${party.id}</td>
            <td>${party.name}</td>
            <td>${party.mobile || '-'}</td>
            <td>${party.address || '-'}</td>
            <td>${SaneXApp.formatDate(party.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteMaster('parties', ${party.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function loadMachines() {
    const machines = SaneXApp.listMaster('machines');
    const tbody = document.querySelector('#machinesTable tbody');
    
    if (machines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No machines found</td></tr>';
        return;
    }
    
    tbody.innerHTML = machines.map(machine => `
        <tr>
            <td>${machine.id}</td>
            <td>${machine.name}</td>
            <td>${machine.remarks || '-'}</td>
            <td>${SaneXApp.formatDate(machine.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteMaster('machines', ${machine.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function loadItems() {
    const items = SaneXApp.listMaster('items');
    const tbody = document.querySelector('#itemsTable tbody');
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.type || '-'}</td>
            <td>${SaneXApp.formatDate(item.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteMaster('items', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function showAddForm(type) {
    currentEditingId = null;
    const modal = document.getElementById('addModal');
    const modalTitle = document.getElementById('modalTitle');
    const formFields = document.getElementById('formFields');
    
    modalTitle.textContent = `Add ${SaneXApp.capitalize(type)}`;
    
    let fieldsHtml = '';
    
    switch(type) {
        case 'operator':
            fieldsHtml = `
                <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="mobile">Mobile</label>
                    <input type="text" id="mobile" class="form-control">
                </div>
                <div class="form-group">
                    <label for="address">Address</label>
                    <textarea id="address" class="form-control" rows="3"></textarea>
                </div>
            `;
            break;
            
        case 'party':
            fieldsHtml = `
                <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="mobile">Mobile</label>
                    <input type="text" id="mobile" class="form-control">
                </div>
                <div class="form-group">
                    <label for="address">Address</label>
                    <textarea id="address" class="form-control" rows="3"></textarea>
                </div>
            `;
            break;
            
        case 'machine':
            fieldsHtml = `
                <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="remarks">Remarks</label>
                    <textarea id="remarks" class="form-control" rows="3"></textarea>
                </div>
            `;
            break;
            
        case 'item':
            fieldsHtml = `
                <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="type">Type</label>
                    <input type="text" id="type" class="form-control" placeholder="e.g., Raw Material, Finished Goods">
                </div>
            `;
            break;
    }
    
    formFields.innerHTML = fieldsHtml;
    modal.style.display = 'block';
    
    // Store the type in the form for later use
    document.getElementById('addForm').dataset.type = type;
}

function closeModal() {
    const modal = document.getElementById('addModal');
    modal.style.display = 'none';
    document.getElementById('addForm').reset();
    currentEditingId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const type = e.target.dataset.type;
    const formData = new FormData(e.target);
    const data = {};
    
    // Get form values
    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile') ? document.getElementById('mobile').value : null;
    const address = document.getElementById('address') ? document.getElementById('address').value : null;
    const remarks = document.getElementById('remarks') ? document.getElementById('remarks').value : null;
    const itemType = document.getElementById('type') ? document.getElementById('type').value : null;
    
    let payload = { name };
    
    switch(type) {
        case 'operator':
        case 'party':
            payload.mobile = mobile;
            payload.address = address;
            break;
        case 'machine':
            payload.remarks = remarks;
            break;
        case 'item':
            payload.type = itemType;
            break;
    }
    
    const result = SaneXApp.addMaster(type + 's', payload);
    
    if (result.success) {
        showMessage(result.message, 'success');
        closeModal();
        loadMastersData(); // Refresh the table
    } else {
        showMessage(result.message, 'error');
    }
}

function deleteMaster(table, id) {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
        const result = SaneXApp.deleteMaster(table, id);
        
        if (result.success) {
            showMessage(result.message, 'success');
            loadMastersData(); // Refresh the table
        } else {
            showMessage(result.message, 'error');
        }
    }
}

// Tab functionality for masters page
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show the selected tab content and activate the tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}