<?php

namespace App\Service;

class TextRenderer
{
    private const FONT_DIR = '/app/fonts';

    public function render(\Imagick $canvas, array $tokens, int $originX, int $originY, ?int $maxWidth = null): void
    {
        $maxWidth = $maxWidth !== null ? ($originX + $maxWidth) : ($canvas->getImageWidth() - $originX);
        $lineHeight = 0;
        $currentX = $originX;
        $currentY = $originY;
        $lineTokens = [];

        $flushLine = function (bool $force = false) use ($canvas, &$lineTokens, &$currentX, &$currentY, $originX, $maxWidth, &$lineHeight) {
            if (empty($lineTokens)) {
                if ($force) {
                    $currentY = $currentY + $lineHeight;
                    $currentX = $originX;
                    $lineHeight = 0;
                }
                return;
            }

            $draw = new \ImagickDraw();
            $draw->setTextAlignment(\Imagick::ALIGN_LEFT);

            $localX = $originX;
            $localY = $currentY + $lineHeight;

            foreach ($lineTokens as $token) {
                $this->configureDraw($draw, $token);

                $canvas->annotateImage($draw, $localX, $localY, 0, $token['text']);

                $metrics = $canvas->queryFontMetrics($draw, $token['text']);
                $localX += (int)$metrics['textWidth'];
            }

            $currentX = $originX;
            $currentY = $currentY + $lineHeight;
            $lineHeight = 0;
            $lineTokens = [];
        };

        foreach ($tokens as $token) {
            if ($token['text'] === "\n") {
                $lineHeight = max($lineHeight, (int)($token['fontSize'] * 1.5));
                $flushLine(true);
                continue;
            }

            $draw = new \ImagickDraw();
            $this->configureDraw($draw, $token);

            $words = explode(' ', $token['text']);

            foreach ($words as $i => $word) {
                $wordStr = $i > 0 ? ' ' . $word : $word;

                $draw = new \ImagickDraw();
                $this->configureDraw($draw, $token);
                $wordMetrics = $canvas->queryFontMetrics($draw, $wordStr);

                $testX = $currentX;
                foreach ($lineTokens as $lt) {
                    $d = new \ImagickDraw();
                    $this->configureDraw($d, $lt);
                    $m = $canvas->queryFontMetrics($d, $lt['text']);
                    $testX += (int)$m['textWidth'];
                }
                $testX += (int)$wordMetrics['textWidth'];

                if ($testX > $maxWidth && !empty($lineTokens)) {
                    $lineHeight = max($lineHeight, (int)($token['fontSize'] * 1.5));
                    $flushLine();
                }

                $lineHeight = max($lineHeight, (int)($token['fontSize'] * 1.5));
                $lineTokens[] = [
                    'text' => $wordStr,
                    'fontSize' => $token['fontSize'],
                    'fontFamily' => $token['fontFamily'],
                    'color' => $token['color'],
                    'bold' => $token['bold'],
                    'italic' => $token['italic'],
                ];
            }
        }

        $flushLine();
    }

    private function resolveTtfPath(string $family, bool $bold, bool $italic): string
    {
        $suffixes = [
            [$bold && $italic, '-BoldItalic.ttf'],
            [$bold, '-Bold.ttf'],
            [$italic, '-Italic.ttf'],
            [true, '-Regular.ttf'],
        ];

        foreach ($suffixes as [$matched, $suffix]) {
            if ($matched) {
                $path = self::FONT_DIR . '/' . $family . $suffix;
                if (file_exists($path)) {
                    return $path;
                }
            }
        }

        return '';
    }

    private function configureDraw(\ImagickDraw $draw, array $token): void
    {
        $draw->setFontSize($token['fontSize']);

        $ttfPath = $this->resolveTtfPath($token['fontFamily'], $token['bold'], $token['italic']);

        if ($ttfPath !== '') {
            $draw->setFont($ttfPath);
        } else {
            $fcName = $token['fontFamily'];
            if ($token['bold'] && $token['italic']) {
                $fcName = 'DejaVu-Sans-Bold-Oblique';
            } elseif ($token['bold']) {
                $fcName = 'DejaVu-Sans-Bold';
            } elseif ($token['italic']) {
                $fcName = 'DejaVu-Sans-Oblique';
            }
            try {
                $draw->setFont($fcName);
            } catch (\ImagickException) {
                $draw->setFont('DejaVu-Sans');
            }
        }

        $draw->setFillColor(new \ImagickPixel($token['color']));
    }
}
