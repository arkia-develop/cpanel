<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Set content type to JSON
header('Content-Type: application/json');

// Get authorization header
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Validate token
if (!preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit;
}

$token = $matches[1];
require_once 'jwt.php';
$jwt = new JwtHandler();

try {
    $user = $jwt->jwtDecodeData($token);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Get users data
try {
    $users_file = 'users.json';
    if (!file_exists($users_file)) {
        file_put_contents($users_file, json_encode(['users' => []]));
    }

    $users_data = json_decode(file_get_contents($users_file), true);
    if (!isset($users_data['users'])) {
        $users_data['users'] = [];
    }

    // Handle different HTTP methods
    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    switch ($method) {
        case 'GET':
            if ($id !== null) {
                // Get single user
                $user = null;
                foreach ($users_data['users'] as $u) {
                    if ($u['id'] === $id) {
                        $user = $u;
                        break;
                    }
                }
                if ($user) {
                    // Remove sensitive data
                    unset($user['password']);
                    echo json_encode(['success' => true, 'user' => $user]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                }
            } else {
                // Get all users
                $users = array_map(function($user) {
                    unset($user['password']);
                    return $user;
                }, $users_data['users']);
                echo json_encode(['success' => true, 'users' => $users]);
            }
            break;

        case 'POST':
            // Add new user
            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit;
            }

            // Check if email already exists
            foreach ($users_data['users'] as $user) {
                if ($user['email'] === $data['email']) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Email already exists']);
                    exit;
                }
            }

            $new_id = 1;
            if (!empty($users_data['users'])) {
                $new_id = max(array_column($users_data['users'], 'id')) + 1;
            }

            $new_user = [
                'id' => $new_id,
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => password_hash($data['password'], PASSWORD_DEFAULT),
                'role' => $data['role'] ?? 'user',
                'created_at' => date('Y-m-d H:i:s')
            ];

            $users_data['users'][] = $new_user;
            file_put_contents($users_file, json_encode($users_data, JSON_PRETTY_PRINT));

            // Remove sensitive data before sending response
            unset($new_user['password']);
            echo json_encode(['success' => true, 'user' => $new_user]);
            break;

        case 'PUT':
            // Update user
            if ($id === null) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing user ID']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $user_found = false;

            foreach ($users_data['users'] as &$user) {
                if ($user['id'] === $id) {
                    $user['name'] = $data['name'] ?? $user['name'];
                    $user['email'] = $data['email'] ?? $user['email'];
                    if (isset($data['password'])) {
                        $user['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
                    }
                    $user['role'] = $data['role'] ?? $user['role'];
                    $user_found = true;
                    break;
                }
            }

            if (!$user_found) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit;
            }

            file_put_contents($users_file, json_encode($users_data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            break;

        case 'DELETE':
            // Delete user
            if ($id === null) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing user ID']);
                exit;
            }

            $user_found = false;
            foreach ($users_data['users'] as $key => $user) {
                if ($user['id'] === $id) {
                    unset($users_data['users'][$key]);
                    $user_found = true;
                    break;
                }
            }

            if (!$user_found) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit;
            }

            $users_data['users'] = array_values($users_data['users']);
            file_put_contents($users_file, json_encode($users_data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log("Users error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
} 