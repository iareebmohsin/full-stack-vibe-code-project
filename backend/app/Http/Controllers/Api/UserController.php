<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get all users (owner only)
     */
    public function index(Request $request)
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can view all users.'
            ], 403);
        }

        // Get all users with their tools count
        $users = User::withCount('tools')->get();

        // Add status field (active by default if not exists)
        $users = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status ?? 'active',
                'tools_count' => $user->tools_count,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
            ];
        });

        return response()->json($users);
    }

    /**
     * Get a single user
     */
    public function show(Request $request, $id)
    {
        // Users can view their own profile, owners can view anyone
        if ($request->user()->role !== 'owner' && $request->user()->id != $id) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $user = User::withCount('tools')->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status ?? 'active',
            'tools_count' => $user->tools_count,
            'created_at' => $user->created_at->toISOString(),
            'updated_at' => $user->updated_at->toISOString(),
        ]);
    }

    /**
     * Create a new user (owner only)
     */
    public function store(Request $request)
    {
        // Only owners can create users
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can create users.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:owner,frontend,backend,designer,devops,data-scientist,qa',
        ]);

        // Hash the password
        $validated['password'] = Hash::make($validated['password']);

        // Create the user
        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status ?? 'active',
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
            ]
        ], 201);
    }

    /**
     * Update user details (owner only)
     */
    public function update(Request $request, $id)
    {
        // Only owners can update users
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can update users.'
            ], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'sometimes|in:owner,frontend,backend,designer,devops,data-scientist,qa',
            'status' => 'sometimes|in:active,inactive',
            'password' => 'sometimes|string|min:8',
        ]);

        // Hash password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status ?? 'active',
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
            ]
        ]);
    }

    /**
     * Delete a user (owner only)
     */
    public function destroy(Request $request, $id)
    {
        // Only owners can delete users
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can delete users.'
            ], 403);
        }

        // Prevent deleting yourself
        if ($request->user()->id == $id) {
            return response()->json([
                'message' => 'You cannot delete your own account.'
            ], 400);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Toggle user status (owner only)
     */
    public function toggleStatus(Request $request, $id)
    {
        // Only owners can toggle user status
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can change user status.'
            ], 403);
        }

        // Prevent changing your own status
        if ($request->user()->id == $id) {
            return response()->json([
                'message' => 'You cannot change your own status.'
            ], 400);
        }

        $user = User::findOrFail($id);

        // Toggle status
        $currentStatus = $user->status ?? 'active';
        $newStatus = $currentStatus === 'active' ? 'inactive' : 'active';

        $user->update(['status' => $newStatus]);

        return response()->json([
            'message' => 'User status updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ]
        ]);
    }
}
