// Reports Management
document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.requireAuth()) return;
    
    loadReportsData();
    setupReportsEventListeners();
});

function setupReportsEventListeners() {
    // Export functionality can be added here
}

function loadReportsData() {
    loadProductionReports();
    loadSalesReports();
    loadSummaryReports();
}

function loadProductionReports() {
    const productions = SaneXApp.listProductions();
    const tbody = document.querySelector('#productionsTable tbody');
    
    // Update stats
    document.getElementById('totalProductions').textContent = productions.length;
    
    const prodTotals = SaneXApp.getProductionTotals();
    document.getElementById('reportTotalLength').textContent = prodTotals.total_length.toFixed(2);
    document.getElementById('reportTotalWeight').textContent = prodTotals.total_weight.toFixed(2);
    
    if (productions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No production records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = productions.map(prod => {
        const totalLength = prod.data ? prod.data.reduce((sum, item) => sum + parseFloat(item.length || 0), 0) : 0;
        const totalWeight = prod.data ? prod.data.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0) : 0;
        
        return `
            <tr>
                <td>${prod.number}</td>
                <td>${SaneXApp.formatDate(prod.date)}</td>
                <td>${prod.shift}</td>
                <td>${prod.operator_name}</td>
                <td>${prod.data ? prod.data.length : 0}</td>
                <td>${totalLength.toFixed(2)}</td>
                <td>${totalWeight.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewProductionDetails(${prod.id})">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadSalesReports() {
    const sales = SaneXApp.listSales();
    const tbody = document.querySelector('#salesTable tbody');
    
    // Update stats
    document.getElementById('totalOrdersReport').textContent = sales.length;
    
    const saleTotals = SaneXApp.getSalesTotals();
    document.getElementById('reportTotalAmount').textContent = `₹${saleTotals.total_amount.toFixed(2)}`;
    document.getElementById('reportTotalItems').textContent = saleTotals.total_items;
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No sales records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => {
        const totalAmount = sale.data ? sale.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) : 0;
        
        return `
            <tr>
                <td>${sale.order_no}</td>
                <td>${SaneXApp.formatDate(sale.date)}</td>
                <td>${sale.party_name}</td>
                <td>${sale.data ? sale.data.length : 0}</td>
                <td>₹${totalAmount.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewSaleDetails(${sale.id})">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadSummaryReports() {
    const db = SaneXApp.getDatabase();
    
    // Production Summary
    const productions = SaneXApp.listProductions();
    const prodTotals = SaneXApp.getProductionTotals();
    
    document.getElementById('summaryProdEntries').textContent = productions.length;
    document.getElementById('summaryProdItems').textContent = prodTotals.total_items;
    document.getElementById('summaryTotalLength').textContent = `${prodTotals.total_length.toFixed(2)} meters`;
    document.getElementById('summaryTotalWeight').textContent = `${prodTotals.total_weight.toFixed(2)} kg`;
    
    // Sales Summary
    const sales = SaneXApp.listSales();
    const saleTotals = SaneXApp.getSalesTotals();
    const avgOrderValue = sales.length > 0 ? saleTotals.total_amount / sales.length : 0;
    
    document.getElementById('summarySalesOrders').textContent = sales.length;
    document.getElementById('summarySalesItems').textContent = saleTotals.total_items;
    document.getElementById('summaryTotalAmount').textContent = `₹${saleTotals.total_amount.toFixed(2)}`;
    document.getElementById('summaryAvgOrder').textContent = `₹${avgOrderValue.toFixed(2)}`;
    
    // Master Data Summary
    document.getElementById('summaryOperators').textContent = (db.operators || []).length;
    document.getElementById('summaryParties').textContent = (db.parties || []).length;
    document.getElementById('summaryMachines').textContent = (db.machines || []).length;
    document.getElementById('summaryItems').textContent = (db.items || []).length;
}

function viewProductionDetails(productionId) {
    const production = SaneXApp.getProductionById(productionId);
    if (!production) return;
    
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('detailModalTitle');
    const detailContent = document.getElementById('detailContent');
    
    modalTitle.textContent = `Production Details - ${production.number}`;
    
    const operator = SaneXApp.getMasterById('operators', production.operator_id);
    const totalLength = production.data ? production.data.reduce((sum, item) => sum + parseFloat(item.length || 0), 0) : 0;
    const totalWeight = production.data ? production.data.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0) : 0;
    
    let itemsHtml = '';
    if (production.data && production.data.length > 0) {
        itemsHtml = `
            <h4>Production Items</h4>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Length (m)</th>
                            <th>Weight (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${production.data.map(item => `
                            <tr>
                                <td>${item.item_name}</td>
                                <td>${parseFloat(item.length).toFixed(2)}</td>
                                <td>${parseFloat(item.weight).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>Total</th>
                            <th>${totalLength.toFixed(2)}</th>
                            <th>${totalWeight.toFixed(2)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }
    
    detailContent.innerHTML = `
        <div class="detail-info">
            <div class="detail-row">
                <label>Production Number:</label>
                <span>${production.number}</span>
            </div>
            <div class="detail-row">
                <label>Date:</label>
                <span>${SaneXApp.formatDate(production.date)}</span>
            </div>
            <div class="detail-row">
                <label>Shift:</label>
                <span>${production.shift}</span>
            </div>
            <div class="detail-row">
                <label>Operator:</label>
                <span>${operator ? operator.name : 'Unknown'}</span>
            </div>
            <div class="detail-row">
                <label>Total Items:</label>
                <span>${production.data ? production.data.length : 0}</span>
            </div>
            <div class="detail-row">
                <label>Total Length:</label>
                <span>${totalLength.toFixed(2)} meters</span>
            </div>
            <div class="detail-row">
                <label>Total Weight:</label>
                <span>${totalWeight.toFixed(2)} kg</span>
            </div>
            <div class="detail-row">
                <label>Created At:</label>
                <span>${SaneXApp.formatDateTime(production.created_at)}</span>
            </div>
        </div>
        ${itemsHtml}
    `;
    
    modal.style.display = 'block';
}

function viewSaleDetails(saleId) {
    const sale = SaneXApp.getSaleById(saleId);
    if (!sale) return;
    
    const modal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('detailModalTitle');
    const detailContent = document.getElementById('detailContent');
    
    modalTitle.textContent = `Sale Details - ${sale.order_no}`;
    
    const party = SaneXApp.getMasterById('parties', sale.party_id);
    const totalAmount = sale.data ? sale.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) : 0;
    
    let itemsHtml = '';
    if (sale.data && sale.data.length > 0) {
        itemsHtml = `
            <h4>Sale Items</h4>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Rate (₹)</th>
                            <th>Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.data.map(item => `
                            <tr>
                                <td>${item.item_name}</td>
                                <td>${parseFloat(item.quantity).toFixed(2)}</td>
                                <td>₹${parseFloat(item.rate).toFixed(2)}</td>
                                <td>₹${parseFloat(item.amount).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="3">Total Amount</th>
                            <th>₹${totalAmount.toFixed(2)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }
    
    detailContent.innerHTML = `
        <div class="detail-info">
            <div class="detail-row">
                <label>Order Number:</label>
                <span>${sale.order_no}</span>
            </div>
            <div class="detail-row">
                <label>Date:</label>
                <span>${SaneXApp.formatDate(sale.date)}</span>
            </div>
            <div class="detail-row">
                <label>Party:</label>
                <span>${party ? party.name : 'Unknown'}</span>
            </div>
            <div class="detail-row">
                <label>Total Items:</label>
                <span>${sale.data ? sale.data.length : 0}</span>
            </div>
            <div class="detail-row">
                <label>Total Amount:</label>
                <span>₹${totalAmount.toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <label>Created At:</label>
                <span>${SaneXApp.formatDateTime(sale.created_at)}</span>
            </div>
        </div>
        ${itemsHtml}
    `;
    
    modal.style.display = 'block';
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    modal.style.display = 'none';
}

function openReportTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show the selected tab content and activate the tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Refresh data for the active tab
    if (tabName === 'productions') {
        loadProductionReports();
    } else if (tabName === 'sales') {
        loadSalesReports();
    } else if (tabName === 'summary') {
        loadSummaryReports();
    }
}

// Export functions (basic implementation)
function exportProductionReport() {
    showMessage('Export feature would be implemented in a real application', 'info');
}

function exportSalesReport() {
    showMessage('Export feature would be implemented in a real application', 'info');
}

function exportSummaryReport() {
    showMessage('Export feature would be implemented in a real application', 'info');
}