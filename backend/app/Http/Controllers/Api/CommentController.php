<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get all comments for a tool
     */
    public function index($toolId)
    {
        $tool = Tool::findOrFail($toolId);

        $comments = $tool->comments()
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'comment' => $comment->comment,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                    ],
                    'created_at' => $comment->created_at->diffForHumans(),
                    'created_at_full' => $comment->created_at->format('M d, Y H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    /**
     * Store a new comment
     */
    public function store(Request $request, $toolId)
    {
        $request->validate([
            'comment' => 'required|string|min:1|max:1000',
        ]);

        $tool = Tool::findOrFail($toolId);
        $user = $request->user();

        $comment = Comment::create([
            'user_id' => $user->id,
            'tool_id' => $toolId,
            'comment' => $request->comment,
        ]);

        // Load user relationship
        $comment->load('user:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'data' => [
                'id' => $comment->id,
                'comment' => $comment->comment,
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                ],
                'created_at' => $comment->created_at->diffForHumans(),
                'created_at_full' => $comment->created_at->format('M d, Y H:i'),
            ],
        ], 201);
    }
}
