<?php
// Prevent any output before headers
ob_start();

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// JWT Handler class for token management
class JWTHandler {
    // Secret key for signing tokens
    private $secretKey = 'your-secret-key-here';  // Change this to a secure random string
    
    // Token expiration time in seconds (24 hours)
    private $expirationTime = 86400;  // 24 * 60 * 60

    // Function to generate a new JWT token
    public function generateToken($data) {
        // Create token header
        $header = json_encode([
            'typ' => 'JWT',  // Token type
            'alg' => 'HS256'  // Algorithm used
        ]);
        
        // Create token payload
        $payload = json_encode([
            'iat' => time(),  // Issued at time
            'exp' => time() + $this->expirationTime,  // Expiration time
            'data' => $data  // User data
        ]);
        
        // Encode header and payload
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        // Create signature
        $signature = hash_hmac('sha256', 
            $base64UrlHeader . "." . $base64UrlPayload, 
            $this->secretKey, 
            true
        );
        
        // Encode signature
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        // Combine all parts to create JWT
        $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
        
        return $jwt;
    }

    // Function to validate a JWT token
    public function validateToken($token) {
        try {
            // Split token into parts
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return false;  // Invalid token format
            }
            
            // Decode payload
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
            
            // Check if token is expired
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return false;  // Token expired
            }
            
            // Verify signature
            $signature = hash_hmac('sha256', 
                $parts[0] . "." . $parts[1], 
                $this->secretKey, 
                true
            );
            
            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            
            if ($base64UrlSignature !== $parts[2]) {
                return false;  // Invalid signature
            }
            
            return $payload['data'];  // Return user data
        } catch (Exception $e) {
            return false;  // Return false on any error
        }
    }

    public function jwtDecodeData($token) {
        return $this->validateToken($token);
    }
}

// End output buffering and flush
ob_end_flush();
?> 