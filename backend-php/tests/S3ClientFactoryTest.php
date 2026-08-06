<?php

namespace App\Tests\Service;

use App\Service\S3ClientFactory;
use PHPUnit\Framework\TestCase;

class S3ClientFactoryTest extends TestCase
{
    public function testCreateReadsConfigFromEnvironment(): void
    {
        $previous = [
            'BUCKET_ENDPOINT' => getenv('BUCKET_ENDPOINT') ?: false,
            'BUCKET_REGION' => getenv('BUCKET_REGION') ?: false,
            'BUCKET_ACCESS_KEY_ID' => getenv('BUCKET_ACCESS_KEY_ID') ?: false,
            'BUCKET_SECRET_ACCESS_KEY' => getenv('BUCKET_SECRET_ACCESS_KEY') ?: false,
        ];

        putenv('BUCKET_ENDPOINT=https://s3.example.com/storage/v1/s3/');
        putenv('BUCKET_REGION=ca-central-1');
        putenv('BUCKET_ACCESS_KEY_ID=my-access-key');
        putenv('BUCKET_SECRET_ACCESS_KEY=my-secret-key');

        try {
            $client = S3ClientFactory::create();

            $this->assertTrue(
                $client->getConfig('use_path_style_endpoint'),
                'path-style must be enabled for S3-compatible providers',
            );
            $this->assertSame('ca-central-1', $client->getConfig('signing_region'));

            $credentials = $client->getCredentials()->wait();
            $this->assertSame('my-access-key', $credentials->getAccessKeyId());
            $this->assertSame('my-secret-key', $credentials->getSecretKey());
        } finally {
            foreach ($previous as $key => $value) {
                if ($value === false) {
                    putenv($key);
                } else {
                    putenv($key . '=' . $value);
                }
            }
        }
    }

    public function testCreateUsesDefaultsWhenEnvUnset(): void
    {
        putenv('BUCKET_ENDPOINT');
        putenv('BUCKET_REGION');
        putenv('BUCKET_ACCESS_KEY_ID');
        putenv('BUCKET_SECRET_ACCESS_KEY');

        $client = S3ClientFactory::create();

        $this->assertTrue($client->getConfig('use_path_style_endpoint'));
        $this->assertSame('us-east-1', $client->getConfig('signing_region'));
    }
}