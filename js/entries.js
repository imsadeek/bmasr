// Entries Management
let productionItemCount = 0;
let saleItemCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.requireAuth()) return;
    
    initializeEntries();
    setupEntriesEventListeners();
});

function initializeEntries() {
    // Set today's date
    const today = SaneXApp.getTodayDate();
    document.getElementById('prodDate').value = today;
    document.getElementById('saleDate').value = today;
    
    // Load next numbers
    document.getElementById('prodNumber').value = SaneXApp.getNextProductionNumber();
    document.getElementById('saleOrderNo').value = SaneXApp.getNextSaleNumber();
    
    // Load dropdown data
    loadOperatorsDropdown();
    loadPartiesDropdown();
    loadItemsDropdown();
    
    // Add first item row
    addProductionItem();
    addSaleItem();
}

function setupEntriesEventListeners() {
    // Production form submission
    const productionForm = document.getElementById('productionForm');
    if (productionForm) {
        productionForm.addEventListener('submit', handleProductionSubmit);
        productionForm.addEventListener('reset', handleProductionReset);
    }
    
    // Sales form submission
    const salesForm = document.getElementById('salesForm');
    if (salesForm) {
        salesForm.addEventListener('submit', handleSaleSubmit);
        salesForm.addEventListener('reset', handleSaleReset);
    }
}

function loadOperatorsDropdown() {
    const operators = SaneXApp.listMaster('operators');
    const dropdown = document.getElementById('prodOperator');
    
    dropdown.innerHTML = '<option value="">Select Operator</option>' +
        operators.map(op => `<option value="${op.id}">${op.name}</option>`).join('');
}

function loadPartiesDropdown() {
    const parties = SaneXApp.listMaster('parties');
    const dropdown = document.getElementById('saleParty');
    
    dropdown.innerHTML = '<option value="">Select Party</option>' +
        parties.map(party => `<option value="${party.id}">${party.name}</option>`).join('');
}

function loadItemsDropdown() {
    const items = SaneXApp.listMaster('items');
    // Items dropdown will be used in item rows
}

