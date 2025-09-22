<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FinancialAid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class BeneficiaryController extends Controller
{
    /**
     * Get beneficiaries for the current facility
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Check if user has a facility
        $facility = FinancialAid::where('user_id', $user->id)->first();
        if (!$facility) {
            return response()->json([
                'success' => false,
                'message' => 'No facility found. Please register a facility first.'
            ], 404);
        }

        $perPage = $request->get('per_page', 10);
        
        // Get beneficiaries for this specific facility only
        $beneficiaries = User::where('systemrole_id', 4) // Beneficiary role
            ->where('financial_aid_id', $facility->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $beneficiaries,
            'facility' => $facility,
            'message' => 'Beneficiaries retrieved successfully.'
        ]);
    }

    /**
     * Store a new beneficiary
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Check if user has a facility and it's approved
        $facility = FinancialAid::where('user_id', $user->id)->first();
        if (!$facility) {
            return response()->json([
                'success' => false,
                'message' => 'No facility found. Please register a facility first.'
            ], 404);
        }

        if (!$facility->isManagable) {
            return response()->json([
                'success' => false,
                'message' => 'Your facility must be approved before you can register beneficiaries.'
            ], 422);
        }

        $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'age' => ['required', 'integer', 'min:1', 'max:120'],
            'enrolled_school' => ['required', 'string', 'max:200'],
            'school_year' => ['required', 'string', 'max:50'],
        ]);

        try {
            $beneficiary = User::create([
                'firstname' => $request->firstname,
                'middlename' => $request->middlename,
                'lastname' => $request->lastname,
                'contact_number' => $request->contact_number,
                'address' => $request->address,
                'email' => $request->email,
                'password' => Hash::make($request->string('password')),
                'status' => 'active',
                'systemrole_id' => 4, // Beneficiary role
                'financial_aid_id' => $facility->id, // Link to facility
                'age' => $request->age,
                'enrolled_school' => $request->enrolled_school,
                'school_year' => $request->school_year,
            ]);

            return response()->json([
                'success' => true,
                'data' => $beneficiary,
                'message' => 'Beneficiary registered successfully.'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register beneficiary.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified beneficiary
     */
    public function show($id)
    {
        $beneficiary = User::where('systemrole_id', 4)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $beneficiary,
            'message' => 'Beneficiary retrieved successfully.'
        ]);
    }

    /**
     * Update the specified beneficiary
     */
    public function update(Request $request, $id)
    {
        $beneficiary = User::where('systemrole_id', 4)
            ->findOrFail($id);

        $request->validate([
            'firstname' => ['sometimes', 'required', 'string', 'max:255'],
            'middlename' => ['nullable', 'string', 'max:255'],
            'lastname' => ['sometimes', 'required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'email' => ['sometimes', 'required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$id],
            'age' => ['sometimes', 'required', 'integer', 'min:1', 'max:120'],
            'enrolled_school' => ['sometimes', 'required', 'string', 'max:200'],
            'school_year' => ['sometimes', 'required', 'string', 'max:50'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        try {
            $beneficiary->update($request->only([
                'firstname', 'middlename', 'lastname', 'contact_number', 
                'address', 'email', 'age', 'enrolled_school', 'school_year', 'status'
            ]));

            return response()->json([
                'success' => true,
                'data' => $beneficiary,
                'message' => 'Beneficiary updated successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update beneficiary.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified beneficiary
     */
    public function destroy($id)
    {
        $beneficiary = User::where('systemrole_id', 4)
            ->findOrFail($id);

        try {
            $beneficiary->delete();

            return response()->json([
                'success' => true,
                'message' => 'Beneficiary deleted successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete beneficiary.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}