<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubscriptionPlanRequest;
use App\Http\Requests\UpdateSubscriptionPlanRequest;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionPlanController extends Controller
{
    /**
     * Display a listing of subscription plans.
     */
    public function index(): JsonResponse
    {
        $plans = SubscriptionPlan::orderBy('plan_name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $plans,
            'message' => 'Subscription plans retrieved successfully.'
        ]);
    }

    /**
     * Store a newly created subscription plan.
     */
    public function store(StoreSubscriptionPlanRequest $request): JsonResponse
    {
        try {
            $plan = SubscriptionPlan::create($request->validated());
            
            return response()->json([
                'success' => true,
                'data' => $plan,
                'message' => 'Subscription plan created successfully.'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create subscription plan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified subscription plan.
     */
    public function show(SubscriptionPlan $subscriptionPlan): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $subscriptionPlan,
            'message' => 'Subscription plan retrieved successfully.'
        ]);
    }

    /**
     * Update the specified subscription plan.
     */
    public function update(UpdateSubscriptionPlanRequest $request, SubscriptionPlan $subscriptionPlan): JsonResponse
    {
        try {
            $subscriptionPlan->update($request->validated());
            
            return response()->json([
                'success' => true,
                'data' => $subscriptionPlan->fresh(),
                'message' => 'Subscription plan updated successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update subscription plan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified subscription plan.
     */
    public function destroy(SubscriptionPlan $subscriptionPlan): JsonResponse
    {
        try {
            // Check if plan has active subscriptions
            $activeSubscriptions = $subscriptionPlan->financialAidSubscriptions()
                ->where('status', 'Active')
                ->count();
                
            if ($activeSubscriptions > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete subscription plan with active subscriptions.'
                ], 422);
            }
            
            $subscriptionPlan->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Subscription plan deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete subscription plan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
