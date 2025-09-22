<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialAidSubscription;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionTransaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserSubscriptionController extends Controller
{
    /**
     * Get current user's subscriptions
     */
    public function mySubscriptions(): JsonResponse
    {
        $user = Auth::user();
        
        $subscriptions = FinancialAidSubscription::with('subscriptionPlan')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $subscriptions,
            'message' => 'User subscriptions retrieved successfully.'
        ]);
    }
    
    /**
     * Subscribe to a plan (creates pending subscription)
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plan,plan_id'
        ]);
        
        $user = Auth::user();
        $planId = $request->plan_id;
        
        // Check if user already has a pending subscription
        $existingPending = FinancialAidSubscription::where('user_id', $user->id)
            ->where('status', 'Pending')
            ->first();
            
        if ($existingPending) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending subscription. Only one pending subscription is allowed.'
            ], 422);
        }
        
        // Check if user has an active subscription
        $hasActiveSubscription = FinancialAidSubscription::where('user_id', $user->id)
            ->where('status', 'Active')
            ->where('end_date', '>=', Carbon::now()->toDateString())
            ->exists();
        
        // Get the plan details
        $plan = SubscriptionPlan::find($planId);
        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription plan not found.'
            ], 404);
        }
        
        // Don't allow subscribing to Free plan
        if (strtolower($plan->plan_name) === 'free') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot manually subscribe to the Free plan.'
            ], 422);
        }
        
        try {
            // Get current active subscription for transaction record
            $currentActiveSubscription = FinancialAidSubscription::where('user_id', $user->id)
                ->where('status', 'Active')
                ->where('end_date', '>=', Carbon::now()->toDateString())
                ->first();

            DB::beginTransaction();

            // If user has no active subscription, activate immediately
            // If user has active subscription, create as pending for future activation
            $status = $hasActiveSubscription ? 'Pending' : 'Active';
            $startDate = $hasActiveSubscription ? Carbon::now()->toDateString() : Carbon::now()->toDateString();
            $endDate = $hasActiveSubscription 
                ? Carbon::now()->addMonths($plan->duration_in_months)->toDateString() // Temporary for pending
                : Carbon::now()->addMonths($plan->duration_in_months)->toDateString(); // Real end date for active
            
            $subscription = FinancialAidSubscription::create([
                'user_id' => $user->id,
                'plan_id' => $planId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status
            ]);

            // Create transaction record
            $transactionNotes = $hasActiveSubscription 
                ? 'Subscription upgrade/change - Pending activation after current subscription expires'
                : 'New subscription activation';

            SubscriptionTransaction::create([
                'user_id' => $user->id,
                'old_plan_id' => $currentActiveSubscription ? $currentActiveSubscription->plan_id : null,
                'new_plan_id' => $planId,
                'payment_method' => 'Auto-Submit', // As requested - simple string for now
                'amount_paid' => $plan->price,
                'transaction_date' => Carbon::now(),
                'notes' => $transactionNotes
            ]);

            DB::commit();
            
            $message = $hasActiveSubscription 
                ? 'Subscription request submitted successfully. It will become active when your current subscription expires. Transaction recorded for ₱' . number_format($plan->price, 2) . '.'
                : 'Subscription activated successfully! You now have access to ' . $plan->plan_name . ' features. Transaction recorded for ₱' . number_format($plan->price, 2) . '.';
            
            return response()->json([
                'success' => true,
                'data' => $subscription->load('subscriptionPlan'),
                'message' => $message
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create subscription.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Cancel pending subscription
     */
    public function cancelPendingSubscription(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $pendingSubscription = FinancialAidSubscription::where('user_id', $user->id)
            ->where('status', 'Pending')
            ->first();
            
        if (!$pendingSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'No pending subscription found.'
            ], 404);
        }
        
        try {
            $pendingSubscription->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Pending subscription cancelled successfully.'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel subscription.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's subscription transaction history
     */
    public function transactionHistory(): JsonResponse
    {
        $user = Auth::user();
        
        // Get user's subscription transactions directly by user_id
        $transactions = SubscriptionTransaction::with(['user', 'oldPlan', 'newPlan'])
            ->where('user_id', $user->id)
            ->orderBy('transaction_date', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $transactions,
            'message' => 'Transaction history retrieved successfully.'
        ]);
    }
}