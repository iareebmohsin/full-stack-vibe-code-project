<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Display a listing of tags
     */
    public function index(Request $request)
    {
        // Cache key based on popular parameter
        $cacheKey = $request->has('popular')
            ? 'tags_popular_' . $request->input('limit', 20)
            : 'tags_all';

        $tags = \Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Tag::query();

            // Get popular tags only
            if ($request->has('popular')) {
                $limit = $request->input('limit', 20);
                $query->popular($limit);
            } else {
                $query->orderBy('name');
            }

            return $query->get(['id', 'name', 'slug']);
        });

        return response()->json([
            'success' => true,
            'data' => $tags,
        ]);
    }

    /**
     * Display the specified tag with its tools
     */
    public function show($id)
    {
        $tag = Tag::with(['tools' => function ($query) {
            $query->published()->latest('published_at')->limit(10);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tag,
        ]);
    }
}
