<?php

return [

    'provider' => env('AI_PROVIDER', 'openai'),

    'model' => env('AI_MODEL', 'gpt-4o-mini'),

    'api_key' => env('AI_API_KEY'),

    'api_url' => env('AI_API_URL','https://api.openai.com/v1/chat/completions'),

];