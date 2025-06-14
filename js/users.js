// Function to load users
async function loadUsers() {
    try {
        const response = await fetch('api/users.php', {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Users data:', data);

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
        alert('Error loading users: ' + error.message);
    }
}

// Function to edit user
async function editUser(id) {
    try {
        const response = await fetch(`api/users.php?id=${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('User data:', data);

        if (!data.success) {
            throw new Error(data.message || 'Failed to load user');
        }

        const user = data.user;
        if (!user) {
            throw new Error('User not found');
        }

        // Create modal if it doesn't exist
        if (!document.getElementById('editUserModal')) {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'editUserModal';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit User</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-user-form">
                                <input type="hidden" name="id" id="edit-user-id">
                                <div class="mb-3">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-control" name="name" id="edit-user-name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" id="edit-user-email" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Role</label>
                                    <select class="form-control" name="role" id="edit-user-role" required>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">New Password (leave blank to keep current)</label>
                                    <input type="password" class="form-control" name="password">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="handleEditUser()">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Fill form with user data
        const form = document.getElementById('edit-user-form');
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-user-name').value = user.name || '';
        document.getElementById('edit-user-email').value = user.email || '';
        document.getElementById('edit-user-role').value = user.role || 'user';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
    } catch (error) {
        console.error('Error editing user:', error);
        alert('Error editing user: ' + error.message);
    }
}

// Function to handle edit user form submission
async function handleEditUser() {
    try {
        const form = document.getElementById('edit-user-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const userId = data.id;

        // Remove empty password
        if (!data.password) {
            delete data.password;
        }

        const response = await fetch(`api/users.php?id=${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to update user');
        }

        // Close modal and reload users
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        modal.hide();
        await loadUsers();

        alert('User updated successfully');
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Error updating user: ' + error.message);
    }
}

// Function to delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(`api/users.php?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete user');
        }

        await loadUsers();
        alert('User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
    }
}

// Function to show add user modal
function showAddUserModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('addUserModal')) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'addUserModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New User</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="add-user-form">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" name="password" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Role</label>
                                <select class="form-control" name="role" required>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="handleAddUser()">Add User</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Reset form and show modal
    document.getElementById('add-user-form').reset();
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
}

// Function to handle add user form submission
async function handleAddUser() {
    try {
        const form = document.getElementById('add-user-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('api/users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to add user');
        }

        // Close modal and reload users
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        await loadUsers();

        alert('User added successfully');
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Error adding user: ' + error.message);
    }
}

// Make functions available globally
window.loadUsers = loadUsers;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.showAddUserModal = showAddUserModal;
window.handleAddUser = handleAddUser;
window.handleEditUser = handleEditUser;
 