<?php

namespace App\Tests\Controller;

use App\Controller\RenderController;
use App\Service\ImageEngine;
use PHPUnit\Framework\TestCase;

class RenderControllerTest extends TestCase
{
    public function testHandleReturnsCompletedStatus(): void
    {
        $engine = $this->createMock(ImageEngine::class);
        $engine->method('process')->willReturn('production-exports/test.png');

        $controller = new RenderController($engine);
        $response = $controller->handle([
            'jobId' => 'test_job_123',
            'definition' => [
                'dimensions' => ['w' => 1200, 'h' => 630],
                'elements' => [],
            ],
        ]);

        $this->assertSame('completed', $response['status']);
        $this->assertSame('production-exports/test.png', $response['objectKey']);
        $this->assertArrayHasKey('executionTimeMs', $response);
        $this->assertIsInt($response['executionTimeMs']);
    }
}
