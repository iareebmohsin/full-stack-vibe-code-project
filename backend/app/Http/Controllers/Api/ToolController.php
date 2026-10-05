<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreToolRequest;
use App\Http\Requests\UpdateToolRequest;
use App\Models\Tool;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ToolController extends Controller
{
    /**
     * Display a listing of tools
     */
    public function index(Request $request)
    {
        $query = Tool::with(['category', 'tags', 'user']);

        // Only show published tools for non-admin users
        // Admins (owners) can see all tools regardless of status
        if (!auth('sanctum')->check() || auth('sanctum')->user()->role !== 'owner') {
            $query->published();
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->byCategory($request->category_id);
        }

        // Filter by type
        if ($request->has('tool_type')) {
            $query->byType($request->tool_type);
        }

        // Filter by role(s)
        if ($request->has('role')) {
            if (is_array($request->role)) {
                $query->byRoles($request->role);
            } else {
                $query->byRole($request->role);
            }
        }

        // Filter by tag
        if ($request->has('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                if (is_array($request->tag)) {
                    $q->whereIn('tags.id', $request->tag);
                } else {
                    $q->where('tags.id', $request->tag);
                }
            });
        }

        // Search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Featured only
        if ($request->has('featured') && $request->featured) {
            $query->featured();
        }

        // Order by published_at for public, or by created_at for admins (to include drafts)
        $orderColumn = (auth('sanctum')->check() && auth('sanctum')->user()->role === 'owner') ? 'created_at' : 'published_at';
        $tools = $query->latest($orderColumn)->paginate(15);

        // Append roles and favorite status to each tool
        $userId = auth('sanctum')->id();
        $tools->getCollection()->transform(function ($tool) use ($userId) {
            $tool->roles_list = $tool->roles;

            // Check if user has favorited this tool
            if ($userId) {
                $tool->is_favorited = \App\Models\Favorite::where('user_id', $userId)
                    ->where('tool_id', $tool->id)
                    ->exists();
            } else {
                $tool->is_favorited = false;
            }

            return $tool;
        });

        return response()->json([
            'success' => true,
            'data' => $tools,
        ]);
    }

    /**
     * Store a newly created tool
     */
    public function store(StoreToolRequest $request)
    {
        $data = $request->validated();

        // Generate slug from title
        $data['slug'] = Str::slug($data['title']);

        // Set user_id
        $data['user_id'] = auth()->id();

        // Set published_at if status is published
        if (isset($data['status']) && $data['status'] === 'published') {
            $data['published_at'] = now();
        }

        // Extract tags and roles
        $tags = $data['tags'] ?? [];
        $roles = $data['roles'] ?? [];
        unset($data['tags'], $data['roles']);

        // Create tool
        $tool = Tool::create($data);

        // Attach tags
        if (!empty($tags)) {
            $tool->tags()->attach($tags);
        }

        // Attach roles
        if (!empty($roles)) {
            $tool->syncRoles($roles);
        }

        // Load relationships
        $tool->load(['category', 'tags', 'user']);
        $tool->roles_list = $tool->roles;

        return response()->json([
            'success' => true,
            'message' => 'Tool created successfully',
            'data' => $tool,
        ], 201);
    }

    /**
     * Display the specified tool
     */
    public function show($id)
    {
        $tool = Tool::with(['category', 'tags', 'user'])
            ->findOrFail($id);

        // Increment views
        $tool->incrementViews();

        // Add roles
        $tool->roles_list = $tool->roles;

        // Check if user has favorited this tool
        $userId = auth('sanctum')->id();
        if ($userId) {
            $tool->is_favorited = \App\Models\Favorite::where('user_id', $userId)
                ->where('tool_id', $tool->id)
                ->exists();
        } else {
            $tool->is_favorited = false;
        }

        return response()->json([
            'success' => true,
            'data' => $tool,
        ]);
    }

    /**
     * Update the specified tool
     */
    public function update(UpdateToolRequest $request, Tool $tool)
    {
        // Authorization is already checked in UpdateToolRequest
        // No need to check again here

        $data = $request->validated();

        // Update slug if title changed
        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        // Set published_at if transitioning to published
        if (isset($data['status']) && $data['status'] === 'published' && !$tool->published_at) {
            $data['published_at'] = now();
        }

        // Extract tags and roles
        $tags = $data['tags'] ?? null;
        $roles = $data['roles'] ?? null;
        unset($data['tags'], $data['roles']);

        // Update tool
        $tool->update($data);

        // Sync tags if provided
        if ($tags !== null) {
            $tool->tags()->sync($tags);
        }

        // Sync roles if provided
        if ($roles !== null) {
            $tool->syncRoles($roles);
        }

        // Load relationships
        $tool->load(['category', 'tags', 'user']);
        $tool->roles_list = $tool->roles;

        return response()->json([
            'success' => true,
            'message' => 'Tool updated successfully',
            'data' => $tool,
        ]);
    }

    /**
     * Remove the specified tool
     */
    public function destroy(Tool $tool)
    {
        // Check authorization
        if (auth()->user()->role !== 'owner' && $tool->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this tool',
            ], 403);
        }

        $tool->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tool deleted successfully',
        ]);
    }

    /**
     * Get user's own tools
     */
    public function myTools()
    {
        $tools = Tool::with(['category', 'tags'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $tools,
        ]);
    }
}
