<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('error_log', 'error.log');

require_once 'jwt.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if authorization header exists
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    error_log('Dashboard API Error: No authorization header');
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No authorization header']);
    exit;
}

// Get the token from the authorization header
$token = str_replace('Bearer ', '', $headers['Authorization']);

// Verify the token
$jwtHandler = new JWTHandler();
$decoded = $jwtHandler->validateToken($token);
if (!$decoded) {
    error_log('Dashboard API Error: Invalid token');
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_log('Dashboard API Error: Method not allowed');
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get counts
$articlesCount = countItems('articles.json');
$servicesCount = countItems('services.json');
$portfolioCount = countItems('portfolio.json');
$usersCount = countItems('users.json');

// Get recent items
$recentArticles = getRecentItems('articles.json');
$recentServices = getRecentItems('services.json');

// Return the dashboard data
echo json_encode([
    'success' => true,
    'message' => 'Dashboard data loaded successfully',
    'data' => [
        'counts' => [
            'articles' => $articlesCount,
            'services' => $servicesCount,
            'portfolio' => $portfolioCount,
            'users' => $usersCount
        ],
        'recent' => [
            'articles' => $recentArticles,
            'services' => $recentServices
        ]
    ]
]);

// Helper function to count items in a JSON file
function countItems($filename) {
    if (!file_exists($filename)) {
        return 0;
    }
    $data = json_decode(file_get_contents($filename), true);
    return is_array($data) ? count($data) : 0;
}

// Helper function to get recent items from a JSON file
function getRecentItems($filename, $limit = 5) {
    if (!file_exists($filename)) {
        return [];
    }
    $data = json_decode(file_get_contents($filename), true);
    if (!is_array($data)) {
        return [];
    }
    // Sort by created_at in descending order
    usort($data, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    return array_slice($data, 0, $limit);
} 