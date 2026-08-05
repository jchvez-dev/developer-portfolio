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
        $this->s3 = $s3 ?? S3ClientFactory::create();

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
        $bgColor = $definition['background'] ?? '#ffffff';
        $canvas->newImage($w, $h, new \ImagickPixel($bgColor));
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

            $w = (int) ($params['width'] ?? $layer->getImageWidth());
            $h = (int) ($params['height'] ?? $layer->getImageHeight());
            $opacity = (float) ($params['opacity'] ?? 1);

            if ($w !== $layer->getImageWidth() || $h !== $layer->getImageHeight()) {
                $layer->resizeImage($w, $h, \Imagick::FILTER_LANCZOS, 1);
            }

            if ($opacity < 1) {
                $layer->setImageAlphaChannel(\Imagick::ALPHACHANNEL_SET);
                $layer->evaluateImage(\Imagick::EVALUATE_MULTIPLY, $opacity, \Imagick::CHANNEL_ALPHA);
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
        $width = $params['width'] ?? null;
        $height = $params['height'] ?? null;
        $bgColor = $params['backgroundColor'] ?? null;
        $opacity = (float) ($params['opacity'] ?? 1);

        $layerH = $height ?? $canvas->getImageHeight();
        $layerW = $width ?? $canvas->getImageWidth();

        $textLayer = new \Imagick();
        $textLayer->newImage(
            $canvas->getImageWidth(),
            $canvas->getImageHeight(),
            new \ImagickPixel('transparent'),
        );
        $textLayer->setImageFormat('png');

        if ($bgColor && $bgColor !== 'transparent') {
            $draw = new \ImagickDraw();
            $draw->setFillColor(new \ImagickPixel($bgColor));
            $draw->rectangle($x, $y, $x + $layerW - 1, $y + $layerH - 1);
            $textLayer->drawImage($draw);
        }

        $safeHtml = $this->sanitizer->sanitize($html);
        $tokens = $this->tokenizer->tokenize($safeHtml);

        $this->textRenderer->render($textLayer, $tokens, $x, $y, $width);

        if (!$bgColor || $bgColor === 'transparent') {
            $textLayer->trimImage(0);
            $textH = $textLayer->getImageHeight();
            $page = $textLayer->getImagePage();
            $centeredY = $y + (int)(($layerH - $textH) / 2);
            if ($centeredY < 0) $centeredY = 0;
        } else {
            $page = ['x' => $x, 'y' => $y];
            $centeredY = $y;
        }

        if ($opacity < 1) {
            $textLayer->setImageAlphaChannel(\Imagick::ALPHACHANNEL_SET);
            $textLayer->evaluateImage(\Imagick::EVALUATE_MULTIPLY, $opacity, \Imagick::CHANNEL_ALPHA);
        }

        $canvas->compositeImage($textLayer, \Imagick::COMPOSITE_OVER, $page['x'], $centeredY);
        $textLayer->clear();
    }
}
