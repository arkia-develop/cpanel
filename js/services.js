async function loadServices() {
    // Services handler
    try {
        const response = await fetch('api/services.php', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load services');
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to load services');
        }
        
        const servicesTable = document.getElementById('services-table');
        if (!servicesTable) {
            console.error('Services table not found');
            return;
        }
        
        // Clear existing rows
        const tbody = servicesTable.querySelector('tbody');
        if (!tbody) {
            console.error('Table body not found');
            return;
        }
        tbody.innerHTML = '';
        
        // Add new rows
        if (Array.isArray(data.items)) {
            data.items.forEach(service => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${service.name}</td>
                    <td>${service.description}</td>
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
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error('Services data is not an array:', data.items);
        }

        // Reinitialize DataTable if it exists
        if ($.fn.DataTable.isDataTable('#services-table')) {
            $('#services-table').DataTable().destroy();
        }
        $('#services-table').DataTable();
    } catch (error) {
        console.error('Error loading services:', error);
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Failed to load services. Please try again later.
                </div>
            `;
        }
    }
}

// View service
async function viewService(id) {
    try {
        const response = await fetch(`api/services.php?id=${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Service data:', data); // Debug log

        if (!data.success) {
            throw new Error(data.message || 'Failed to load service');
        }

        // Find the service in the items array
        const service = data.items.find(item => item.id === parseInt(id));
        if (!service) {
            throw new Error('Service not found');
        }

        // Update modal content
        const modal = document.getElementById('viewServiceModal');
        if (!modal) {
            throw new Error('View service modal not found');
        }

        // Update modal content with service data
        modal.querySelector('.modal-title').textContent = service.name || 'No Name';
        modal.querySelector('#service-description').innerHTML = service.description || 'No Description';
        modal.querySelector('#service-status').textContent = service.status || 'No Status';
        modal.querySelector('#service-created').textContent = service.created_at ? new Date(service.created_at).toLocaleString() : 'Not Available';
        modal.querySelector('#service-updated').textContent = service.updated_at ? new Date(service.updated_at).toLocaleString() : 'Not Available';

        // Show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error viewing service:', error);
        alert('Error viewing service: ' + error.message);
    }
}

// Edit service
async function editService(id) {
    try {
        const response = await fetch(`api/services.php?id=${id}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Service data:', data); // Debug log

        if (!data.success) {
            throw new Error(data.message || 'Failed to load service');
        }

        // Get the service from the response
        const service = data.items.find(item => item.id === parseInt(id));
        if (!service) {
            throw new Error('Service not found');
        }

        // Update modal content
        const modal = document.getElementById('editServiceModal');
        if (!modal) {
            throw new Error('Edit service modal not found');
        }
        
        // Fill form with service data
        const form = document.getElementById('edit-service-form');
        form.querySelector('#edit-service-id').value = service.id;
        form.querySelector('#edit-service-name').value = service.name || '';
        form.querySelector('#edit-service-description').value = service.description || '';
        form.querySelector('#edit-service-status').value = service.status || 'inactive';

        // Show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error editing service:', error);
        alert('Error editing service: ' + error.message);
    }
}

// Delete service
async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) {
        return;
    }
    
    try {
        const response = await fetch(`api/services.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete service');
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete service');
        }
        
        alert('Service deleted successfully');
        await loadServices();
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error deleting service');
    }
}

// Initialize services functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for service forms
    const addServiceForm = document.getElementById('add-service-form');
    if (addServiceForm) {
        addServiceForm.addEventListener('submit', handleAddService);
    }

    const editServiceForm = document.getElementById('edit-service-form');
    if (editServiceForm) {
        editServiceForm.addEventListener('submit', handleEditService);
    }
});

// Show add service modal
function showAddServiceModal() {
    const modal = new bootstrap.Modal(document.getElementById('addServiceModal'));
    modal.show();
}

// Handle add service form submission
async function handleAddService(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('api/services.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to add service');
        }

        // Close modal and reload services
        const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
        modal.hide();
        loadServices();

        // Show success message
        alert('Service added successfully');
    } catch (error) {
        console.error('Error adding service:', error);
        alert(error.message || 'Failed to add service');
    }
}

// Handle edit service form submission
async function handleEditService(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const serviceId = document.getElementById('edit-service-id').value;
        
        const response = await fetch('api/services.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                id: parseInt(serviceId),
                name: data.name,
                description: data.description,
                status: data.status
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update service');
        }

        // Close modal and reload services
        const modal = bootstrap.Modal.getInstance(document.getElementById('editServiceModal'));
        modal.hide();
        loadServices();
        
        // Show success message
        alert('Service updated successfully');
    } catch (error) {
        console.error('Error updating service:', error);
        alert(error.message || 'Failed to update service');
    }
}

// Make functions available globally
window.showAddServiceModal = showAddServiceModal;
window.editService = editService;
window.viewService = viewService;
window.deleteService = deleteService; 