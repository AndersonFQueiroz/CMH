<?php

use App\Http\Controllers\Api\V1\ImovelController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function (): void {
    Route::post('imoveis/{imovel}/foto', [ImovelController::class, 'updateFoto'])
        ->name('imoveis.foto');

    Route::apiResource('imoveis', ImovelController::class)
        ->parameters(['imoveis' => 'imovel']);
});