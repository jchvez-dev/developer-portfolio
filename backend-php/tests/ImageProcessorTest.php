<?php

namespace App\Tests\Service;

use App\Service\ImageProcessor;
use Aws\S3\S3Client;
use PHPUnit\Framework\TestCase;

class ImageProcessorTest extends TestCase
{
    public function testProcessReturnsObjectKey(): void
    {
        $s3 = $this->getMockBuilder(S3Client::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['__call'])
            ->getMock();
        $s3->expects($this->once())
            ->method('__call')
            ->with('putObject', $this->anything())
            ->willReturn([]);

        $processor = new ImageProcessor($s3);
        $inputPath = __DIR__ . '/fixtures/test-input.png';

        $result = $processor->process($inputPath, 'sess_test/abc123.webp');

        $this->assertSame('sess_test/abc123.webp', $result);
    }
}
