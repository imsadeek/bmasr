// Authentication System
class Auth {
    static isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    static login(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Don't store password in session
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            return true;
        }
        return false;
    }

    static logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    static requireAdmin() {
        if (!this.isLoggedIn() || !this.isAdmin()) {
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    }

    static updateNavigation() {
        const user = this.getCurrentUser();
        if (user) {
            // Update username display
            const usernameDisplays = document.querySelectorAll('#usernameDisplay');
            usernameDisplays.forEach(display => {
                if (display) {
                    display.textContent = `Welcome, ${user.username} (${user.role})`;
                }
            });

            // Hide admin-only features for non-admin users
            if (!this.isAdmin()) {
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(el => {
                    el.style.display = 'none';
                });
            }
        }
    }
}

// Initialize default admin user if not exists
function initializeDefaultUser() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'Admin',
                password: 'Admin', // In a real app, this should be hashed
                role: 'admin',
                created_at: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize default user
    initializeDefaultUser();

    // Handle login form
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (Auth.login(username, password)) {
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showMessage('Invalid username or password', 'error');
            }
        });
    }

    // Update navigation for authenticated pages
    if (Auth.isLoggedIn()) {
        Auth.updateNavigation();
    }
});

// Show message function
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    } else {
        // Fallback alert
        alert(message);
    }
}

// Redirect to login if not authenticated (for protected pages)
function checkAuthentication() {
    if (!Auth.isLoggedIn() && !window.location.href.includes('login.html') && !window.location.href.includes('index.html')) {
        window.location.href = 'login.html';
    }
}

// Check authentication on page load for protected pages
if (!window.location.href.includes('login.html') && !window.location.href.includes('index.html')) {
    document.addEventListener('DOMContentLoaded', checkAuthentication);
}