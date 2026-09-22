<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configuração RNF-07 — libera Expo Go (emulador + físico na mesma Wi-Fi)
    | em http://<IP_LOCAL>:8000/api/v1 sem bloqueio. Mantido explícito em
    | backend/config/cors.php:1 para audit + php artisan config:show.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
