<?php

namespace App\Tests\Controller;

use App\Controller\UploadController;
use App\Service\ImageProcessor;
use PHPUnit\Framework\TestCase;

class UploadControllerTest extends TestCase
{
    public function testHandleReturnsCompletedStatus(): void
    {
        $processor = $this->createMock(ImageProcessor::class);
        $processor->method('process')->willReturn('sess_test/uuid.webp');

        $controller = new UploadController($processor);

        $tmpFile = tempnam(sys_get_temp_dir(), 'upload_test_');
        file_put_contents($tmpFile, 'fake-image-content');

        $response = $controller->handle(
            [
                'file' => [
                    'tmp_name' => $tmpFile,
                    'error' => UPLOAD_ERR_OK,
                ],
            ],
            [
                'jobId' => 'job_123',
                'sessionId' => 'sess_test',
            ]
        );

        $this->assertSame('completed', $response['status']);
        $this->assertStringStartsWith('user-uploads/', $response['objectKey']);
        $this->assertStringEndsWith('.webp', $response['objectKey']);
        $this->assertArrayHasKey('executionTimeMs', $response);
        $this->assertIsInt($response['executionTimeMs']);

        unlink($tmpFile);
    }

    public function testHandleThrowsOnMissingFile(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('File upload failed or no file provided.');

        $controller = new UploadController();
        $controller->handle([], []);
    }
}
