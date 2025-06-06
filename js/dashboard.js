// Global variable for DataTable instance
let currentDataTable = null;

// Function to initialize dashboard
function initializeDashboard() {
    // Set up sidebar toggle
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });
    }

    // Initialize section navigation
    document.querySelectorAll('#sidebar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            loadContent(section);
            
            // Update active state
            document.querySelectorAll('#sidebar li').forEach(li => li.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });

    // Load default section
    loadContent('dashboard');
}

// Function to load content
function loadContent(section) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) {
        console.error('Main content element not found');
        return;
    }
    
    // Destroy existing DataTable if it exists
    if (currentDataTable) {
        currentDataTable.destroy();
        currentDataTable = null;
    }

    let content = '';
    switch(section) {
        case 'dashboard':
            content = `
                <h2 class="mb-4">Dashboard Overview</h2>
                <div class="row">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Articles</h5>
                                <p class="card-text">Manage your articles</p>
                                <a href="#" onclick="loadContent('articles')" class="btn btn-primary">View Articles</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Services</h5>
                                <p class="card-text">Manage your services</p>
                                <a href="#" onclick="loadContent('services')" class="btn btn-primary">View Services</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Portfolio</h5>
                                <p class="card-text">Manage your portfolio</p>
                                <a href="#" onclick="loadContent('portfolio')" class="btn btn-primary">View Portfolio</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'articles':
            content = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Articles</h2>
                    <button class="btn btn-primary" onclick="addNewArticle()">
                        <i class='bx bx-plus'></i> Add New Article
                    </button>
                </div>
                <div class="table-responsive">
                    <table id="articlesTable" class="table table-striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Author</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            `;
            break;

        case 'services':
            content = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Services</h2>
                    <button class="btn btn-primary" onclick="addNewService()">
                        <i class='bx bx-plus'></i> Add New Service
                    </button>
                </div>
                <div class="table-responsive">
                    <table id="servicesTable" class="table table-striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            `;
            break;

        case 'portfolio':
            content = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Portfolio</h2>
                    <button class="btn btn-primary" onclick="addNewPortfolioItem()">
                        <i class='bx bx-plus'></i> Add New Item
                    </button>
                </div>
                <div class="table-responsive">
                    <table id="portfolioTable" class="table table-striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Client</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            `;
            break;

        default:
            content = '<div class="alert alert-danger">Invalid section selected</div>';
    }

    // Update the content
    mainContent.innerHTML = content;

    // Load section-specific content
    switch(section) {
        case 'articles':
            if (typeof loadArticles === 'function') {
                loadArticles();
            }
            break;
        case 'services':
            if (typeof loadServices === 'function') {
                loadServices();
            }
            break;
        case 'portfolio':
            if (typeof loadPortfolio === 'function') {
                loadPortfolio();
            }
            break;
    }
}

// Export functions to global scope
window.initializeDashboard = initializeDashboard;
window.loadContent = loadContent;
