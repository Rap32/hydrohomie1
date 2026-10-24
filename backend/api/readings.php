<?php
// Minimal read-only endpoint for the latest readings. Add authentication before deployment.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit;
}
try {
    require __DIR__ . '/db.php';
    $sql = 'SELECT s.device_code, s.sensor_name, s.location_description, s.warning_threshold_m,
                   r.water_level_m, r.recorded_at
            FROM sensors s
            LEFT JOIN readings r ON r.id = (
                SELECT r2.id FROM readings r2
                WHERE r2.sensor_id = s.id ORDER BY r2.recorded_at DESC, r2.id DESC LIMIT 1
            )
            WHERE s.is_active = 1 ORDER BY s.id';
    echo json_encode(['ok' => true, 'data' => $pdo->query($sql)->fetchAll()]);
} catch (Throwable $e) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'Could not load readings. Check API/database setup.']);
}
