// Main Application Core
class SaneXApp {
    constructor() {
        this.init();
    }

    init() {
        this.initializeDatabase();
        this.setupEventListeners();
    }

    initializeDatabase() {
        // Initialize database structure if not exists
        if (!localStorage.getItem('database')) {
            const database = {
                operators: [],
                parties: [],
                machines: [],
                items: [],
                productions: [],
                sales: [],
                users: JSON.parse(localStorage.getItem('users') || '[]')
            };
            localStorage.setItem('database', JSON.stringify(database));
        }
    }

    setupEventListeners() {
        // Global event listeners can be added here
    }

    // Database operations
    static getDatabase() {
        return JSON.parse(localStorage.getItem('database') || '{}');
    }

    static saveDatabase(database) {
        localStorage.setItem('database', JSON.stringify(database));
    }

    // Master data operations
    static addMaster(table, data) {
        const db = this.getDatabase();
        if (!db[table]) db[table] = [];
        
        // Check for unique name
        const exists = db[table].some(item => item.name === data.name);
        if (exists) {
            return { success: false, message: `${table.slice(0, -1).title()} name must be unique` };
        }
        
        data.id = db[table].length > 0 ? Math.max(...db[table].map(item => item.id)) + 1 : 1;
        data.created_at = new Date().toISOString();
        db[table].push(data);
        this.saveDatabase(db);
        
        return { success: true, message: `${this.capitalize(table.slice(0, -1))} added successfully` };
    }

    static deleteMaster(table, id) {
        const db = this.getDatabase();
        if (db[table]) {
            db[table] = db[table].filter(item => item.id !== id);
            this.saveDatabase(db);
        }
        return { success: true, message: 'Record deleted successfully' };
    }

    static listMaster(table) {
        const db = this.getDatabase();
        return (db[table] || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    static getMasterById(table, id) {
        const db = this.getDatabase();
        return (db[table] || []).find(item => item.id === id);
    }

    // Production operations
    static getNextProductionNumber() {
        const db = this.getDatabase();
        const productions = db.productions || [];
        if (productions.length === 0) return 'DP001';
        
        const lastNumber = productions[productions.length - 1].number;
        const num = parseInt(lastNumber.substring(2)) + 1;
        return `DP${num.toString().padStart(3, '0')}`;
    }

    static saveProduction(data) {
        const db = this.getDatabase();
        if (!db.productions) db.productions = [];
        
        data.id = db.productions.length > 0 ? Math.max(...db.productions.map(item => item.id)) + 1 : 1;
        data.created_at = new Date().toISOString();
        db.productions.push(data);
        this.saveDatabase(db);
        
        return { success: true, id: data.id, message: 'Production saved successfully' };
    }

    static listProductions() {
        const db = this.getDatabase();
        const productions = db.productions || [];
        
        // Join with operators
        const operators = db.operators || [];
        return productions.map(prod => {
            const operator = operators.find(op => op.id === prod.operator_id);
            return {
                ...prod,
                operator_name: operator ? operator.name : 'Unknown'
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
    }

    static getProductionById(id) {
        const db = this.getDatabase();
        return (db.productions || []).find(prod => prod.id === id);
    }

    // Sales operations
    static getNextSaleNumber() {
        const db = this.getDatabase();
        const sales = db.sales || [];
        if (sales.length === 0) return 'JOB001';
        
        const lastNumber = sales[sales.length - 1].order_no;
        const num = parseInt(lastNumber.substring(3)) + 1;
        return `JOB${num.toString().padStart(3, '0')}`;
    }

    static saveSale(data) {
        const db = this.getDatabase();
        if (!db.sales) db.sales = [];
        
        data.id = db.sales.length > 0 ? Math.max(...db.sales.map(item => item.id)) + 1 : 1;
        data.created_at = new Date().toISOString();
        db.sales.push(data);
        this.saveDatabase(db);
        
        return { success: true, id: data.id, message: 'Sale saved successfully' };
    }

    static listSales() {
        const db = this.getDatabase();
        const sales = db.sales || [];
        
        // Join with parties
        const parties = db.parties || [];
        return sales.map(sale => {
            const party = parties.find(p => p.id === sale.party_id);
            return {
                ...sale,
                party_name: party ? party.name : 'Unknown'
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
    }

    static getSaleById(id) {
        const db = this.getDatabase();
        return (db.sales || []).find(sale => sale.id === id);
    }

    // User management
    static addUser(username, password, role = 'user') {
        const db = this.getDatabase();
        if (!db.users) db.users = [];
        
        // Check if username exists
        const exists = db.users.some(user => user.username === username);
        if (exists) {
            return { success: false, message: 'Username already exists' };
        }
        
        const newUser = {
            id: db.users.length > 0 ? Math.max(...db.users.map(user => user.id)) + 1 : 1,
            username,
            password, // In a real app, this should be hashed
            role,
            created_at: new Date().toISOString()
        };
        
        db.users.push(newUser);
        this.saveDatabase(db);
        
        // Also update the users in localStorage for auth
        localStorage.setItem('users', JSON.stringify(db.users));
        
        return { success: true, message: 'User added successfully' };
    }

    static listUsers() {
        const db = this.getDatabase();
        return (db.users || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    static deleteUser(id) {
        const db = this.getDatabase();
        if (db.users) {
            // Prevent deleting the last admin
            const users = db.users;
            const userToDelete = users.find(u => u.id === id);
            const adminUsers = users.filter(u => u.role === 'admin' && u.id !== id);
            
            if (userToDelete && userToDelete.role === 'admin' && adminUsers.length === 0) {
                return { success: false, message: 'Cannot delete the last admin user' };
            }
            
            db.users = users.filter(user => user.id !== id);
            this.saveDatabase(db);
            
            // Also update the users in localStorage for auth
            localStorage.setItem('users', JSON.stringify(db.users));
            
            // If current user deleted themselves, logout
            const currentUser = Auth.getCurrentUser();
            if (currentUser && currentUser.id === id) {
                Auth.logout();
            }
        }
        return { success: true, message: 'User deleted successfully' };
    }

    // Reports and totals
    static getProductionTotals() {
        const productions = this.listProductions();
        let totalLength = 0;
        let totalWeight = 0;
        let totalItems = 0;
        
        productions.forEach(prod => {
            if (prod.data && Array.isArray(prod.data)) {
                prod.data.forEach(item => {
                    totalLength += parseFloat(item.length || 0);
                    totalWeight += parseFloat(item.weight || 0);
                    totalItems += 1;
                });
            }
        });
        
        return {
            total_length: totalLength,
            total_weight: totalWeight,
            total_items: totalItems
        };
    }

    static getSalesTotals() {
        const sales = this.listSales();
        let totalAmount = 0;
        let totalItems = 0;
        let totalOrders = sales.length;
        
        sales.forEach(sale => {
            if (sale.data && Array.isArray(sale.data)) {
                sale.data.forEach(item => {
                    totalAmount += parseFloat(item.amount || 0);
                    totalItems += 1;
                });
            }
        });
        
        return {
            total_amount: totalAmount,
            total_items: totalItems,
            total_orders: totalOrders
        };
    }

    // Utility methods
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    }

    static formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN');
    }

    static getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new SaneXApp();
});

// Global utility functions
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

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});