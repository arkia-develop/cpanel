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

// Check authentication
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    error_log('Dashboard API Error: Missing or invalid Authorization header');
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid Authorization header']);
    exit;
}

$auth_header = $headers['Authorization'];
if (!preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    error_log('Dashboard API Error: Invalid Authorization header format');
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid Authorization header format']);
    exit;
}

$jwt = $matches[1];
$jwtHandler = new JWTHandler();

try {
    $decoded = $jwtHandler->validateToken($jwt);
    if (!$decoded) {
        error_log('Token validation error: Invalid token');
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
        exit;
    }
} catch (Exception $e) {
    error_log('Token validation error: ' . $e->getMessage());
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
    exit;
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get counts
        $counts = [
            'articles' => countItems('articles.json'),
            'services' => countItems('services.json'),
            'portfolio' => countItems('portfolio.json'),
            'users' => countItems('users.json')
        ];

        // Get recent items
        $recent = [
            'articles' => getRecentItems('articles.json', 3),
            'services' => getRecentItems('services.json', 3),
            'portfolio' => getRecentItems('portfolio.json', 3)
        ];

        // Return success response
        echo json_encode([
            'success' => true,
            'data' => [
                'counts' => $counts,
                'recent' => $recent
            ]
        ]);
    } catch (Exception $e) {
        error_log('Dashboard error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to load dashboard data'
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

// Helper function to count items in a JSON file
function countItems($filename) {
    if (!file_exists($filename)) {
        return 0;
    }
    $data = json_decode(file_get_contents($filename), true);
    return is_array($data) ? count($data) : 0;
}

// Helper function to get recent items from a JSON file
function getRecentItems($filename, $limit = 3) {
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
    
    // Return limited items
    return array_slice($data, 0, $limit);
} 