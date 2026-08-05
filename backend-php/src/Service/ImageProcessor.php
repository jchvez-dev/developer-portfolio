<?php

namespace App\Service;

use Aws\S3\S3Client;

class ImageProcessor
{
    private S3Client $s3;
    private const MAX_DIMENSION = 1920;
    private const WEBP_QUALITY = 80;

    public function __construct(?S3Client $s3 = null)
    {
        $this->s3 = $s3 ?? S3ClientFactory::create();
    }

    public function process(string $inputPath, string $objectKey): string
    {
        $image = new \Imagick($inputPath);

        $this->resizeIfNeeded($image);

        $image->setImageFormat('webp');
        $image->setImageCompressionQuality(self::WEBP_QUALITY);

        $blob = $image->getImageBlob();
        $image->clear();

        $this->s3->putObject([
            'Bucket' => 'user-uploads',
            'Key' => $objectKey,
            'Body' => $blob,
            'ContentType' => 'image/webp',
        ]);

        return $objectKey;
    }

    private function resizeIfNeeded(\Imagick $image): void
    {
        $w = $image->getImageWidth();
        $h = $image->getImageHeight();

        if ($w > self::MAX_DIMENSION || $h > self::MAX_DIMENSION) {
            if ($w >= $h) {
                $image->resizeImage(self::MAX_DIMENSION, 0, \Imagick::FILTER_LANCZOS, 1);
            } else {
                $image->resizeImage(0, self::MAX_DIMENSION, \Imagick::FILTER_LANCZOS, 1);
            }
        }
    }
}
