// Global variable for DataTable instance
let currentDataTable = null;

// Dashboard handler
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initializeDashboard();

    // Add event listeners for navigation
    const navLinks = document.querySelectorAll('.nav-link[data-content]');
    if (navLinks.length === 0) {
        console.error('Navigation links not found');
        return;
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const content = this.getAttribute('data-content');
            if (content) {
                loadContent(content);
            }
        });
    });

    // Add logout event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Initialize dashboard
function initializeDashboard() {
    // Load default content (dashboard overview)
    loadContent('dashboard');
}

// Load content based on navigation
async function loadContent(content) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        console.error('Main content container not found');
        return;
    }

    try {
        switch (content) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'articles':
                mainContent.innerHTML = `
                    <div class="container-fluid">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h1 class="h3 mb-0 text-gray-800">Articles</h1>
                            <button class="btn btn-primary" onclick="showAddArticleModal()">
                                <i class="fas fa-plus"></i> Add Article
                            </button>
                        </div>
                        <div class="card shadow mb-4">
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table id="articles-table" class="table table-bordered" width="100%" cellspacing="0">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Author</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                await loadArticles();
                break;
            case 'services':
                mainContent.innerHTML = `
                    <div class="container-fluid">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h1 class="h3 mb-0 text-gray-800">Services</h1>
                            <button class="btn btn-primary" onclick="showAddServiceModal()">
                                <i class="fas fa-plus"></i> Add Service
                            </button>
                        </div>
                        <div class="card shadow mb-4">
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table id="services-table" class="table table-bordered" width="100%" cellspacing="0">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Description</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                await loadServices();
                break;
            case 'portfolio':
                mainContent.innerHTML = `
                    <div class="container-fluid">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h1 class="h3 mb-0 text-gray-800">Portfolio</h1>
                            <button class="btn btn-primary" onclick="showAddPortfolioModal()">
                                <i class="fas fa-plus"></i> Add Portfolio Item
                            </button>
                        </div>
                        <div class="card shadow mb-4">
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table id="portfolio-table" class="table table-bordered" width="100%" cellspacing="0">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Description</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                await loadPortfolio();
                break;
            case 'users':
                await loadUsers();
                break;
            default:
                mainContent.innerHTML = '<div class="alert alert-danger">Invalid content requested</div>';
        }
    } catch (error) {
        console.error(`Error loading ${content}:`, error);
        mainContent.innerHTML = `<div class="alert alert-danger">Error loading ${content}</div>`;
    }
}

// Load dashboard overview
async function loadDashboard() {
    try {
        const response = await fetch('api/dashboard.php', {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to load dashboard data');
        }

        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }

        // Update dashboard content
        mainContent.innerHTML = `
            <div class="container-fluid">
                <h1 class="h3 mb-4 text-gray-800">Dashboard Overview</h1>
                
                <!-- Stats Cards -->
                <div class="row">
                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Articles</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">${data.data.counts.articles}</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-newspaper fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-success shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">Services</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">${data.data.counts.services}</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-cogs fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-info shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">Portfolio Items</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">${data.data.counts.portfolio}</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-briefcase fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-6 mb-4">
                        <div class="card border-left-warning shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">Users</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">${data.data.counts.users}</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-users fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Content -->
                <div class="row">
                    <!-- Recent Articles -->
                    <div class="col-xl-6 col-lg-6">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Recent Articles</h6>
                            </div>
                            <div class="card-body">
                                ${data.data.recent.articles.length > 0 ? `
                                    <div class="list-group">
                                        ${data.data.recent.articles.map(article => `
                                            <a href="#" class="list-group-item list-group-item-action">
                                                <div class="d-flex w-100 justify-content-between">
                                                    <h6 class="mb-1">${article.title}</h6>
                                                    <small>${new Date(article.created_at).toLocaleDateString()}</small>
                                                </div>
                                                <p class="mb-1">${article.content.substring(0, 100)}...</p>
                                            </a>
                                        `).join('')}
                                    </div>
                                ` : '<p class="text-muted">No recent articles</p>'}
                            </div>
                        </div>
                    </div>

                    <!-- Recent Services -->
                    <div class="col-xl-6 col-lg-6">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Recent Services</h6>
                            </div>
                            <div class="card-body">
                                ${data.data.recent.services.length > 0 ? `
                                    <div class="list-group">
                                        ${data.data.recent.services.map(service => `
                                            <a href="#" class="list-group-item list-group-item-action">
                                                <div class="d-flex w-100 justify-content-between">
                                                    <h6 class="mb-1">${service.name}</h6>
                                                    <small>${new Date(service.created_at).toLocaleDateString()}</small>
                                                </div>
                                                <p class="mb-1">${service.description.substring(0, 100)}...</p>
                                            </a>
                                        `).join('')}
                                    </div>
                                ` : '<p class="text-muted">No recent services</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        throw error;
    }
}

