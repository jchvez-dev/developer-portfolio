<?php

namespace App\Service;

class HtmlTokenizer
{
    public function tokenize(string $html): array
    {
        $dom = new \DOMDocument();
        @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        $body = $dom->getElementsByTagName('body')->item(0) ?? $dom->documentElement;

        $state = [
            'fontSize' => 42,
            'fontFamily' => 'DejaVu-Sans',
            'color' => '#111827',
            'bold' => false,
            'italic' => false,
        ];

        $tokens = [];
        $this->extractTokens($body, $state, $tokens);

        return $tokens;
    }

    private function extractTokens(\DOMNode $node, array $state, array &$tokens): void
    {
        if ($node instanceof \DOMText) {
            $text = $node->textContent;
            if (trim($text) === '') {
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

            foreach ($node->childNodes as $child) {
                $this->extractTokens($child, $state, $tokens);
            }

            $state = $prevState;
        }
    }
}
