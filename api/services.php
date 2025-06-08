<?php
// Prevent any output before headers
ob_start();

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'error.log');

// Set content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'jwt.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check authentication
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    error_log('Services API Error: Missing or invalid Authorization header');
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid Authorization header']);
    exit;
}

$auth_header = $headers['Authorization'];
if (!preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
    error_log('Services API Error: Invalid Authorization header format');
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

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        try {
            $services = json_decode(file_get_contents('services.json'), true);
            if (!is_array($services)) {
                $services = [];
            }

            echo json_encode([
                'success' => true,
                'items' => $services
            ]);
        } catch (Exception $e) {
            error_log('Services error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to load services'
            ]);
        }
        break;
        
    case 'POST':
        // Get POST data
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($data['name']) || !isset($data['description'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name and description are required']);
            exit;
        }
        
        // Read existing items
        $items = [];
        if (file_exists('services.json')) {
            $items = json_decode(file_get_contents('services.json'), true);
        }
        
        // Generate new ID
        $newId = 1;
        if (!empty($items)) {
            $newId = max(array_column($items, 'id')) + 1;
        }
        
        // Create new item
        $newItem = [
            'id' => $newId,
            'name' => $data['name'],
            'description' => $data['description'],
            'status' => $data['status'] ?? 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        // Add to items array
        $items[] = $newItem;
        
        // Save to file
        if (file_put_contents('services.json', json_encode($items, JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'item' => $newItem]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save service']);
        }
        break;
        
    case 'PUT':
        // Get PUT data
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($data['id']) || !isset($data['name']) || !isset($data['description'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID, name and description are required']);
            exit;
        }
        
        // Read existing items
        $items = [];
        if (file_exists('services.json')) {
            $items = json_decode(file_get_contents('services.json'), true);
        }
        
        // Find and update item
        $found = false;
        foreach ($items as &$item) {
            if ($item['id'] === $data['id']) {
                $item['name'] = $data['name'];
                $item['description'] = $data['description'];
                $item['status'] = $data['status'] ?? $item['status'];
                $item['updated_at'] = date('Y-m-d H:i:s');
                $found = true;
                break;
            }
        }
        
        if ($found) {
            // Save to file
            if (file_put_contents('services.json', json_encode($items, JSON_PRETTY_PRINT))) {
                echo json_encode(['success' => true, 'item' => $item]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update service']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Service not found']);
        }
        break;
        
    case 'DELETE':
        // Get item ID from query string
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Service ID is required']);
            exit;
        }
        
        // Read existing items
        $items = [];
        if (file_exists('services.json')) {
            $items = json_decode(file_get_contents('services.json'), true);
        }
        
        // Find and remove item
        $found = false;
        foreach ($items as $key => $item) {
            if ($item['id'] === $id) {
                unset($items[$key]);
                $found = true;
                break;
            }
        }
        
        if ($found) {
            // Reindex array
            $items = array_values($items);
            
            // Save to file
            if (file_put_contents('services.json', json_encode($items, JSON_PRETTY_PRINT))) {
                echo json_encode(['success' => true, 'message' => 'Service deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete service']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Service not found']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

// End output buffering and flush
ob_end_flush(); 