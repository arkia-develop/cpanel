// Articles management functionality
let articlesTable;

// Function to load articles
async function loadArticles() {
    try {
        const response = await fetch('api/articles.php', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load articles');
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to load articles');
        }
        
        const articlesTable = document.getElementById('articles-table');
        if (!articlesTable) {
            console.error('Articles table not found');
            return;
        }
        
        // Clear existing rows
        const tbody = articlesTable.querySelector('tbody');
        if (!tbody) {
            console.error('Table body not found');
            return;
        }
        tbody.innerHTML = '';
        
        // Add new rows
        if (Array.isArray(data.items)) {
            data.items.forEach(article => {
                const row = document.createElement('tr');
                row.innerHTML = `
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
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error('Articles data is not an array:', data.items);
        }

        // Reinitialize DataTable if it exists
        if ($.fn.DataTable.isDataTable('#articles-table')) {
            $('#articles-table').DataTable().destroy();
        }
        $('#articles-table').DataTable();
    } catch (error) {
        console.error('Error loading articles:', error);
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Failed to load articles. Please try again later.
                </div>
            `;
        }
    }
}

// View article
async function viewArticle(id) {
    try {
        const response = await fetch(`api/articles.php?id=${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Article data:', data); // Debug log

        if (!data.success) {
            throw new Error(data.message || 'Failed to load article');
        }

        // Get the article from the response
        const article = data.item;
        if (!article) {
            throw new Error('Article not found');
        }

        // Update modal content
        const modal = document.getElementById('viewArticleModal');
        if (!modal) {
            throw new Error('View article modal not found');
        }

        // Update modal content with article data
        modal.querySelector('.modal-title').textContent = article.title || 'No Title';
        modal.querySelector('#article-content').innerHTML = article.content || 'No Content';
        modal.querySelector('#article-category').textContent = article.category || 'No Category';
        modal.querySelector('#article-author').textContent = article.author || 'No Author';
        modal.querySelector('#article-status').textContent = article.status || 'No Status';
        modal.querySelector('#article-created').textContent = article.created_at ? new Date(article.created_at).toLocaleString() : 'Not Available';
        modal.querySelector('#article-updated').textContent = article.updated_at ? new Date(article.updated_at).toLocaleString() : 'Not Available';

        // Show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error viewing article:', error);
        alert('Error viewing article: ' + error.message);
    }
}

// Edit article
async function editArticle(id) {
    try {
        const response = await fetch(`api/articles.php?id=${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Article data for edit:', data); // Debug log

        if (!data.success) {
            throw new Error(data.message || 'Failed to load article');
        }

        // Get the article from the response
        const article = data.item;
        if (!article) {
            throw new Error('Article not found');
        }

        // Update modal content
        const modal = document.getElementById('editArticleModal');
        if (!modal) {
            throw new Error('Edit article modal not found');
        }

        // Fill form with article data
        const form = document.getElementById('edit-article-form');
        form.querySelector('#edit-article-id').value = article.id;
        form.querySelector('#edit-article-title').value = article.title || '';
        form.querySelector('#edit-article-category').value = article.category || 'Uncategorized';
        form.querySelector('#edit-article-author').value = article.author || 'Admin';
        form.querySelector('#edit-article-content').value = article.content || '';
        form.querySelector('#edit-article-status').value = article.status || 'draft';

        // Show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error editing article:', error);
        alert('Error editing article: ' + error.message);
    }
}

// Delete article
async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) {
        return;
    }
    
    try {
        const response = await fetch(`api/articles.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete article');
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete article');
        }
        
        alert('Article deleted successfully');
        await loadArticles();
    } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error deleting article');
    }
}

// Add article
async function handleAddArticle(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('api/articles.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to add article');
        }

        // Close modal and reload articles
        const modal = bootstrap.Modal.getInstance(document.getElementById('addArticleModal'));
        modal.hide();
        loadArticles();

        // Show success message
        alert('Article added successfully');
    } catch (error) {
        console.error('Error adding article:', error);
        alert(error.message || 'Failed to add article');
    }
}

// Handle edit article form submission
async function handleEditArticle(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = data.id;

    try {
        const response = await fetch('api/articles.php', {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: parseInt(id),
                title: data.title,
                content: data.content,
                category: data.category || 'Uncategorized',
                author: data.author || 'Admin',
                status: data.status || 'draft'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Failed to update article');
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editArticleModal'));
        modal.hide();

        // Reload articles
        await loadArticles();

        // Show success message
        alert('Article updated successfully');
    } catch (error) {
        console.error('Error updating article:', error);
        alert('Error updating article: ' + error.message);
    }
}

// Show add article modal
function showAddArticleModal() {
    const modal = new bootstrap.Modal(document.getElementById('addArticleModal'));
    modal.show();
}

// Initialize articles
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for article forms
    const addArticleForm = document.getElementById('add-article-form');
    if (addArticleForm) {
        addArticleForm.addEventListener('submit', handleAddArticle);
    }

    const editArticleForm = document.getElementById('edit-article-form');
    if (editArticleForm) {
        editArticleForm.addEventListener('submit', handleEditArticle);
    }
});

// Export functions to global scope
window.loadArticles = loadArticles;
window.viewArticle = viewArticle;
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.showAddArticleModal = showAddArticleModal; 