<?php
// Prevent any output before headers
ob_start();

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Set content type
header('Content-Type: application/json');

// Get POST data
$input = file_get_contents('php://input');
error_log("Raw input: " . $input);

$data = json_decode($input, true);
error_log("Decoded data: " . print_r($data, true));

// Validate required fields
if (!isset($data['email']) || !isset($data['password'])) {
    error_log("Login error: Email and password are required");
    error_log("Data received: " . print_r($data, true));
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

// Load users
$usersFile = __DIR__ . '/users.json';
if (!file_exists($usersFile)) {
    error_log("Login error: Users file not found");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Users file not found']);
    exit;
}

$usersData = json_decode(file_get_contents($usersFile), true);
if (!isset($usersData['users']) || !is_array($usersData['users'])) {
    error_log("Login error: Invalid users data");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Invalid users data']);
    exit;
}

$users = $usersData['users'];

// Find user
$user = null;
foreach ($users as $u) {
    if ($u['email'] === $data['email']) {
        $user = $u;
        break;
    }
}

// Verify user and password
if (!$user || !password_verify($data['password'], $user['password'])) {
    error_log("Login error: Invalid email or password");
    error_log("Attempted login with email: " . $data['email']);
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

// Generate token
require_once __DIR__ . '/jwt.php';
$token = JWTHandler::generateToken($user);

if (!$token) {
    error_log("Login error: Failed to generate token");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to generate token']);
    exit;
}

// Remove password from user data
unset($user['password']);

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'token' => $token,
    'user' => $user
]);

// End output buffering and flush
ob_end_flush(); 