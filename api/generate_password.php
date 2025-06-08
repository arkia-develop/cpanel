<?php
$password = 'abuBakr&elKhiouty';
$hash = password_hash($password, PASSWORD_BCRYPT);
printf("Password: %s\nHash: %s\n", $password, $hash);
?> 