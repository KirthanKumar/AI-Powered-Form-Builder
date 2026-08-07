<?php

namespace App\Schema;

class DefaultSchema
{
    public static function make(string $title = 'Untitled Form'): array
    {
        return [
            'version' => 1,
            'title' => $title,
            'sections' => [],
        ];
    }
}