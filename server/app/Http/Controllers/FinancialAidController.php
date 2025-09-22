<?php

namespace App\Http\Controllers;

use App\Models\FinancialAid;
use App\Models\FinancialAidDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FinancialAidController extends Controller
{
    /**
     * Display a listing of financial aid facilities.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 8); // Default to 8 items per page
        $facilities = FinancialAid::with(['owner', 'documents'])
            ->where('isManagable', false) // Only show pending applications
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        
        return response()->json($facilities);
    }

    /**
     * Get current user's facilities.
     */
    public function myFacilities()
    {
        $user = Auth::user();
        $facilities = FinancialAid::with(['documents'])
            ->where('user_id', $user->id)
            ->get();
        return response()->json($facilities);
    }

    /**
     * Store a newly created facility registration.
     */
    public function store(Request $request)
    {
        $request->validate([
            'center_id' => 'required|string|max:50|unique:financial_aid,center_id',
            'center_name' => 'required|string|max:255',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
            'description' => 'nullable|string|max:1000',
            'documents' => 'nullable|array',
            'documents.*.type' => 'required_with:documents|string',
            'documents.*.file' => 'required_with:documents|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $user = Auth::user();

        // Check if user already has a facility
        $existingFacility = FinancialAid::where('user_id', $user->id)->first();
        if ($existingFacility) {
            return response()->json([
                'message' => 'You have already registered a facility. Each user can only register one facility.',
                'existing_facility' => $existingFacility
            ], 422);
        }

        $facility = FinancialAid::create([
            'user_id' => $user->id,
            'center_id' => $request->center_id,
            'center_name' => $request->center_name,
            'longitude' => $request->longitude,
            'latitude' => $request->latitude,
            'description' => $request->description,
            'isManagable' => false, // Requires admin approval
        ]);

        // Handle document uploads
        if ($request->has('documents')) {
            foreach ($request->documents as $document) {
                $file = $document['file'];
                $path = $file->store('financial-aid-documents', 'public');
                
                FinancialAidDocument::create([
                    'financial_aid_id' => $facility->id,
                    'document_type' => $document['type'],
                    'document_path' => $path,
                ]);
            }
        }

        return response()->json([
            'message' => 'Facility registration submitted successfully. Awaiting admin approval.',
            'facility' => $facility->load('documents')
        ], 201);
    }

    /**
     * Display the specified facility.
     */
    public function show($id)
    {
        $facility = FinancialAid::with(['owner', 'documents'])->findOrFail($id);
        return response()->json($facility);
    }

    /**
     * Update the specified facility.
     */
    public function update(Request $request, $id)
    {
        $facility = FinancialAid::findOrFail($id);
        
        $request->validate([
            'center_name' => 'sometimes|required|string|max:255',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
            'description' => 'nullable|string|max:1000',
        ]);
        
        $facility->update($request->only([
            'center_name', 'longitude', 'latitude', 'description'
        ]));
        
        return response()->json([
            'message' => 'Facility updated successfully',
            'facility' => $facility
        ]);
    }

    /**
     * Admin approve/reject facility.
     */
    public function updateStatus(Request $request, $id)
    {
        
        $request->validate([
            'isManagable' => 'required|boolean',
        ]);
        
        $facility = FinancialAid::findOrFail($id);
        $facility->update(['isManagable' => $request->isManagable]);
        
        $status = $request->isManagable ? 'approved' : 'rejected';
        
        return response()->json([
            'message' => "Facility has been {$status}",
            'facility' => $facility
        ]);
    }

    /**
     * Remove the specified facility.
     */
    public function destroy($id)
    {
        $facility = FinancialAid::findOrFail($id);
        
        // Delete associated documents from storage
        foreach ($facility->documents as $document) {
            Storage::disk('public')->delete($document->document_path);
        }
        
        $facility->delete();
        
        return response()->json(['message' => 'Facility deleted successfully']);
    }
}
