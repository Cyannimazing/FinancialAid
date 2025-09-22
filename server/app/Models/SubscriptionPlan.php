<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $table = 'subscription_plan';
    protected $primaryKey = 'plan_id';

    protected $fillable = [
        'plan_name',
        'price',
        'duration_in_months',
        'description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_in_months' => 'integer',
    ];

    // Relationships
    public function financialAidSubscriptions()
    {
        return $this->hasMany(FinancialAidSubscription::class, 'plan_id', 'plan_id');
    }

    public function oldTransactions()
    {
        return $this->hasMany(SubscriptionTransaction::class, 'old_plan_id', 'plan_id');
    }

    public function newTransactions()
    {
        return $this->hasMany(SubscriptionTransaction::class, 'new_plan_id', 'plan_id');
    }
}
