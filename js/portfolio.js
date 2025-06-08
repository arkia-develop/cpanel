// Function to show add portfolio modal
function showAddPortfolioModal() {
    const modalHtml = `
        <div class="modal fade" id="portfolioModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Portfolio Item</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="portfolioForm">
                            <input type="hidden" id="portfolioId" name="id">
                            <div class="mb-3">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" name="title" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Category</label>
                                <input type="text" class="form-control" name="category" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Client</label>
                                <input type="text" class="form-control" name="client" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-select" name="status" required>
                                    <option value="completed">Completed</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="planned">Planned</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="savePortfolioItem()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('portfolioModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('portfolioModal'));
    modal.show();
}

// Function to load portfolio items
async function loadPortfolio() {
    try {
        const response = await fetch('api/portfolio.php', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Portfolio data:', data); // Debug log

        if (!data.success) {
            throw new Error(data.message || 'Failed to load portfolio items');
        }

        const items = data.items || [];
        
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }

        mainContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Portfolio Management</h2>
                <button class="btn btn-primary" onclick="addNewPortfolioItem()">
                    <i class="fas fa-plus"></i> Add New Item
                </button>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover" id="portfolioTable">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Client</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr>
                                        <td>${item.title || ''}</td>
                                        <td>${item.category || ''}</td>
                                        <td>${item.client || ''}</td>
                                        <td>
                                            <span class="badge bg-${item.status === 'completed' ? 'success' : item.status === 'in-progress' ? 'warning' : 'info'}">
                                                ${item.status || 'in-progress'}
                                            </span>
                                        </td>
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
        `;

        // Initialize DataTable
        if ($.fn.DataTable.isDataTable('#portfolioTable')) {
            $('#portfolioTable').DataTable().destroy();
        }
        $('#portfolioTable').DataTable({
            order: [[0, 'asc']],
            pageLength: 10
        });
    } catch (error) {
        console.error('Error loading portfolio:', error);
        alert('Error loading portfolio items: ' + error.message);
    }
}

// Function to add new portfolio item
function addNewPortfolioItem() {
    // Create modal if it doesn't exist
    if (!document.getElementById('portfolioModal')) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'portfolioModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Portfolio Item</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="portfolioForm">
                            <input type="hidden" id="portfolioId">
                            <div class="mb-3">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" name="title" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Category</label>
                                <input type="text" class="form-control" name="category" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Client</label>
                                <input type="text" class="form-control" name="client" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" rows="4" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-control" name="status" required>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="savePortfolioItem()">Save Item</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Reset form and show modal
    document.getElementById('portfolioForm').reset();
    document.getElementById('portfolioId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('portfolioModal'));
    modal.show();
}

// Function to edit portfolio item
async function editPortfolioItem(id) {
    try {
        const response = await fetch(`api/portfolio.php?id=${id}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Portfolio item data:', data); // Debug log

        if (!data.success) {
            throw new Error(data.message || 'Failed to load portfolio item');
        }

        // Get the item from the response
        const item = data.items.find(item => item.id === parseInt(id));
        if (!item) {
            throw new Error('Portfolio item not found');
        }

        // Create modal if it doesn't exist
        if (!document.getElementById('portfolioModal')) {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'portfolioModal';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Portfolio Item</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="portfolioForm">
                                <input type="hidden" id="portfolioId" name="id">
                                <div class="mb-3">
                                    <label class="form-label">Title</label>
                                    <input type="text" class="form-control" name="title" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Category</label>
                                    <input type="text" class="form-control" name="category" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Client</label>
                                    <input type="text" class="form-control" name="client" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" name="description" rows="4" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Status</label>
                                    <select class="form-control" name="status" required>
                                        <option value="completed">Completed</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="planned">Planned</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="savePortfolioItem()">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Fill form with item data
        const form = document.getElementById('portfolioForm');
        form.querySelector('#portfolioId').value = item.id;
        form.querySelector('[name="title"]').value = item.title || '';
        form.querySelector('[name="category"]').value = item.category || '';
        form.querySelector('[name="client"]').value = item.client || '';
        form.querySelector('[name="description"]').value = item.description || '';
        form.querySelector('[name="status"]').value = item.status || 'in-progress';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('portfolioModal'));
        modal.show();
    } catch (error) {
        console.error('Error editing portfolio item:', error);
        alert('Error editing portfolio item: ' + error.message);
    }
}

// Function to delete portfolio item
async function deletePortfolioItem(id) {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
        return;
    }

    try {
        const response = await fetch(`api/portfolio.php?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to delete portfolio item');
        }

        await loadPortfolio();
        alert('Portfolio item deleted successfully');
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        alert('Error deleting portfolio item: ' + error.message);
    }
}

// Function to save portfolio item
async function savePortfolioItem() {
    try {
        const form = document.getElementById('portfolioForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const portfolioId = document.getElementById('portfolioId').value;

        const method = portfolioId ? 'PUT' : 'POST';
        const url = 'api/portfolio.php';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                id: portfolioId ? parseInt(portfolioId) : undefined,
                title: data.title,
                category: data.category,
                client: data.client,
                description: data.description,
                status: data.status
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to save portfolio item');
        }

        // Close modal and reload portfolio items
        const modal = bootstrap.Modal.getInstance(document.getElementById('portfolioModal'));
        modal.hide();
        loadPortfolio();

        alert(portfolioId ? 'Portfolio item updated successfully' : 'Portfolio item added successfully');
    } catch (error) {
        console.error('Error saving portfolio item:', error);
        alert('Error saving portfolio item: ' + error.message);
    }
}

// View portfolio item
async function viewPortfolioItem(id) {
    try {
        const response = await fetch(`api/portfolio.php?id=${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Portfolio data:', data); // Debug log

        if (!data.success) {
            throw new Error(data.message || 'Failed to load portfolio item');
        }

        // Find the portfolio item in the items array
        const item = data.items.find(item => item.id === parseInt(id));
        if (!item) {
            throw new Error('Portfolio item not found');
        }

        // Update modal content
        const modal = document.getElementById('viewPortfolioModal');
        if (!modal) {
            throw new Error('View portfolio modal not found');
        }

        // Update modal content with portfolio data
        modal.querySelector('.modal-title').textContent = item.title || 'No Title';
        modal.querySelector('#portfolio-description').innerHTML = item.description || 'No Description';
        modal.querySelector('#portfolio-status').textContent = item.status || 'No Status';
        modal.querySelector('#portfolio-created').textContent = item.created_at ? new Date(item.created_at).toLocaleString() : 'Not Available';
        modal.querySelector('#portfolio-updated').textContent = item.updated_at ? new Date(item.updated_at).toLocaleString() : 'Not Available';

        // Show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error viewing portfolio item:', error);
        alert('Error viewing portfolio item: ' + error.message);
    }
}

// Export functions to global scope
window.loadPortfolio = loadPortfolio;
window.addNewPortfolioItem = addNewPortfolioItem;
window.editPortfolioItem = editPortfolioItem;
window.deletePortfolioItem = deletePortfolioItem;
window.savePortfolioItem = savePortfolioItem;
window.viewPortfolioItem = viewPortfolioItem;
window.showAddPortfolioModal = showAddPortfolioModal; 