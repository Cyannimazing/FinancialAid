<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'contact_number',
        'address',
        'email',
        'password',
        'status',
        'systemrole_id',
        'financial_aid_id',
        'age',
        'enrolled_school',
        'school_year',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function systemRole()
    {
        return $this->belongsTo(SystemRole::class, 'systemrole_id');
    }

    public function financialAid()
    {
        return $this->belongsTo(FinancialAid::class, 'financial_aid_id');
    }

    // Helper methods
    public function isAdmin()
    {
        return $this->systemRole->name === 'admin';
    }

    public function isDirector()
    {
        return $this->systemRole->name === 'director';
    }

    public function isEmployee()
    {
        return $this->systemRole->name === 'employee';
    }

    public function isBeneficiary()
    {
        return $this->systemRole->name === 'beneficiary';
    }

    public function getFullNameAttribute()
    {
        return trim($this->firstname . ' ' . $this->middlename . ' ' . $this->lastname);
    }

    // Subscription-related methods
    public function financialAidSubscriptions()
    {
        return $this->hasMany(FinancialAidSubscription::class);
    }

    public function hasHadFreePlan()
    {
        $freePlan = SubscriptionPlan::whereRaw('LOWER(plan_name) = ?', ['free'])->first();
        if (!$freePlan) {
            return false;
        }
        
        return $this->financialAidSubscriptions()
            ->where('plan_id', $freePlan->plan_id)
            ->exists();
    }

    public function hasActiveSubscription()
    {
        return $this->financialAidSubscriptions()
            ->where('status', 'Active')
            ->where('end_date', '>=', now()->toDateString())
            ->exists();
    }

    public function getCurrentSubscription()
    {
        return $this->financialAidSubscriptions()
            ->with('subscriptionPlan')
            ->where('status', 'Active')
            ->where('end_date', '>=', now()->toDateString())
            ->first();
    }
}
