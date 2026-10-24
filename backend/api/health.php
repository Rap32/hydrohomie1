<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
try {
    require __DIR__ . '/db.php';
    $pdo->query('SELECT 1');
    echo json_encode(['ok' => true, 'service' => 'HydroHomie API', 'database' => 'connected']);
} catch (Throwable $e) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'service' => 'HydroHomie API', 'error' => 'Database connection failed. Check config.php and MySQL.']);
}
