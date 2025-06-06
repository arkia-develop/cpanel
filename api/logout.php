<?php
// Start session
session_start();

// Clear all session variables
$_SESSION = array();

// If it's desired to kill the session, also delete the session cookie.
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy the session
session_destroy();

// Return success response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]); 