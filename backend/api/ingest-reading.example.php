<?php
// EXAMPLE ONLY. Do not expose this endpoint until device authentication is implemented.
// ESP32 should POST JSON such as: {"device_code":"HH-ESP32-01","water_level_m":1.24}
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Device-Key');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit;
}
http_response_code(501);
echo json_encode([
    'ok' => false,
    'message' => 'Not implemented: add device-key authentication, JSON validation, sensor lookup, and a prepared INSERT before enabling ESP32 ingestion.'
]);
