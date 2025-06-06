<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
session_start();

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Log the request method and raw input for debugging
error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Raw Input: ' . file_get_contents('php://input'));

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Log the decoded data for debugging
error_log('Decoded Data: ' . print_r($data, true));

// Validate input
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit();
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Function to read users from JSON file
function readUsers() {
    $usersFile = __DIR__ . '/users.json';
    
    // Create empty users file if it doesn't exist
    if (!file_exists($usersFile)) {
        file_put_contents($usersFile, json_encode(['users' => []]));
        return [];
    }
    
    $json = file_get_contents($usersFile);
    if ($json === false) {
        error_log('Failed to read users.json');
        return [];
    }
    
    $data = json_decode($json, true);
    if ($data === null) {
        error_log('Failed to decode users.json');
        return [];
    }
    
    return isset($data['users']) ? $data['users'] : [];
}

// Get users from JSON file
$users = readUsers();

// Find user by email
$user = null;
foreach ($users as $u) {
    if ($u['email'] === $data['email']) {
        $user = $u;
        break;
    }
}

// Log the comparison for debugging
error_log('Found user: ' . print_r($user, true));

if ($user && $user['password'] === $data['password']) {
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_role'] = $user['role'];
    
    // Remove password from user data before sending
    unset($user['password']);
    
    // Login successful
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => $user
    ]);
} else {
    // Login failed
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password'
    ]);
} 