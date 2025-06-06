// Function to load services
function loadServices() {
    const tbody = document.querySelector('#servicesTable tbody');
    if (!tbody) {
        console.error('Services table body not found');
        return;
    }

    // Sample data - replace with API call in production
    const services = [
        {
            id: 1,
            title: 'Web Development',
            category: 'Development',
            price: '$1000',
            duration: '2 weeks',
            status: 'active'
        },
        {
            id: 2,
            title: 'SEO Optimization',
            category: 'Marketing',
            price: '$500',
            duration: '1 month',
            status: 'active'
        },
        {
            id: 3,
            title: 'Content Writing',
            category: 'Content',
            price: '$300',
            duration: '1 week',
            status: 'inactive'
        }
    ];

    // Clear existing rows
    tbody.innerHTML = '';

    // Add services to table
    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${service.title}</td>
            <td>${service.category}</td>
            <td>${service.price}</td>
            <td>${service.duration}</td>
            <td><span class="badge ${service.status === 'active' ? 'bg-success' : 'bg-danger'}">${service.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editService(${service.id})">
                    <i class='bx bx-edit'></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">
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
    currentDataTable = $('#servicesTable').DataTable();
}

// Function to add new service
function addNewService() {
    // Create modal if it doesn't exist
    if (!document.getElementById('serviceModal')) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'serviceModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Service</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="serviceForm">
                            <input type="hidden" id="serviceId">
                            <div class="mb-3">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" name="title" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Category</label>
                                <input type="text" class="form-control" name="category" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Price</label>
                                <input type="text" class="form-control" name="price" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Duration</label>
                                <input type="text" class="form-control" name="duration" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-control" name="status" required>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="saveService()">Save Service</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Reset form and show modal
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    modal.show();
}

// Function to edit service
function editService(id) {
    console.log('Editing service:', id); // Debug log

    // Sample data - replace with API call in production
    const services = [
        {
            id: 1,
            title: 'Web Development',
            category: 'Development',
            price: '$1000',
            duration: '2 weeks',
            status: 'active'
        },
        {
            id: 2,
            title: 'SEO Optimization',
            category: 'Marketing',
            price: '$500',
            duration: '1 month',
            status: 'active'
        },
        {
            id: 3,
            title: 'Content Writing',
            category: 'Content',
            price: '$300',
            duration: '1 week',
            status: 'inactive'
        }
    ];

    // Find the service
    const service = services.find(s => s.id === id);
    if (!service) {
        console.error('Service not found:', id);
        return;
    }

    // Create modal if it doesn't exist
    if (!document.getElementById('serviceModal')) {
        addNewService();
    }

    // Fill form with service data
    const form = document.getElementById('serviceForm');
    if (!form) {
        console.error('Service form not found');
        return;
    }

    document.getElementById('serviceId').value = service.id;
    form.querySelector('[name="title"]').value = service.title;
    form.querySelector('[name="category"]').value = service.category;
    form.querySelector('[name="price"]').value = service.price;
    form.querySelector('[name="duration"]').value = service.duration;
    form.querySelector('[name="status"]').value = service.status;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    modal.show();
}

// Function to delete service
function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        // TODO: Implement delete functionality
        console.log('Delete service:', id);
        loadServices(); // Reload services after deletion
    }
}

// Function to save service
function saveService() {
    const form = document.getElementById('serviceForm');
    if (!form) {
        console.error('Service form not found');
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const serviceId = document.getElementById('serviceId').value;
    
    // TODO: Implement save functionality
    console.log('Save service:', { ...data, id: serviceId || null });
    
    // Close modal and reload services
    const modal = bootstrap.Modal.getInstance(document.getElementById('serviceModal'));
    modal.hide();
    loadServices();
}

// Export functions to global scope
window.loadServices = loadServices;
window.addNewService = addNewService;
window.editService = editService;
window.deleteService = deleteService;
window.saveService = saveService; 