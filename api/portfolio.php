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

$portfolioFile = __DIR__ . '/portfolio.json';

// Read portfolio items from JSON file
function readPortfolio() {
    global $portfolioFile;
    if (!file_exists($portfolioFile)) {
        // Create empty portfolio file if it doesn't exist
        file_put_contents($portfolioFile, json_encode(['portfolio' => []]));
        return ['portfolio' => []];
    }
    $data = json_decode(file_get_contents($portfolioFile), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('Error reading portfolio file: ' . json_last_error_msg());
        return ['portfolio' => []];
    }
    return $data ?: ['portfolio' => []];
}

// Write portfolio items to JSON file
function writePortfolio($data) {
    global $portfolioFile;
    $result = file_put_contents($portfolioFile, json_encode($data, JSON_PRETTY_PRINT));
    if ($result === false) {
        error_log('Error writing to portfolio file');
        throw new Exception('Failed to write portfolio data');
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
$portfolio = [
    [
        'id' => 1,
        'title' => 'E-commerce Website',
        'category' => 'Web Development',
        'client' => 'ABC Company',
        'status' => 'published'
    ],
    [
        'id' => 2,
        'title' => 'Mobile App Design',
        'category' => 'UI/UX',
        'client' => 'XYZ Corp',
        'status' => 'published'
    ],
    [
        'id' => 3,
        'title' => 'Brand Identity',
        'category' => 'Design',
        'client' => '123 Industries',
        'status' => 'draft'
    ]
];

echo json_encode(['portfolio' => $portfolio]);

try {
    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if specific portfolio item is requested
            $id = $_GET['id'] ?? null;
            $data = readPortfolio();
            
            if ($id) {
                // Find specific portfolio item
                $item = null;
                foreach ($data['portfolio'] as $p) {
                    if ($p['id'] == $id) {
                        $item = $p;
                        break;
                    }
                }
                if ($item) {
                    echo json_encode(['item' => $item]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Portfolio item not found']);
                }
            } else {
                // Return all portfolio items
                echo json_encode($data);
            }
            break;

        case 'POST':
            // Add new portfolio item
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON data: ' . json_last_error_msg());
            }
            $data = readPortfolio();
            $input['id'] = time(); // Simple ID generation
            $input['date'] = date('Y-m-d');
            $data['portfolio'][] = $input;
            writePortfolio($data);
            echo json_encode(['success' => true, 'item' => $input]);
            break;

        case 'PUT':
            // Update existing portfolio item
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON data: ' . json_last_error_msg());
            }
            $data = readPortfolio();
            $found = false;
            foreach ($data['portfolio'] as &$item) {
                if ($item['id'] == $input['id']) {
                    $item = array_merge($item, $input);
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                throw new Exception('Portfolio item not found');
            }
            writePortfolio($data);
            echo json_encode(['success' => true]);
            break;

        case 'DELETE':
            // Delete portfolio item
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('Portfolio item ID required');
            }
            $data = readPortfolio();
            $data['portfolio'] = array_filter($data['portfolio'], function($item) use ($id) {
                return $item['id'] != $id;
            });
            writePortfolio($data);
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