// Load articles section
async function loadArticles() {
    try {
        const response = await fetch('api/articles.php', {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load articles');
        }

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Articles</h2>
                    <button class="btn btn-primary" onclick="showAddArticleModal()">
                        <i class="fas fa-plus"></i> Add Article
                    </button>
                </div>

                <div class="card">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped" id="articles-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Author</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.articles ? data.articles.map(article => `
                                        <tr>
                                            <td>${article.title}</td>
                                            <td>${article.category}</td>
                                            <td>${article.author}</td>
                                            <td>
                                                <span class="badge bg-${article.status === 'published' ? 'success' : 'warning'}">
                                                    ${article.status}
                                                </span>
                                            </td>
                                            <td>${new Date(article.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button class="btn btn-sm btn-info" onclick="viewArticle(${article.id})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-primary" onclick="editArticle(${article.id})">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteArticle(${article.id})">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('') : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize DataTable
        $('#articles-table').DataTable();
    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('main-content').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Failed to load articles. Please try again later.
            </div>
        `;
    }
}

// Load services section
async function loadServices() {
    try {
        const response = await fetch('api/services.php', {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load services');
        }

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Services</h2>
                    <button class="btn btn-primary" onclick="showAddServiceModal()">
                        <i class="fas fa-plus"></i> Add Service
                    </button>
                </div>

                <div class="card">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped" id="services-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.services ? data.services.map(service => `
                                        <tr>
                                            <td>${service.name}</td>
                                            <td>
                                                <span class="badge bg-${service.status === 'active' ? 'success' : 'warning'}">
                                                    ${service.status}
                                                </span>
                                            </td>
                                            <td>${new Date(service.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button class="btn btn-sm btn-info" onclick="viewService(${service.id})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-primary" onclick="editService(${service.id})">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('') : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize DataTable
        $('#services-table').DataTable();
    } catch (error) {
        console.error('Error loading services:', error);
        document.getElementById('main-content').innerHTML = `
            <div class="alert alert-danger" role="alert">
                Failed to load services. Please try again later.
            </div>
        `;
    }
}

// Load portfolio section
async function loadPortfolio() {
    try {
        const response = await fetch('api/portfolio.php', {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load portfolio');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to load portfolio');
        }

        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }

        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="h3 text-gray-800">Portfolio Management</h1>
                    <button class="btn btn-primary" onclick="showAddPortfolioModal()">
                        <i class="fas fa-plus"></i> Add New Item
                    </button>
                </div>

                <div class="card shadow mb-4">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" id="portfolio-table" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.items.map(item => `
                                        <tr>
                                            <td>${item.title}</td>
                                            <td>${item.description}</td>
                                            <td>${new Date(item.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button class="btn btn-sm btn-info" onclick="viewPortfolioItem(${item.id})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-primary" onclick="editPortfolioItem(${item.id})">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deletePortfolioItem(${item.id})">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize DataTable
        if ($.fn.DataTable.isDataTable('#portfolio-table')) {
            $('#portfolio-table').DataTable().destroy();
        }
        $('#portfolio-table').DataTable();
    } catch (error) {
        console.error('Error loading portfolio:', error);
        throw error;
    }
}

// Load users section
async function loadUsers() {
    try {
        const response = await fetch('api/users.php', {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to load users');
        }

        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }

        mainContent.innerHTML = `
            <div class="container-fluid">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="h3 text-gray-800">User Management</h1>
                    <button class="btn btn-primary" onclick="showAddUserModal()">
                        <i class="fas fa-plus"></i> Add New User
                    </button>
                </div>

                <div class="card shadow mb-4">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" id="users-table" width="100%" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.users.map(user => `
                                        <tr>
                                            <td>${user.name}</td>
                                            <td>${user.email}</td>
                                            <td>${user.role}</td>
                                            <td>${new Date(user.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize DataTable
        if ($.fn.DataTable.isDataTable('#users-table')) {
            $('#users-table').DataTable().destroy();
        }
        $('#users-table').DataTable();
    } catch (error) {
        console.error('Error loading users:', error);
        throw error;
    }
}

// Export functions to global scope
window.initializeDashboard = initializeDashboard;
window.loadContent = loadContent;
window.loadDashboard = loadDashboard;
window.loadPortfolio = loadPortfolio;
window.loadUsers = loadUsers;

// Helper function to get auth headers
function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
