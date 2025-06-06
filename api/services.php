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

$servicesFile = __DIR__ . '/services.json';

// Read services from JSON file
function readServices() {
    global $servicesFile;
    if (!file_exists($servicesFile)) {
        // Create empty services file if it doesn't exist
        file_put_contents($servicesFile, json_encode(['services' => []]));
        return ['services' => []];
    }
    $data = json_decode(file_get_contents($servicesFile), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('Error reading services file: ' . json_last_error_msg());
        return ['services' => []];
    }
    return $data ?: ['services' => []];
}

// Write services to JSON file
function writeServices($data) {
    global $servicesFile;
    $result = file_put_contents($servicesFile, json_encode($data, JSON_PRETTY_PRINT));
    if ($result === false) {
        error_log('Error writing to services file');
        throw new Exception('Failed to write services data');
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
$services = [
    [
        'id' => 1,
        'title' => 'Web Development',
        'category' => 'Development',
        'price' => '$1000',
        'duration' => '2 weeks',
        'status' => 'active'
    ],
    [
        'id' => 2,
        'title' => 'SEO Optimization',
        'category' => 'Marketing',
        'price' => '$500',
        'duration' => '1 month',
        'status' => 'active'
    ],
    [
        'id' => 3,
        'title' => 'Content Writing',
        'category' => 'Content',
        'price' => '$300',
        'duration' => '1 week',
        'status' => 'inactive'
    ]
];

echo json_encode(['services' => $services]);

try {
    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if specific service is requested
            $id = $_GET['id'] ?? null;
            $data = readServices();
            
            if ($id) {
                // Find specific service
                $service = null;
                foreach ($data['services'] as $s) {
                    if ($s['id'] == $id) {
                        $service = $s;
                        break;
                    }
                }
                if ($service) {
                    echo json_encode(['service' => $service]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Service not found']);
                }
            } else {
                // Return all services
                echo json_encode($data);
            }
            break;

        case 'POST':
            // Add new service
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON data: ' . json_last_error_msg());
            }
            $data = readServices();
            $input['id'] = time(); // Simple ID generation
            $input['date'] = date('Y-m-d');
            $data['services'][] = $input;
            writeServices($data);
            echo json_encode(['success' => true, 'service' => $input]);
            break;

        case 'PUT':
            // Update existing service
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON data: ' . json_last_error_msg());
            }
            $data = readServices();
            $found = false;
            foreach ($data['services'] as &$service) {
                if ($service['id'] == $input['id']) {
                    $service = array_merge($service, $input);
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                throw new Exception('Service not found');
            }
            writeServices($data);
            echo json_encode(['success' => true]);
            break;

        case 'DELETE':
            // Delete service
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('Service ID required');
            }
            $data = readServices();
            $data['services'] = array_filter($data['services'], function($service) use ($id) {
                return $service['id'] != $id;
            });
            writeServices($data);
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