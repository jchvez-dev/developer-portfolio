<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Controller\RenderController;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

if ($uri === '/internal/render' && $method === 'POST') {
    try {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $controller = new RenderController();
        $response = $controller->handle($body);
        echo json_encode($response);
    } catch (\Throwable $e) {
        http_response_code(422);
        echo json_encode([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
