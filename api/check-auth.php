<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('error_log', 'error.log');

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'jwt.php';

function checkAuth() {
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
        return $decoded;
    } catch (Exception $e) {
        error_log('Token validation error: ' . $e->getMessage());
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
        exit;
    }
}

// Prevent any output before headers
ob_start();

try {
    // Get Authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    error_log('Received Authorization header: ' . $authHeader);

    // Check if Authorization header exists and has correct format
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception('Missing or invalid Authorization header');
    }

    // Extract token
    $token = $matches[1];
    error_log('Extracted token: ' . $token);

    // Validate token
    require_once 'jwt.php';
    $decoded = JWTHandler::validateToken($token);
    
    if (!$decoded) {
        throw new Exception('Invalid or expired token');
    }

    error_log('Token validation successful. User data: ' . json_encode($decoded));

    // Token is valid, return user data
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $decoded['id'],
            'email' => $decoded['email'],
            'name' => $decoded['name'],
            'role' => $decoded['role']
        ]
    ]);

} catch (Exception $e) {
    // Log the error
    error_log('Auth check error: ' . $e->getMessage());
    
    // Return error response
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// End output buffering and flush
ob_end_flush();
?> 