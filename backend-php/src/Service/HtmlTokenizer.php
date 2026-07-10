<?php

namespace App\Service;

class HtmlTokenizer
{
    private const BLOCK_TAGS = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol', 'li'];

    public function tokenize(string $html): array
    {
        $dom = new \DOMDocument();
        @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NODEFDTD);

        $body = $dom->getElementsByTagName('body')->item(0);

        $state = [
            'fontSize' => 16,
            'fontFamily' => 'DejaVu-Sans',
            'color' => '#111827',
            'bold' => false,
            'italic' => false,
        ];

        $tokens = [];
        $this->extractTokens($body, $state, $tokens);

        return $tokens;
    }

    private function extractTokens(\DOMNode $node, array $state, array &$tokens, bool $isFirstInParent = true): void
    {
        if ($node instanceof \DOMText) {
            $text = $node->textContent;
            $clean = str_replace("\xC2\xA0", ' ', $text);
            if (trim($clean) === '') {
                return;
            }

            $tokens[] = [
                'text' => $text,
                'fontSize' => $state['fontSize'],
                'fontFamily' => $state['fontFamily'],
                'color' => $state['color'],
                'bold' => $state['bold'],
                'italic' => $state['italic'],
            ];

            return;
        }

        if ($node instanceof \DOMElement) {
            $tag = strtolower($node->tagName);
            $prevState = $state;

            if (in_array($tag, self::BLOCK_TAGS, true)) {
                if (!$isFirstInParent) {
                    $tokens[] = [
                        'text' => "\n",
                        'fontSize' => $state['fontSize'],
                        'fontFamily' => $state['fontFamily'],
                        'color' => $state['color'],
                        'bold' => $state['bold'],
                        'italic' => $state['italic'],
                    ];
                }
            }

            $style = $node->getAttribute('style');
            if ($style) {
                if (preg_match('/font-size:\s*(\d+)px/', $style, $m)) {
                    $state['fontSize'] = (int)$m[1];
                }
                if (preg_match('/color:\s*(#[0-9a-fA-F]{3,6})/', $style, $m)) {
                    $state['color'] = $m[1];
                }
                if (preg_match('/font-family:\s*([^;]+)/', $style, $m)) {
                    $state['fontFamily'] = trim($m[1], ' "\'');
                }
            }

            switch ($tag) {
                case 'b':
                case 'strong':
                    $state['bold'] = true;
                    break;
                case 'i':
                case 'em':
                    $state['italic'] = true;
                    break;
                case 'br':
                    $tokens[] = [
                        'text' => "\n",
                        'fontSize' => $state['fontSize'],
                        'fontFamily' => $state['fontFamily'],
                        'color' => $state['color'],
                        'bold' => $state['bold'],
                        'italic' => $state['italic'],
                    ];
                    break;
            }

            $isFirstChild = true;
            foreach ($node->childNodes as $child) {
                $this->extractTokens($child, $state, $tokens, $isFirstChild);
                $isFirstChild = false;
            }

            $state = $prevState;
        }
    }
}
