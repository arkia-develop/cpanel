// Constants for localStorage keys
const AUTH_TOKEN_KEY = 'token';  // Key for storing JWT token
const USER_DATA_KEY = 'user';    // Key for storing user data

// Function to check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);  // Get token from localStorage
    return !!token;  // Convert to boolean (true if token exists)
}

// Function to get authentication headers for API requests
function getAuthHeaders() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);  // Get token from localStorage
    if (!token) {
        throw new Error('No authentication token found');  // Throw error if no token
    }
    return {
        'Authorization': `Bearer ${token}`,  // Add token to Authorization header
        'Content-Type': 'application/json'   // Set content type to JSON
    };
}

// Function to handle login form submission
async function handleLogin(e) {
    e.preventDefault();  // Prevent default form submission
    
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Show loading spinner if it exists
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }

    // Clear any existing error messages
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    // Get form input values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Attempting login with email:', email);  // Log login attempt

    try {
        // Send login request to server
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })  // Send credentials as JSON
        });

        console.log('Response status:', response.status);  // Log response status

        const data = await response.json();  // Parse response JSON
        console.log('Login response:', data);  // Log response data

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');  // Throw error if response not ok
        }

        if (data.success && data.token) {
            console.log('Login successful, storing token');  // Log success
            localStorage.setItem('token', data.token);  // Store token
            localStorage.setItem('user', JSON.stringify(data.user));  // Store user data
            window.location.href = 'dashboard.html';  // Redirect to dashboard
        } else {
            throw new Error(data.message || 'Invalid response from server');  // Throw error if invalid response
        }
    } catch (error) {
        console.error('Login error:', error);  // Log error
        if (errorMessage) {
            errorMessage.textContent = error.message || 'An error occurred during login';  // Show error message
            errorMessage.style.display = 'block';
        } else {
            alert(error.message || 'An error occurred during login');  // Fallback to alert
        }
    } finally {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';  // Hide loading spinner
        }
    }
}

// Function to handle user logout
function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);  // Remove token
    localStorage.removeItem(USER_DATA_KEY);   // Remove user data
    window.location.href = 'index.html';      // Redirect to login page
}

// Function to check authentication status
async function checkAuth() {
    if (!isAuthenticated()) {  // Check if user is authenticated
        window.location.href = 'index.html';  // Redirect to login if not authenticated
        return false;
    }
    return true;
}

// Function to handle authentication state changes
async function handleAuthState() {
    const authState = await checkAuth();  // Check authentication status
    
    // Get elements that should be shown/hidden based on auth state
    const authElements = document.querySelectorAll('[data-auth]');  // Elements for authenticated users
    const noAuthElements = document.querySelectorAll('[data-no-auth]');  // Elements for non-authenticated users
    
    if (authState.isAuthenticated) {
        // User is logged in
        authElements.forEach(el => el.style.display = '');  // Show auth elements
        noAuthElements.forEach(el => el.style.display = 'none');  // Hide non-auth elements
        
        // Update user info in UI
        const userNameElements = document.querySelectorAll('[data-user-name]');  // Elements showing user name
        const userEmailElements = document.querySelectorAll('[data-user-email]');  // Elements showing user email
        const userRoleElements = document.querySelectorAll('[data-user-role]');  // Elements showing user role
        
        const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '{}');  // Get user data
        
        // Update user info in all relevant elements
        userNameElements.forEach(el => el.textContent = userData.name || '');
        userEmailElements.forEach(el => el.textContent = userData.email || '');
        userRoleElements.forEach(el => el.textContent = userData.role || '');
        
        return true;
    } else {
        // User is not logged in
        authElements.forEach(el => el.style.display = 'none');  // Hide auth elements
        noAuthElements.forEach(el => el.style.display = '');  // Show non-auth elements
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
        
        return false;
    }
}

// Initialize auth functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');  // Get login form
    const errorMessage = document.getElementById('error-message');  // Get error message element
    const loadingSpinner = document.getElementById('loadingSpinner');  // Get loading spinner

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);  // Add login handler
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';  // Redirect to dashboard if already logged in
    }

    // Add logout handler if logout button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);  // Add logout handler
    }
});

// Export functions to global scope
window.handleLogout = handleLogout;  // Make logout function globally available
window.getAuthHeaders = getAuthHeaders;  // Make auth headers function globally available
window.isAuthenticated = isAuthenticated;  // Make auth check function globally available
window.checkAuth = checkAuth;  // Make auth check function globally available
window.handleAuthState = handleAuthState;  // Make auth state handler globally available 