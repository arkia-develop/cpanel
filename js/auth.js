// Auth handler
const AUTH_TOKEN_KEY = 'token';
const USER_DATA_KEY = 'user';

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
}

// Get authentication headers
function getAuthHeaders() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    // Show loading spinner if it exists
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }

    // Clear error message if it exists
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Attempting login with email:', email);

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.success && data.token) {
            console.log('Login successful, storing token');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(data.message || 'Invalid response from server');
        }
    } catch (error) {
        console.error('Login error:', error);
        if (errorMessage) {
            errorMessage.textContent = error.message || 'An error occurred during login';
            errorMessage.style.display = 'block';
        } else {
            alert(error.message || 'An error occurred during login');
        }
    } finally {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    window.location.href = 'index.html';
}

// Check authentication status
async function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Function to handle authentication state changes
async function handleAuthState() {
    const authState = await checkAuth();
    
    // Get all elements that should be shown/hidden based on auth state
    const authElements = document.querySelectorAll('[data-auth]');
    const noAuthElements = document.querySelectorAll('[data-no-auth]');
    
    if (authState.isAuthenticated) {
        // User is logged in
        authElements.forEach(el => el.style.display = '');
        noAuthElements.forEach(el => el.style.display = 'none');
        
        // Update user info if elements exist
        const userNameElements = document.querySelectorAll('[data-user-name]');
        const userEmailElements = document.querySelectorAll('[data-user-email]');
        const userRoleElements = document.querySelectorAll('[data-user-role]');
        
        const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');
        
        userNameElements.forEach(el => el.textContent = userData.name || '');
        userEmailElements.forEach(el => el.textContent = userData.email || '');
        userRoleElements.forEach(el => el.textContent = userData.role || '');
        
        return true;
    } else {
        // User is not logged in
        authElements.forEach(el => el.style.display = 'none');
        noAuthElements.forEach(el => el.style.display = '');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
        
        return false;
    }
}

// Initialize auth functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loadingSpinner = document.getElementById('loadingSpinner');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading spinner if it exists
            if (loadingSpinner) {
                loadingSpinner.style.display = 'block';
            }

            // Clear error message if it exists
            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Attempting login with email:', email);

            try {
                const response = await fetch('api/auth.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                console.log('Response status:', response.status);

                const data = await response.json();
                console.log('Login response:', data);

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                if (data.success && data.token) {
                    console.log('Login successful, storing token');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    throw new Error(data.message || 'Invalid response from server');
                }
            } catch (error) {
                console.error('Login error:', error);
                if (errorMessage) {
                    errorMessage.textContent = error.message || 'An error occurred during login';
                    errorMessage.style.display = 'block';
                } else {
                    alert(error.message || 'An error occurred during login');
                }
            } finally {
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
            }
        });
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';
    }

    // Add logout handler if logout button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Export functions to global scope
window.handleLogout = handleLogout;
window.getAuthHeaders = getAuthHeaders;
window.isAuthenticated = isAuthenticated;
window.checkAuth = checkAuth;
window.handleAuthState = handleAuthState; 