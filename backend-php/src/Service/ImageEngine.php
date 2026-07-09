<?php

namespace App\Service;

use Aws\S3\S3Client;

class ImageEngine
{
    private S3Client $s3;
    private HtmlSanitizer $sanitizer;
    private HtmlTokenizer $tokenizer;
    private TextRenderer $textRenderer;

    public function __construct(
        ?S3Client $s3 = null,
        ?HtmlSanitizer $sanitizer = null,
        ?HtmlTokenizer $tokenizer = null,
        ?TextRenderer $textRenderer = null,
    ) {
        $endpoint = rtrim(getenv('MINIO_ENDPOINT') ?: 'http://storage:9000', '/');

        $this->s3 = $s3 ?? new S3Client([
            'version' => 'latest',
            'region' => 'us-east-1',
            'endpoint' => $endpoint,
            'use_path_style_endpoint' => true,
            'credentials' => [
                'key' => getenv('MINIO_ROOT_USER') ?: '',
                'secret' => getenv('MINIO_ROOT_PASSWORD') ?: '',
            ],
        ]);

        $this->sanitizer = $sanitizer ?? new HtmlSanitizer();
        $this->tokenizer = $tokenizer ?? new HtmlTokenizer();
        $this->textRenderer = $textRenderer ?? new TextRenderer();
    }

    public function process(array $definition): string
    {
        $w = $definition['dimensions']['w'] ?? 1200;
        $h = $definition['dimensions']['h'] ?? 630;
        $elements = $definition['elements'] ?? [];

        $canvas = new \Imagick();
        $canvas->newImage($w, $h, new \ImagickPixel('#ffffff'));
        $canvas->setImageFormat('png');

        foreach ($elements as $element) {
            $action = $element['action'] ?? '';
            $params = $element['params'] ?? [];

            match ($action) {
                'draw_image' => $this->drawImage($canvas, $params),
                'render_html_text' => $this->renderText($canvas, $params),
                default => null,
            };
        }

        $objectKey = uniqid('', true) . '.png';
        $blob = $canvas->getImageBlob();
        $canvas->clear();

        $this->s3->putObject([
            'Bucket' => 'production-exports',
            'Key' => $objectKey,
            'Body' => $blob,
            'ContentType' => 'image/png',
        ]);

        return $objectKey;
    }

    private function drawImage(\Imagick $canvas, array $params): void
    {
        $src = $params['src'] ?? '';

        if (!$src) {
            return;
        }

        try {
            if (!str_starts_with($src, 'http')) {
                $parts = explode('/', $src, 2);
                $bucket = $parts[0];
                $key = $parts[1] ?? '';

                $result = $this->s3->getObject([
                    'Bucket' => $bucket,
                    'Key' => $key,
                ]);
                $layer = new \Imagick();
                $layer->readImageBlob((string) $result['Body']);
            } else {
                $client = new \GuzzleHttp\Client(['timeout' => 5]);
                $response = $client->get($src);
                $layer = new \Imagick();
                $layer->readImageBlob((string) $response->getBody());
            }

            $x = $params['x'] ?? 0;
            $y = $params['y'] ?? 0;
            $canvas->compositeImage($layer, \Imagick::COMPOSITE_OVER, $x, $y);
            $layer->clear();
        } catch (\Exception $e) {
            error_log('draw_image failed: ' . $e->getMessage());
        }
    }

    private function renderText(\Imagick $canvas, array $params): void
    {
        $html = $params['html'] ?? '';

        if (!$html) {
            return;
        }

        $x = $params['x'] ?? 0;
        $y = $params['y'] ?? 0;

        $safeHtml = $this->sanitizer->sanitize($html);
        $tokens = $this->tokenizer->tokenize($safeHtml);

        $this->textRenderer->render($canvas, $tokens, $x, $y);
    }
}
