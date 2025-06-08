<?php
header('Content-Type: application/json');

$password = 'abuBakr&elKhiouty';
$hash = password_hash($password, PASSWORD_BCRYPT);

// Read current users.json
$usersFile = __DIR__ . '/users.json';
$users = json_decode(file_get_contents($usersFile), true);

// Update the password hash
$users['users'][0]['password'] = $hash;

// Save back to file
file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'message' => 'Password updated successfully',
    'hash' => $hash
]);
?> 