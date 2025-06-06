// Function to handle logout
function handleLogout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        // Clear any session data
        sessionStorage.clear();
        localStorage.clear();
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
}

// Function to check if user is logged in
function checkAuth() {
    // Check if user is logged in (you can modify this based on your authentication method)
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
    }
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
        
        userNameElements.forEach(el => el.textContent = authState.user.name);
        userEmailElements.forEach(el => el.textContent = authState.user.email);
        userRoleElements.forEach(el => el.textContent = authState.user.role);
        
        return true;
    } else {
        // User is not logged in
        authElements.forEach(el => el.style.display = 'none');
        noAuthElements.forEach(el => el.style.display = '');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('sign-in.html')) {
            window.location.href = 'sign-in.html';
        }
        
        return false;
    }
}

// Export functions to global scope
window.handleLogout = handleLogout;
window.checkAuth = checkAuth;
window.handleAuthState = handleAuthState; 