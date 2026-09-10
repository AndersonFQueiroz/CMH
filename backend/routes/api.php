<?php

use App\Http\Controllers\Api\V1\ImovelController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('imoveis/{imovel}/foto', [ImovelController::class, 'updateFoto'])
        ->name('imoveis.foto');

    Route::apiResource('imoveis', ImovelController::class)
        ->parameters(['imoveis' => 'imovel']);
});
