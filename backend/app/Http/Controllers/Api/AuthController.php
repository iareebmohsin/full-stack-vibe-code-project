<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Login user and send 2FA code
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user account is inactive
        if (isset($user->status) && $user->status === 'inactive') {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact an administrator.'],
            ]);
        }

        // Local demo switch: TWO_FACTOR_ENABLED=false skips the emailed code
        if (!config('app.two_factor_enabled')) {
            $user->tokens()->delete();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'requires_2fa' => false,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ]);
        }

        // Generate 6-digit 2FA code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Save code and expiration (10 minutes)
        $user->two_factor_code = $code;
        $user->two_factor_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        // Send 2FA code via email
        $user->notify(new TwoFactorCodeNotification($code));

        return response()->json([
            'success' => true,
            'requires_2fa' => true,
            'message' => 'A verification code has been sent to your email.',
            'email' => $user->email,
        ]);
    }

    /**
     * Verify 2FA code and create token
     */
    public function verifyTwoFactor(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.'],
            ]);
        }

        // Check if code exists and is not expired
        if (!$user->two_factor_code || !$user->two_factor_expires_at) {
            throw ValidationException::withMessages([
                'code' => ['No verification code found. Please login again.'],
            ]);
        }

        if (Carbon::now()->isAfter($user->two_factor_expires_at)) {
            // Clear expired code
            $user->two_factor_code = null;
            $user->two_factor_expires_at = null;
            $user->save();

            throw ValidationException::withMessages([
                'code' => ['Verification code has expired. Please login again.'],
            ]);
        }

        // Verify the code
        if ($user->two_factor_code !== $request->code) {
            throw ValidationException::withMessages([
                'code' => ['Invalid verification code.'],
            ]);
        }

        // Code is valid - clear it and mark as verified
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->two_factor_verified_at = Carbon::now();
        $user->save();

        // Delete old tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Resend 2FA code
     */
    public function resendTwoFactorCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.'],
            ]);
        }

        // Generate new 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Save code and expiration (10 minutes)
        $user->two_factor_code = $code;
        $user->two_factor_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        // Send 2FA code via email
        $user->notify(new TwoFactorCodeNotification($code));

        return response()->json([
            'success' => true,
            'message' => 'A new verification code has been sent to your email.',
        ]);
    }

    /**
     * Logout user (delete token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user info
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
            ],
        ]);
    }

    /**
     * Get user statistics for dashboard
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        // Get all user's tools
        $tools = $user->tools()->get();

        // Calculate statistics
        $toolsShared = $tools->count();
        $totalViews = $tools->sum('views_count');
        $totalFavorites = $tools->sum('favorites_count');

        // Calculate rank (based on total views)
        $rank = User::join('tools', 'users.id', '=', 'tools.user_id')
            ->selectRaw('users.id, SUM(tools.views_count) as total_views')
            ->groupBy('users.id')
            ->havingRaw('SUM(tools.views_count) > ?', [$totalViews])
            ->count() + 1;

        return response()->json([
            'success' => true,
            'data' => [
                'tools_shared' => $toolsShared,
                'total_views' => $totalViews,
                'total_favorites' => $totalFavorites,
                'rank' => $rank,
            ],
        ]);
    }

    /**
     * Get user activity feed for dashboard
     */
    public function activities(Request $request)
    {
        $user = $request->user();
        $activities = [];

        // 1. Get last tool added by user
        $lastTool = $user->tools()->latest()->first();
        if ($lastTool) {
            $activities[] = [
                'type' => 'tool_added',
                'icon' => '✨',
                'title' => 'New tool added',
                'description' => "You shared '{$lastTool->title}'",
                'time' => $lastTool->created_at->diffForHumans(),
                'created_at' => $lastTool->created_at,
            ];
        }

        // 2. Get recent favorites on user's tools
        $recentFavorite = \DB::table('favorites')
            ->join('tools', 'favorites.tool_id', '=', 'tools.id')
            ->join('users', 'favorites.user_id', '=', 'users.id')
            ->where('tools.user_id', $user->id)
            ->where('favorites.user_id', '!=', $user->id) // Don't show self-favorites
            ->select('favorites.*', 'tools.title as tool_title', 'users.name as user_name')
            ->orderBy('favorites.created_at', 'desc')
            ->first();

        if ($recentFavorite) {
            $favoriteTime = \Carbon\Carbon::parse($recentFavorite->created_at);
            $activities[] = [
                'type' => 'tool_favorited',
                'icon' => '❤️',
                'title' => 'Tool favorited',
                'description' => "{$recentFavorite->user_name} favorited your '{$recentFavorite->tool_title}' tool",
                'time' => $favoriteTime->diffForHumans(),
                'created_at' => $favoriteTime,
            ];
        }

        // 3. Get recent comments on user's tools (from other users)
        $recentComment = \DB::table('comments')
            ->join('tools', 'comments.tool_id', '=', 'tools.id')
            ->join('users', 'comments.user_id', '=', 'users.id')
            ->where('tools.user_id', $user->id)
            ->where('comments.user_id', '!=', $user->id) // Don't show self-comments
            ->select('comments.*', 'tools.title as tool_title', 'users.name as user_name')
            ->orderBy('comments.created_at', 'desc')
            ->first();

        if ($recentComment) {
            $commentTime = \Carbon\Carbon::parse($recentComment->created_at);
            $activities[] = [
                'type' => 'new_comment',
                'icon' => '💬',
                'title' => 'New comment',
                'description' => "{$recentComment->user_name} commented on '{$recentComment->tool_title}'",
                'time' => $commentTime->diffForHumans(),
                'created_at' => $commentTime,
            ];
        }

        // 4. Get comments made by the user (on other people's tools)
        $userComment = \DB::table('comments')
            ->join('tools', 'comments.tool_id', '=', 'tools.id')
            ->where('comments.user_id', $user->id)
            ->select('comments.*', 'tools.title as tool_title')
            ->orderBy('comments.created_at', 'desc')
            ->first();

        if ($userComment) {
            $userCommentTime = \Carbon\Carbon::parse($userComment->created_at);
            $activities[] = [
                'type' => 'user_commented',
                'icon' => '💬',
                'title' => 'You commented',
                'description' => "You commented on '{$userComment->tool_title}'",
                'time' => $userCommentTime->diffForHumans(),
                'created_at' => $userCommentTime,
            ];
        }

        // Sort by created_at descending
        usort($activities, function ($a, $b) {
            return $b['created_at'] <=> $a['created_at'];
        });

        // Remove created_at from response (only used for sorting)
        $activities = array_map(function ($activity) {
            unset($activity['created_at']);
            return $activity;
        }, $activities);

        return response()->json([
            'success' => true,
            'data' => array_values($activities),
        ]);
    }

    /**
     * Update user profile (name and email)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }
}
