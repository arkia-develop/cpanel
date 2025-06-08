<?php
// Prevent any output before headers
ob_start();

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

class JWTHandler {
    private $secret_key = 'your-secret-key';
    private $algorithm = 'HS256';

    public function generateToken($user_data) {
        $header = json_encode(['typ' => 'JWT', 'alg' => $this->algorithm]);
        $payload = json_encode([
            'id' => $user_data['id'],
            'email' => $user_data['email'],
            'name' => $user_data['name'],
            'role' => $user_data['role'],
            'exp' => time() + (60 * 60 * 24) // 24 hours
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret_key, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function validateToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlSignature));
        $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret_key, true);

        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    public function jwtDecodeData($token) {
        return $this->validateToken($token);
    }
}

// End output buffering and flush
ob_end_flush();
?> 