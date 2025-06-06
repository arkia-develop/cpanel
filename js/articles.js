// Articles management functionality
let articlesTable;

// Function to load articles
function loadArticles() {
    const tbody = document.querySelector('#articlesTable tbody');
    if (!tbody) return;

    // Sample data - replace with API call in production
    const articles = [
        {
            id: 1,
            title: 'Getting Started with Web Development',
            category: 'Web Development',
            author: 'John Doe',
            content: 'This is a sample article content.',
            status: 'published'
        },
        {
            id: 2,
            title: 'Advanced PHP Techniques',
            category: 'Programming',
            author: 'Jane Smith',
            content: 'This is another sample article content.',
            status: 'draft'
        },
        {
            id: 3,
            title: 'Database Design Best Practices',
            category: 'Database',
            author: 'Mike Johnson',
            content: 'This is a third sample article content.',
            status: 'published'
        }
    ];

    // Clear existing rows
    tbody.innerHTML = '';

    // Add articles to table
    articles.forEach(article => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${article.title}</td>
            <td>${article.category}</td>
            <td>${article.author}</td>
            <td><span class="badge ${article.status === 'published' ? 'bg-success' : 'bg-warning'}">${article.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editArticle(${article.id})">
                    <i class='bx bx-edit'></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteArticle(${article.id})">
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
    currentDataTable = $('#articlesTable').DataTable();
}

// Function to add new article
function addNewArticle() {
    // Create modal if it doesn't exist
    if (!document.getElementById('articleModal')) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'articleModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Article</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="articleForm">
                            <input type="hidden" id="articleId">
                            <div class="mb-3">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control" name="title" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Category</label>
                                <input type="text" class="form-control" name="category" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Author</label>
                                <input type="text" class="form-control" name="author" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Content</label>
                                <textarea class="form-control" name="content" rows="4" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-control" name="status" required>
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="saveArticle()">Save Article</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Reset form and show modal
    document.getElementById('articleForm').reset();
    document.getElementById('articleId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('articleModal'));
    modal.show();
}

// Function to edit article
function editArticle(id) {
    // Sample data - replace with API call in production
    const articles = [
        {
            id: 1,
            title: 'Getting Started with Web Development',
            category: 'Web Development',
            author: 'John Doe',
            content: 'This is a sample article content.',
            status: 'published'
        },
        {
            id: 2,
            title: 'Advanced PHP Techniques',
            category: 'Programming',
            author: 'Jane Smith',
            content: 'This is another sample article content.',
            status: 'draft'
        },
        {
            id: 3,
            title: 'Database Design Best Practices',
            category: 'Database',
            author: 'Mike Johnson',
            content: 'This is a third sample article content.',
            status: 'published'
        }
    ];

    // Find the article
    const article = articles.find(a => a.id === id);
    if (!article) {
        console.error('Article not found:', id);
        return;
    }

    // Create modal if it doesn't exist
    if (!document.getElementById('articleModal')) {
        addNewArticle();
    }

    // Fill form with article data
    const form = document.getElementById('articleForm');
    document.getElementById('articleId').value = article.id;
    form.querySelector('[name="title"]').value = article.title;
    form.querySelector('[name="category"]').value = article.category;
    form.querySelector('[name="author"]').value = article.author;
    form.querySelector('[name="content"]').value = article.content;
    form.querySelector('[name="status"]').value = article.status;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('articleModal'));
    modal.show();
}

// Function to delete article
function deleteArticle(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        // TODO: Implement delete functionality
        console.log('Delete article:', id);
        loadArticles(); // Reload articles after deletion
    }
}

// Function to save article
function saveArticle() {
    const form = document.getElementById('articleForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const articleId = document.getElementById('articleId').value;
    
    // TODO: Implement save functionality
    console.log('Save article:', { ...data, id: articleId || null });
    
    // Close modal and reload articles
    const modal = bootstrap.Modal.getInstance(document.getElementById('articleModal'));
    modal.hide();
    loadArticles();
}

// Export functions to global scope
window.loadArticles = loadArticles;
window.addNewArticle = addNewArticle;
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;
window.saveArticle = saveArticle; 