<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$articlesFile = __DIR__ . '/articles.json';

// Read articles from JSON file
function readArticles() {
    global $articlesFile;
    if (!file_exists($articlesFile)) {
        // Create empty articles file if it doesn't exist
        file_put_contents($articlesFile, json_encode(['articles' => []]));
        return ['articles' => []];
    }
    $data = json_decode(file_get_contents($articlesFile), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('Error reading articles file: ' . json_last_error_msg());
        return ['articles' => []];
    }
    return $data ?: ['articles' => []];
}

// Write articles to JSON file
function writeArticles($data) {
    global $articlesFile;
    $result = file_put_contents($articlesFile, json_encode($data, JSON_PRETTY_PRINT));
    if ($result === false) {
        error_log('Error writing to articles file');
        throw new Exception('Failed to write articles data');
    }
}

session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Sample data - replace with database queries in production
$articles = [
    [
        'id' => 1,
        'title' => 'Getting Started with Web Development',
        'category' => 'Web Development',
        'author' => 'John Doe',
        'status' => 'published'
    ],
    [
        'id' => 2,
        'title' => 'Advanced PHP Techniques',
        'category' => 'Programming',
        'author' => 'Jane Smith',
        'status' => 'draft'
    ],
    [
        'id' => 3,
        'title' => 'Database Design Best Practices',
        'category' => 'Database',
        'author' => 'Mike Johnson',
        'status' => 'published'
    ]
];

echo json_encode(['articles' => $articles]);

try {
    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if specific article is requested
            $id = $_GET['id'] ?? null;
            $data = readArticles();
            
            if ($id) {
                // Find specific article
                $article = null;
                foreach ($data['articles'] as $a) {
                    if ($a['id'] == $id) {
                        $article = $a;
                        break;
                    }
                }
                if ($article) {
                    echo json_encode(['article' => $article]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Article not found']);
                }
            } else {
                // Return all articles
                echo json_encode($data);
            }
            break;

        case 'POST':
            // Add new article
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON data: ' . json_last_error_msg());
            }
            $data = readArticles();
            $input['id'] = time(); // Simple ID generation
            $input['date'] = date('Y-m-d');
            $data['articles'][] = $input;
            writeArticles($data);
            echo json_encode(['success' => true, 'article' => $input]);
            break;

        case 'PUT':
            // Update existing article
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON data: ' . json_last_error_msg());
            }
            $data = readArticles();
            $found = false;
            foreach ($data['articles'] as &$article) {
                if ($article['id'] == $input['id']) {
                    $article = array_merge($article, $input);
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                throw new Exception('Article not found');
            }
            writeArticles($data);
            echo json_encode(['success' => true]);
            break;

        case 'DELETE':
            // Delete article
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('Article ID required');
            }
            $data = readArticles();
            $data['articles'] = array_filter($data['articles'], function($article) use ($id) {
                return $article['id'] != $id;
            });
            writeArticles($data);
            echo json_encode(['success' => true]);
            break;

        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 