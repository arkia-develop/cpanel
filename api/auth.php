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

// Handle login request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get POST data
        $input = file_get_contents('php://input');
        error_log('Received input: ' . $input);

        if (!$input) {
            error_log('Login error: No input data received');
            throw new Exception('No input data received');
        }

        $data = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Login error: Invalid JSON data - ' . json_last_error_msg());
            throw new Exception('Invalid JSON data: ' . json_last_error_msg());
        }

        // Validate required fields
        if (!isset($data['email']) || !isset($data['password'])) {
            error_log('Login error: Missing required fields');
            throw new Exception('Email and password are required');
        }

        error_log('Attempting login for email: ' . $data['email']);

        // Read users from JSON file
        $usersFile = 'users.json';
        if (!file_exists($usersFile)) {
            error_log('Login error: Users database not found at ' . realpath($usersFile));
            throw new Exception('Users database not found');
        }

        $usersContent = file_get_contents($usersFile);
        if ($usersContent === false) {
            error_log('Login error: Failed to read users database');
            throw new Exception('Failed to read users database');
        }

        error_log('Users database content: ' . $usersContent);

        $users = json_decode($usersContent, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Login error: Invalid users database format - ' . json_last_error_msg());
            throw new Exception('Invalid users database format');
        }

        if (!is_array($users)) {
            error_log('Login error: Invalid users database structure');
            throw new Exception('Invalid users database structure');
        }

        // Find user by email
        $user = null;
        foreach ($users as $u) {
            if ($u['email'] === $data['email']) {
                $user = $u;
                break;
            }
        }

        if (!$user) {
            error_log('Login error: User not found for email ' . $data['email']);
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
            exit;
        }

        // Check if user exists and password matches
        if (password_verify($data['password'], $user['password'])) {
            error_log('Password verified successfully for user: ' . $user['email']);

            // Generate JWT token
            $jwtHandler = new JWTHandler();
            $token = $jwtHandler->generateToken([
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ]);

            error_log('Generated token: ' . $token);

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
            error_log('Login error: Password verification failed for email ' . $data['email']);
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email or password'
            ]);
            exit;
        }
    } catch (Exception $e) {
        error_log('Login error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
        exit;
    }
} 