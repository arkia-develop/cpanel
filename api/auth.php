<?php
// Enable error reporting for debugging purposes
error_reporting(E_ALL);  // Report all PHP errors
ini_set('display_errors', 1);  // Display errors in output
ini_set('error_log', 'error.log');  // Set error log file

// Set response headers
header('Content-Type: application/json');  // Set response type to JSON
header('Access-Control-Allow-Origin: *');  // Allow cross-origin requests
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');  // Allow specific HTTP methods
header('Access-Control-Allow-Headers: Content-Type, Authorization');  // Allow specific headers

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);  // Return 200 OK for preflight
    exit();
}

// Include JWT handler for token management
require_once 'jwt.php';

// Function to check authentication token
function checkAuth() {
    $headers = getallheaders();  // Get all request headers
    if (!isset($headers['Authorization'])) {
        error_log('Dashboard API Error: Missing or invalid Authorization header');  // Log error
        http_response_code(401);  // Return unauthorized status
        echo json_encode(['success' => false, 'message' => 'Missing or invalid Authorization header']);
        exit;
    }

    $auth_header = $headers['Authorization'];  // Get Authorization header
    if (!preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
        error_log('Dashboard API Error: Invalid Authorization header format');  // Log error
        http_response_code(401);  // Return unauthorized status
        echo json_encode(['success' => false, 'message' => 'Invalid Authorization header format']);
        exit;
    }

    $jwt = $matches[1];  // Extract JWT token
    $jwtHandler = new JWTHandler();  // Create JWT handler instance
    
    try {
        $decoded = $jwtHandler->validateToken($jwt);  // Validate token
        if (!$decoded) {
            error_log('Token validation error: Invalid token');  // Log error
            http_response_code(401);  // Return unauthorized status
            echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
            exit;
        }
        return $decoded;  // Return decoded token data
    } catch (Exception $e) {
        error_log('Token validation error: ' . $e->getMessage());  // Log error
        http_response_code(401);  // Return unauthorized status
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
        exit;
    }
}

// Handle login request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get POST data from request body
        $input = file_get_contents('php://input');  // Read raw POST data
        error_log('Received input: ' . $input);  // Log received data

        if (!$input) {
            error_log('Login error: No input data received');  // Log error
            throw new Exception('No input data received');
        }

        $data = json_decode($input, true);  // Decode JSON data
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Login error: Invalid JSON data - ' . json_last_error_msg());  // Log error
            throw new Exception('Invalid JSON data: ' . json_last_error_msg());
        }

        // Validate required fields
        if (!isset($data['email']) || !isset($data['password'])) {
            error_log('Login error: Missing required fields');  // Log error
            throw new Exception('Email and password are required');
        }

        error_log('Attempting login for email: ' . $data['email']);  // Log login attempt
        error_log('Received password: ' . $data['password']); // Log received password

        // Read users from JSON file
        $usersFile = 'users.json';  // Path to users database
        if (!file_exists($usersFile)) {
            error_log('Login error: Users database not found at ' . realpath($usersFile));  // Log error
            throw new Exception('Users database not found');
        }

        $usersContent = file_get_contents($usersFile);  // Read users file
        if ($usersContent === false) {
            error_log('Login error: Failed to read users database');  // Log error
            throw new Exception('Failed to read users database');
        }

        error_log('Users database content: ' . $usersContent);  // Log database content

        $users = json_decode($usersContent, true);  // Decode users JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Login error: Invalid users database format - ' . json_last_error_msg());  // Log error
            throw new Exception('Invalid users database format');
        }

        if (!isset($users['users']) || !is_array($users['users'])) {
            error_log('Login error: Invalid users database structure');  // Log error
            throw new Exception('Invalid users database structure');
        }

        // Find user by email
        $user = null;
        foreach ($users['users'] as $u) {
            error_log('Checking user: ' . $u['email']); // Log user being checked
            if ($u['email'] === $data['email']) {
                $user = $u;
                error_log('User found: ' . json_encode($user)); // Log found user
                break;
            }
        }

        if (!$user) {
            error_log('Login error: User not found for email ' . $data['email']);  // Log error
            http_response_code(401);  // Return unauthorized status
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
            exit;
        }

        // Verify password
        $verifyResult = password_verify($data['password'], $user['password']);
        error_log('Password verify result: ' . ($verifyResult ? 'true' : 'false'));
        if ($verifyResult) {
            error_log('Password verified successfully for user: ' . $user['email']);  // Log success

            // Generate JWT token
            $jwtHandler = new JWTHandler();  // Create JWT handler instance
            $token = $jwtHandler->generateToken([  // Generate token with user data
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ]);

            error_log('Generated token: ' . $token);  // Log generated token

            // Return success response
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role']
                ]
            ]);
            exit;
        } else {
            error_log('Login error: Password verification failed for email ' . $data['email']);  // Log error
            http_response_code(401);  // Return unauthorized status
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
            exit;
        }
    } catch (Exception $e) {
        error_log('Login error: ' . $e->getMessage());  // Log error
        http_response_code(500);  // Return server error status
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
        exit;
    }
} 