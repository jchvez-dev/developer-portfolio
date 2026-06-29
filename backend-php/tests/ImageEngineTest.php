<?php

namespace App\Tests\Service;

use App\Service\ImageEngine;
use Aws\S3\S3Client;
use PHPUnit\Framework\TestCase;

class ImageEngineTest extends TestCase
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

        $engine = new ImageEngine($s3);
        $result = $engine->process([
            'dimensions' => ['w' => 10, 'h' => 10],
            'elements' => [],
        ]);

        $this->assertIsString($result);
        $this->assertStringEndsWith('.png', $result);
    }
}
