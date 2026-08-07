<?php

namespace App\Services;

class HashService
{
    public function schema(array $schema): string
    {
        ksort($schema);
        return hash('sha256', json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
}
