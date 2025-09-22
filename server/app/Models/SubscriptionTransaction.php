<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionTransaction extends Model
{
    use HasFactory;

    protected $table = 'subscription_transaction';
    protected $primaryKey = 'sub_transaction_id';

    protected $fillable = [
        'user_id',
        'old_plan_id',
        'new_plan_id',
        'payment_method',
        'amount_paid',
        'transaction_date',
        'notes',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function oldPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'old_plan_id', 'plan_id');
    }

    public function newPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'new_plan_id', 'plan_id');
    }
}
