<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of active categories
     */
    public function index()
    {
        $categories = \Cache::remember('categories_active', 3600, function () {
            return Category::active()
                ->ordered()
                ->get(['id', 'name', 'slug', 'description', 'icon', 'color']);
        });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Store a newly created category (owner only)
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    /**
     * Display the specified category with its tools
     */
    public function show($id)
    {
        $category = Category::with(['publishedTools' => function ($query) {
            $query->latest('published_at')->limit(10);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }

    /**
     * Update the specified category (owner only)
     */
    public function update(StoreCategoryRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    /**
     * Remove the specified category (owner only)
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check if category has tools
        if ($category->tools()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with existing tools',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}
