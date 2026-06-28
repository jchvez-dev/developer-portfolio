<?php

namespace App\Tests\Service;

use App\Service\ImageEngine;
use PHPUnit\Framework\TestCase;

class ImageEngineTest extends TestCase
{
    public function testProcessReturnsString(): void
    {
        $engine = new ImageEngine();
        $result = $engine->process([]);

        $this->assertIsString($result);
    }
}
