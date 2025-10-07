// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.requireAuth()) return;
    
    loadDashboardData();
    setupDashboardEventListeners();
});

function setupDashboardEventListeners() {
    // Refresh button functionality can be added here
}

function loadDashboardData() {
    // Load statistics
    const prodTotals = SaneXApp.getProductionTotals();
    const saleTotals = SaneXApp.getSalesTotals();
    
    document.getElementById('totalLength').textContent = prodTotals.total_length.toFixed(2);
    document.getElementById('totalWeight').textContent = prodTotals.total_weight.toFixed(2);
    document.getElementById('totalProdItems').textContent = prodTotals.total_items;
    document.getElementById('totalAmount').textContent = `₹${saleTotals.total_amount.toFixed(2)}`;
    document.getElementById('totalSaleItems').textContent = saleTotals.total_items;
    document.getElementById('totalOrders').textContent = saleTotals.total_orders;
    
    // Load recent productions
    loadRecentProductions();
    
    // Load recent sales
    loadRecentSales();
}

function loadRecentProductions() {
    const productions = SaneXApp.listProductions().slice(0, 5);
    const productionsContainer = document.getElementById('recentProductions');
    
    if (productions.length === 0) {
        productionsContainer.innerHTML = `
            <div class="empty-state">
                <p>No productions found</p>
                <a href="entries.html#production" class="btn btn-sm btn-primary">Add First Production</a>
            </div>
        `;
        return;
    }
    
    const productionsHtml = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>Date</th>
                        <th>Shift</th>
                        <th>Operator</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
                    ${productions.map(prod => `
                        <tr>
                            <td>${prod.number}</td>
                            <td>${SaneXApp.formatDate(prod.date)}</td>
                            <td>${prod.shift}</td>
                            <td>${prod.operator_name}</td>
                            <td>${prod.data ? prod.data.length : 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="table-footer">
            <a href="reports.html#productions" class="btn btn-sm btn-outline">View All Productions</a>
        </div>
    `;
    
    productionsContainer.innerHTML = productionsHtml;
}

function loadRecentSales() {
    const sales = SaneXApp.listSales().slice(0, 5);
    const salesContainer = document.getElementById('recentSales');
    
    if (sales.length === 0) {
        salesContainer.innerHTML = `
            <div class="empty-state">
                <p>No sales found</p>
                <a href="entries.html#sales" class="btn btn-sm btn-primary">Add First Sale</a>
            </div>
        `;
        return;
    }
    
    const salesHtml = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Order No</th>
                        <th>Date</th>
                        <th>Party</th>
                        <th>Items</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${sales.map(sale => {
                        const totalAmount = sale.data ? sale.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) : 0;
                        return `
                            <tr>
                                <td>${sale.order_no}</td>
                                <td>${SaneXApp.formatDate(sale.date)}</td>
                                <td>${sale.party_name}</td>
                                <td>${sale.data ? sale.data.length : 0}</td>
                                <td>₹${totalAmount.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="table-footer">
            <a href="reports.html#sales" class="btn btn-sm btn-outline">View All Sales</a>
        </div>
    `;
    
    salesContainer.innerHTML = salesHtml;
}

// Auto-refresh dashboard every 30 seconds
setInterval(loadDashboardData, 30000);