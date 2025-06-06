// Function to load portfolio items
function loadPortfolio() {
    const tbody = document.querySelector('#portfolioTable tbody');
    if (!tbody) return;

    // Sample data - replace with API call in production
    const portfolioItems = [
        {
            id: 1,
            title: 'E-commerce Website',
            category: 'Web Development',
            client: 'ABC Company',
            description: 'A full-featured e-commerce platform',
            status: 'completed'
        },
        {
            id: 2,
            title: 'Mobile App Design',
            category: 'UI/UX',
            client: 'XYZ Corp',
            description: 'Mobile app interface design',
            status: 'in-progress'
        },
        {
            id: 3,
            title: 'Brand Identity',
            category: 'Design',
            client: '123 Industries',
            description: 'Complete brand identity package',
            status: 'completed'
        }
    ];

    // Clear existing rows
    tbody.innerHTML = '';

    // Add portfolio items to table
    portfolioItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.category}</td>
            <td>${item.client}</td>
            <td><span class="badge ${item.status === 'completed' ? 'bg-success' : 'bg-warning'}">${item.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editPortfolioItem(${item.id})">
                    <i class='bx bx-edit'></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePortfolioItem(${item.id})">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Initialize DataTable
    if (currentDataTable) {
        currentDataTable.destroy();
    }
    currentDataTable = $('#portfolioTable').DataTable();
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
function editPortfolioItem(id) {
    // Sample data - replace with API call in production
    const portfolioItems = [
        {
            id: 1,
            title: 'E-commerce Website',
            category: 'Web Development',
            client: 'ABC Company',
            description: 'A full-featured e-commerce platform',
            status: 'completed'
        },
        {
            id: 2,
            title: 'Mobile App Design',
            category: 'UI/UX',
            client: 'XYZ Corp',
            description: 'Mobile app interface design',
            status: 'in-progress'
        },
        {
            id: 3,
            title: 'Brand Identity',
            category: 'Design',
            client: '123 Industries',
            description: 'Complete brand identity package',
            status: 'completed'
        }
    ];

    // Find the portfolio item
    const item = portfolioItems.find(p => p.id === id);
    if (!item) {
        console.error('Portfolio item not found:', id);
        return;
    }

    // Create modal if it doesn't exist
    if (!document.getElementById('portfolioModal')) {
        addNewPortfolioItem();
    }

    // Fill form with portfolio item data
    const form = document.getElementById('portfolioForm');
    document.getElementById('portfolioId').value = item.id;
    form.querySelector('[name="title"]').value = item.title;
    form.querySelector('[name="category"]').value = item.category;
    form.querySelector('[name="client"]').value = item.client;
    form.querySelector('[name="description"]').value = item.description;
    form.querySelector('[name="status"]').value = item.status;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('portfolioModal'));
    modal.show();
}

// Function to delete portfolio item
function deletePortfolioItem(id) {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
        // TODO: Implement delete functionality
        console.log('Delete portfolio item:', id);
        loadPortfolio(); // Reload portfolio items after deletion
    }
}

// Function to save portfolio item
function savePortfolioItem() {
    const form = document.getElementById('portfolioForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const portfolioId = document.getElementById('portfolioId').value;
    
    // TODO: Implement save functionality
    console.log('Save portfolio item:', { ...data, id: portfolioId || null });
    
    // Close modal and reload portfolio items
    const modal = bootstrap.Modal.getInstance(document.getElementById('portfolioModal'));
    modal.hide();
    loadPortfolio();
}

// Export functions to global scope
window.loadPortfolio = loadPortfolio;
window.addNewPortfolioItem = addNewPortfolioItem;
window.editPortfolioItem = editPortfolioItem;
window.deletePortfolioItem = deletePortfolioItem;
window.savePortfolioItem = savePortfolioItem; 