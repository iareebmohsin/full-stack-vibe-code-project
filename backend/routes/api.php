<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\CommentController;

// Public routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/verify-2fa', [AuthController::class, 'verifyTwoFactor']);
Route::post('/resend-2fa', [AuthController::class, 'resendTwoFactorCode']);

// Public resource routes (read-only)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{id}', [TagController::class, 'show']);
Route::get('/tools', [ToolController::class, 'index']);
Route::get('/tools/{id}', [ToolController::class, 'show']);
Route::get('/tools/{id}/comments', [CommentController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/user/stats', [AuthController::class, 'stats']);
    Route::get('/user/activities', [AuthController::class, 'activities']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Tool management
    Route::post('/tools', [ToolController::class, 'store']);
    Route::put('/tools/{tool}', [ToolController::class, 'update']);
    Route::delete('/tools/{tool}', [ToolController::class, 'destroy']);
    Route::get('/my-tools', [ToolController::class, 'myTools']);

    // Favorites
    Route::post('/tools/{id}/favorite', [FavoriteController::class, 'toggle']);
    Route::get('/tools/{id}/favorite/check', [FavoriteController::class, 'check']);

    // Comments
    Route::post('/tools/{id}/comments', [CommentController::class, 'store']);

    // Category management (owner only - checked in controller)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // User management (owner only - checked in controller)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
});

// Test status endpoint
Route::get('/status', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is running',
    ]);
});

// Test POST endpoint
Route::post('/test-post', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'POST endpoint working',
        'received_data' => $request->all(),
        'has_auth_header' => $request->hasHeader('Authorization'),
        'auth_header' => $request->header('Authorization'),
    ]);
});

// Debug auth endpoint - check if token is valid
Route::get('/debug/auth', function (Request $request) {
    $token = $request->bearerToken();
    $user = $request->user();

    return response()->json([
        'has_bearer_token' => !empty($token),
        'token_preview' => $token ? substr($token, 0, 10) . '...' : null,
        'is_authenticated' => !empty($user),
        'user' => $user,
        'headers' => [
            'authorization' => $request->header('Authorization'),
            'origin' => $request->header('Origin'),
        ],
    ]);
})->middleware('auth:sanctum');
