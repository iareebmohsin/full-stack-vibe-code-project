<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Toggle favorite status for a tool
     */
    public function toggle(Request $request, $toolId)
    {
        $user = $request->user();
        $tool = Tool::findOrFail($toolId);

        // Check if already favorited
        $favorite = Favorite::where('user_id', $user->id)
            ->where('tool_id', $toolId)
            ->first();

        if ($favorite) {
            // Remove favorite
            $favorite->delete();

            // Decrement favorites count
            $tool->decrement('favorites_count');

            return response()->json([
                'success' => true,
                'message' => 'Removed from favorites',
                'is_favorited' => false,
                'favorites_count' => $tool->fresh()->favorites_count,
            ]);
        } else {
            // Add favorite
            Favorite::create([
                'user_id' => $user->id,
                'tool_id' => $toolId,
            ]);

            // Increment favorites count
            $tool->increment('favorites_count');

            return response()->json([
                'success' => true,
                'message' => 'Added to favorites',
                'is_favorited' => true,
                'favorites_count' => $tool->fresh()->favorites_count,
            ]);
        }
    }

    /**
     * Check if user has favorited a tool
     */
    public function check(Request $request, $toolId)
    {
        $user = $request->user();

        $isFavorited = Favorite::where('user_id', $user->id)
            ->where('tool_id', $toolId)
            ->exists();

        return response()->json([
            'success' => true,
            'is_favorited' => $isFavorited,
        ]);
    }
}
