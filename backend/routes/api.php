<?php

use App\Http\Controllers\Api\V1\ImovelController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::apiResource('imoveis', ImovelController::class)
        ->parameters(['imoveis' => 'imovel']);
});
