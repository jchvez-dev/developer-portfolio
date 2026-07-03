<?php

namespace App\Controller;

use App\Service\ImageProcessor;

class UploadController
{
    private ImageProcessor $processor;

    public function __construct(?ImageProcessor $processor = null)
    {
        $this->processor = $processor ?? new ImageProcessor();
    }

    public function handle(array $files, array $post): array
    {
        $jobId = $post['jobId'] ?? 'unknown';
        $sessionId = $post['sessionId'] ?? 'sess_' . bin2hex(random_bytes(8));

        if (!isset($files['file']) || $files['file']['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('File upload failed or no file provided.');
        }

        $tmpPath = $files['file']['tmp_name'];
        $uuid = bin2hex(random_bytes(16));
        $objectKey = sprintf('%s/%s.webp', $sessionId, $uuid);

        $start = microtime(true);
        $this->processor->process($tmpPath, $objectKey);
        $elapsed = (int) ((microtime(true) - $start) * 1000);

        return [
            'status' => 'completed',
            'objectKey' => 'user-uploads/' . $objectKey,
            'executionTimeMs' => $elapsed,
        ];
    }
}
