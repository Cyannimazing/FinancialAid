<?php

use App\Http\Controllers\Api\SubscriptionPlanController;
use App\Http\Controllers\Api\UserSubscriptionController;
use App\Http\Controllers\FinancialAidController;
use App\Http\Controllers\BeneficiaryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Financial Aid Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('my-facilities', [FinancialAidController::class, 'myFacilities']);
    Route::apiResource('financial-aid', FinancialAidController::class);
    Route::patch('financial-aid/{id}/status', [FinancialAidController::class, 'updateStatus']);
    
    // Subscription Plan Routes (Admin only)
    Route::apiResource('subscription-plans', SubscriptionPlanController::class, [
        'parameters' => ['subscription-plans' => 'subscriptionPlan']
    ]);
    
    // User Subscription Routes
    Route::get('my-subscriptions', [UserSubscriptionController::class, 'mySubscriptions']);
    Route::post('subscribe', [UserSubscriptionController::class, 'subscribe']);
    Route::delete('cancel-pending-subscription', [UserSubscriptionController::class, 'cancelPendingSubscription']);
    Route::get('subscription-transactions', [UserSubscriptionController::class, 'transactionHistory']);
    
    // Beneficiary Routes (for financial facilities)
    Route::apiResource('beneficiaries', BeneficiaryController::class);
});
