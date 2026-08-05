<?php

namespace App\Service;

use Aws\S3\S3Client;

final class S3ClientFactory
{
    public static function create(): S3Client
    {
        $endpoint = rtrim(getenv('BUCKET_ENDPOINT') ?: 'http://storage:9000', '/');

        return new S3Client([
            'version' => 'latest',
            'region' => getenv('BUCKET_REGION') ?: 'us-east-1',
            'endpoint' => $endpoint,
            'use_path_style_endpoint' => true,
            'credentials' => [
                'key' => getenv('BUCKET_ACCESS_KEY_ID') ?: '',
                'secret' => getenv('BUCKET_SECRET_ACCESS_KEY') ?: '',
            ],
        ]);
    }
}
