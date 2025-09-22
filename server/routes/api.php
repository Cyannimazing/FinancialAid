<?php

use App\Http\Controllers\FinancialAidController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Financial Aid Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('financial-aid', FinancialAidController::class);
    Route::patch('financial-aid/{id}/status', [FinancialAidController::class, 'updateStatus']);
});
