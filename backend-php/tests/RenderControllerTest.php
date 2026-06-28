<?php

namespace App\Tests\Controller;

use App\Controller\RenderController;
use PHPUnit\Framework\TestCase;

class RenderControllerTest extends TestCase
{
    public function testHandleReturnsCompletedStatus(): void
    {
        $controller = new RenderController();
        $response = $controller->handle([
            'jobId' => 'test_job_123',
            'definition' => [
                'dimensions' => ['w' => 1200, 'h' => 630],
                'elements' => [],
            ],
        ]);

        $this->assertSame('completed', $response['status']);
        $this->assertArrayHasKey('objectKey', $response);
        $this->assertIsString($response['objectKey']);
        $this->assertArrayHasKey('executionTimeMs', $response);
        $this->assertIsInt($response['executionTimeMs']);
    }
}
