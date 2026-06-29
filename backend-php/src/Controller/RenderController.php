<?php

namespace App\Controller;

use App\Service\ImageEngine;

class RenderController
{
    private ImageEngine $imageEngine;

    public function __construct(?ImageEngine $imageEngine = null)
    {
        $this->imageEngine = $imageEngine ?? new ImageEngine();
    }

    public function handle(array $body): array
    {
        $jobId = $body['jobId'] ?? 'unknown';
        $definition = $body['definition'] ?? [];

        $start = microtime(true);
        $objectKey = $this->imageEngine->process($definition);
        $elapsed = (int) ((microtime(true) - $start) * 1000);

        return [
            'status' => 'completed',
            'objectKey' => $objectKey,
            'executionTimeMs' => $elapsed,
        ];
    }
}