function addProductionItem() {
    const itemsContainer = document.getElementById('productionItems');
    const items = SaneXApp.listMaster('items');
    
    productionItemCount++;
    
    const itemHtml = `
        <div class="item-row" id="prodItem-${productionItemCount}">
            <div class="form-group">
                <label>Item</label>
                <select class="form-control item-select" name="item" required>
                    <option value="">Select Item</option>
                    ${items.map(item => `<option value="${item.id}">${item.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Length (meters)</label>
                <input type="number" class="form-control" name="length" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Weight (kg)</label>
                <input type="number" class="form-control" name="weight" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Actions</label>
                <button type="button" class="btn btn-danger btn-sm" onclick="removeProductionItem(${productionItemCount})">Remove</button>
            </div>
        </div>
    `;
    
    itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
}

function removeProductionItem(itemId) {
    const itemElement = document.getElementById(`prodItem-${itemId}`);
    if (itemElement) {
        itemElement.remove();
    }
    
    // Don't allow removing the last item
    const remainingItems = document.querySelectorAll('#productionItems .item-row');
    if (remainingItems.length === 0) {
        addProductionItem();
    }
}

function addSaleItem() {
    const itemsContainer = document.getElementById('salesItems');
    const items = SaneXApp.listMaster('items');
    
    saleItemCount++;
    
    const itemHtml = `
        <div class="item-row" id="saleItem-${saleItemCount}">
            <div class="form-group">
                <label>Item</label>
                <select class="form-control item-select" name="item" required>
                    <option value="">Select Item</option>
                    ${items.map(item => `<option value="${item.id}">${item.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="form-control" name="quantity" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Rate (₹)</label>
                <input type="number" class="form-control" name="rate" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" class="form-control" name="amount" step="0.01" min="0" readonly>
            </div>
            <div class="form-group">
                <label>Actions</label>
                <button type="button" class="btn btn-danger btn-sm" onclick="removeSaleItem(${saleItemCount})">Remove</button>
            </div>
        </div>
    `;
    
    itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
    
    // Add event listeners for auto-calculation
    const quantityInput = document.querySelector(`#saleItem-${saleItemCount} input[name="quantity"]`);
    const rateInput = document.querySelector(`#saleItem-${saleItemCount} input[name="rate"]`);
    const amountInput = document.querySelector(`#saleItem-${saleItemCount} input[name="amount"]`);
    
    function calculateAmount() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        amountInput.value = (quantity * rate).toFixed(2);
    }
    
    quantityInput.addEventListener('input', calculateAmount);
    rateInput.addEventListener('input', calculateAmount);
}

function removeSaleItem(itemId) {
    const itemElement = document.getElementById(`saleItem-${itemId}`);
    if (itemElement) {
        itemElement.remove();
    }
    
    // Don't allow removing the last item
    const remainingItems = document.querySelectorAll('#salesItems .item-row');
    if (remainingItems.length === 0) {
        addSaleItem();
    }
}

function handleProductionSubmit(e) {
    e.preventDefault();
    
    const formData = {
        number: document.getElementById('prodNumber').value,
        date: document.getElementById('prodDate').value,
        shift: document.getElementById('prodShift').value,
        operator_id: parseInt(document.getElementById('prodOperator').value),
        items: []
    };
    
    // Collect items data
    const itemRows = document.querySelectorAll('#productionItems .item-row');
    itemRows.forEach(row => {
        const itemSelect = row.querySelector('.item-select');
        const lengthInput = row.querySelector('input[name="length"]');
        const weightInput = row.querySelector('input[name="weight"]');
        
        if (itemSelect.value && lengthInput.value && weightInput.value) {
            formData.items.push({
                item_id: parseInt(itemSelect.value),
                item_name: itemSelect.options[itemSelect.selectedIndex].text,
                length: parseFloat(lengthInput.value),
                weight: parseFloat(weightInput.value)
            });
        }
    });
    
    if (formData.items.length === 0) {
        showMessage('Please add at least one production item', 'error');
        return;
    }
    
    const result = SaneXApp.saveProduction(formData);
    
    if (result.success) {
        showMessage(result.message, 'success');
        resetProductionForm();
    } else {
        showMessage(result.message, 'error');
    }
}

function handleProductionReset() {
    setTimeout(() => {
        resetProductionForm();
    }, 0);
}

function resetProductionForm() {
    // Reset form
    document.getElementById('productionForm').reset();
    
    // Set today's date
    document.getElementById('prodDate').value = SaneXApp.getTodayDate();
    
    // Get next production number
    document.getElementById('prodNumber').value = SaneXApp.getNextProductionNumber();
    
    // Clear items and add one fresh item
    document.getElementById('productionItems').innerHTML = '';
    productionItemCount = 0;
    addProductionItem();
}

function handleSaleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        order_no: document.getElementById('saleOrderNo').value,
        date: document.getElementById('saleDate').value,
        party_id: parseInt(document.getElementById('saleParty').value),
        items: []
    };
    
    // Collect items data
    const itemRows = document.querySelectorAll('#salesItems .item-row');
    itemRows.forEach(row => {
        const itemSelect = row.querySelector('.item-select');
        const quantityInput = row.querySelector('input[name="quantity"]');
        const rateInput = row.querySelector('input[name="rate"]');
        const amountInput = row.querySelector('input[name="amount"]');
        
        if (itemSelect.value && quantityInput.value && rateInput.value) {
            formData.items.push({
                item_id: parseInt(itemSelect.value),
                item_name: itemSelect.options[itemSelect.selectedIndex].text,
                quantity: parseFloat(quantityInput.value),
                rate: parseFloat(rateInput.value),
                amount: parseFloat(amountInput.value)
            });
        }
    });
    
    if (formData.items.length === 0) {
        showMessage('Please add at least one sale item', 'error');
        return;
    }
    
    const result = SaneXApp.saveSale(formData);
    
    if (result.success) {
        showMessage(result.message, 'success');
        resetSaleForm();
    } else {
        showMessage(result.message, 'error');
    }
}

function handleSaleReset() {
    setTimeout(() => {
        resetSaleForm();
    }, 0);
}

function resetSaleForm() {
    // Reset form
    document.getElementById('salesForm').reset();
    
    // Set today's date
    document.getElementById('saleDate').value = SaneXApp.getTodayDate();
    
    // Get next sale number
    document.getElementById('saleOrderNo').value = SaneXApp.getNextSaleNumber();
    
    // Clear items and add one fresh item
    document.getElementById('salesItems').innerHTML = '';
    saleItemCount = 0;
    addSaleItem();
}

function openEntryTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show the selected tab content and activate the tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Refresh the form if needed
    if (tabName === 'production') {
        loadOperatorsDropdown();
    } else if (tabName === 'sales') {
        loadPartiesDropdown();
    }
}